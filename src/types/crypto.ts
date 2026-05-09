export enum PayloadType {
  TEXT = 'text',
  FILE = 'file'
}

export interface EncryptedPayload {
  salt: Uint8Array;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

export interface StegoMetadata {
  version: number;
  type: PayloadType;
  fileName?: string;
  fileType?: string;
  payloadSize: number;
}
