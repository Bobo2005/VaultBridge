/**
 * Mock / Live API Client for VaultBridge
 * Handles contract interactions, client-side privacy encryption, state synchronization, and judge demonstrations.
 */

import { encryptInvoiceClientSide } from "./privacy";

export interface InvoiceRecord {
  id: string;
  invoiceIdHex: string;
  amountEth: number;
  amountUsd: number;
  debtor: string;
  dueDateBlock: number;
  txHash: string;
  status: "Attested" | "Borrowed" | "Paid" | "Defaulted" | "Awaiting Proof";
  attestedHeight?: number;
  borrowedAmountUsd?: number;
  borrowedToken?: string;
  riskTier?: "Tier A (Prime 80%)" | "Tier B (Standard 70%)" | "Tier C (Subprime 50%)";
  ltvBps?: number;
  apr?: number;
  createdAt: string;
  // Privacy Layer fields (V2)
  commitment?: string;
  pointer?: string;
  isEncrypted?: boolean;
}

export interface LoanRecord {
  id: string;
  invoiceId: string;
  borrower: string;
  principalUsd: number;
  currency: string;
  ltvPercent: number;
  apr: number;
  status: "Active" | "Repaid" | "Liquidated";
  dueDate: string;
  dueDateBlock: number;
}

// Initial Mock Ledger
let INVOICES_STORE: InvoiceRecord[] = [
  {
    id: "INV-2026-001",
    invoiceIdHex: "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d",
    amountEth: 10.0,
    amountUsd: 27000,
    debtor: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    dueDateBlock: 11568000,
    txHash: "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d",
    status: "Borrowed",
    attestedHeight: 11566330,
    borrowedAmountUsd: 18900,
    borrowedToken: "USDC",
    riskTier: "Tier B (Standard 70%)",
    ltvBps: 7000,
    apr: 4.5,
    createdAt: "2026-08-28T10:14:00Z",
    commitment: "0x98f4e21a4d8c7b9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e",
    pointer: "ipfs://bafkreihdwdcefgh456jkl901mno234pqr567stu890vwx123",
    isEncrypted: true,
  },
  {
    id: "INV-2026-002",
    invoiceIdHex: "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    amountEth: 25.0,
    amountUsd: 67500,
    debtor: "0x8f7a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
    dueDateBlock: 11569500,
    txHash: "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    status: "Attested",
    attestedHeight: 11566310,
    borrowedToken: "USDC",
    riskTier: "Tier A (Prime 80%)",
    ltvBps: 8000,
    apr: 4.0,
    createdAt: "2026-08-28T12:30:00Z",
    commitment: "0x1234a4d8c7b9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5",
    pointer: "ipfs://bafkreig729dhy4k390s8djsakjndaskjndas908234jksd",
    isEncrypted: true,
  },
  {
    id: "INV-2026-003",
    invoiceIdHex: "0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
    amountEth: 50.0,
    amountUsd: 135000,
    debtor: "0xAaBbCcDdEeFf00112233445566778899aAbBcCdD",
    dueDateBlock: 11564000,
    txHash: "0x112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00",
    status: "Paid",
    attestedHeight: 11564264,
    borrowedAmountUsd: 94500,
    borrowedToken: "EURC",
    riskTier: "Tier B (Standard 70%)",
    ltvBps: 7000,
    apr: 4.5,
    createdAt: "2026-08-27T08:00:00Z",
    commitment: "0x5566778899aabbccddeeff00112233445566778899aabbccddeeff0011223344",
    pointer: "ipfs://bafkreia3489sjhd893hsdjkbnvksdf73892hjsdf93",
    isEncrypted: true,
  },
  {
    id: "INV-2026-004",
    invoiceIdHex: "0x998877665544332211ffeeddccbbaa00998877665544332211ffeeddccbbaa00",
    amountEth: 18.0,
    amountUsd: 48600,
    debtor: "0x5566778899aabbccddeeff001122334455667788",
    dueDateBlock: 11565000,
    txHash: "0x998877665544332211ffeeddccbbaa00998877665544332211ffeeddccbbaa00",
    status: "Defaulted",
    attestedHeight: 11565100,
    borrowedAmountUsd: 24300,
    borrowedToken: "USDC",
    riskTier: "Tier C (Subprime 50%)",
    ltvBps: 5000,
    apr: 6.5,
    createdAt: "2026-08-26T15:45:00Z",
    commitment: "0xaa8877665544332211ffeeddccbbaa00998877665544332211ffeeddccbbaa00",
    pointer: "ipfs://bafkreibdf98234jksdf89234jsdf98234jsdf89",
    isEncrypted: true,
  },
  {
    id: "INV-2026-005",
    invoiceIdHex: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    amountEth: 8.5,
    amountUsd: 22950,
    debtor: "0x1234567890abcdef1234567890abcdef12345678",
    dueDateBlock: 11571000,
    txHash: "0xabcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
    status: "Awaiting Proof",
    borrowedToken: "USDC",
    riskTier: "Tier B (Standard 70%)",
    ltvBps: 7000,
    apr: 4.5,
    createdAt: "2026-08-29T09:12:00Z",
    commitment: "0xbbccddeeff00112233445566778899aabbccddeeff00112233445566778899aa",
    pointer: "ipfs://bafkreic98234msdkfj23908sdjf98234jksdf89",
    isEncrypted: true,
  },
];

let LOANS_STORE: LoanRecord[] = [
  {
    id: "LOAN-8831",
    invoiceId: "INV-2026-001",
    borrower: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
    principalUsd: 18900,
    currency: "USDC",
    ltvPercent: 70,
    apr: 4.5,
    status: "Active",
    dueDate: "2026-09-28",
    dueDateBlock: 11568000,
  },
  {
    id: "LOAN-8829",
    invoiceId: "INV-2026-003",
    borrower: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
    principalUsd: 94500,
    currency: "EURC",
    ltvPercent: 70,
    apr: 4.5,
    status: "Repaid",
    dueDate: "2026-09-15",
    dueDateBlock: 11564000,
  },
  {
    id: "LOAN-8825",
    invoiceId: "INV-2026-004",
    borrower: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
    principalUsd: 24300,
    currency: "USDC",
    ltvPercent: 50,
    apr: 6.5,
    status: "Liquidated",
    dueDate: "2026-09-01",
    dueDateBlock: 11565000,
  },
];

// Storage Keys for persistent real ledger
const INVOICES_STORAGE_KEY = "vaultbridge_invoices_ledger_v2";
const LOANS_STORAGE_KEY = "vaultbridge_loans_ledger_v2";

function getStoredInvoices(): InvoiceRecord[] {
  if (typeof window === "undefined") return INVOICES_STORE;
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INVOICES_STORE;
}

function setStoredInvoices(invoices: InvoiceRecord[]): void {
  INVOICES_STORE = invoices;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    } catch {}
  }
}

function getStoredLoans(): LoanRecord[] {
  if (typeof window === "undefined") return LOANS_STORE;
  try {
    const raw = localStorage.getItem(LOANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return LOANS_STORE;
}

function setStoredLoans(loans: LoanRecord[]): void {
  LOANS_STORE = loans;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    } catch {}
  }
}

export const VaultBridgeAPI = {
  async getInvoices(): Promise<InvoiceRecord[]> {
    return [...getStoredInvoices()];
  },

  async getInvoiceById(id: string): Promise<InvoiceRecord | undefined> {
    const invoices = getStoredInvoices();
    return invoices.find((i) => i.id === id || i.invoiceIdHex === id);
  },

  async getLoans(): Promise<LoanRecord[]> {
    return [...getStoredLoans()];
  },

  async issueInvoice(params: {
    amountEth: number;
    debtor: string;
    riskTier?: "Tier A (Prime 80%)" | "Tier B (Standard 70%)" | "Tier C (Subprime 50%)";
    txHash?: string;
  }): Promise<InvoiceRecord> {
    const currentInvoices = getStoredInvoices();
    const idNum = currentInvoices.length + 1;
    const invId = `INV-2026-${idNum.toString().padStart(3, "0")}`;
    const txHash = params.txHash || "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const tier = params.riskTier || "Tier B (Standard 70%)";
    const ltvBps = tier.includes("80") ? 8000 : tier.includes("50") ? 5000 : 7000;
    const amountUsd = Math.round(params.amountEth * 2700);
    const dueDateBlock = 11566330 + 1000;

    // 🔐 CLIENT-SIDE ENCRYPTION (No plaintext sent in transactions)
    const encryptedBundle = await encryptInvoiceClientSide({
      invoiceId: invId,
      amountEth: params.amountEth,
      amountUsd: amountUsd,
      debtor: params.debtor,
      dueDateBlock: dueDateBlock,
      notes: "Encrypted via AES-256-GCM under VaultBridge V2 Privacy Layer",
    });

    const newInv: InvoiceRecord = {
      id: invId,
      invoiceIdHex: txHash,
      amountEth: params.amountEth,
      amountUsd: amountUsd,
      debtor: params.debtor,
      dueDateBlock: dueDateBlock,
      txHash: txHash,
      status: "Awaiting Proof",
      riskTier: tier,
      ltvBps: ltvBps,
      apr: tier.includes("80") ? 4.0 : tier.includes("50") ? 6.5 : 4.5,
      createdAt: new Date().toISOString(),
      commitment: encryptedBundle.commitment,
      pointer: encryptedBundle.pointer,
      isEncrypted: true,
    };

    const updated = [newInv, ...currentInvoices];
    setStoredInvoices(updated);
    return newInv;
  },

  async runInteractiveAttestation(
    invoiceId: string,
    onProgress: (step: number, percent: number, title: string) => void
  ): Promise<InvoiceRecord> {
    const currentInvoices = getStoredInvoices();
    const inv = currentInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error("Invoice not found");

    onProgress(1, 15, "1/4: Querying Sepolia InvoiceRegistrar block inclusion...");
    await new Promise((r) => setTimeout(r, 600));

    onProgress(2, 45, "2/4: Generating Merkle proof & Block continuity proof...");
    await new Promise((r) => setTimeout(r, 800));

    onProgress(3, 75, "3/4: Calling Precompile 0x0FD2 on Creditcoin testnet...");
    await new Promise((r) => setTimeout(r, 700));

    onProgress(4, 100, "4/4: Registered with commitment & pointer! Ready to borrow.");
    inv.status = "Attested";
    inv.attestedHeight = 11566330;

    setStoredInvoices([...currentInvoices]);
    return { ...inv };
  },

  async borrowLiquidity(invoiceId: string, amountUsd: number, token: string = "USDC"): Promise<LoanRecord> {
    const currentInvoices = getStoredInvoices();
    const inv = currentInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error("Invoice not found");

    inv.status = "Borrowed";
    inv.borrowedAmountUsd = amountUsd;
    inv.borrowedToken = token;
    setStoredInvoices([...currentInvoices]);

    const currentLoans = getStoredLoans();
    const loanId = `LOAN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newLoan: LoanRecord = {
      id: loanId,
      invoiceId: inv.id,
      borrower: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
      principalUsd: amountUsd,
      currency: token,
      ltvPercent: Math.round((amountUsd / inv.amountUsd) * 100),
      apr: inv.apr || 4.5,
      status: "Active",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dueDateBlock: inv.dueDateBlock,
    };

    const updatedLoans = [newLoan, ...currentLoans];
    setStoredLoans(updatedLoans);
    return newLoan;
  },

  async simulatePayment(invoiceId: string): Promise<InvoiceRecord> {
    const currentInvoices = getStoredInvoices();
    const inv = currentInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error("Invoice not found");

    inv.status = "Paid";
    setStoredInvoices([...currentInvoices]);

    const currentLoans = getStoredLoans();
    const loan = currentLoans.find((l) => l.invoiceId === invoiceId);
    if (loan) {
      loan.status = "Repaid";
      setStoredLoans([...currentLoans]);
    }

    return { ...inv };
  },

  async triggerDefaultCheck(invoiceId: string): Promise<{ liquidated: boolean; reason: string }> {
    const currentInvoices = getStoredInvoices();
    const inv = currentInvoices.find((i) => i.id === invoiceId);
    if (!inv) throw new Error("Invoice not found");

    if (inv.id === "INV-2026-004") {
      inv.status = "Defaulted";
      setStoredInvoices([...currentInvoices]);

      const currentLoans = getStoredLoans();
      const loan = currentLoans.find((l) => l.invoiceId === invoiceId);
      if (loan) {
        loan.status = "Liquidated";
        setStoredLoans([...currentLoans]);
      }
      return {
        liquidated: true,
        reason: "Absence-of-payment proof verified on Sepolia block #11565000 via Precompile 0x0FD2. Collateral liquidated to lenders.",
      };
    }

    return {
      liquidated: false,
      reason: `Invoice due block #${inv.dueDateBlock} is in future or grace period. Default check rejected.`,
    };
  },
};
