/**
 * @file blobStorage.ts
 * Off-chain storage adapter for encrypted payloads (IPFS, LocalStorage and simulated in-memory store)
 * Resilient against SSR, Incognito private browsing, and corrupted JSON storage tokens.
 */

import crypto from "crypto";

export interface EncryptedPayloadBundle {
  ciphertext: string;
  iv: string;
  tag: string;
  ephemPublicKey?: string;
  commitment: string;
  pointer?: string;
  timestamp?: number;
}

export type StorageErrorType =
  | "STORAGE_UNAVAILABLE"
  | "RECORD_NOT_FOUND"
  | "CORRUPTED_JSON"
  | "INVALID_CRYPTO_SCHEMA"
  | "UNKNOWN_ERROR";

export interface StorageError {
  type: StorageErrorType;
  message: string;
  details?: string;
}

export type StorageResult<T> =
  | { success: true; data: T }
  | { success: false; error: StorageError };

// In-memory decentralized blob cache
const IN_MEMORY_STORE = new Map<string, string>();

/**
 * Checks if browser localStorage is available and writable
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__vaultbridge_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates whether an object contains the required cryptographic fields
 */
export function isValidCryptoBundle(obj: any): obj is EncryptedPayloadBundle {
  if (!obj || typeof obj !== "object") return false;
  const hasCiphertext = typeof obj.ciphertext === "string" && obj.ciphertext.length > 0;
  const hasIv = typeof obj.iv === "string" && obj.iv.length > 0;
  const hasTag = (typeof obj.tag === "string" && obj.tag.length > 0) || (typeof obj.authTag === "string" && obj.authTag.length > 0);
  const hasCommitment = typeof obj.commitment === "string" && obj.commitment.startsWith("0x");

  return hasCiphertext && hasIv && hasTag && hasCommitment;
}

/**
 * Safely writes an encrypted record to local storage with schema validation
 */
export function storeLocalBlob(key: string, bundle: EncryptedPayloadBundle): StorageResult<boolean> {
  if (!isValidCryptoBundle(bundle)) {
    return {
      success: false,
      error: {
        type: "INVALID_CRYPTO_SCHEMA",
        message: "Payload does not satisfy required cryptographic fields (ciphertext, iv, tag, commitment)",
      },
    };
  }

  // Always cache in memory
  IN_MEMORY_STORE.set(key, JSON.stringify(bundle));

  if (!isLocalStorageAvailable()) {
    return { success: true, data: true };
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(bundle));
    return { success: true, data: true };
  } catch (err: any) {
    return {
      success: false,
      error: {
        type: "STORAGE_UNAVAILABLE",
        message: "Failed to persist to localStorage (quota exceeded or incognito sandbox)",
        details: err?.message,
      },
    };
  }
}

/**
 * Safely reads and validates an encrypted record from storage
 */
export function getLocalBlob(key: string): StorageResult<EncryptedPayloadBundle> {
  // Check in-memory store first
  const memData = IN_MEMORY_STORE.get(key);
  if (memData) {
    try {
      const parsed = JSON.parse(memData);
      if (isValidCryptoBundle(parsed)) {
        return { success: true, data: parsed };
      }
    } catch {
      // Continue to local storage check
    }
  }

  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: {
        type: "RECORD_NOT_FOUND",
        message: `Encrypted record not found in local cache for key: ${key}`,
      },
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        success: false,
        error: {
          type: "RECORD_NOT_FOUND",
          message: `Encrypted record not found in local cache for key: ${key}`,
        },
      };
    }

    const parsed = JSON.parse(raw);
    if (!isValidCryptoBundle(parsed)) {
      return {
        success: false,
        error: {
          type: "INVALID_CRYPTO_SCHEMA",
          message: "Stored record is corrupted or missing cryptographic fields (ciphertext, iv, tag, commitment)",
        },
      };
    }

    return { success: true, data: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: {
        type: "CORRUPTED_JSON",
        message: "Failed to parse stored JSON payload",
        details: err?.message,
      },
    };
  }
}

/**
 * Uploads an encrypted ciphertext blob to off-chain store (IPFS / mock IPFS CID)
 * @param ciphertext Base64 encoded ciphertext
 * @returns pointer URI (e.g. ipfs://bafkrei...)
 */
export async function uploadBlob(ciphertext: string): Promise<string> {
  const hash = crypto.createHash("sha256").update(ciphertext).digest("hex");
  const cid = `bafkrei${hash.slice(0, 48)}`;
  const pointer = `ipfs://${cid}`;

  IN_MEMORY_STORE.set(pointer, ciphertext);
  return pointer;
}

/**
 * Fetches an encrypted ciphertext blob from off-chain store using pointer URI
 * @param pointer IPFS pointer URI (e.g. ipfs://bafkrei...)
 * @returns ciphertext string
 */
export async function fetchBlob(pointer: string): Promise<string> {
  const data = IN_MEMORY_STORE.get(pointer);
  if (!data) {
    throw new Error(`Blob not found for pointer: ${pointer}`);
  }
  return data;
}

/**
 * Clears the in-memory blob store (for testing)
 */
export function clearBlobStore(): void {
  IN_MEMORY_STORE.clear();
}
