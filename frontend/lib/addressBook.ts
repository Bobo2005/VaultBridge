/**
 * @file addressBook.ts
 * Address Book Management for VaultBridge
 * Saves, tags, and organizes frequent debtor, borrower, and auditor addresses in localStorage.
 */

export interface Contact {
  id: string;
  name: string;
  address: string;
  category: "Debtor" | "Auditor" | "Borrower" | "Treasury" | "Other";
  network: "Sepolia" | "Creditcoin" | "Multi-Chain";
  notes?: string;
  createdAt: string;
}

const STORAGE_KEY = "vaultbridge_address_book";

const DEFAULT_CONTACTS: Contact[] = [
  {
    id: "cnt_1",
    name: "Acme Global Freight Ltd.",
    address: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
    category: "Debtor",
    network: "Sepolia",
    notes: "Prime Tier A enterprise debtor with 80% LTV eligibility",
    createdAt: "2026-08-25T10:00:00Z",
  },
  {
    id: "cnt_2",
    name: "Ernst & Young Compliance Auditor",
    address: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
    category: "Auditor",
    network: "Creditcoin",
    notes: "Authorized auditor for Privacy Layer AccessRegistry grants",
    createdAt: "2026-08-26T14:30:00Z",
  },
  {
    id: "cnt_3",
    name: "Nexus Logistics Prime",
    address: "0xAaBbCcDdEeFf00112233445566778899aAbBcCdD",
    category: "Debtor",
    network: "Sepolia",
    notes: "Standard Tier B debtor for shipping invoice receivables",
    createdAt: "2026-08-27T09:15:00Z",
  },
  {
    id: "cnt_4",
    name: "VaultBridge Protocol Treasury",
    address: "0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714",
    category: "Treasury",
    network: "Creditcoin",
    notes: "Creditcoin lending liquidity pool contract",
    createdAt: "2026-08-28T11:00:00Z",
  },
];

export function getAddressBookContacts(): Contact[] {
  if (typeof window === "undefined") return DEFAULT_CONTACTS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONTACTS));
      return DEFAULT_CONTACTS;
    }
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function saveAddressBookContact(contact: Omit<Contact, "id" | "createdAt">): Contact {
  const contacts = getAddressBookContacts();
  const newContact: Contact = {
    ...contact,
    id: `cnt_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newContact, ...contacts];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
  return newContact;
}

export function deleteAddressBookContact(id: string): void {
  const contacts = getAddressBookContacts();
  const updated = contacts.filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }
}
