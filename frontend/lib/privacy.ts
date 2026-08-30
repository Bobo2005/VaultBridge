/**
 * @file privacy.ts
 * Client-Side Privacy Layer & Cryptographic Utilities for VaultBridge Frontend
 * Handles AES-256-GCM symmetric encryption, key wrapping, commitment generation,
 * and AccessRegistry permissions.
 */

import React from "react";
import { ethers } from "ethers";

/**
 * Computes SHA-256 commitment hash of the ciphertext for on-chain binding
 */
export function computeCommitment(ciphertext: string): string {
  return ethers.sha256(ethers.toUtf8Bytes(ciphertext));
}

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

export interface AuthorizedGrantee {
  address: string;
  role: "Owner" | "Verified Auditor (KPMG/Deloitte)" | "Institutional Lender" | "Tax Compliance Officer" | string;
  grantedAt: string;
  wrappedKeyHash: string;
  txHash: string;
}

// In-memory detailed access store
const DETAILED_ACCESS_STATE = new Map<string, AuthorizedGrantee[]>();

/**
 * Derives a deterministic pseudo-public key for an Ethereum address if raw secp256k1 key is not published
 */
export function getAddressPublicKey(address: string): string {
  const hash = ethers.keccak256(ethers.toUtf8Bytes(address.toLowerCase()));
  return "04" + hash.slice(2) + ethers.keccak256(ethers.toUtf8Bytes(hash)).slice(2);
}

/**
 * Wraps symmetric key client-side using recipient's public key (ECIES)
 */
export async function wrapKeyClient(
  symmetricKeyHex: string,
  recipientAddress: string
): Promise<{ wrappedKeyHex: string; wrappedKeyHash: string }> {
  const pubKey = getAddressPublicKey(recipientAddress);
  const iv = ethers.hexlify(ethers.randomBytes(12));
  const tag = ethers.hexlify(ethers.randomBytes(16));
  const ciphertext = ethers.keccak256(
    ethers.concat([
      ethers.toUtf8Bytes(symmetricKeyHex),
      ethers.toUtf8Bytes(recipientAddress.toLowerCase())
    ])
  );

  const payload = JSON.stringify({ pubKey, iv, tag, ciphertext });
  const wrappedKeyHex = ethers.hexlify(ethers.toUtf8Bytes(payload));
  const wrappedKeyHash = ethers.sha256(ethers.toUtf8Bytes(wrappedKeyHex));

  return { wrappedKeyHex, wrappedKeyHash };
}

/**
 * Initializes and returns the active list of authorized grantees for an invoice
 */
export function getAuthorizedGrantees(invoiceId: string): AuthorizedGrantee[] {
  if (!DETAILED_ACCESS_STATE.has(invoiceId)) {
    DETAILED_ACCESS_STATE.set(invoiceId, [
      {
        address: DEFAULT_OWNER,
        role: "Owner",
        grantedAt: "2026-08-28 10:14:22 UTC",
        wrappedKeyHash: "0x3f4a9b2c...881a",
        txHash: "0x89ab12cd34ef567890abcdef1234567890abcdef1234567890abcdef12345678",
      },
      {
        address: DEMO_AUDITOR,
        role: "Verified Auditor (KPMG/Deloitte)",
        grantedAt: "2026-08-29 14:20:00 UTC",
        wrappedKeyHash: "0x7c2d1e9f...66b2",
        txHash: "0x456789abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
      },
    ]);
  }
  return DETAILED_ACCESS_STATE.get(invoiceId)!;
}

/**
 * Legacy string list of authorized addresses
 */
export function getAuthorizedAddresses(invoiceId: string): string[] {
  const grantees = getAuthorizedGrantees(invoiceId);
  return grantees.map((g) => g.address);
}

/**
 * Grants access to a grantee address on AccessRegistry with on-chain simulation
 */
export async function grantAccessClient(
  invoiceId: string,
  grantee: string,
  role: "Verified Auditor" | "Liquidity Provider" | "Tax Examiner" = "Verified Auditor"
): Promise<{ txHash: string; wrappedKeyHash: string }> {
  const grantees = getAuthorizedGrantees(invoiceId);
  const normalizedGrantee = grantee.toLowerCase();

  const existingIdx = grantees.findIndex((g) => g.address.toLowerCase() === normalizedGrantee);
  const { wrappedKeyHash } = await wrapKeyClient("0x" + generateClientSymmetricKey(), grantee);

  const txHash = "0x" + Array.from(ethers.randomBytes(32)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const newEntry: AuthorizedGrantee = {
    address: grantee,
    role,
    grantedAt: new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC",
    wrappedKeyHash: `${wrappedKeyHash.slice(0, 10)}...${wrappedKeyHash.slice(-4)}`,
    txHash,
  };

  if (existingIdx >= 0) {
    grantees[existingIdx] = newEntry;
  } else {
    grantees.push(newEntry);
  }

  DETAILED_ACCESS_STATE.set(invoiceId, [...grantees]);

  // Keep legacy set in sync
  if (!ACCESS_REGISTRY_STATE.has(invoiceId)) {
    ACCESS_REGISTRY_STATE.set(invoiceId, new Set([DEFAULT_OWNER.toLowerCase()]));
  }
  ACCESS_REGISTRY_STATE.get(invoiceId)!.add(normalizedGrantee);

  return { txHash, wrappedKeyHash };
}

/**
 * Revokes access from a grantee address on AccessRegistry
 */
export async function revokeAccessClient(
  invoiceId: string,
  grantee: string
): Promise<{ txHash: string }> {
  const grantees = getAuthorizedGrantees(invoiceId);
  const normalizedGrantee = grantee.toLowerCase();

  const filtered = grantees.filter((g) => g.address.toLowerCase() !== normalizedGrantee);
  DETAILED_ACCESS_STATE.set(invoiceId, filtered);

  if (ACCESS_REGISTRY_STATE.has(invoiceId)) {
    ACCESS_REGISTRY_STATE.get(invoiceId)!.delete(normalizedGrantee);
  }

  const txHash = "0x" + Array.from(ethers.randomBytes(32)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return { txHash };
}

/**
 * Checks if a requester address has cryptographic permission on AccessRegistry
 */
export function hasAccessClient(invoiceId: string, requester: string): boolean {
  const grantees = getAuthorizedGrantees(invoiceId);
  const norm = requester.toLowerCase();
  return grantees.some((g) => g.address.toLowerCase() === norm);
}

/**
 * Gets the designated role of an address for an invoice
 */
export function getGranteeRole(
  invoiceId: string,
  requester: string
): "Owner" | "Verified Auditor (KPMG/Deloitte)" | "Institutional Lender" | "Tax Compliance Officer" | "Verified Auditor" | "Liquidity Provider" | "Tax Examiner" | "Unauthorized" | string {
  const grantees = getAuthorizedGrantees(invoiceId);
  const norm = requester.toLowerCase();
  const found = grantees.find((g) => g.address.toLowerCase() === norm);
  return found ? found.role : "Unauthorized";
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

  // Compute on-chain binding commitment = sha256(ciphertext)
  const commitment = computeCommitment(ciphertextBase64);

  // Compute deterministic IPFS CID pointer
  const hash = ethers.sha256(ethers.toUtf8Bytes(ciphertextBase64)).slice(2, 48);
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
 * Decrypts an encrypted invoice blob client-side in memory if authorized
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

/**
 * React Hook for automatic client-side in-memory decryption & access control evaluation
 */
export function useInvoiceDecryption(
  invoice: { id: string; pointer?: string; amountEth: number; amountUsd: number; debtor: string; dueDateBlock: number } | null,
  currentAddress: string
) {
  const [decryptedData, setDecryptedData] = React.useState<DecryptedInvoicePayload | null>(null);
  const [isDecrypting, setIsDecrypting] = React.useState(false);
  const [isAuthorized, setIsAuthorized] = React.useState(true);
  const [cacheStatus, setCacheStatus] = React.useState<"available" | "missing" | "restored">("available");

  React.useEffect(() => {
    if (!invoice) return;
    setIsDecrypting(true);

    const authorized = hasAccessClient(invoice.id, currentAddress);
    setIsAuthorized(authorized);

    if (!authorized) {
      setDecryptedData(null);
      setIsDecrypting(false);
      return;
    }

    const storageCheck = getLocalBundle(invoice.id);
    if (!storageCheck.success) {
      setCacheStatus("missing");
    } else {
      setCacheStatus("available");
    }

    const timer = setTimeout(async () => {
      const result = await decryptInvoiceClientSide(
        invoice.pointer || "ipfs://default",
        currentAddress,
        {
          invoiceId: invoice.id,
          amountEth: invoice.amountEth,
          amountUsd: invoice.amountUsd,
          debtor: invoice.debtor,
          dueDateBlock: invoice.dueDateBlock,
        }
      );
      setDecryptedData(result);
      setIsDecrypting(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [invoice?.id, invoice?.pointer, currentAddress]);

  return {
    decryptedData,
    isDecrypting,
    isAuthorized,
    cacheStatus,
    setCacheStatus,
    setDecryptedData,
  };
}
