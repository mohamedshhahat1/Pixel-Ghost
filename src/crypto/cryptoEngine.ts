/**
 * StegVault Crypto Engine
 * Algorithm: AES-256-GCM
 * KDF: PBKDF2-SHA256 (250,000 iterations)
 */

export class CryptoEngine {
  private static ITERATIONS = 250000;
  private static SALT_SIZE = 16;
  private static IV_SIZE = 12; // 96-bit for GCM
  private static KEY_SIZE = 256;

  /**
   * Derives a cryptographic key from a password and salt using PBKDF2
   */
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      { name: 'AES-GCM', length: this.KEY_SIZE },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts data using AES-256-GCM
   */
  static async encrypt(data: Uint8Array, password: string): Promise<Uint8Array> {
    const salt = window.crypto.getRandomValues(new Uint8Array(this.SALT_SIZE));
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_SIZE));
    const key = await this.deriveKey(password, salt);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    const ciphertextArray = new Uint8Array(ciphertext);
    const result = new Uint8Array(this.SALT_SIZE + this.IV_SIZE + ciphertextArray.length);

    result.set(salt, 0);
    result.set(iv, this.SALT_SIZE);
    result.set(ciphertextArray, this.SALT_SIZE + this.IV_SIZE);

    return result;
  }

  /**
   * Decrypts AES-256-GCM protected data
   */
  static async decrypt(encryptedData: Uint8Array, password: string): Promise<Uint8Array> {
    const salt = encryptedData.slice(0, this.SALT_SIZE);
    const iv = encryptedData.slice(this.SALT_SIZE, this.SALT_SIZE + this.IV_SIZE);
    const ciphertext = encryptedData.slice(this.SALT_SIZE + this.IV_SIZE);

    const key = await this.deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      ciphertext
    );

    return new Uint8Array(decrypted);
  }
}
