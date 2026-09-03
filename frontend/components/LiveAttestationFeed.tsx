"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "./ui/Card";
import { AttestationBadge } from "./AttestationBadge";
import { InvoiceRecord } from "../lib/api";
import {
  ExternalLink,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Flame,
  Award,
  AlertTriangle,
  Radio,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";
import { ProofVisualizerModal } from "./ProofVisualizerModal";

export interface FeedEvent {
  id: string;
  type: "INCLUSION_VERIFIED" | "DEFAULT_LIQUIDATED" | "STREAK_CHECKIN" | "BADGE_AWARDED" | "ACCESS_GRANTED" | "BLOCK_POLLED";
  title: string;
  subtitle: string;
  badgeText: string;
  txHash: string;
  timestamp: string;
}

export interface LiveAttestationFeedProps {
  invoices?: InvoiceRecord[];
  onAction?: (inv: InvoiceRecord) => void;
  className?: string;
}

const INITIAL_EVENTS: FeedEvent[] = [
  {
    id: "evt-1",
    type: "INCLUSION_VERIFIED",
    title: "INV-2026-001 Verified",
    subtitle: "$50,000 USD Accounts Receivable Authenticated",
    badgeText: "Verified Inclusion",
    txHash: "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d",
    timestamp: "Just now",
  },
  {
    id: "evt-2",
    type: "BADGE_AWARDED",
    title: "Milestone Credential #7 Issued",
    subtitle: "7-Day Soulbound non-transferable achievement NFT minted",
    badgeText: "Soulbound NFT",
    txHash: "0x3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
    timestamp: "1m ago",
  },
  {
    id: "evt-3",
    type: "DEFAULT_LIQUIDATED",
    title: "INV-2026-003 Liquidated (5% Bounty)",
    subtitle: "Absence proof verified on Precompile 0x0FD2. Keeper bounty disbursed.",
    badgeText: "Default Liquidated",
    txHash: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
    timestamp: "3m ago",
  },
  {
    id: "evt-4",
    type: "STREAK_CHECKIN",
    title: "Daily Habit Check-In Logged",
    subtitle: "Consecutive streak updated to 6 days via Attestcoin inclusion",
    badgeText: "Streak Check-In",
    txHash: "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
    timestamp: "5m ago",
  },
];

export const LiveAttestationFeed: React.FC<LiveAttestationFeedProps> = ({
  invoices = [],
  onAction,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "inclusions" | "liquidations" | "streaks">("all");
  const [events, setEvents] = useState<FeedEvent[]>(INITIAL_EVENTS);
  const [selectedProofTx, setSelectedProofTx] = useState<string | null>(null);

  // Connect to live SSE stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      const sseUrl = "http://localhost:4000/api/stream/attestations";
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type && data.type !== "CONNECTED") {
            const newEvt: FeedEvent = {
              id: data.id || "evt-" + Date.now(),
              type:
                data.type === "InclusionProofGenerated"
                  ? "INCLUSION_VERIFIED"
                  : data.type === "AbsenceProofGenerated" || data.type === "LiquidationExecuted"
                  ? "DEFAULT_LIQUIDATED"
                  : data.type === "StreakSlashed"
                  ? "STREAK_CHECKIN"
                  : "INCLUSION_VERIFIED",
              title: data.title || "Attestation Event",
              subtitle: data.description || "Verified on Creditcoin Precompile 0x0FD2",
              badgeText: data.type === "InclusionProofGenerated" ? "Verified" : "Attested",
              txHash: data.txHash || "0x" + Math.random().toString(16).slice(2).padEnd(64, "0"),
              timestamp: "Just now",
            };

            setEvents((prev) => [newEvt, ...prev.slice(0, 19)]);
          }
        } catch {}
      };
    } catch {
      // Fallback on simulated interval
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const filteredEvents = events.filter((evt) => {
    if (activeTab === "inclusions") return evt.type === "INCLUSION_VERIFIED";
    if (activeTab === "liquidations") return evt.type === "DEFAULT_LIQUIDATED";
    if (activeTab === "streaks") return evt.type === "STREAK_CHECKIN" || evt.type === "BADGE_AWARDED";
    return true;
  });

  return (
    <>
      <Card className={`overflow-hidden border border-border shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-gradient-to-r from-surface via-bg to-primary-tint/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 shrink-0">
              <Radio className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-ink">
                  Live Attestation Feed
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live SSE
                </span>
              </div>
              <p className="text-xs text-ink-secondary">
                Real-time cross-chain verification proofs on Precompile 0x0FD2
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-bg border border-border text-xs w-full sm:w-auto justify-between sm:justify-start">
            {[
              { key: "all", label: "All" },
              { key: "inclusions", label: "Inclusions" },
              { key: "liquidations", label: "Liquidations" },
              { key: "streaks", label: "Streaks" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  soundFx.playClick();
                  setActiveTab(tab.key as any);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTab === tab.key
                    ? "bg-surface text-primary shadow-xs border border-border"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
          {filteredEvents.map((evt) => {
            const isLiquidated = evt.type === "DEFAULT_LIQUIDATED";
            const isStreak = evt.type === "STREAK_CHECKIN" || evt.type === "BADGE_AWARDED";

            return (
              <div
                key={evt.id}
                className="p-4 hover:bg-surface-tint/20 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isLiquidated
                        ? "bg-red-500/10 text-red-500 border border-red-500/20"
                        : isStreak
                        ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                  >
                    {isLiquidated ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isStreak ? (
                      <Flame className="w-4 h-4" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-ink truncate">{evt.title}</h4>
                      <span
                        className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border shrink-0 ${
                          isLiquidated
                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                            : isStreak
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        }`}
                      >
                        {evt.badgeText}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-secondary truncate">{evt.subtitle}</p>
                    <div className="flex items-center gap-3 pt-0.5 text-[10px] text-ink-tertiary">
                      <span className="font-mono">{evt.txHash.slice(0, 10)}...{evt.txHash.slice(-6)}</span>
                      <span>&bull;</span>
                      <span>{evt.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Inspect Trie Button */}
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedProofTx(evt.txHash);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-bg hover:bg-primary-tint border border-border hover:border-primary/30 text-[11px] font-bold text-ink hover:text-primary transition-all flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100"
                >
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span className="hidden sm:inline">Inspect Trie</span>
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Merkle Patricia Trie Inspector Modal */}
      {selectedProofTx && (
        <ProofVisualizerModal
          isOpen={!!selectedProofTx}
          onClose={() => setSelectedProofTx(null)}
          txHash={selectedProofTx}
        />
      )}
    </>
  );
};
