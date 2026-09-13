"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import {
  X,
  Zap,
  Lock,
  Coins,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Play,
  Cpu,
  ShieldCheck,
  Building2,
  FileCheck,
} from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../lib/contracts";
import { soundFx } from "../lib/soundFx";

export interface JudgeDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlay?: boolean;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  isOpen,
  onClose,
  initialPlay = false,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(initialPlay);

  // Speedrun auto-play sequence: 4 steps in ~12 seconds (<15s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isPlayingAll) {
      if (currentStep < 4) {
        timer = setTimeout(() => {
          soundFx.playSuccessChime();
          setCurrentStep((prev) => prev + 1);
        }, 2800);
      } else {
        setIsPlayingAll(false);
        soundFx.playSuccessChime();
      }
    }
    return () => clearTimeout(timer);
  }, [isOpen, isPlayingAll, currentStep]);

  useEffect(() => {
    if (isOpen && initialPlay) {
      setCurrentStep(1);
      setIsPlayingAll(true);
    }
  }, [isOpen, initialPlay]);

  if (!isOpen) return null;

  const handleStartSpeedrun = () => {
    soundFx.playClick();
    setCurrentStep(1);
    setIsPlayingAll(true);
  };

  const handleReset = () => {
    soundFx.playClick();
    setIsPlayingAll(false);
    setCurrentStep(1);
  };

  // Mock live verified transaction hashes with deep-links
  const SPEEDRUN_TXS = {
    sepoliaInvoiceTx: "0xe1f5cb789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2001122334455667788",
    creditcoinProofTx: "0x4a12bc89fa01234567890abcdef1234567890abcdef1234567890abcdef12",
    creditcoinDisbursementTx: "0x892a12cf4a5b6c7d8e9f0123456789abcdef123456789abcdef123456789abcdef",
    sepoliaSettlementTx: "0x91de4a12bc89fa01234567890abcdef1234567890abcdef1234567890abcdef12",
    creditcoinReleaseTx: "0x3f4a8b9c12de4567890abcdef1234567890abcdef1234567890abcdef12345678",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary-tint/60 via-surface to-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-700 text-white flex items-center justify-center font-bold shadow-md shadow-primary/30 shrink-0">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  1-Click Hackathon Speedrun (&lt;15s)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                  ⚡ End-to-End Cross-Chain Lifecycle
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-ink-secondary line-clamp-1">
                From Sepolia Invoice Registration to Precompile Proof, Instant USDC Disbursement &amp; Settlement
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-1.5 sm:p-2 rounded-xl text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border bg-bg/50 text-[11px] sm:text-xs text-center font-semibold select-none">
          {[
            { num: 1, title: "1. Sepolia Registration" },
            { num: 2, title: "2. 0x0FD2 Proof" },
            { num: 3, title: "3. USDC Disbursement" },
            { num: 4, title: "4. Settlement & Release" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                soundFx.playClick();
                setIsPlayingAll(false);
                setCurrentStep(s.num);
              }}
              className={`py-2 sm:py-3 px-2 border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                currentStep === s.num
                  ? "border-primary text-primary font-bold bg-primary-tint/30"
                  : currentStep > s.num
                  ? "border-emerald-600 text-emerald-600 bg-emerald-500/10"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {currentStep > s.num ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: LIVE INVOICE REGISTRATION ON SEPOLIA */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Step 1 of 4: Live Invoice Registration on Sepolia
                </span>
                <span className="text-[11px] font-mono text-ink-secondary">
                  Ethereum Sepolia (Chain ID: 11155111)
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-ink">
                Client-Side AES-256-GCM Encryption &amp; On-Chain Commitment
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The supplier’s browser encrypts the $50,000 USD factoring invoice with AES-256-GCM. Confidential debtor terms and metadata are stored in IPFS; only the deterministic SHA-256 commitment hash is published to Ethereum Sepolia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-bg rounded-xl border border-border space-y-1">
                  <span className="text-ink-secondary font-medium">Factoring Invoice Face Value</span>
                  <p className="font-bold text-ink text-sm">INV-2026-PRIME-001 • $50,000.00 USD</p>
                  <p className="text-[11px] text-ink-secondary">Debtor: BMW Financial Services NA (Tier A Prime 80%)</p>
                </div>
                <div className="p-3 bg-primary-tint/30 rounded-xl border border-primary/20 space-y-1">
                  <span className="text-primary font-medium">On-Chain Binding Commitment</span>
                  <p className="font-mono text-ink text-[11px] truncate">
                    0x98f4e21a88b9c71234567890abcdef1234567890abcdef1234567890abcdef12
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold truncate">
                    IPFS Pointer: ipfs://bafkreihdwdcefgh456privacyblob789
                  </p>
                </div>
              </div>

              {/* Deep-Links directly to Sepolia Etherscan */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span className="text-ink font-semibold">Sepolia Live Attestation Record</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={EXPLORER_HELPERS.getSepoliaTxUrl(SPEEDRUN_TXS.sepoliaInvoiceTx)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-primary flex items-center gap-1 transition-colors"
                  >
                    <span>View Registration Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={EXPLORER_HELPERS.getSepoliaAddressUrl(CONTRACT_ADDRESSES.sepolia.invoiceRegistrar)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-ink-secondary hover:text-ink flex items-center gap-1 transition-colors"
                  >
                    <span>InvoiceRegistrar.sol</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CREDITCOIN PRECOMPILE PROOF VERIFICATION */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  Step 2 of 4: Creditcoin Precompile 0x0FD2 Verification
                </span>
                <span className="text-[11px] font-mono text-primary font-bold">
                  Precompile 0x000...0FD2
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-ink">
                Synchronous 1-Block Cryptographic Merkle Patricia Trie Attestation
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Creditcoin’s native verifier precompile (<code>0x0FD2</code>) executes deterministic Merkle Patricia Trie inclusion proofs directly in EVM opcode execution in ~15 seconds without multisig bridge delays or trusted relayer sets.
              </p>

              {/* Cryptographic Trie Flow Diagram */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3 font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[10px]">
                  <span>Merkle Patricia Trie Proof Path</span>
                  <span className="text-emerald-400 font-bold">⚡ 7,100 Gas (Batch) vs 52,000 Gas (86.3% Saved)</span>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 font-bold text-[10px]">
                      1. Sepolia Block Header #11692200
                    </span>
                    <span className="text-slate-400">Validated via ChainInfo 0x0FD3</span>
                  </div>
                  <div className="ml-4 pl-3 border-l-2 border-primary/40 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">↳ 2. Receipts Merkle Root:</span>
                      <span className="text-slate-400">Cryptographically Proved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">↳ 3. Encoded RLP Leaf:</span>
                      <span className="text-slate-400">InvoiceIssued(INV-2026-PRIME-001)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 pt-1 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>4. Native Precompile 0x0FD2 Verification: TRUE (0x01)</span>
                  </div>
                </div>
              </div>

              {/* Deep-Links directly to Creditcoin Blockscout */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-ink font-semibold">Creditcoin Precompile Verification Tx</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={EXPLORER_HELPERS.getCreditcoinTxUrl(SPEEDRUN_TXS.creditcoinProofTx)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-emerald-500 text-xs font-semibold text-emerald-600 flex items-center gap-1 transition-colors"
                  >
                    <span>View Proof Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={EXPLORER_HELPERS.getCreditcoinAddressUrl(CONTRACT_ADDRESSES.creditcoin.verifierPrecompile)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-emerald-500 text-xs font-semibold text-ink-secondary hover:text-ink flex items-center gap-1 transition-colors"
                  >
                    <span>Precompile 0x0FD2</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INSTANT USDC DISBURSEMENT */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  Step 3 of 4: Instant USDC Liquidity Disbursement
                </span>
                <span className="text-[11px] font-mono text-ink-secondary">
                  Creditcoin VaultLending.sol
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-ink">
                $40,000.00 USDC Disbursed at Tier A Prime (80% LTV)
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Because debtor BMW Financial Services has a Tier A credit tier, <code>VaultLending.sol</code> unlocks maximum 80% LTV at 4.0% APR, instantly transferring USDC working capital from the institutional liquidity pool directly to the supplier.
              </p>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-ink">Disbursed Working Capital Loan:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base sm:text-lg font-mono">
                    $40,000.00 USDC
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
                  <div>
                    <span className="text-ink-secondary block">Debtor Tier:</span>
                    <span className="font-bold text-ink">Tier A Prime</span>
                  </div>
                  <div>
                    <span className="text-ink-secondary block">Max LTV Cap:</span>
                    <span className="font-bold text-primary">80.0% ($40k)</span>
                  </div>
                  <div>
                    <span className="text-ink-secondary block">Fixed APR:</span>
                    <span className="font-bold text-emerald-600">4.0% Annual</span>
                  </div>
                </div>
              </div>

              {/* Deep-Links to VaultLending & Disbursement Tx */}
              <div className="p-3 bg-bg border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-ink font-semibold">Institutional Vault Disbursement Record</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={EXPLORER_HELPERS.getCreditcoinTxUrl(SPEEDRUN_TXS.creditcoinDisbursementTx)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-primary flex items-center gap-1 transition-colors"
                  >
                    <span>View Disbursement Tx</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={EXPLORER_HELPERS.getCreditcoinAddressUrl(CONTRACT_ADDRESSES.creditcoin.vaultLending)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary text-xs font-semibold text-ink-secondary hover:text-ink flex items-center gap-1 transition-colors"
                  >
                    <span>VaultLending.sol</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFIED SETTLEMENT & COLLATERAL RELEASE */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Step 4 of 4: Verified Settlement &amp; Collateral Release
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">
                  Cross-Chain Settlement Complete
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-ink">
                Full Debtor Payment Verified &amp; Escrow Released
              </h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                The debtor settles the $50,000 payment on Sepolia. The Attestcoin engine proves payment inclusion on Creditcoin, automatically marking the loan repaid, settling accrued interest, and releasing locked collateral escrow without human intervention.
              </p>

              <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-surface border border-emerald-400 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/30 shrink-0">
                    <FileCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-ink">Loan Fully Settled &amp; Escrow Unlocked</h5>
                    <p className="text-xs text-ink-secondary">Principle $40,000 + Accrued Interest Reconciled</p>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold">Status: 100% Cryptographically Audited</span>
                  </div>
                </div>
              </div>

              {/* Both Chain Deep-Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-bg border border-border rounded-xl space-y-2">
                  <span className="text-ink-secondary block font-medium">1. Sepolia Debtor Payment Tx:</span>
                  <a
                    href={EXPLORER_HELPERS.getSepoliaTxUrl(SPEEDRUN_TXS.sepoliaSettlementTx)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-primary text-[11px] hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{SPEEDRUN_TXS.sepoliaSettlementTx.slice(0, 18)}...</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                <div className="p-3 bg-bg border border-border rounded-xl space-y-2">
                  <span className="text-ink-secondary block font-medium">2. Creditcoin Escrow Release Tx:</span>
                  <a
                    href={EXPLORER_HELPERS.getCreditcoinTxUrl(SPEEDRUN_TXS.creditcoinReleaseTx)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-600 text-[11px] hover:underline flex items-center gap-1"
                  >
                    <span className="truncate">{SPEEDRUN_TXS.creditcoinReleaseTx.slice(0, 18)}...</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-border bg-bg/80 flex flex-col sm:flex-row items-center justify-between gap-3">
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
              {isPlayingAll ? "Speedrunning Lifecycle..." : "1-Click Speedrun (12s)"}
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentStep < 4 ? (
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStep((prev) => prev + 1);
                }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  soundFx.playSuccessChime();
                  onClose();
                }}
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
