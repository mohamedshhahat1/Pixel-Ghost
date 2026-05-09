import { StegoMetadata, PayloadType } from '../types/crypto';

/**
 * StegVault Stego Engine
 * Method: LSB (Least Significant Bit)
 * Channels: RGB (Alpha preserved)
 */

export class StegoEngine {
  private static HEADER_MARKER = new TextEncoder().encode('STEG');
  private static VERSION = 1;

  /**
   * Calculates the max payload capacity of an image in bytes
   */
  static getCapacity(width: number, height: number): number {
    // 3 bits per pixel (R, G, B)
    const totalBits = width * height * 3;
    // Minus header overhead (approx 64 bytes for safety)
    return Math.floor((totalBits / 8) - 128);
  }

  /**
   * Embeds data into image pixels using LSB
   */
  static async embed(
    imageData: ImageData,
    payload: Uint8Array,
    type: PayloadType,
    fileName: string = ''
  ): Promise<ImageData> {
    const data = imageData.data;
    
    // Prepare header: Marker(4) + Version(1) + Type(1) + PayloadSize(4) + FileNameLen(1) + FileName(var)
    const fileNameBytes = new TextEncoder().encode(fileName);
    const header = new Uint8Array(4 + 1 + 1 + 4 + 1 + fileNameBytes.length);
    header.set(this.HEADER_MARKER, 0);
    header[4] = this.VERSION;
    header[5] = type === PayloadType.TEXT ? 0 : 1;
    
    const sizeView = new DataView(new ArrayBuffer(4));
    sizeView.setUint32(0, payload.length);
    header.set(new Uint8Array(sizeView.buffer), 6);
    
    header[10] = fileNameBytes.length;
    header.set(fileNameBytes, 11);

    const fullPayload = new Uint8Array(header.length + payload.length);
    fullPayload.set(header, 0);
    fullPayload.set(payload, header.length);

    // Convert bits to array for easier embedding
    const bits: number[] = [];
    for (let i = 0; i < fullPayload.length; i++) {
      for (let j = 7; j >= 0; j--) {
        bits.push((fullPayload[i] >> j) & 1);
      }
    }

    if (bits.length > (data.length / 4) * 3) {
      throw new Error('Payload exceeds image capacity');
    }

    let bitIdx = 0;
    for (let i = 0; i < data.length && bitIdx < bits.length; i += 4) {
      // Embed in R, G, B channels
      for (let channel = 0; channel < 3 && bitIdx < bits.length; channel++) {
        const pixelIdx = i + channel;
        // Zero out the LSB and set it to the bit value
        data[pixelIdx] = (data[pixelIdx] & 0xFE) | bits[bitIdx++];
      }
      // Skip Alpha channel (i + 3 remains unchanged)
    }

    return imageData;
  }

  /**
   * Extracts hidden data from image pixels
   */
  static async extract(imageData: ImageData): Promise<{ payload: Uint8Array; metadata: StegoMetadata }> {
    const data = imageData.data;
    const bits: number[] = [];
    
    // Extract enough bits to check for header marker first
    const MARKER_BITS = 4 * 8;
    for (let i = 0; i < data.length && bits.length < MARKER_BITS; i += 4) {
      for (let channel = 0; channel < 3 && bits.length < MARKER_BITS; channel++) {
        bits.push(data[i + channel] & 1);
      }
    }

    const markerBytes = this.bitsToBytes(bits.slice(0, MARKER_BITS));
    if (new TextDecoder().decode(markerBytes) !== 'STEG') {
      throw new Error('No StegVault payload detected in image');
    }

    // Now extract everything (optimize by extracting in chunks if needed, but for now simple)
    // We'll extract first 100 bytes to get header info
    const HEADER_SCAN_LIMIT = 200;
    const scanBits: number[] = [];
    for (let i = 0; i < data.length && scanBits.length < HEADER_SCAN_LIMIT * 8; i += 4) {
      for (let channel = 0; channel < 3 && scanBits.length < HEADER_SCAN_LIMIT * 8; channel++) {
        scanBits.push(data[i + channel] & 1);
      }
    }

    const scanBytes = this.bitsToBytes(scanBits);
    const version = scanBytes[4];
    const type = scanBytes[5] === 0 ? PayloadType.TEXT : PayloadType.FILE;
    const payloadSize = new DataView(scanBytes.buffer).getUint32(6);
    const fileNameLen = scanBytes[10];
    const fileName = new TextDecoder().decode(scanBytes.slice(11, 11 + fileNameLen));

    const totalToExtract = 11 + fileNameLen + payloadSize;
    const allBits: number[] = [];
    for (let i = 0; i < data.length && allBits.length < totalToExtract * 8; i += 4) {
      for (let channel = 0; channel < 3 && allBits.length < totalToExtract * 8; channel++) {
        allBits.push(data[i + channel] & 1);
      }
    }

    const allBytes = this.bitsToBytes(allBits);
    const payload = allBytes.slice(11 + fileNameLen);

    return {
      payload,
      metadata: {
        version,
        type,
        payloadSize,
        fileName,
      }
    };
  }

  private static bitsToBytes(bits: number[]): Uint8Array {
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | bits[i * 8 + j];
      }
      bytes[i] = byte;
    }
    return bytes;
  }
}
