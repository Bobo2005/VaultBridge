"use client";

import React from "react";
import { CheckCircle2, Loader2, ShieldCheck, ArrowRight } from "lucide-react";

export interface ProofProgressRingProps {
  progressPercent: number; // 0 to 100
  secondsRemaining: number;
  currentStep?: number; // 1 to 4
  statusText?: string;
  txHash?: string;
  onComplete?: () => void;
  className?: string;
}

export const ProofProgressRing: React.FC<ProofProgressRingProps> = ({
  progressPercent,
  secondsRemaining,
  currentStep = 2,
  statusText = "Attesting cross-chain proof via Attestcoin Protocol...",
  txHash,
  className = "",
}) => {
  const radius = 52;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progressPercent)) / 100) * circumference;
  const isComplete = progressPercent >= 100;

  const steps = [
    { num: 1, title: "Sepolia Tx Mined", desc: "InvoiceRegistrar.issueInvoice() emitted" },
    { num: 2, title: "USC Relayer Attestation", desc: "Creditcoin poller confirms block header (chainKey 1)" },
    { num: 3, title: "ProofBuilder Ingestion", desc: "Merkle inclusion & continuity proofs compiled" },
    { num: 4, title: "Precompile 0x0FD2 Verification", desc: "Synchronous verification & RWA collateral lock" },
  ];

  return (
    <div
      className={`p-6 bg-surface border border-border rounded-card shadow-card space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">
              Cryptographic Engine
            </span>
            <h4 className="text-[16px] font-bold text-ink tracking-tight">
              Live Attestation Pipeline
            </h4>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            isComplete
              ? "bg-success-tint text-success"
              : "bg-warning-tint text-warning"
          }`}
        >
          {isComplete ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified 0x0FD2</span>
            </>
          ) : (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Attesting (~15s)</span>
            </>
          )}
        </span>
      </div>

      {/* Main Radial Progress Ring */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#EFF6FF"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Animated Progress */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={isComplete ? "#16A34A" : "#2563EB"}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300 ease-out"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {isComplete ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-9 h-9 text-success animate-in zoom-in-50 duration-200" />
                <span className="text-[11px] font-bold text-success mt-1">SUCCESS</span>
              </div>
            ) : (
              <>
                <span className="text-3xl font-bold text-ink tracking-tight">
                  {secondsRemaining}s
                </span>
                <span className="text-[10px] font-semibold uppercase text-ink-secondary tracking-wider">
                  Attesting
                </span>
              </>
            )}
          </div>
        </div>

        {/* Steps Progression Checklist */}
        <div className="w-full space-y-3">
          {steps.map((s) => {
            const stepDone = progressPercent >= s.num * 25;
            const stepCurrent = !stepDone && progressPercent >= (s.num - 1) * 25;

            return (
              <div
                key={s.num}
                className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
                  stepCurrent ? "bg-primary-tint/50 border border-primary/20" : ""
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ${
                    stepDone
                      ? "bg-success text-white"
                      : stepCurrent
                      ? "bg-primary text-white animate-pulse"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {stepDone ? "✓" : s.num}
                </div>
                <div className="text-xs">
                  <p
                    className={`font-semibold ${
                      stepDone ? "text-ink" : stepCurrent ? "text-primary font-bold" : "text-ink-secondary"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[11px] text-ink-secondary">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ink-secondary gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>Tx:</span>
          <span className="text-ink font-semibold">
            {txHash ? `${txHash.slice(0, 10)}...${txHash.slice(-8)}` : "0xdcd05...d2d"}
          </span>
        </div>
        <div className="flex items-center gap-1 text-primary font-semibold">
          <span>Native Precompile 0x0FD2</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};

export default ProofProgressRing;
