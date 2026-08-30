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
  CheckCircle2
} from "lucide-react";
import { EXPLORER_HELPERS } from "../lib/contracts";

export interface FeedEvent {
  id: string;
  type: "INCLUSION_VERIFIED" | "DEFAULT_LIQUIDATED" | "STREAK_CHECKIN" | "BADGE_AWARDED";
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
    title: "INV-2026-001 Attested (1-Block)",
    subtitle: "$12,500 USDC Collateral Verified via Precompile 0x0FD2",
    badgeText: "Positive Proof",
    txHash: "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d",
    timestamp: "Just now",
  },
  {
    id: "evt-2",
    type: "BADGE_AWARDED",
    title: "Soulbound sSTRK #7 Awarded",
    subtitle: "7-Day Streak milestone badge minted on StreakBadge.sol",
    badgeText: "NFT Badge",
    txHash: "0x3456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012",
    timestamp: "1m ago",
  },
  {
    id: "evt-3",
    type: "DEFAULT_LIQUIDATED",
    title: "INV-2026-003 Liquidated",
    subtitle: "Absence-of-payment proof verified past due block #11566000",
    badgeText: "Absence Proof",
    txHash: "0x89abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567",
    timestamp: "3m ago",
  },
  {
    id: "evt-4",
    type: "STREAK_CHECKIN",
    title: "StreakChain Check-In Attested",
    subtitle: "Daily check-in for habit streak (current count: 5 days)",
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

  // Periodic simulated live ticker pulse
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvt: FeedEvent = {
        id: `evt-${Date.now()}`,
        type: "INCLUSION_VERIFIED",
        title: `INV-2026-${Math.floor(100 + Math.random() * 900)} Verified`,
        subtitle: `$${Math.floor(5000 + Math.random() * 15000).toLocaleString()} USDC Collateral Attested on Creditcoin`,
        badgeText: "Precompile 0x0FD2",
        txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        timestamp: "Just now",
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 5)]);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((e) => {
    if (activeTab === "inclusions") return e.type === "INCLUSION_VERIFIED";
    if (activeTab === "liquidations") return e.type === "DEFAULT_LIQUIDATED";
    if (activeTab === "streaks") return e.type === "STREAK_CHECKIN" || e.type === "BADGE_AWARDED";
    return true;
  });

  return (
    <Card className={`space-y-4 ${className}`}>
      {/* Header with Live Blinking Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Live Attestcoin Stream
            </span>
          </div>
          <h3 className="text-base font-bold text-ink tracking-tight mt-0.5">
            Creditcoin Attestation Feed
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-bg p-1 rounded-btn border border-border text-[10px] font-semibold">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2 py-1 rounded-md transition-all ${
              activeTab === "all" ? "bg-surface text-primary shadow-xs font-bold" : "text-ink-secondary hover:text-ink"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("inclusions")}
            className={`px-2 py-1 rounded-md transition-all ${
              activeTab === "inclusions" ? "bg-surface text-primary shadow-xs font-bold" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Inclusions
          </button>
          <button
            onClick={() => setActiveTab("liquidations")}
            className={`px-2 py-1 rounded-md transition-all ${
              activeTab === "liquidations" ? "bg-surface text-danger shadow-xs font-bold" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Liquidations
          </button>
          <button
            onClick={() => setActiveTab("streaks")}
            className={`px-2 py-1 rounded-md transition-all ${
              activeTab === "streaks" ? "bg-surface text-amber-600 shadow-xs font-bold" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Streaks
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="divide-y divide-border/60">
        {filteredEvents.map((evt) => {
          return (
            <div
              key={evt.id}
              className="py-3 flex items-start justify-between gap-3 hover:bg-bg/60 px-2 -mx-2 rounded-xl transition-colors animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    evt.type === "INCLUSION_VERIFIED"
                      ? "bg-emerald-500/10 text-emerald-600"
                      : evt.type === "DEFAULT_LIQUIDATED"
                      ? "bg-rose-500/10 text-rose-600"
                      : evt.type === "BADGE_AWARDED"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {evt.type === "INCLUSION_VERIFIED" ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : evt.type === "DEFAULT_LIQUIDATED" ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : evt.type === "BADGE_AWARDED" ? (
                    <Award className="w-4 h-4" />
                  ) : (
                    <Flame className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-ink truncate">{evt.title}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold ${
                        evt.type === "INCLUSION_VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : evt.type === "DEFAULT_LIQUIDATED"
                          ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {evt.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary truncate">{evt.subtitle}</p>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <span className="text-[10px] text-ink-secondary block">{evt.timestamp}</span>
                <a
                  href={EXPLORER_HELPERS.getCreditcoinTxUrl(evt.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-mono text-primary hover:underline inline-flex items-center gap-0.5"
                >
                  <span>Tx {evt.txHash.slice(0, 6)}...</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default LiveAttestationFeed;
