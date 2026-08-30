"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";
import { Flame, Trophy, Award, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { EXPLORER_HELPERS } from "../lib/contracts";

export interface StreakLeaderboardItem {
  rank: number;
  user: string;
  habit: string;
  currentStreak: number;
  longestStreak: number;
  badgesCount: number;
  isCurrentUser?: boolean;
}

export interface StreakLeaderboardProps {
  currentUserAddress?: string;
  className?: string;
}

export const StreakLeaderboard: React.FC<StreakLeaderboardProps> = ({
  currentUserAddress,
  className = "",
}) => {
  const [filter, setFilter] = useState<"all" | "active">("all");

  const defaultLeaderboard: StreakLeaderboardItem[] = [
    { rank: 1, user: "0x789d38c11e3b6a908871abf48820c29f6ca291c1", habit: "Daily Smart Contract Audit", currentStreak: 42, longestStreak: 42, badgesCount: 3 },
    { rank: 2, user: "0x3c4dbb9382109827371982739812739182731c2d", habit: "Morning 10km Run", currentStreak: 30, longestStreak: 35, badgesCount: 2 },
    { rank: 3, user: "0x8f7a982173918273918273918273918273916f7a", habit: "Daily Github Commit", currentStreak: 21, longestStreak: 21, badgesCount: 2 },
    { rank: 4, user: currentUserAddress || "0x9876543210fedcba9876543210fedcba98765432", habit: "Cross-Chain Lending Checks", currentStreak: 14, longestStreak: 18, badgesCount: 1, isCurrentUser: true },
    { rank: 5, user: "0x1234567890abcdef1234567890abcdef12345678", habit: "Reading 30 Mins", currentStreak: 9, longestStreak: 12, badgesCount: 1 },
    { rank: 6, user: "0x55aa33bb11cc22dd33ee44ff55aa66bb77cc88dd", habit: "Meditation & Breathwork", currentStreak: 7, longestStreak: 7, badgesCount: 1 },
  ];

  const items = filter === "active" ? defaultLeaderboard.filter((i) => i.currentStreak > 0) : defaultLeaderboard;

  return (
    <Card className={`p-0 overflow-hidden border border-border ${className}`}>
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink tracking-tight">StreakChain Hall of Fame</h3>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold border border-primary/20">
                Precompile 0x0FD2
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Verified daily habit attestations on Creditcoin USC Testnet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-bg rounded-lg border border-border self-start sm:self-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "all" ? "bg-surface text-ink shadow-sm" : "text-ink-secondary hover:text-ink"
            }`}
          >
            All Streakers
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filter === "active" ? "bg-surface text-ink shadow-sm" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Active Only
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-bg/80 border-b border-border text-ink-secondary uppercase font-semibold text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-6">Rank</th>
              <th className="py-3 px-4">Streaker & Habit</th>
              <th className="py-3 px-4">Current Streak</th>
              <th className="py-3 px-4">All-Time Best</th>
              <th className="py-3 px-6 text-right">Soulbound Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {items.map((item) => {
              const isFirst = item.rank === 1;
              const isSecond = item.rank === 2;
              const isThird = item.rank === 3;

              return (
                <tr
                  key={item.rank}
                  className={`transition-colors ${
                    item.isCurrentUser ? "bg-primary-tint/30 font-medium" : "hover:bg-bg/50"
                  }`}
                >
                  <td className="py-4 px-6 font-bold text-ink">
                    {isFirst ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        🥇 #1
                      </span>
                    ) : isSecond ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-300">
                        🥈 #2
                      </span>
                    ) : isThird ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
                        🥉 #3
                      </span>
                    ) : (
                      <span className="text-ink-secondary font-mono px-2">#{item.rank}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium text-ink">
                          {item.user.slice(0, 6)}...{item.user.slice(-4)}
                        </span>
                        {item.isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-primary text-white text-[10px] font-bold">
                            YOU
                          </span>
                        )}
                        <a
                          href={EXPLORER_HELPERS.getCreditcoinAddressUrl(item.user)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-ink-secondary hover:text-primary transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[11px] text-ink-secondary mt-0.5">{item.habit}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="inline-flex items-center gap-1.5 font-bold text-ink">
                      <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                      <span className="text-sm font-extrabold text-amber-600">{item.currentStreak}</span>
                      <span className="text-xs text-ink-secondary">Days</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-ink-secondary">
                    {item.longestStreak} Days
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[11px] font-bold">
                        <Award className="w-3 h-3" />
                        <span>{item.badgesCount} {item.badgesCount === 1 ? "Badge" : "Badges"}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StreakLeaderboard;
