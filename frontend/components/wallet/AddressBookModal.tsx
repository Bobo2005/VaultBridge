"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import {
  X,
  BookUser,
  Search,
  Plus,
  Trash2,
  Check,
  Building2,
  ShieldCheck,
  Coins,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Contact,
  getAddressBookContacts,
  saveAddressBookContact,
  deleteAddressBookContact,
} from "../../lib/addressBook";

export interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress?: (address: string, contactName?: string) => void;
}

export const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Contact Form
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newCategory, setNewCategory] = useState<Contact["category"]>("Debtor");
  const [newNetwork, setNewNetwork] = useState<Contact["network"]>("Sepolia");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setContacts(getAddressBookContacts());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) => {
    const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;

    saveAddressBookContact({
      name: newName,
      address: newAddress,
      category: newCategory,
      network: newNetwork,
      notes: newNotes,
    });

    setContacts(getAddressBookContacts());
    setIsAddingNew(false);
    setNewName("");
    setNewAddress("");
    setNewNotes("");
  };

  const handleDelete = (id: string) => {
    deleteAddressBookContact(id);
    setContacts(getAddressBookContacts());
  };

  const handleCopy = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card shadow-2xl max-w-lg w-full p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <BookUser className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Address Book</h3>
              <p className="text-[11px] text-ink-secondary">Manage saved debtors, auditors, & counterparties</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-secondary hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isAddingNew ? (
          /* Add Contact Form */
          <form onSubmit={handleCreateContact} className="space-y-3.5 bg-bg p-4 rounded-xl border border-border">
            <h4 className="text-xs font-bold text-ink">Save New Contact</h4>
            <div>
              <label className="text-[10px] uppercase font-semibold text-ink-secondary block mb-1">
                Contact Name / Enterprise
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Global Trade"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded-btn text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-semibold text-ink-secondary block mb-1">
                Ethereum / Creditcoin Address
              </label>
              <input
                type="text"
                required
                placeholder="0x..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-1.5 bg-surface border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-semibold text-ink-secondary block mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-btn text-xs text-ink"
                >
                  <option value="Debtor">Debtor</option>
                  <option value="Auditor">Auditor</option>
                  <option value="Borrower">Borrower</option>
                  <option value="Treasury">Treasury</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-semibold text-ink-secondary block mb-1">
                  Network
                </label>
                <select
                  value={newNetwork}
                  onChange={(e) => setNewNetwork(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-surface border border-border rounded-btn text-xs text-ink"
                >
                  <option value="Sepolia">Sepolia</option>
                  <option value="Creditcoin">Creditcoin</option>
                  <option value="Multi-Chain">Multi-Chain</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAddingNew(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Contact
              </Button>
            </div>
          </form>
        ) : (
          <>
            {/* Search & Actions Bar */}
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-bg border border-border rounded-btn text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setIsAddingNew(true)}
              >
                Add
              </Button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {["All", "Debtor", "Auditor", "Borrower", "Treasury"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all whitespace-nowrap ${
                    categoryFilter === cat
                      ? "bg-primary text-white"
                      : "bg-bg text-ink-secondary hover:text-ink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Contact List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-border/60 border border-border rounded-xl">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3 hover:bg-bg/60 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink truncate">{contact.name}</span>
                      <span className="px-1.5 py-0.5 bg-primary-tint text-primary text-[9px] font-bold rounded-full">
                        {contact.category}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] text-ink-secondary truncate">
                      {contact.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(contact.address, contact.id)}
                      className="p-1 text-ink-secondary hover:text-ink transition-colors"
                      title="Copy Address"
                    >
                      {copiedId === contact.id ? (
                        <Check className="w-3.5 h-3.5 text-success" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {onSelectAddress && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onSelectAddress(contact.address, contact.name);
                          onClose();
                        }}
                      >
                        Select
                      </Button>
                    )}

                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="p-1 text-ink-secondary hover:text-danger transition-colors ml-1"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="p-6 text-center text-xs text-ink-secondary">
                  No contacts found matching "{searchQuery}".
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
