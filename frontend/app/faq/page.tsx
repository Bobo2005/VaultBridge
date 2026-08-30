"use client";

import React, { useState } from "react";
import { TopBar } from "../../components/layout/TopBar";
import { Card } from "../../components/ui/Card";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Key,
  Coins,
  Lock,
  Flame,
  Zap,
  Award,
  Bot
} from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
  category: "General" | "RWA Lending (V1)" | "Privacy Layer (V2)" | "StreakChain (V2)" | "Attestcoin & 0x0FD2";
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    q: "What is VaultBridge and what problems does it solve across V1 and V2?",
    a: "VaultBridge is a dual-track decentralized verification platform built on Creditcoin using the Attestcoin Protocol. In Version 1 (RWA Track), it solves the $3 Trillion trade finance liquidity trap by tokenizing invoices on Ethereum Sepolia and enabling trustless stablecoin borrowing with zero-oracle default liquidation. In Version 2, it adds a client-side Privacy Layer (AES-256-GCM + ECIES) to keep invoice terms confidential, and introduces StreakChain (Gaming Track)—reusing the absence-proof engine to power verifiable habit streaks and Soulbound NFT badges.",
  },
  {
    category: "Privacy Layer (V2)",
    q: "How does the Privacy Layer ensure invoice details remain confidential?",
    a: "Before signing any transaction, the user's browser encrypts the invoice data using AES-256-GCM with a symmetric key. The ciphertext blob is pinned to IPFS/blob storage, while Creditcoin VaultLending.sol receives only a 32-byte SHA-256 commitment hash and the IPFS pointer. Plaintext invoice amounts, debtor names, and payment dates are never exposed to the public on-chain.",
  },
  {
    category: "Privacy Layer (V2)",
    q: "How does AccessRegistry.sol handle address-scoped key delegation and revocation?",
    a: "When an invoice owner wishes to share data with an auditor, debtor, or secondary lender, the client wraps the AES key with the recipient's secp256k1 public key (ECIES) and records it on AccessRegistry.sol via grantAccess(). The recipient calls getWrappedKey() to unwrap the key using their private key and decrypt the blob. When the owner calls revokeAccess(), the recipient's access is revoked immediately on-chain.",
  },
  {
    category: "RWA Lending (V1)",
    q: "How do the Dynamic Debtor Risk Tiers and LTV caps work?",
    a: "VaultBridge implements risk-adjusted borrowing tiers in VaultLending.sol: Tier A (Prime Debtors, credit score ≥ 750) receives 80% LTV at 4.0% APR; Tier B (Standard Debtors) receives 70% LTV at 4.5% APR; Tier C (Subprime Debtors) receives 50% LTV at 6.5% APR. Borrowers can draw liquidity across USDC, EURC, or USDT.",
  },
  {
    category: "RWA Lending (V1)",
    q: "What is the Attested Default Trigger and how does the Absence Proof work?",
    a: "Traditional cross-chain bridges only prove that an event occurred. When an invoice passes its Sepolia due date block (H_due) without payment, VaultBridge generates a cryptographic absence proof verifying that no payment transaction occurred across the entire continuous block range [0, H_due]. VaultLending.sol executes default liquidation permissionlessly without requiring centralized oracle price feeds or human discretion.",
  },
  {
    category: "StreakChain (V2)",
    q: "What is StreakChain and how does it reuse the Attestcoin Protocol?",
    a: "StreakChain applies the core Attestcoin inclusion and absence-proving engine to habit tracking. Users perform a daily check-in on Ethereum Sepolia via StreakRegistry.checkIn(). Creditcoin StreakVerifier.sol verifies the inclusion proof via Precompile 0x0FD2 to increment active streak counts. If a day is missed, any peer or hunter can submit an Absence Proof via breakStreakIfMissed() to trustlessly reset the streak to 0.",
  },
  {
    category: "StreakChain (V2)",
    q: "What are the Soulbound Milestone Badges and why are they non-transferable?",
    a: "StreakBadge.sol is an ERC-721 contract with the _update() hook overridden to prevent user-to-user transfers. When a user reaches 7, 30, or 100 consecutive days of verified check-ins, StreakVerifier.sol automatically calls StreakBadge.mintMilestoneBadge() to award a permanent, soulbound NFT achievement that cannot be sold or transferred.",
  },
  {
    category: "Attestcoin & 0x0FD2",
    q: "What is Creditcoin's Native Precompile 0x0FD2 and why is it superior to bridge relayers?",
    a: "Precompile 0x0FD2 is a native cryptographic verification engine built directly into the Creditcoin node client. It verifies Merkle inclusion proofs and block header continuity in a single synchronous EVM transaction (~28,500 gas for single proofs, ~7,000 gas in bulk batches), settling cross-chain state in 1 block (~15s) without trusting multi-sig relayer sets.",
  },
  {
    category: "Attestcoin & 0x0FD2",
    q: "How does Bulk Merkle Batching save 86.5% on gas?",
    a: "Instead of submitting separate continuity proofs for each transaction, our Bulk Batch Verifier calls verifyBatch on Precompile 0x0FD2, combining up to 20 invoices under one shared block header continuity proof. This reduces gas consumption from ~52,000 gas to ~7,000 gas per invoice.",
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [selectedCat, setSelectedCat] = useState<string>("All");

  const categories = [
    "All",
    "General",
    "RWA Lending (V1)",
    "Privacy Layer (V2)",
    "StreakChain (V2)",
    "Attestcoin & 0x0FD2",
  ];

  const filteredFaqs =
    selectedCat === "All" ? FAQS : FAQS.filter((f) => f.category === selectedCat);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <TopBar
        title="Frequently Asked Questions (V1 + V2)"
        subtitle="Complete technical documentation for Privacy RWA Lending, StreakChain, and the Attestcoin Engine"
        showFilter={false}
      />

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCat(cat);
              setOpenIdx(0);
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              selectedCat === cat
                ? "bg-primary text-white shadow-xs"
                : "text-ink-secondary hover:text-ink hover:bg-bg"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card
              key={faq.q}
              className="p-5 cursor-pointer transition-all duration-150 hover:border-primary/40"
              onClick={() => setOpenIdx(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0 font-bold">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      {faq.category}
                    </span>
                    <h4 className="text-sm font-bold text-ink mt-0.5">{faq.q}</h4>
                  </div>
                </div>
                <div className="text-ink-secondary">
                  {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 pt-3 border-t border-border/60 text-xs text-ink-secondary leading-relaxed animate-in fade-in duration-150 space-y-2">
                  <p>{faq.a}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}