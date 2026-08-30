/**
 * @file wrapKey.ts
 * Wraps a symmetric key with a recipient's secp256k1 public key using ECIES (ECDH + AES-256-GCM)
 */

import crypto from "crypto";

export interface WrappedKeyPayload {
  ephemeralPublicKey: string; // Hex-encoded 65-byte uncompressed public key (04...)
  iv: string;                 // Hex-encoded 12-byte IV
  authTag: string;            // Hex-encoded 16-byte authentication tag
  encryptedKey: string;       // Hex-encoded encrypted symmetric key
}

/**
 * Wraps a 256-bit symmetric key using a recipient's secp256k1 public key
 * @param symmetricKeyHex Hex-encoded symmetric key (32 bytes)
 * @param recipientPublicKeyHex Hex-encoded secp256k1 public key (compressed 33-byte or uncompressed 65-byte)
 */
export async function wrapKey(
  symmetricKeyHex: string,
  recipientPublicKeyHex: string
): Promise<string> {
  const cleanKeyHex = symmetricKeyHex.replace(/^0x/, "");
  const cleanPubHex = recipientPublicKeyHex.replace(/^0x/, "");

  const recipientPubKeyBuffer = Buffer.from(cleanPubHex, "hex");

  // 1. Generate ephemeral secp256k1 keypair
  const ephemeral = crypto.createECDH("secp256k1");
  ephemeral.generateKeys();

  // 2. Compute shared secret via ECDH
  const sharedSecret = ephemeral.computeSecret(recipientPubKeyBuffer);

  // 3. Derive 256-bit key using SHA-256
  const derivedKey = crypto.createHash("sha256").update(sharedSecret).digest();

  // 4. Encrypt symmetric key with AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", derivedKey, iv);

  let encrypted = cipher.update(Buffer.from(cleanKeyHex, "hex"));
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  const payload: WrappedKeyPayload = {
    ephemeralPublicKey: ephemeral.getPublicKey("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    encryptedKey: encrypted.toString("hex"),
  };

  return JSON.stringify(payload);
}
