"use client";

import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  X,
  Sparkles,
  Zap,
  Lock,
  ShieldCheck,
  Coins,
  Flame,
  Award,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Play,
  Layers,
  Cpu
} from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../lib/contracts";

export interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [stepProgress, setStepProgress] = useState<number>(0);

  // Speedrun auto-play sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlayingAll) {
      if (currentStep < 4) {
        timer = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, 2200);
      } else {
        setIsPlayingAll(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isOpen, isPlayingAll, currentStep]);

  if (!isOpen) return null;

  const handleStartSpeedrun = () => {
    setCurrentStep(1);
    setIsPlayingAll(true);
  };

  const handleReset = () => {
    setIsPlayingAll(false);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-border bg-gradient-to-r from-primary-tint/60 via-surface to-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-primary/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">Judge Speedrun Demo Mode</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
                  ⚡ 10s End-to-End Walkthrough
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Experience the 4-step cross-chain attestation lifecycle across Privacy RWA Lending & StreakChain
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 border-b border-border bg-bg/50 text-xs text-center font-semibold select-none">
          {[
            { num: 1, title: "1. Encrypt RWA" },
            { num: 2, title: "2. 0x0FD2 Proof" },
            { num: 3, title: "3. Tier A Draw" },
            { num: 4, title: "4. Habit Badge" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                setIsPlayingAll(false);
                setCurrentStep(s.num);
              }}
              className={`py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                currentStep === s.num
                  ? "border-primary text-primary font-bold bg-primary-tint/30"
                  : currentStep > s.num
                  ? "border-success text-success bg-success-tint/20"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {currentStep > s.num ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-border text-[10px] flex items-center justify-center shrink-0">
                  {s.num}
                </span>
              )}
              <span className="truncate">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Step Interactive Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: ENCRYPTED RWA TOKENIZATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Step 1 of 4: Client-Side AES-256-GCM Encryption
                </span>
                <span className="text-[11px] font-mono text-ink-secondary">Source: Ethereum Sepolia</span>
              </div>

              <h4 className="text-lg font-bold text-ink">
                Tokenizing B2B Trade Invoice with Zero On-Chain Plaintext
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The supplier’s browser encrypts the invoice ($8,750 USD face value) using AES-256-GCM. Plaintext debtor identity and payment terms are stored in off-chain IPFS storage; only the SHA-256 commitment hash is published to Ethereum Sepolia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
                  <span className="text-ink-secondary font-medium">Plaintext Payload (Browser Memory Only)</span>
                  <p className="font-bold text-ink">INV-2026-DEMO • $8,750 USD</p>
                  <p className="text-[11px] text-ink-secondary">Debtor: Acme Global Freight Ltd. (Tier A)</p>
                </div>
                <div className="p-3 bg-primary-tint/30 rounded-xl border border-primary/20 space-y-1">
                  <span className="text-primary font-medium">On-Chain Binding Commitment</span>
                  <p className="font-mono text-ink text-[11px] truncate">0x98f4e21a4d8c7b89e3a1f4c2e5b8d9a0f1c2...</p>
                  <p className="text-[11px] text-success font-semibold">IPFS Pointer: ipfs://bafkreihdwdc...</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERACTIVE MERKLE PATRICIA TRIE PROOF PATH */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Step 2 of 4: Attestcoin Cryptographic Verification
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">Precompile 0x0FD2</span>
              </div>

              <h4 className="text-lg font-bold text-ink">
                Synchronous 1-Block Attestation & Merkle Proof
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Creditcoin’s native verifier precompile (<code>0x0FD2</code>) executes deterministic Merkle proof verification directly in EVM opcode execution in ~15 seconds without third-party multisig bridges.
              </p>

              {/* Interactive SVG Cryptographic Tree Diagram */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[10px]">
                  <span>Merkle Patricia Trie Proof Path</span>
                  <span className="text-emerald-400">⚡ 28,500 gas (1 Block)</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px]">1. Sepolia Block Header</span>
                    <span className="text-slate-400">Height #11597954 • Hash 0x3a9f...b42e</span>
                  </div>
                  <div className="ml-4 pl-3 border-l-2 border-primary/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">↳ 2. Receipts Merkle Root:</span>
                      <span className="text-slate-400">0x7c2d...89f1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">↳ 3. Encoded Tx Buffer:</span>
                      <span className="text-slate-400">InvoiceIssued(0x98f4...)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 pt-1 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4. Creditcoin Precompile 0x0FD2: VERIFIED TRUE (0x01)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TIER A DYNAMIC LENDING DRAW */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-success flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  Step 3 of 4: Dynamic Risk-Tiered Liquidity
                </span>
                <span className="text-[11px] font-mono text-ink-secondary">Creditcoin VaultLending.sol</span>
              </div>

              <h4 className="text-lg font-bold text-ink">
                $7,000 USDC Disbursed at Tier A (80% LTV)
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Because the debtor has a credit score of 780, <code>VaultLending.sol</code> unlocks prime Tier A borrowing (80% LTV at 4.0% APR) instead of standard 70% LTV, releasing instant liquidity to the borrower.
              </p>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-ink">Disbursed Loan Principal:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-sm font-mono">$7,000.00 USDC</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <div>
                    <span className="text-ink-secondary block">Debtor Tier:</span>
                    <span className="font-bold text-ink">Tier A Prime</span>
                  </div>
                  <div>
                    <span className="text-ink-secondary block">Max LTV:</span>
                    <span className="font-bold text-primary">80.0% Cap</span>
                  </div>
                  <div>
                    <span className="text-ink-secondary block">Fixed APR:</span>
                    <span className="font-bold text-success">4.0% Annual</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: STREAKCHAIN SOULBOUND BADGE MINT */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-600" />
                  Step 4 of 4: StreakChain Habit Attestation
                </span>
                <span className="text-[11px] font-mono text-amber-600 font-bold">Soulbound ERC-721</span>
              </div>

              <h4 className="text-lg font-bold text-ink">
                7-Day Builder Soulbound NFT Badge Awarded!
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Reusing the exact same Attestcoin engine, 7 consecutive daily check-ins on Sepolia automatically trigger <code>StreakVerifier.sol</code> on Creditcoin to mint a non-transferable milestone badge.
              </p>

              <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface border border-amber-300 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/30">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-ink">sSTRK #7: 7-Day Builder Badge</h5>
                    <p className="text-xs text-ink-secondary">Non-transferable Soulbound Achievement</p>
                    <span className="text-[10px] font-mono text-amber-600 font-semibold">Contract: StreakBadge.sol</span>
                  </div>
                </div>

                <a
                  href={EXPLORER_HELPERS.getCreditcoinAddressUrl(CONTRACT_ADDRESSES.creditcoin.streakBadge)}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-primary flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>Blockscout</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Modal Actions */}
        <div className="p-5 border-t border-border bg-bg/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={handleStartSpeedrun}
              disabled={isPlayingAll}
            >
              {isPlayingAll ? "Speedrunning..." : "Speedrun All (8s)"}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => setCurrentStep((prev) => prev + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={onClose}
              >
                Complete Walkthrough
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
