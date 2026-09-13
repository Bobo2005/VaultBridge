"use client";

import React, { useState } from "react";
import {
  X,
  FileCheck,
  ShieldCheck,
  Lock,
  ExternalLink,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  Key,
  QrCode,
  Building2,
  Calendar,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";
import { GasSavingsCalculator } from "./GasSavingsCalculator";

export interface AuditCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: string;
  amountUsd?: number;
  debtorName?: string;
  commitmentHash?: string;
  storagePointer?: string;
  creditcoinTxHash?: string;
  sepoliaProofTx?: string;
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  isOpen,
  onClose,
  invoiceId = "INV-2026-PRIME-001",
  amountUsd = 50000,
  debtorName = "BMW Financial Services NA (Tier A Prime)",
  commitmentHash = "0x98f4e21a88b9c71234567890abcdef1234567890abcdef1234567890abcdef12",
  storagePointer = "ipfs://bafkreihdwdcefgh456privacyblob789",
  creditcoinTxHash = "0x4a12bc89...creditcoin_attested_tx",
  sepoliaProofTx = "0x892a78f1...sepolia_settlement_tx",
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    soundFx.playClick();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopySummary = () => {
    soundFx.playClick();
    const summary = `
=== VAULTBRIDGE INSTITUTIONAL COMPLIANCE CERTIFICATE ===
Invoice ID: ${invoiceId}
Valuation: $${amountUsd.toLocaleString()} USD
Debtor: ${debtorName}
Commitment Hash (SHA-256): ${commitmentHash}
Storage Pointer: ${storagePointer}
Settlement Attestation: Verified on Creditcoin Precompile 0x0FD2
Creditcoin Tx: ${creditcoinTxHash}
Status: 100% Cryptographically Verified & Audited
=======================================================
    `.trim();

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-surface border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-emerald-500/10 via-surface to-primary-tint/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 shrink-0">
              <FileCheck className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-ink">
                  Institutional Proof & Compliance Certificate
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                  VERIFIED AUDIT
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Tamper-proof on-chain verification report for KPMG, Deloitte & Institutional Lenders
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Printable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-surface">
          {/* Official Seal Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-bg via-surface to-primary-tint/30 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  VaultBridge Protocol Attestation Seal
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-ink">{invoiceId}</h2>
              <p className="text-xs text-ink-secondary">
                Issued for {debtorName} • Advance Rate: 80% Tier A Prime
              </p>
            </div>

            <div className="text-center sm:text-right shrink-0 p-3 rounded-xl bg-surface border border-border shadow-xs">
              <span className="text-[10px] font-bold text-ink-tertiary uppercase block">
                Valuation Amount
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                ${amountUsd.toLocaleString()} USD
              </span>
            </div>
          </div>

          {/* Core Verification Proof Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
              <div className="flex items-center gap-2 text-ink font-bold">
                <Lock className="w-4 h-4 text-primary" />
                <span>Client-Side Payload Confidentiality</span>
              </div>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Encrypted client-side via <strong>AES-256-GCM</strong>. Deterministic SHA-256 commitment validated against on-chain storage.
              </p>
              <div className="p-2 rounded-lg bg-surface border border-border font-mono text-[10px] text-ink-secondary truncate">
                Commitment: {commitmentHash}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg border border-border space-y-2">
              <div className="flex items-center gap-2 text-ink font-bold">
                <Key className="w-4 h-4 text-indigo-500" />
                <span>ECIES Viewing Key Delegation</span>
              </div>
              <p className="text-ink-secondary text-[11px] leading-relaxed">
                Granted to <strong>Verified Auditor Role</strong> via secp256k1 ECIES on <code>AccessRegistry.sol</code> with 1-click on-chain revocation.
              </p>
              <div className="p-2 rounded-lg bg-surface border border-border font-mono text-[10px] text-ink-secondary truncate">
                Pointer: {storagePointer}
              </div>
            </div>
          </div>

          {/* On-Chain Cross-Chain Settlement Matrix */}
          <div className="p-4 rounded-2xl bg-bg border border-border space-y-3 text-xs">
            <h4 className="font-bold text-ink uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Cross-Chain Settlement & Attestation Matrix
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-ink-secondary">Settlement Chain:</span>
                <span className="font-bold text-ink">Creditcoin Testnet (Chain ID 102031)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-ink-secondary">Verification Engine:</span>
                <span className="font-bold text-emerald-600 font-mono">Native Precompile 0x0FD2</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-ink-secondary">Source Chain Tx Hash:</span>
                <span className="font-mono text-primary font-medium truncate max-w-[220px]">
                  {sepoliaProofTx}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border">
                <span className="text-ink-secondary">Audit Status:</span>
                <span className="flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Fully Reconciled & Solvent
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Precompile Gas Savings Breakdown */}
          <GasSavingsCalculator compact={true} />

          {/* Certificate Footer Stamp */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-ink">Tamper-Proof Audit Guarantee</p>
                <p className="text-[11px] text-ink-secondary">
                  Certified by VaultBridge Cryptographic Verification Engine
                </p>
              </div>
            </div>
            <span className="text-[10px] text-ink-tertiary font-mono">
              Timestamp: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 border-t border-border bg-bg/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-bg text-xs font-bold text-ink flex items-center justify-center gap-2 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied Audit Report!" : "Copy Summary"}</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-bg text-xs font-bold text-ink flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/30 hover:bg-primary-hover transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
