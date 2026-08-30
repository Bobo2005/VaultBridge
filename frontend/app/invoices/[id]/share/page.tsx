"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "../../../../components/layout/TopBar";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { ShareAccessPanel } from "../../../../components/ShareAccessPanel";
import {
  ChevronLeft,
  Sparkles,
  Shield,
  Lock,
  EyeOff,
  Cpu,
  CheckCircle2,
  ExternalLink,
  Zap,
  Layers,
  ArrowRight
} from "lucide-react";

export default function InvoiceSharePage() {
  const params = useParams();
  const invoiceId = (params?.id as string) || "INV-2026-001";

  // ZK Stealth Address Simulator State
  const [isSimulating, setIsSimulating] = useState(false);
  const [stealthData, setStealthData] = useState<{
    stealthAddress: string;
    ephemKey: string;
    nullifierHash: string;
    zkProofHash: string;
  } | null>(null);

  const handleSimulateZkStealth = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const ephem = "0x04" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const stealth = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const nullifier = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const proof = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      setStealthData({
        stealthAddress: stealth,
        ephemKey: ephem,
        nullifierHash: nullifier,
        zkProofHash: proof,
      });
      setIsSimulating(false);
    }, 450);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          href={`/invoices/${invoiceId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Receivable Details</span>
        </Link>
      </div>

      <TopBar
        title="Selective Access & Privacy Controls"
        subtitle={`Manage permissioned sharing & confidentiality controls for ${invoiceId}`}
        showFilter={false}
      />

      {/* Main ECIES & AccessRegistry Panel */}
      <ShareAccessPanel invoiceId={invoiceId} />

      {/* SECTION: ZK STEALTH ADDRESS ROADMAP SHOWCASE */}
      <Card className="space-y-5 border-purple-200 bg-gradient-to-br from-surface via-purple-500/5 to-primary-tint/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-500/20">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-ink">Phase 3 Privacy Roadmap: ZK Stealth Addresses</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                  Roadmap Milestone
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Complete Transaction Graph Unlinkability (ERC-5564 + Groth16 / Plonk Proofs)
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-purple-300 text-purple-700 hover:bg-purple-50 self-start sm:self-auto"
            onClick={handleSimulateZkStealth}
            isLoading={isSimulating}
            icon={<Sparkles className="w-3.5 h-3.5 text-purple-600" />}
          >
            Simulate ZK Stealth Link
          </Button>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          While VaultBridge Phase 2 delivers <strong>full invoice payload confidentiality</strong> (AES-256-GCM + ECIES key delegation), Phase 3 will decouple the public on-chain identity link between the Ethereum Sepolia supplier and Creditcoin loan recipient using one-time cryptographic stealth addresses and zero-knowledge nullifiers.
        </p>

        {/* Interactive ZK Simulator Output */}
        {stealthData ? (
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-purple-500/30 space-y-3 font-mono text-[11px] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-purple-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ZK Stealth Proof Generated (Simulated)
              </span>
              <span className="text-slate-400 text-[10px]">Zero Linkability</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">One-Time Stealth Settlement Address:</span>
                <span className="text-emerald-400 font-bold">{stealthData.stealthAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Ephemeral Curve Public Key (R):</span>
                <span className="text-slate-300 text-[10px] truncate block">{stealthData.ephemKey}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Nullifier Commitment:</span>
                  <span className="text-purple-300 text-[10px] truncate block">{stealthData.nullifierHash.slice(0, 24)}...</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">SNARK Proof Hash:</span>
                  <span className="text-purple-300 text-[10px] truncate block">{stealthData.zkProofHash.slice(0, 24)}...</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
              <span className="font-bold text-ink flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                1. Dual Key Pair
              </span>
              <p className="text-[11px] text-ink-secondary">
                Separate viewing and spending keys derived per borrower.
              </p>
            </div>

            <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
              <span className="font-bold text-ink flex items-center gap-1">
                <EyeOff className="w-3.5 h-3.5 text-purple-600" />
                2. Ephemeral Stealth
              </span>
              <p className="text-[11px] text-ink-secondary">
                Unique one-time deposit address generated per draw.
              </p>
            </div>

            <div className="p-3.5 bg-surface rounded-xl border border-border space-y-1">
              <span className="font-bold text-ink flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                3. ZK Nullifiers
              </span>
              <p className="text-[11px] text-ink-secondary">
                Repayment and liquidation unlinkable from origin wallet.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
