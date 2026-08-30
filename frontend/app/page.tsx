"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import DashboardPage from "./dashboard/page";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ShieldCheck,
  Zap,
  Coins,
  Bot,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Wallet,
  Activity,
  ArrowUpRight,
  Lock,
  Flame,
  Key,
  Award,
  Share2,
  Cpu
} from "lucide-react";

export default function HomePage() {
  const { isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // If wallet is connected, seamlessly render the live Protocol Dashboard
  if (isConnected) {
    return <DashboardPage />;
  }

  const faqItems = [
    {
      q: "What is VaultBridge and what is new in Version 2?",
      a: "VaultBridge is a cross-chain RWA lending and habit attestation platform built on Creditcoin using the Attestcoin Protocol (@gluwa/usc-sdk) and native Precompile 0x0FD2. Version 1 introduced cross-chain invoice financing, dynamic debtor risk tiers, bulk Merkle batching, and the world's first Attested Default Trigger using absence-of-payment proofs. Version 2 expands this with a client-side Privacy Layer (AES-256-GCM + ECIES AccessRegistry) and StreakChain—a trustless habit verification module with Soulbound NFT badges targeting the Gaming Track.",
    },
    {
      q: "How does the Privacy Layer (V2) protect sensitive invoice data?",
      a: "Invoices are encrypted client-side in the user's browser before any transaction is signed. Only a 32-byte SHA-256 commitment hash and an encrypted IPFS pointer are stored on Creditcoin VaultLending.sol. Decryption keys are wrapped using secp256k1 ECIES and managed via AccessRegistry.sol, allowing the invoice owner to granularly grant and revoke read access to specific auditor or lender wallet addresses without ever revealing plaintext to the public.",
    },
    {
      q: "How does the Attested Default Trigger (Absence Proof) work?",
      a: "Traditional cross-chain bridges only prove that an event occurred. When an invoice reaches its Sepolia due date block (H_due) without payment, VaultBridge generates a cryptographic absence proof verifying that the continuous block history contains zero qualifying payment transactions. The smart contract executes default liquidation with mathematical certainty—without centralized oracles or human discretion.",
    },
    {
      q: "What is StreakChain (V2) and how does it reuse the Attestcoin engine?",
      a: "StreakChain applies the core Attestcoin Protocol to non-financial habit tracking. Users check in daily on Ethereum Sepolia via StreakRegistry.sol, and Creditcoin StreakVerifier.sol verifies inclusion proofs via Precompile 0x0FD2 to increment their active streak. If a day is missed, any peer can permissionlessly submit an Absence Proof to break the streak. Users earn Soulbound non-transferable ERC-721 milestone badges at 7, 30, and 100 consecutive days.",
    },
    {
      q: "Why is Creditcoin's Native Precompile 0x0FD2 a breakthrough?",
      a: "Creditcoin's native verifier precompile (0x000...0FD2) executes cryptographic Merkle and block continuity verification synchronously in 1 transaction on-chain (~28,500 gas for single proofs, ~7,000 gas in bulk batches), settling cross-chain actions in a single block without multi-signature delay.",
    },
    {
      q: "How does Bulk Batch Verification save 86.5% on gas?",
      a: "Instead of verifying invoices individually (52,000 gas each), our Bulk Batch Verifier calls verifyBatch on Precompile 0x0FD2, combining up to 20 invoices under one shared block continuity proof. This reduces gas cost to ~7,000 gas per invoice—an 86.5% efficiency gain for enterprise invoice financing.",
    },
  ];

  return (
    <div className="space-y-20 py-4 max-w-6xl mx-auto select-none">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 text-center space-y-8">
        {/* Glowing Ambient Backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Main Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-ink tracking-tight leading-[1.1]">
            Cross-Chain Privacy RWA & Habit Attestation on{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Creditcoin
            </span>
          </h1>
          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-3xl mx-auto">
            Tokenize trade invoices with <strong>client-side encryption</strong> on Ethereum Sepolia, borrow instant liquidity on Creditcoin, and verify daily habit streaks with <strong>Soulbound NFT badges</strong>—powered 100% trustlessly by the <strong>Attestcoin Protocol</strong>.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            icon={<Wallet className="w-5 h-5" />}
            onClick={() => connect()}
            className="w-full sm:w-auto px-8 py-3.5 text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <span>Connect Wallet & Enter App</span>
          </Button>

          <Link href="/how-it-works" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              icon={<Activity className="w-4 h-4" />}
              className="w-full sm:w-auto px-6 py-3.5 text-sm"
            >
              <span>Explore Architecture (V1 + V2)</span>
            </Button>
          </Link>
        </div>

        {/* 4 Live Metric Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto text-left">
          <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider block">
              Total Collateral
            </span>
            <p className="text-2xl font-black text-ink mt-0.5">$2.84M USD</p>
            <span className="text-[11px] text-success font-medium">Encrypted RWA Escrow</span>
          </div>

          <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider block">
              Gas Efficiency
            </span>
            <p className="text-2xl font-black text-primary mt-0.5">⚡ 86.5%</p>
            <span className="text-[11px] text-ink-secondary font-medium">Bulk Merkle Batching</span>
          </div>

          <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider block">
              Privacy & Access
            </span>
            <p className="text-2xl font-black text-ink mt-0.5">AES-256</p>
            <span className="text-[11px] text-primary font-medium">ECIES AccessRegistry</span>
          </div>

          <div className="p-4 bg-surface border border-border rounded-2xl shadow-xs">
            <span className="text-[11px] font-semibold text-ink-secondary uppercase tracking-wider block">
              Habit Attestation
            </span>
            <p className="text-2xl font-black text-amber-500 mt-0.5">Soulbound</p>
            <span className="text-[11px] text-ink-secondary font-medium">Precompile 0x0FD2</span>
          </div>
        </div>
      </section>

      {/* COMPOSABLE WITH BAR */}
      <section className="pt-2 pb-6 border-y border-border/80 text-center space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-secondary">
          Composable Across Leading Web3 Infrastructure
        </span>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-200">
          <span className="font-mono font-bold text-sm text-ink">Ethereum Sepolia</span>
          <span className="font-mono font-bold text-sm text-ink">Creditcoin 3 USC</span>
          <span className="font-mono font-bold text-sm text-ink">Attestcoin Protocol</span>
          <span className="font-mono font-bold text-sm text-ink">AES-256-GCM / ECIES</span>
          <span className="font-mono font-bold text-sm text-ink">Precompile 0x0FD2</span>
          <span className="font-mono font-bold text-sm text-ink">Vercel & Render</span>
        </div>
      </section>

      {/* DUAL PRODUCT SHOWCASE: V1 RWA LENDING + V2 PRIVACY & STREAKCHAIN */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Unified Ecosystem
          </span>
          <h2 className="text-3xl font-black text-ink tracking-tight">
            One Trustless Engine, Two Transformative Products
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Built on native precompiles and dual-proof cryptographic verification to eliminate centralized counterparty risk across DeFi and gaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product 1: Privacy RWA Lending */}
          <Card className="p-8 space-y-6 border-primary/30 relative overflow-hidden bg-gradient-to-br from-surface to-primary-tint/20">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold">
                <Lock className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full bg-primary-tint text-primary text-xs font-bold border border-primary/20">
                RWA/DeFi Track (V1 + V2)
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-ink">Privacy-Preserving RWA Lending</h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Tokenize unpaid B2B trade invoices with end-to-end client-side encryption. Commitments and pointers are stored on Creditcoin, with granular access sharing via <code>AccessRegistry.sol</code> and dynamic risk-tiered credit lines (80%/70%/50% LTV).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-bg rounded-xl border border-border/60">
                <span className="text-ink-secondary font-medium">Encryption</span>
                <p className="font-bold text-ink mt-0.5">AES-256-GCM + ECIES</p>
              </div>
              <div className="p-3 bg-bg rounded-xl border border-border/60">
                <span className="text-ink-secondary font-medium">Default Mechanism</span>
                <p className="font-bold text-primary mt-0.5">Absence Proof Trigger</p>
              </div>
            </div>

            <Link href="/invoices" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-dark pt-2">
              <span>Enter Invoice Lending Module</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>

          {/* Product 2: StreakChain */}
          <Card className="p-8 space-y-6 border-amber-300/60 relative overflow-hidden bg-gradient-to-br from-surface to-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                <Flame className="w-6 h-6 fill-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                Gaming Track (V2)
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-ink">StreakChain Habit Attestation</h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                Reuses the absence-proof engine for trustless habit verification. Check in daily on Sepolia, attest on Creditcoin via Precompile 0x0FD2, mint non-transferable Soulbound milestone badges (7, 30, 100 days), and trustlessly break missed streaks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-bg rounded-xl border border-border/60">
                <span className="text-ink-secondary font-medium">Milestone Rewards</span>
                <p className="font-bold text-amber-600 mt-0.5">Soulbound ERC-721</p>
              </div>
              <div className="p-3 bg-bg rounded-xl border border-border/60">
                <span className="text-ink-secondary font-medium">Slashing Logic</span>
                <p className="font-bold text-danger mt-0.5">Permissionless Break</p>
              </div>
            </div>

            <Link href="/streaks" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 pt-2">
              <span>Enter StreakChain Module</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* 4 CORE INNOVATION PILLARS */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Key Differentiators
          </span>
          <h2 className="text-3xl font-black text-ink tracking-tight">
            How VaultBridge Revolutionizes Verification
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Built on native precompiles and dual-proof cryptographic verification to eliminate centralized counterparty risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Pillar 1 */}
          <Card className="space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all p-5">
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Privacy Layer (V2)</span>
              <h3 className="text-base font-bold text-ink">Client-Side AES & ECIES</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Zero plaintext stored on-chain. Granular address-scoped key delegation via <code>AccessRegistry.sol</code>.
              </p>
            </div>
          </Card>

          {/* Pillar 2 */}
          <Card className="space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all p-5">
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Precompile 0x0FD2</span>
              <h3 className="text-base font-bold text-ink">Synchronous 1-Block Proofs</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Direct EVM precompile verification with bulk Merkle batching saving up to 86.5% gas for enterprise portfolios.
              </p>
            </div>
          </Card>

          {/* Pillar 3 */}
          <Card className="space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all p-5">
            <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Absence Engine</span>
              <h3 className="text-base font-bold text-ink">Attested Default Trigger</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Proves zero payment before due date to execute automated default liquidations without centralized oracles.
              </p>
            </div>
          </Card>

          {/* Pillar 4 */}
          <Card className="space-y-3 relative overflow-hidden group hover:border-primary/40 transition-all p-5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">StreakChain (V2)</span>
              <h3 className="text-base font-bold text-ink">Soulbound NFT Badges</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Non-transferable ERC-721 milestone badges awarded at 7, 30, and 100 days with public verifiable proof certificates.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* HOW IT WORKS 4-STEP VISUAL JOURNEY */}
      <section className="space-y-8 bg-surface p-8 sm:p-10 border border-border rounded-3xl shadow-sm">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Cross-Chain Lifecycle</span>
          <h2 className="text-3xl font-black text-ink tracking-tight">The 4-Step Attestcoin Verification Flow</h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Shared cross-chain attestation engine powering both RWA invoice financing and habit tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 relative">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-primary/30">
              01
            </div>
            <h4 className="text-sm font-bold text-ink">Action on Sepolia</h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Invoice issued (or habit checked-in) on Ethereum Sepolia with client-side encryption.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-primary/30">
              02
            </div>
            <h4 className="text-sm font-bold text-ink">Relayer Attestation</h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Creditcoin relayer observes the Sepolia block and attests its header state in ~15 seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-primary/30">
              03
            </div>
            <h4 className="text-sm font-bold text-ink">0x0FD2 Verification</h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              ProofBuilder generates proofs; Creditcoin precompile executes synchronous verification on-chain.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold flex items-center justify-center text-sm shadow-sm shadow-primary/30">
              04
            </div>
            <h4 className="text-sm font-bold text-ink">Release, Slash or Award</h4>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Collateral released, overdue loan liquidated via absence proof, or Soulbound milestone badge awarded.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE FAQ ACCORDION */}
      <section className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Frequently Asked Questions</span>
          <h2 className="text-3xl font-black text-ink tracking-tight">Everything You Need to Know (V1 + V2)</h2>
          <p className="text-xs sm:text-sm text-ink-secondary">
            Deep dive into the cryptographic design, Privacy Layer, StreakChain, and Creditcoin precompiles.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-ink hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-ink-secondary transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-ink-secondary leading-relaxed border-t border-border/60 animate-in fade-in duration-150">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="p-8 sm:p-12 bg-gradient-to-br from-primary via-blue-700 to-indigo-800 text-white rounded-3xl text-center space-y-6 shadow-xl shadow-primary/20">
        <div className="max-w-2xl mx-auto space-y-3">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to Experience Trustless Cross-Chain Verification?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Connect your Web3 wallet now to enter the interactive protocol dashboard, tokenize encrypted invoices, draw liquidity, and track verifiable habit streaks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Button
            variant="secondary"
            size="lg"
            icon={<Wallet className="w-5 h-5 text-primary" />}
            onClick={() => connect()}
            className="w-full sm:w-auto px-8 py-3.5 text-sm bg-white text-primary hover:bg-slate-50 font-bold shadow-lg"
          >
            <span>Connect Wallet & Enter App</span>
          </Button>

          <Link href="/how-it-works" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto px-6 py-3.5 text-sm border-white/40 text-white hover:bg-white/10"
            >
              <span>View Technical Docs</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
