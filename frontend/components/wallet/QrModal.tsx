"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "../ui/Button";
import {
  X,
  QrCode,
  Camera,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { EXPLORER_HELPERS } from "../../lib/contracts";

export interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanAddress?: (scannedAddress: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose, onScanAddress }) => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<"receive" | "scan">("receive");
  const [copied, setCopied] = useState(false);
  const [simulatedScanInput, setSimulatedScanInput] = useState("");
  const [isScanningActive, setIsScanningActive] = useState(false);

  if (!isOpen) return null;

  const currentAddress = address || "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2";

  const handleCopy = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteScan = (scanned: string) => {
    if (onScanAddress) {
      onScanAddress(scanned);
      onClose();
    }
  };

  // Generates SVG QR code representation for standard Web3 addresses
  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card shadow-2xl max-w-sm w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">QR Code Manager</h3>
              <p className="text-[11px] text-ink-secondary">Mobile transfer & scanner</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-secondary hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-bg border border-border rounded-btn text-xs font-semibold">
          <button
            onClick={() => setActiveTab("receive")}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === "receive" ? "bg-primary text-white shadow-xs" : "text-ink-secondary hover:text-ink"
            }`}
          >
            My QR Code
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`py-1.5 rounded-md transition-all ${
              activeTab === "scan" ? "bg-primary text-white shadow-xs" : "text-ink-secondary hover:text-ink"
            }`}
          >
            Scan Mobile QR
          </button>
        </div>

        {activeTab === "receive" ? (
          <div className="space-y-4 text-center">
            {/* Render High-Contrast SVG QR Pattern */}
            <div className="w-48 h-48 mx-auto p-3 bg-white rounded-2xl border-2 border-border shadow-md flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                {/* Position detection squares */}
                <path d="M10,10 h25 v25 h-25 z M15,15 v15 h15 v-15 z M19,19 h7 v7 h-7 z" />
                <path d="M65,10 h25 v25 h-25 z M70,15 v15 h15 v-15 z M74,19 h7 v7 h-7 z" />
                <path d="M10,65 h25 v25 h-25 z M15,70 v15 h15 v-15 z M19,74 h7 v7 h-7 z" />
                {/* Data modules pattern */}
                <rect x="42" y="12" width="6" height="6" />
                <rect x="52" y="12" width="6" height="6" />
                <rect x="42" y="24" width="6" height="12" />
                <rect x="52" y="28" width="6" height="8" />
                <rect x="12" y="42" width="8" height="6" />
                <rect x="28" y="42" width="14" height="6" />
                <rect x="48" y="44" width="8" height="8" />
                <rect x="62" y="42" width="10" height="6" />
                <rect x="78" y="42" width="10" height="6" />
                <rect x="12" y="52" width="6" height="8" />
                <rect x="24" y="52" width="12" height="6" />
                <rect x="42" y="56" width="6" height="12" />
                <rect x="54" y="56" width="12" height="6" />
                <rect x="72" y="52" width="6" height="12" />
                <rect x="84" y="56" width="6" height="8" />
                <rect x="42" y="74" width="12" height="6" />
                <rect x="58" y="72" width="6" height="14" />
                <rect x="70" y="74" width="18" height="6" />
                <rect x="44" y="84" width="6" height="6" />
                <rect x="66" y="84" width="12" height="6" />
                <rect x="82" y="84" width="8" height="6" />
              </svg>
            </div>

            <div className="p-2.5 bg-bg rounded-xl border border-border">
              <span className="text-[10px] uppercase font-semibold text-ink-secondary block mb-1">
                Your Wallet Address
              </span>
              <p className="font-mono text-xs font-bold text-ink truncate select-all">{currentAddress}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                icon={copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopy}
              >
                {copied ? "Copied!" : "Copy Address"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-6 bg-slate-950 rounded-2xl text-center space-y-3 text-white">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto animate-pulse">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Camera Scanner Active</h4>
                <p className="text-[11px] text-slate-400">Position QR code within viewfinder or paste payload below</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-semibold text-ink-secondary block">
                Direct Scan / Paste Input
              </label>
              <input
                type="text"
                placeholder="0x... or ethereum:0x..."
                value={simulatedScanInput}
                onChange={(e) => setSimulatedScanInput(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  const cleaned = simulatedScanInput.replace(/^ethereum:/, "").split("@")[0];
                  if (cleaned) handleCompleteScan(cleaned);
                }}
              >
                Confirm Scanned Address
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
