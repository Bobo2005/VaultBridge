"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Award, Flame, CheckCircle2, Lock, ShieldCheck, ExternalLink, Share2, Copy } from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../lib/contracts";

export interface StreakBadgeCardProps {
  title: string;
  days: number;
  unlocked: boolean;
  tokenId?: number;
  mintedAt?: string;
  streakId?: string;
  className?: string;
}

export const StreakBadgeCard: React.FC<StreakBadgeCardProps> = ({
  title,
  days,
  unlocked,
  tokenId,
  mintedAt,
  streakId = "STRK-2026-001",
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/streaks/${streakId}`
      : `https://vaultbridge.xyz/streaks/${streakId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Card
      className={`p-4 space-y-3 relative overflow-hidden transition-all duration-200 border ${
        unlocked
          ? "border-amber-300/80 bg-gradient-to-b from-amber-500/5 to-amber-500/10 shadow-sm"
          : "border-border opacity-70 bg-bg/40"
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold transition-transform ${
            unlocked
              ? "bg-amber-500/20 text-amber-500 shadow-inner scale-105"
              : "bg-slate-100 dark:bg-slate-800 text-ink-secondary"
          }`}
        >
          {unlocked ? <Award className="w-6 h-6 animate-pulse" /> : <Lock className="w-5 h-5" />}
        </div>

        <div className="flex items-center gap-1.5">
          {unlocked && (
            <button
              onClick={handleShare}
              title="Share public proof link"
              className="p-1.5 rounded-lg bg-surface border border-border hover:border-primary text-ink-secondary hover:text-primary transition-colors flex items-center gap-1 text-[10px] font-semibold"
            >
              {copied ? <CheckCircle2 className="w-3 h-3 text-success" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Share"}</span>
            </button>
          )}

          {unlocked ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-success-tint text-success flex items-center gap-1 border border-success/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>Unlocked</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-bg text-ink-secondary border border-border">
              {days} Days Req.
            </span>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-ink flex items-center gap-1.5">
          <span>{title}</span>
          {unlocked && <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
        </h4>
        <p className="text-xs text-ink-secondary mt-0.5">
          {days} Consecutive Days Attested On-Chain
        </p>
      </div>

      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
        {unlocked ? (
          <>
            <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
              sSTRK #{tokenId !== undefined ? tokenId : 1}
            </span>
            <a
              href={EXPLORER_HELPERS.getCreditcoinAddressUrl(CONTRACT_ADDRESSES.creditcoin.streakBadge)}
              target="_blank"
              rel="noreferrer"
              className="text-ink-secondary hover:text-primary transition-colors flex items-center gap-0.5"
            >
              <span>Soulbound NFT</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </>
        ) : (
          <span className="text-ink-secondary flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Non-transferable ERC-721</span>
          </span>
        )}
      </div>
    </Card>
  );
};

export default StreakBadgeCard;
