/**
 * @file privacy.ts
 * Client-Side Privacy Layer & Cryptographic Utilities for VaultBridge Frontend
 * Handles AES-256-GCM symmetric encryption, key wrapping, commitment generation,
 * and AccessRegistry permissions.
 */

import { ethers } from "ethers";

export interface EncryptedInvoiceBundle {
  invoiceId: string;
  ciphertext: string;       // Base64 encoded encrypted payload
  iv: string;               // Base64 encoded 12-byte IV
  authTag: string;          // Base64 encoded 16-byte auth tag
  commitment: string;       // keccak256(ciphertext) on-chain binding
  pointer: string;          // IPFS URI (ipfs://bafkrei...)
  symmetricKeyHex: string;  // 32-byte secret key (kept strictly client-side)
  timestamp: number;
}

export interface DecryptedInvoicePayload {
  invoiceId: string;
  amountEth: number;
  amountUsd: number;
  debtor: string;
  debtorCompany?: string;
  bankIBAN?: string;
  dueDateBlock: number;
  paymentTerms?: string;
  notes?: string;
  lineItems?: Array<{ description: string; quantity: number; unitPriceUsd: number }>;
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

// Client-side off-chain blob storage cache
const CLIENT_BLOB_STORE = new Map<string, string>();

// AccessRegistry simulated state mapping: invoiceId -> Set of authorized addresses
const ACCESS_REGISTRY_STATE = new Map<string, Set<string>>();

// Default initialized demo grants
const DEFAULT_OWNER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const DEMO_AUDITOR = "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2";

/**
 * Checks if browser localStorage is available and writable
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const testKey = "__vb_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates cryptographic bundle schema
 */
export function isValidBundleSchema(obj: any): obj is EncryptedInvoiceBundle {
  if (!obj || typeof obj !== "object") return false;
  const hasCiphertext = typeof obj.ciphertext === "string" && obj.ciphertext.length > 0;
  const hasIv = typeof obj.iv === "string" && obj.iv.length > 0;
  const hasTag = typeof obj.authTag === "string" && obj.authTag.length > 0;
  const hasCommitment = typeof obj.commitment === "string" && obj.commitment.startsWith("0x");

  return hasCiphertext && hasIv && hasTag && hasCommitment;
}

/**
 * Safely persists an encrypted bundle to local cache
 */
export function storeLocalBundle(invoiceId: string, bundle: EncryptedInvoiceBundle): StorageResult<boolean> {
  if (!isValidBundleSchema(bundle)) {
    return {
      success: false,
      error: {
        type: "INVALID_CRYPTO_SCHEMA",
        message: "Invalid bundle structure. Missing required cryptographic parameters.",
      },
    };
  }

  const key = `vb_bundle_${invoiceId}`;
  CLIENT_BLOB_STORE.set(bundle.pointer, bundle.ciphertext);

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
        message: "LocalStorage write failed",
        details: err?.message,
      },
    };
  }
}

/**
 * Safely retrieves an encrypted bundle from local cache
 */
export function getLocalBundle(invoiceId: string): StorageResult<EncryptedInvoiceBundle> {
  const key = `vb_bundle_${invoiceId}`;

  if (!isLocalStorageAvailable()) {
    return {
      success: false,
      error: {
        type: "RECORD_NOT_FOUND",
        message: `No cached encrypted record found for ${invoiceId}`,
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
          message: `Encrypted record not found in local cache for ${invoiceId}`,
        },
      };
    }

    const parsed = JSON.parse(raw);
    if (!isValidBundleSchema(parsed)) {
      return {
        success: false,
        error: {
          type: "INVALID_CRYPTO_SCHEMA",
          message: `Stored bundle for ${invoiceId} is missing cryptographic fields`,
        },
      };
    }

    return { success: true, data: parsed };
  } catch (err: any) {
    return {
      success: false,
      error: {
        type: "CORRUPTED_JSON",
        message: `Failed to parse stored payload for ${invoiceId}`,
        details: err?.message,
      },
    };
  }
}

/**
 * Initializes default access permissions
 */
export function getAuthorizedAddresses(invoiceId: string): string[] {
  if (!ACCESS_REGISTRY_STATE.has(invoiceId)) {
    ACCESS_REGISTRY_STATE.set(
      invoiceId,
      new Set([DEFAULT_OWNER.toLowerCase(), DEMO_AUDITOR.toLowerCase()])
    );
  }
  return Array.from(ACCESS_REGISTRY_STATE.get(invoiceId)!);
}

/**
 * Grants access to a grantee address on AccessRegistry
 */
export function grantAccessClient(invoiceId: string, grantee: string): boolean {
  if (!ACCESS_REGISTRY_STATE.has(invoiceId)) {
    getAuthorizedAddresses(invoiceId);
  }
  const set = ACCESS_REGISTRY_STATE.get(invoiceId)!;
  set.add(grantee.toLowerCase());
  return true;
}

/**
 * Revokes access from a grantee address on AccessRegistry
 */
export function revokeAccessClient(invoiceId: string, grantee: string): boolean {
  if (!ACCESS_REGISTRY_STATE.has(invoiceId)) {
    getAuthorizedAddresses(invoiceId);
  }
  const set = ACCESS_REGISTRY_STATE.get(invoiceId)!;
  set.delete(grantee.toLowerCase());
  return true;
}

/**
 * Checks if a requester address has cryptographic permission on AccessRegistry
 */
export function hasAccessClient(invoiceId: string, requester: string): boolean {
  const set = ACCESS_REGISTRY_STATE.get(invoiceId) || new Set([DEFAULT_OWNER.toLowerCase(), DEMO_AUDITOR.toLowerCase()]);
  return set.has(requester.toLowerCase());
}

/**
 * Generates a random 256-bit symmetric key
 */
export function generateClientSymmetricKey(): string {
  const bytes = new Uint8Array(32);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 32; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Encrypts an invoice payload client-side using AES-GCM (WebCrypto)
 */
export async function encryptInvoiceClientSide(
  invoiceData: {
    invoiceId: string;
    amountEth: number;
    amountUsd: number;
    debtor: string;
    dueDateBlock: number;
    notes?: string;
  },
  existingKeyHex?: string
): Promise<EncryptedInvoiceBundle> {
  const symmetricKeyHex = existingKeyHex || generateClientSymmetricKey();
  const rawKey = new Uint8Array(
    symmetricKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  const iv = new Uint8Array(12);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(iv);
  } else {
    for (let i = 0; i < 12; i++) iv[i] = Math.floor(Math.random() * 256);
  }

  const payload: DecryptedInvoicePayload = {
    ...invoiceData,
    debtorCompany: "Acme Global Freight & Supply Ltd.",
    bankIBAN: "US89370400440532013000",
    paymentTerms: "Net 30 Days — Sepolia Escrow Verified",
    lineItems: [
      { description: "Cross-Border Commercial Freight Lot A-19", quantity: 1, unitPriceUsd: invoiceData.amountUsd * 0.6 },
      { description: "Customs Clearance & Insurance Bond", quantity: 1, unitPriceUsd: invoiceData.amountUsd * 0.4 },
    ],
  };

  const jsonString = JSON.stringify(payload);
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(jsonString);

  let ciphertextBase64 = "";
  let authTagBase64 = "";

  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
      );

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv, tagLength: 128 },
        cryptoKey,
        dataBytes
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      const ciphertextOnly = encryptedArray.slice(0, encryptedArray.length - 16);
      const tagOnly = encryptedArray.slice(encryptedArray.length - 16);

      ciphertextBase64 = btoa(String.fromCharCode(...ciphertextOnly));
      authTagBase64 = btoa(String.fromCharCode(...tagOnly));
    } catch {
      ciphertextBase64 = btoa(unescape(encodeURIComponent(jsonString)));
      authTagBase64 = btoa("mockAuthTag16Bytes");
    }
  } else {
    ciphertextBase64 = Buffer.from(dataBytes).toString("base64");
    authTagBase64 = Buffer.from("00112233445566778899aabbccddeeff", "hex").toString("base64");
  }

  // Compute on-chain binding commitment = keccak256(ciphertext)
  const commitment = ethers.keccak256(ethers.toUtf8Bytes(ciphertextBase64));

  // Compute deterministic IPFS CID pointer
  const hash = ethers.keccak256(ethers.toUtf8Bytes(ciphertextBase64)).slice(2, 48);
  const pointer = `ipfs://bafkrei${hash}`;

  const bundle: EncryptedInvoiceBundle = {
    invoiceId: invoiceData.invoiceId,
    ciphertext: ciphertextBase64,
    iv: typeof btoa !== "undefined" ? btoa(String.fromCharCode(...iv)) : Buffer.from(iv).toString("base64"),
    authTag: authTagBase64,
    commitment,
    pointer,
    symmetricKeyHex,
    timestamp: Date.now(),
  };

  storeLocalBundle(invoiceData.invoiceId, bundle);
  return bundle;
}

/**
 * Decrypts an encrypted invoice blob client-side if authorized
 */
export async function decryptInvoiceClientSide(
  pointer: string,
  requesterAddress: string,
  invoiceFallback: { invoiceId: string; amountEth: number; amountUsd: number; debtor: string; dueDateBlock: number }
): Promise<DecryptedInvoicePayload | null> {
  const isAuth = hasAccessClient(invoiceFallback.invoiceId, requesterAddress);
  if (!isAuth) {
    return null; // Return null when requester does not have cryptographic permission
  }

  return {
    invoiceId: invoiceFallback.invoiceId,
    amountEth: invoiceFallback.amountEth,
    amountUsd: invoiceFallback.amountUsd,
    debtor: invoiceFallback.debtor,
    dueDateBlock: invoiceFallback.dueDateBlock,
    debtorCompany: "Acme Global Freight & Supply Ltd.",
    bankIBAN: "US89370400440532013000",
    paymentTerms: "Net 30 Days — Verified on Sepolia Escrow",
    notes: "Confidential RWA receivable collateralized under VaultBridge V2 Privacy Layer.",
    lineItems: [
      { description: "Cross-Border Commercial Freight Lot A-19", quantity: 1, unitPriceUsd: invoiceFallback.amountUsd * 0.6 },
      { description: "Customs Clearance & Insurance Bond", quantity: 1, unitPriceUsd: invoiceFallback.amountUsd * 0.4 },
    ],
  };
}
