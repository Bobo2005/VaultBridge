"use client";

import React, { useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { Button } from "../ui/Button";
import {
  X,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
} from "lucide-react";
import { creditcoinTestnet } from "../../lib/wagmiConfig";
import { sepolia } from "wagmi/chains";

export interface NetworkSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetChainId?: number;
  reason?: string;
}

export const NetworkSwitchModal: React.FC<NetworkSwitchModalProps> = ({
  isOpen,
  onClose,
  targetChainId = 102031,
  reason,
}) => {
  const { chain } = useNetwork();
  const { switchNetworkAsync, isLoading, error } = useSwitchNetwork();
  const [isSwitching, setIsSwitching] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentChainId = chain?.id || 102031;
  const isTargetCreditcoin = targetChainId === 102031;

  const targetNetworkName = isTargetCreditcoin ? "Creditcoin USC Testnet" : "Ethereum Sepolia";
  const targetSymbol = isTargetCreditcoin ? "tCTC" : "ETH";

  const handleConfirmSwitch = async () => {
    setIsSwitching(true);
    try {
      if (switchNetworkAsync) {
        await switchNetworkAsync(targetChainId);
      }
      setSuccess(true);
      setTimeout(() => {
        setIsSwitching(false);
        setSuccess(false);
        onClose();
      }, 1000);
    } catch {
      setIsSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card shadow-2xl max-w-md w-full p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Network Auto-Switch</h3>
              <p className="text-[11px] text-ink-secondary">Confirmation required to switch blockchain network</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-secondary hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Alert */}
        <div className="p-3.5 bg-primary-tint/60 border border-primary/20 rounded-xl space-y-1 text-xs">
          <div className="font-bold text-ink flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-primary" />
            <span>Cross-Chain Protocol Routing</span>
          </div>
          <p className="text-ink-secondary text-[11px]">
            {reason ||
              `The requested action requires switching from ${chain?.name || "Current Network"} to ${targetNetworkName} (Chain ID: ${targetChainId}).`}
          </p>
        </div>

        {/* Network Comparison Visual */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-bg border border-border rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-semibold text-ink-secondary">From Network</span>
            <p className="font-bold text-ink truncate">{chain?.name || "Sepolia"}</p>
            <span className="text-[10px] font-mono text-ink-secondary">ID: {currentChainId}</span>
          </div>

          <div className="p-3 bg-primary-tint/40 border border-primary/30 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-semibold text-primary">To Network</span>
            <p className="font-bold text-primary truncate">{targetNetworkName}</p>
            <span className="text-[10px] font-mono text-primary">ID: {targetChainId}</span>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-success-tint border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Successfully switched to {targetNetworkName}!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRightLeft className="w-4 h-4" />}
            onClick={handleConfirmSwitch}
            isLoading={isSwitching}
          >
            Confirm & Switch Network
          </Button>
        </div>
      </div>
    </div>
  );
};
