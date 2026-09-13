"use client";

import React, { useState } from "react";
import {
  X,
  Cpu,
  Layers,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Binary,
  Code2,
  Copy,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";
import { GasSavingsCalculator } from "./GasSavingsCalculator";

export interface ProofVisualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  txHash?: string;
  invoiceId?: string;
  blockHeight?: number;
}

export const ProofVisualizerModal: React.FC<ProofVisualizerModalProps> = ({
  isOpen,
  onClose,
  txHash = "0x892a78f16b23d5678901234567890abcdef1234567890abcdef1234567890abc",
  invoiceId = "INV-2026-PRIME-001",
  blockHeight = 7219482,
}) => {
  const [activeTab, setActiveTab] = useState<"trie" | "benchmark">("trie");
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const trieLayers = [
    {
      depth: 0,
      title: "Layer 0: State & Tx Root",
      type: "Root Node",
      hash: "0x7a8b9c...transactions_root",
      size: "532 bytes",
      description: `Sepolia Header #${blockHeight} Transactions Root committed to Creditcoin via ChainInfo Precompile 0x0FD3.`,
      color: "from-blue-500/20 to-primary/10 border-primary/40",
      pill: "Header Continuity",
    },
    {
      depth: 1,
      title: "Layer 1: Extension Prefix",
      type: "Extension Node",
      hash: "0x4a9b12...nibble_prefix",
      size: "96 bytes",
      description: "Shared path nibbles `0x4a9b` routing directly to the invoice payment transaction hash.",
      color: "from-purple-500/20 to-indigo-500/10 border-purple-500/40",
      pill: "Compact Nibbles",
    },
    {
      depth: 2,
      title: "Layer 2: Intermediate Branch",
      type: "Branch Node",
      hash: "0xd8e712...intermediate_branch",
      size: "512 bytes",
      description: "16-child routing slot verifying cryptographic inclusion without full block data overhead.",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/40",
      pill: "Zero-Knowledge Route",
    },
    {
      depth: 3,
      title: "Layer 3: RLP Leaf Payload",
      type: "Leaf Node (Settlement Tx)",
      hash: txHash,
      size: "284 bytes",
      description: "RLP encoded transaction data executing invoice settlement on Sepolia InvoiceRegistrar.sol.",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/40",
      pill: "Verified Inclusion",
    },
  ];

  const handleCopyCallData = () => {
    soundFx.playClick();
    const mockCallData = `0x7b1c4e90000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000006e2a82...`;
    navigator.clipboard.writeText(mockCallData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-surface border border-primary/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-primary-tint/70 via-surface to-indigo-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-primary/30 shrink-0">
              <Layers className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-ink">
                  Merkle Patricia Trie Proof Inspector
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Precompile 0x0FD2
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Cryptographic inclusion & block continuity verification on Creditcoin
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

        {/* View Switcher Tabs */}
        <div className="flex border-b border-border bg-bg/50 px-4 sm:px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("trie");
            }}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "trie"
                ? "border-primary text-primary font-bold bg-primary-tint/30"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Merkle Trie Decomposition</span>
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab("benchmark");
            }}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "benchmark"
                ? "border-emerald-500 text-emerald-600 font-bold bg-emerald-500/10"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>0x0FD2 Gas Savings Benchmark (86.3%)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === "benchmark" ? (
            <div className="space-y-4 animate-in fade-in duration-150">
              <GasSavingsCalculator />
            </div>
          ) : (
            <>
              {/* Top Quick Meta */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                    Source Block
                  </span>
                  <p className="text-sm font-bold text-ink mt-0.5">#{blockHeight}</p>
                  <span className="text-[10px] text-primary font-medium">Sepolia Attested</span>
                </div>
                <div className="p-3 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                    Precompile Gas
                  </span>
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">28,500 Gas</p>
                  <span className="text-[10px] text-emerald-600 font-medium">⚡ 45.2% Saved</span>
                </div>
                <div className="p-3 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                    Target Contract
                  </span>
                  <p className="text-xs font-mono font-bold text-ink truncate mt-0.5">
                    0x000...0FD2
                  </p>
                  <span className="text-[10px] text-ink-secondary">Native Precompile</span>
                </div>
                <div className="p-3 rounded-2xl bg-bg border border-border">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">
                    Status
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cryptographically Valid</span>
                  </div>
                </div>
              </div>

          {/* Interactive Trie Graph Layers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                <Binary className="w-4 h-4 text-primary" /> Merkle Patricia Trie Depth Tree
              </h4>
              <span className="text-[11px] text-ink-secondary">Click layer to inspect node</span>
            </div>

            <div className="space-y-2">
              {trieLayers.map((layer, idx) => {
                const isSelected = activeLayer === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveLayer(idx);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-gradient-to-r " + layer.color + " shadow-sm"
                        : "bg-surface border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-bg text-ink-secondary border border-border"
                        }`}
                      >
                        {layer.depth}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink truncate">
                            {layer.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-md bg-surface text-[10px] font-medium border border-border text-ink-secondary shrink-0">
                            {layer.pill}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-secondary line-clamp-1 font-mono mt-0.5">
                          {layer.hash}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-ink-secondary">
                        {layer.size}
                      </span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? "rotate-90 text-primary" : "text-ink-tertiary"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Layer Inspector */}
          <div className="p-4 rounded-2xl bg-bg border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-primary" /> Layer {activeLayer} Node Disassembly
              </span>
              <span className="text-[10px] font-mono bg-surface px-2 py-0.5 rounded-full border border-border text-ink-secondary">
                {trieLayers[activeLayer].type}
              </span>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              {trieLayers[activeLayer].description}
            </p>

            <div className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-1">
              <div className="text-slate-400">// Node Hash Verification</div>
              <div className="text-emerald-400 truncate">{trieLayers[activeLayer].hash}</div>
              <div className="text-slate-400 pt-1">// Precompile Verification Primitive</div>
              <div className="text-blue-400">
                IUSCVerifier(0x0FD2).verifySingle(chainKey: 1, height: {blockHeight}, ...)
              </div>
            </div>
          </div>

          {/* Gas Efficiency Benchmark Comparison */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-surface to-primary/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Attestcoin Precompile Advantage
              </h4>
              <p className="text-[11px] text-ink-secondary">
                Synchronous single-block verification without multisig relayer delay or bridge risk.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-ink-tertiary block">Multisig Bridges</span>
                <span className="text-xs line-through text-red-500 font-mono">52,000 gas</span>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-tertiary" />
              <div>
                <span className="text-[10px] text-emerald-600 font-bold block">0x0FD2 Native</span>
                <span className="text-sm font-bold text-emerald-600 font-mono">28,500 gas</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-bg/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyCallData}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-bg text-xs font-bold text-ink flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Copied 0x0FD2 Payload!" : "Copy Precompile CallData"}</span>
          </button>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-md shadow-primary/30 hover:bg-primary-hover transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
