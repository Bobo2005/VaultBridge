/**
 * @file encryptPayload.ts
 * Symmetric encryption and decryption of invoice/loan data using AES-256-GCM
 */

import crypto from "crypto";
import { ethers } from "ethers";

export interface EncryptedPayload {
  ciphertext: string;       // Base64 encoded encrypted JSON payload
  iv: string;               // Base64 encoded 12-byte initialization vector
  authTag: string;          // Base64 encoded 16-byte authentication tag
  commitment: string;       // Keccak256 hash of the ciphertext for on-chain binding
  timestamp: number;
}

/**
 * Generates a cryptographically secure 256-bit (32-byte) symmetric key
 */
export function generateSymmetricKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes SHA-256 commitment hash of the ciphertext for on-chain binding
 */
export function computeCommitment(ciphertext: string): string {
  return ethers.sha256(ethers.toUtf8Bytes(ciphertext));
}

/**
 * Encrypts arbitrary JSON payload using AES-256-GCM
 * @param data Arbitrary JSON serializable data object
 * @param symmetricKeyHex 32-byte hex-encoded symmetric key
 */
export async function encryptPayload(
  data: Record<string, any>,
  symmetricKeyHex: string
): Promise<EncryptedPayload> {
  const key = Buffer.from(symmetricKeyHex.replace(/^0x/, ""), "hex");
  if (key.length !== 32) {
    throw new Error("Invalid symmetric key length: must be 32 bytes (256 bits)");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const jsonString = JSON.stringify(data);
  let encrypted = cipher.update(jsonString, "utf8", "base64");
  encrypted += cipher.final("base64");

  const authTag = cipher.getAuthTag();

  // Compute on-chain commitment = sha256(ciphertext)
  const commitment = computeCommitment(encrypted);

  return {
    ciphertext: encrypted,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    commitment,
    timestamp: Date.now(),
  };
}

/**
 * Decrypts an EncryptedPayload using AES-256-GCM and verifies authenticity
 * @param payload The encrypted payload bundle
 * @param symmetricKeyHex 32-byte hex-encoded symmetric key
 */
export async function decryptPayload(
  payload: EncryptedPayload,
  symmetricKeyHex: string
): Promise<Record<string, any>> {
  const key = Buffer.from(symmetricKeyHex.replace(/^0x/, ""), "hex");
  if (key.length !== 32) {
    throw new Error("Invalid symmetric key length: must be 32 bytes (256 bits)");
  }

  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}
