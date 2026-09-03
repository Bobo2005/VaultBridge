"use client";

import React, { useState } from "react";
import {
  Zap,
  Play,
  Layers,
  ShieldCheck,
  Flame,
  Award,
  Lock,
  Coins,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { soundFx } from "../lib/soundFx";
import { JudgeDemoModal } from "./JudgeDemoModal";
import { ProofVisualizerModal } from "./ProofVisualizerModal";

export const JudgeSandboxBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [runningScenario, setRunningScenario] = useState<number | null>(null);
  const [scenarioStatus, setScenarioStatus] = useState<string | null>(null);

  const toggleMute = () => {
    const nextMute = soundFx.toggleMute();
    setIsMuted(nextMute);
  };

  const handleRunScenario = async (scenarioNum: number) => {
    soundFx.playClick();
    setRunningScenario(scenarioNum);

    if (scenarioNum === 1) {
      // Scenario 1: Happy Path RWA
      setScenarioStatus("1/4: Encrypting invoice payload (AES-256-GCM)...");
      await new Promise((r) => setTimeout(r, 600));
      setScenarioStatus("2/4: Registering commitment on Creditcoin (80% Tier A)...");
      soundFx.playSuccessChime();
      await new Promise((r) => setTimeout(r, 700));
      setScenarioStatus("3/4: Debtor settles payment on Sepolia...");
      await new Promise((r) => setTimeout(r, 600));
      setScenarioStatus("4/4: Precompile 0x0FD2 verified inclusion proof! Escrow unlocked.");
      soundFx.playSuccessChime();
      await new Promise((r) => setTimeout(r, 1200));
    } else if (scenarioNum === 2) {
      // Scenario 2: Absence Proof Default Liquidation
      setScenarioStatus("1/3: Checking Sepolia height past due date #7220000...");
      await new Promise((r) => setTimeout(r, 600));
      setScenarioStatus("2/3: Generating Absence Proof (zero payments in range)...");
      await new Promise((r) => setTimeout(r, 700));
      soundFx.playAlertSound();
      setScenarioStatus("3/3: Default liquidated via 0x0FD2! 5% Keeper Bounty Claimed.");
      soundFx.playSuccessChime();
      await new Promise((r) => setTimeout(r, 1200));
    } else if (scenarioNum === 3) {
      // Scenario 3: Streak Milestone & Slasher
      setScenarioStatus("1/3: Verifying 7 consecutive daily check-ins on Sepolia...");
      await new Promise((r) => setTimeout(r, 600));
      setScenarioStatus("2/3: Soulbound 7-Day Achievement Badge Minted!");
      soundFx.playBadgeAwardFanfare();
      await new Promise((r) => setTimeout(r, 900));
      setScenarioStatus("3/3: Simulating missed Day 8 -> Absence Proof slashes active streak.");
      soundFx.playAlertSound();
      await new Promise((r) => setTimeout(r, 1200));
    }

    setRunningScenario(null);
    setScenarioStatus(null);
  };

  return (
    <>
      {/* Floating Bottom Sandbox Bar */}
      <aside
        aria-label="Judge God Mode Sandbox"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      >
        <div className="bg-surface/95 backdrop-blur-xl border border-primary/40 rounded-2xl sm:rounded-3xl shadow-2xl p-2.5 sm:p-3 space-y-2">
          {/* Top Mini Header */}
          <div className="flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black tracking-tight text-ink flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Judge Sandbox &quot;God Mode&quot;
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-primary-tint text-primary text-[10px] font-bold border border-primary/20">
                1-Click Live Sim
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1 rounded-lg text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
                title={isMuted ? "Unmute Audio Feedback" : "Mute Audio Feedback"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 rounded-lg text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Running Status Pill */}
          {scenarioStatus && (
            <div className="px-3 py-1.5 rounded-xl bg-primary-tint/80 border border-primary/30 flex items-center gap-2 text-xs font-semibold text-primary animate-in fade-in">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{scenarioStatus}</span>
            </div>
          )}

          {/* Expanded Controls Grid */}
          {isExpanded && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 pt-1 text-xs">
              {/* Scenario 1: Happy Path RWA */}
              <button
                onClick={() => handleRunScenario(1)}
                disabled={runningScenario !== null}
                className="p-2 sm:p-2.5 rounded-xl bg-bg border border-border hover:border-primary/40 hover:bg-primary-tint/30 text-left transition-all flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[11px] text-ink group-hover:text-primary">
                    1. RWA Happy Path
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <span className="text-[10px] text-ink-secondary line-clamp-1">
                  80% LTV &bull; Precompile Release
                </span>
              </button>

              {/* Scenario 2: Absence Proof Default */}
              <button
                onClick={() => handleRunScenario(2)}
                disabled={runningScenario !== null}
                className="p-2 sm:p-2.5 rounded-xl bg-bg border border-border hover:border-red-500/40 hover:bg-red-500/10 text-left transition-all flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[11px] text-ink group-hover:text-red-500">
                    2. Default &amp; Bounty
                  </span>
                  <Zap className="w-3.5 h-3.5 text-red-500 shrink-0" />
                </div>
                <span className="text-[10px] text-ink-secondary line-clamp-1">
                  Absence Proof &bull; 5% Keeper
                </span>
              </button>

              {/* Scenario 3: Streak Milestone & Slasher */}
              <button
                onClick={() => handleRunScenario(3)}
                disabled={runningScenario !== null}
                className="p-2 sm:p-2.5 rounded-xl bg-bg border border-border hover:border-amber-500/40 hover:bg-amber-500/10 text-left transition-all flex flex-col justify-between group disabled:opacity-50"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[11px] text-ink group-hover:text-amber-500">
                    3. Streak &amp; Slasher
                  </span>
                  <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                </div>
                <span className="text-[10px] text-ink-secondary line-clamp-1">
                  7-Day Badge &bull; Missed Slashed
                </span>
              </button>

              {/* Merkle Patricia Trie Inspector */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsInspectorModalOpen(true);
                }}
                className="p-2 sm:p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-left transition-all flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-[11px] text-indigo-600">
                    Merkle Inspector
                  </span>
                  <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                </div>
                <span className="text-[10px] text-ink-secondary line-clamp-1">
                  Inspect 0x0FD2 Trie Layers
                </span>
              </button>

              {/* Speedrun Modal */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsDemoModalOpen(true);
                }}
                className="col-span-2 sm:col-span-1 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-600 text-white font-bold text-left transition-all shadow-md shadow-primary/30 hover:brightness-110 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] font-bold">10s Speedrun</span>
                  <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                </div>
                <span className="text-[10px] text-white/80 line-clamp-1">
                  Full 4-Step Walkthrough
                </span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Speedrun Demo Modal */}
      <JudgeDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Merkle Patricia Trie Proof Inspector Modal */}
      <ProofVisualizerModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
      />
    </>
  );
};
