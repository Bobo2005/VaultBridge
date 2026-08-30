/**
 * @file unwrapKey.ts
 * Unwraps an ECIES wrapped key using the recipient's secp256k1 private key
 */

import crypto from "crypto";
import { WrappedKeyPayload } from "./wrapKey";

/**
 * Unwraps an ECIES-wrapped symmetric key using recipient's private key
 * @param wrappedKeyString JSON stringified or raw WrappedKeyPayload
 * @param recipientPrivateKeyHex Hex-encoded 32-byte private key
 */
export async function unwrapKey(
  wrappedKeyString: string,
  recipientPrivateKeyHex: string
): Promise<string> {
  const cleanPrivHex = recipientPrivateKeyHex.replace(/^0x/, "");
  const privKeyBuffer = Buffer.from(cleanPrivHex, "hex");

  if (privKeyBuffer.length !== 32) {
    throw new Error("Invalid private key length: must be 32 bytes");
  }

  const payload: WrappedKeyPayload =
    typeof wrappedKeyString === "string"
      ? JSON.parse(wrappedKeyString)
      : wrappedKeyString;

  // 1. Initialize recipient ECDH on secp256k1
  const recipient = crypto.createECDH("secp256k1");
  recipient.setPrivateKey(privKeyBuffer);

  // 2. Compute shared secret with ephemeral public key
  const ephemeralPubKeyBuffer = Buffer.from(payload.ephemeralPublicKey, "hex");
  const sharedSecret = recipient.computeSecret(ephemeralPubKeyBuffer);

  // 3. Derive 256-bit key using SHA-256
  const derivedKey = crypto.createHash("sha256").update(sharedSecret).digest();

  // 4. Decrypt symmetric key with AES-256-GCM
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");
  const encryptedKey = Buffer.from(payload.encryptedKey, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedKey);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("hex");
}
