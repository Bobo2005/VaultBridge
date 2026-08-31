"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "../../../components/layout/TopBar";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ProofProgressRing } from "../../../components/ProofProgressRing";
import { LiveAttestationFeed } from "../../../components/LiveAttestationFeed";
import {
  ChevronLeft,
  Flame,
  ShieldCheck,
  Zap,
  Share2,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  AlertTriangle,
  Award,
  Lock,
  Cpu,
  Layers
} from "lucide-react";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../../../lib/contracts";

export default function StreakDetailPage() {
  const params = useParams();
  const rawId = (params?.id as string) || "STRK-2026-001";
  const streakId = decodeURIComponent(rawId);

  const [streakData, setStreakData] = useState({
    id: streakId,
    title: streakId === "STRK-2026-002" ? "Cross-Chain USC Relayer Verification" : "Daily Smart Contract Security Audit",
    category: "Code",
    owner: "0x9876543210fedcba9876543210fedcba98765432",
    currentStreak: 14,
    longestStreak: 18,
    lastCheckInDay: 14,
    lastCheckInBlock: 6819420,
    creditcoinHeight: 104250,
    status: "Active" as "Active" | "Broken",
    sepoliaTxHash: "0x3f4a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a",
    createdAt: "14 days ago",
  });

  const [isAttesting, setIsAttesting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [breakStreakSuccess, setBreakStreakSuccess] = useState(false);

  const handleTriggerCheckIn = () => {
    setIsAttesting(true);
    setProgressPercent(10);
    setSecondsRemaining(15);

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAttesting(false);
          setStreakData((curr) => ({
            ...curr,
            currentStreak: curr.currentStreak + 1,
            longestStreak: Math.max(curr.longestStreak, curr.currentStreak + 1),
            lastCheckInDay: curr.lastCheckInDay + 1,
            lastCheckInBlock: curr.lastCheckInBlock + 120,
            creditcoinHeight: curr.creditcoinHeight + 10,
          }));
          return 100;
        }
        return prev + 15;
      });

      setSecondsRemaining((sec) => Math.max(0, sec - 2));
    }, 1500);
  };

  const handleBreakStreak = () => {
    if (confirm("Simulate permissionless absence proof submission on Creditcoin for a missed day?")) {
      setStreakData((curr) => ({
        ...curr,
        currentStreak: 0,
        status: "Broken",
      }));
      setBreakStreakSuccess(true);
      setTimeout(() => setBreakStreakSuccess(false), 7000);
    }
  };

  const handleCopyShareLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://vaultbridge.xyz/streaks/${streakId}`;
    navigator.clipboard.writeText(url);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 3000);
  };

  const checkInHistory = Array.from({ length: 5 }, (_, i) => {
    const day = streakData.lastCheckInDay - i;
    return {
      dayIndex: day,
      blockHeight: streakData.lastCheckInBlock - i * 7200,
      timestamp: `${i === 0 ? "Today" : `${i} days ago`}, 08:30 AM`,
      txHash: `0x${(i + 1).toString().repeat(8)}...${(i + 1).toString().repeat(4)}`,
      verified: true,
    };
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Navigation & Share Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/streaks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Streaks</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={copiedShareLink ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : <Share2 className="w-3.5 h-3.5" />}
            onClick={() => setIsShareModalOpen(true)}
          >
            <span>{copiedShareLink ? "Link Copied" : "Share Streak Proof"}</span>
          </Button>
        </div>
      </div>

      {/* Header Info */}
      <TopBar
        title={`Streak Detail: ${streakData.title}`}
        subtitle="Cryptographic on-chain verification history for daily check-in activity"
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-danger border-danger/30 hover:bg-danger-tint"
              onClick={handleBreakStreak}
              disabled={streakData.currentStreak === 0}
            >
              <span>Test Absence Break</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Flame className="w-4 h-4 text-amber-300" />}
              onClick={handleTriggerCheckIn}
              disabled={isAttesting}
            >
              <span>{isAttesting ? "Attesting Check-In..." : "Check In (Sepolia)"}</span>
            </Button>
          </div>
        }
      />

      {/* Break Streak Notification Banner */}
      {breakStreakSuccess && (
        <div className="p-4 bg-danger-tint border border-danger/30 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-danger shrink-0" />
            <div>
              <p className="text-sm font-bold text-ink">Streak Broken on Creditcoin!</p>
              <p className="text-xs text-ink-secondary">
                Verified absence proof via Precompile 0x0FD2. Current streak reset to 0; personal best preserved ({streakData.longestStreak} days).
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-danger">Absence Proved</span>
        </div>
      )}

      {/* Streak Overview Card */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
              <Flame className="w-8 h-8 fill-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-ink">{streakData.title}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    streakData.status === "Active"
                      ? "bg-success-tint text-success border border-success/30"
                      : "bg-danger-tint text-danger border border-danger/30"
                  }`}
                >
                  {streakData.status}
                </span>
              </div>
              <p className="text-xs text-ink-secondary font-mono mt-0.5">
                Streak ID: {streakData.id} • Owner: {streakData.owner ? `${streakData.owner.slice(0, 6)}...${streakData.owner.slice(-4)}` : "0x9876...5432"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-bg p-3.5 rounded-xl border border-border/60 shrink-0">
            <div>
              <span className="text-[11px] text-ink-secondary font-medium">Current Count</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-2xl font-extrabold text-ink">{streakData.currentStreak}</span>
                <span className="text-xs text-ink-secondary">Days</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border/80" />
            <div>
              <span className="text-[11px] text-ink-secondary font-medium">Personal Best</span>
              <p className="text-lg font-bold text-ink mt-0.5">{streakData.longestStreak} Days</p>
            </div>
          </div>
        </div>

        {/* 4 Metadata Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-border text-xs">
          <div className="p-3 bg-bg rounded-xl">
            <span className="text-ink-secondary">Source Chain</span>
            <p className="font-bold text-ink mt-0.5">Ethereum Sepolia (11155111)</p>
          </div>
          <div className="p-3 bg-bg rounded-xl">
            <span className="text-ink-secondary">Destination Network</span>
            <p className="font-bold text-ink mt-0.5">Creditcoin Testnet (102031)</p>
          </div>
          <div className="p-3 bg-bg rounded-xl">
            <span className="text-ink-secondary">Verification Engine</span>
            <p className="font-bold text-primary mt-0.5">Precompile 0x0FD2</p>
          </div>
          <div className="p-3 bg-bg rounded-xl">
            <span className="text-ink-secondary">Soulbound Badges</span>
            <p className="font-bold text-amber-600 mt-0.5">
              {streakData.currentStreak >= 30 ? "2 Badges Unlocked" : streakData.currentStreak >= 7 ? "1 Badge Unlocked" : "0 Badges"}
            </p>
          </div>
        </div>
      </Card>

      {/* Real-time Proof Attestation Progress Ring Component */}
      <ProofProgressRing
        progressPercent={progressPercent}
        secondsRemaining={secondsRemaining}
        txHash={streakData.sepoliaTxHash}
        statusText="Attesting daily check-in inclusion proof on Creditcoin via Precompile 0x0FD2..."
      />

      {/* Precompile 0x0FD2 Cryptographic Proof Inspector */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-ink">Cryptographic Attestation Proof Inspector</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
            ChainKey 1 (Sepolia)
          </span>
        </div>

        <div className="p-4 bg-bg rounded-xl border border-border/80 font-mono text-xs space-y-2 text-ink-secondary">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink font-semibold">Precompile Endpoint:</span>
            <span className="text-primary font-bold">{CONTRACT_ADDRESSES.creditcoin.verifierPrecompile}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink font-semibold">Sepolia Header Height:</span>
            <span>{streakData.lastCheckInBlock}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink font-semibold">Creditcoin Attested Block:</span>
            <span>{streakData.creditcoinHeight}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink font-semibold">Merkle Inclusion Root:</span>
            <span className="truncate max-w-[280px]">0x9f8e7d6c5b4a3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-ink font-semibold">Continuity Proof Length:</span>
            <span>1,024 bytes (Header chain segment)</span>
          </div>
        </div>
      </Card>

      {/* Historical Check-In Timeline */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-ink" />
            <h3 className="text-base font-bold text-ink">Historical Check-In Attestation Log</h3>
          </div>
          <span className="text-xs text-ink-secondary font-medium">Recent 5 Check-Ins</span>
        </div>

        <div className="divide-y divide-border/60">
          {checkInHistory.map((item) => (
            <div key={item.dayIndex} className="py-3.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success-tint text-success flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">Day {item.dayIndex} Check-In</span>
                    <span className="px-2 py-0.2 rounded-full bg-bg text-ink-secondary text-[10px] font-mono border border-border">
                      Block #{item.blockHeight}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary mt-0.5">{item.timestamp}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`https://sepolia.etherscan.io/tx/${streakData.sepoliaTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline font-mono text-[11px] flex items-center gap-1"
                >
                  <span>{item.txHash}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Public Share Proof Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-card p-4 sm:p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-ink">Public Proof Certificate</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-ink-secondary hover:text-ink text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-bg rounded-xl border border-border/80 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold shrink-0">
                  <Flame className="w-6 h-6 fill-amber-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink">{streakData.title}</h4>
                  <p className="text-xs text-amber-600 font-bold">{streakData.currentStreak} Days Verified Streak</p>
                </div>
              </div>
              <p className="text-xs text-ink-secondary">
                Anyone with this public link can inspect the on-chain cryptographic proofs verified by Creditcoin Precompile 0x0FD2 without connecting a wallet.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink">Public Link</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== "undefined" ? window.location.href : `https://vaultbridge.xyz/streaks/${streakId}`}
                  className="flex-1 px-3 py-2 text-xs rounded-btn bg-bg border border-border font-mono text-ink-secondary focus:outline-hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCopyShareLink}
                  icon={copiedShareLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  <span>{copiedShareLink ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
