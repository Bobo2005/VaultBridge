"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TopBar } from "../../components/layout/TopBar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import {
  FileText,
  Clock,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  Bot,
  ExternalLink,
  Layers,
  Lock,
  Flame,
  Award,
  Key,
  Cpu,
  Share2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Scale,
  ShieldAlert
} from "lucide-react";
import { CONTRACT_ADDRESSES } from "../../lib/contracts";

export default function HowItWorksPage() {
  const [selectedBenchmarkTab, setSelectedBenchmarkTab] = useState<"all" | "security" | "gas" | "liquidation">("all");

  const rwaSteps = [
    {
      num: "01",
      title: "Client-Side Encryption & Tokenization",
      chain: "Ethereum Sepolia (V1 + V2)",
      icon: <Lock className="w-6 h-6 text-primary" />,
      desc: "Suppliers issue invoices encrypted client-side using AES-256-GCM. Plaintext invoice details never touch a server; only a 32-byte SHA-256 commitment and encrypted IPFS pointer are stored on-chain.",
      tag: "AES-256-GCM Privacy Layer",
    },
    {
      num: "02",
      title: "Attestcoin Relayer Attestation",
      chain: "Creditcoin Relayer",
      icon: <Clock className="w-6 h-6 text-primary" />,
      desc: "Creditcoin's decentralized relayer observes the Sepolia block and attests its Merkle state root into Creditcoin's native state via precompile 0x0FD3 in ~15 seconds without third-party oracles.",
      tag: "Deterministic Attestation",
    },
    {
      num: "03",
      title: "Precompile 0x0FD2 Verification & Liquidity",
      chain: "Creditcoin USC Layer",
      icon: <Zap className="w-6 h-6 text-primary" />,
      desc: "ProofBuilder generates a cryptographic Merkle proof. VaultLending verifies it in 1 transaction via precompile 0x0FD2 (or bulk batches up to 20 invoices with 86.5% gas savings), unlocking dynamic risk-tiered credit lines (80%/70%/50% LTV).",
      tag: "Precompile 0x0FD2 & 86.5% Batching",
    },
    {
      num: "04",
      title: "Attested Release or Absence Default",
      chain: "Creditcoin Native VM",
      icon: <Bot className="w-6 h-6 text-primary" />,
      desc: "Payment on Sepolia releases collateral instantly via inclusion proof. If unpaid past due date block, our autonomous keeper submits an Absence Proof, triggering permissionless liquidation without human discretion.",
      tag: "Zero-Oracle Absence Proof",
    },
  ];

  const streakSteps = [
    {
      num: "01",
      title: "Daily Habit Check-In",
      chain: "Ethereum Sepolia (V2)",
      icon: <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />,
      desc: "Users execute a daily checkIn() on StreakRegistry.sol on Sepolia. The contract enforces one check-in per 24-hour day index, emitting an immutable CheckedIn(streakId, dayIndex, timestamp) event.",
      tag: "Source Chain Habit Event",
    },
    {
      num: "02",
      title: "Cross-Chain Streak Attestation",
      chain: "Creditcoin 0x0FD2 (V2)",
      icon: <Award className="w-6 h-6 text-amber-500" />,
      desc: "Creditcoin StreakVerifier.sol verifies the positive check-in proof via Precompile 0x0FD2, increments currentCount, and automatically mints non-transferable Soulbound milestone badges at 7, 30, and 100 days.",
      tag: "Soulbound Milestone Badges",
    },
    {
      num: "03",
      title: "Permissionless Absence Slashing",
      chain: "Creditcoin Native VM (V2)",
      icon: <Bot className="w-6 h-6 text-danger" />,
      desc: "If a user misses a day, any peer or bounty hunter can generate an Absence Proof for that day and call breakStreakIfMissed(). The contract trustlessly resets the active streak to 0 while preserving the all-time record.",
      tag: "Attested Habit Slashing",
    },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-12">
      <TopBar
        title="Protocol Architecture & Lifecycle (V1 + V2)"
        subtitle="How VaultBridge bridges real-world invoice financing and habit tracking to Creditcoin using cryptographic Attestcoin proofs"
        showFilter={false}
        actionButton={
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="outline" size="md">
                Invoice Lending
              </Button>
            </Link>
            <Link href="/streaks">
              <Button variant="primary" size="md" icon={<Flame className="w-4 h-4 text-amber-300" />}>
                StreakChain
              </Button>
            </Link>
          </div>
        }
      />

      {/* SECTION 1: PRIVACY RWA LENDING */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-ink">1. Privacy-Preserving RWA Invoice Lending (V1 + V2)</h2>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Client-side encrypted trade finance with dynamic debtor risk tiers and attested default triggers
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary-tint text-primary text-xs font-bold w-fit">
            RWA / DeFi Track
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rwaSteps.map((st) => (
            <Card key={st.num} className="space-y-4 relative overflow-hidden group p-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary-tint flex items-center justify-center">
                  {st.icon}
                </div>
                <span className="text-3xl font-black text-slate-200 group-hover:text-primary/20 transition-colors">
                  {st.num}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-ink-secondary">
                    {st.chain}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-tint text-primary">
                    {st.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink">{st.title}</h3>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed">{st.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 2: STREAKCHAIN HABIT ATTESTATION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-bold text-ink">2. StreakChain Habit Attestation & Badges (V2)</h2>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Reusing the Attestcoin absence proof engine for verifiable habits, Soulbound badges, and trustless breaks
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold w-fit">
            Gaming Track
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {streakSteps.map((st) => (
            <Card key={st.num} className="space-y-4 relative overflow-hidden group p-6 border-amber-200/60 bg-surface">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  {st.icon}
                </div>
                <span className="text-3xl font-black text-slate-200 group-hover:text-amber-500/20 transition-colors">
                  {st.num}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-ink-secondary">
                    {st.chain}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                    {st.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-ink">{st.title}</h3>
              </div>

              <p className="text-xs text-ink-secondary leading-relaxed">{st.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3: COMPETITIVE BENCHMARK & COMPARISON MATRIX */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-ink">3. Competitive Benchmark Matrix</h2>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              How VaultBridge (Attestcoin 0x0FD2) outperforms traditional multisig bridges and centralized oracles
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-success-tint text-success text-xs font-bold w-fit">
            Zero Oracle Trust
          </span>
        </div>

        <Card className="p-6 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-ink-secondary font-semibold uppercase text-[10px]">
                  <th className="pb-3">Dimension</th>
                  <th className="pb-3 text-primary font-bold">⚡ VaultBridge (0x0FD2)</th>
                  <th className="pb-3">Multisig Bridges (LayerZero / Wormhole)</th>
                  <th className="pb-3">Centralized Oracles (Chainlink / Keepers)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="bg-primary-tint/20">
                  <td className="py-3.5 font-bold text-ink flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    Oracle Trust Model
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    0% (Cryptographic Merkle Proofs)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    100% (Relayer + Oracle Collusion Risk)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    100% (Multisig Committee Consensus)
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 font-bold text-ink flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    Settlement Latency
                  </td>
                  <td className="py-3.5 font-bold text-primary">
                    ~15 Seconds (1 Block Verification)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    15 – 60 Minutes (Checkpoint Latency)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    5 – 30 Minutes (Heartbeat / Deviation)
                  </td>
                </tr>

                <tr className="bg-primary-tint/20">
                  <td className="py-3.5 font-bold text-ink flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-primary shrink-0" />
                    Batch Gas Efficiency
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    ⚡ 86.5% Gas Savings (verifyBatch)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    Linear O(N) Costs per Message
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    High recurring upkeep & gas premium
                  </td>
                </tr>

                <tr>
                  <td className="py-3.5 font-bold text-ink flex items-center gap-1.5">
                    <Bot className="w-4 h-4 text-primary shrink-0" />
                    Default Liquidation
                  </td>
                  <td className="py-3.5 font-bold text-primary">
                    Pure Absence Proof (Zero Discretion)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    Unsupported (Positive proofs only)
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    Subject to keeper downtime / front-running
                  </td>
                </tr>

                <tr className="bg-primary-tint/20">
                  <td className="py-3.5 font-bold text-ink flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-primary shrink-0" />
                    Privacy Architecture
                  </td>
                  <td className="py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                    AES-256-GCM + ECIES Key Delegation
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    Plaintext payload on-chain
                  </td>
                  <td className="py-3.5 text-ink-secondary">
                    Public plaintext data feeds
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* SECTION 4: GAS BENCHMARK & SHARED ENGINE */}
      <Card className="space-y-5 border-blue-200 bg-gradient-to-br from-surface to-primary-tint/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Shared Engine: Precompile 0x0FD2 Gas Benchmarks</h3>
              <p className="text-xs text-ink-secondary">Synchronous On-Chain State Validation on Creditcoin</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-success-tint text-success rounded-full text-xs font-bold w-fit">
            ⚡ 86.5% Gas Reduction
          </span>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-ink-secondary font-semibold uppercase text-[10px]">
                <th className="pb-2">Operation Mode</th>
                <th className="pb-2">Gas per Invoice / Action</th>
                <th className="pb-2">10 Units Batch Cost</th>
                <th className="pb-2">Execution Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-3 font-semibold text-ink">Single Verification (verifySingle)</td>
                <td className="py-3 font-mono">~52,000 gas</td>
                <td className="py-3 font-mono">520,000 gas</td>
                <td className="py-3 text-ink-secondary">Creditcoin Native Precompile (0x0FD2)</td>
              </tr>
              <tr className="bg-primary-tint/40 font-bold text-primary">
                <td className="py-3">Bulk Merkle Batching (verifyBatch)</td>
                <td className="py-3 font-mono">~7,000 gas</td>
                <td className="py-3 font-mono">~70,000 gas</td>
                <td className="py-3">Shared Block Continuity Proof (⚡ 86.5% Saved)</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-ink">Absence Proof Default Trigger / Break</td>
                <td className="py-3 font-mono">~38,000 gas</td>
                <td className="py-3 font-mono">N/A (Single Window)</td>
                <td className="py-3 text-ink-secondary">Continuous Header Chain Verification</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}