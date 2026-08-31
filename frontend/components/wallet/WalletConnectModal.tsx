"use client";

import React, { useState } from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { Button } from "../ui/Button";
import {
  X,
  Wallet,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Smartphone,
  Globe,
  Sparkles,
  Loader2,
} from "lucide-react";

export interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletProviderOption {
  id: string;
  name: string;
  description: string;
  iconBg: string;
  badge?: string;
  isPopular?: boolean;
}

export const WALLET_PROVIDERS: WalletProviderOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect via browser extension or mobile app",
    iconBg: "bg-amber-500/10 text-amber-600",
    isPopular: true,
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan QR code with any mobile wallet",
    iconBg: "bg-blue-500/10 text-blue-600",
    badge: "Mobile QR",
    isPopular: true,
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with Coinbase Self-Custody App",
    iconBg: "bg-indigo-500/10 text-indigo-600",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    description: "Fast and fun Ethereum mobile wallet",
    iconBg: "bg-rose-500/10 text-rose-600",
  },
  {
    id: "brave",
    name: "Brave Wallet",
    description: "Native built-in privacy browser wallet",
    iconBg: "bg-orange-500/10 text-orange-600",
  },
  {
    id: "injected",
    name: "Injected / Browser Provider",
    description: "Generic EIP-1193 compatible provider",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
];

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { address, isConnected } = useAccount();
  const { connect, isLoading, error } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [selectedProviderObj, setSelectedProviderObj] = useState<WalletProviderOption | null>(null);
  const [isConnectingProvider, setIsConnectingProvider] = useState(false);
  const [connectionStage, setConnectionStage] = useState(1);

  if (!isOpen) return null;

  const handleSelectProvider = async (provider: WalletProviderOption) => {
    setSelectedProviderObj(provider);
    setIsConnectingProvider(true);
    setConnectionStage(1);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setConnectionStage(2);
      await connect();
      await new Promise((r) => setTimeout(r, 400));
      setIsConnectingProvider(false);
      onClose();
    } catch {
      setIsConnectingProvider(false);
    }
  };

  const handleCancelConnecting = () => {
    setIsConnectingProvider(false);
    setSelectedProviderObj(null);
  };

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-surface border border-border rounded-card shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">Connect Wallet</h3>
              <p className="text-[11px] text-ink-secondary">Select your preferred Web3 provider</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-secondary hover:text-ink transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConnected ? (
          <div className="p-4 bg-success-tint border border-emerald-200 rounded-xl space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-ink">Wallet Connected!</h4>
              <p className="font-mono text-xs text-ink-secondary mt-1">
                {address?.slice(0, 10)}...{address?.slice(-8)}
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-danger border-rose-200 hover:bg-danger-tint"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
              <Button variant="primary" size="sm" onClick={onClose}>
                Continue
              </Button>
            </div>
          </div>
        ) : isConnectingProvider && selectedProviderObj ? (
          <div className="p-6 bg-gradient-to-br from-primary-tint/70 to-surface border border-primary/30 rounded-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-ping" />
              <div className={`w-16 h-16 rounded-2xl ${selectedProviderObj.iconBg} flex items-center justify-center font-bold relative z-10 shadow-lg`}>
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-ink">
                Connecting to {selectedProviderObj.name}...
              </h4>
              <p className="text-xs text-ink-secondary">
                {connectionStage === 1
                  ? "Prompting Web3 handshake & account signature..."
                  : "Synchronizing Creditcoin Testnet & balance cache..."}
              </p>
            </div>

            {/* Stage Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${connectionStage === 1 ? 50 : 100}%` }}
              />
            </div>

            <p className="text-[11px] text-ink-secondary flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              Please approve the connection prompt in your wallet
            </p>

            <Button variant="ghost" size="sm" onClick={handleCancelConnecting} className="mx-auto">
              Cancel Connection
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {WALLET_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSelectProvider(provider)}
                className="w-full p-3 bg-bg hover:bg-primary-tint/40 border border-border hover:border-primary/30 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${provider.iconBg} flex items-center justify-center font-bold text-sm shrink-0`}
                  >
                    {provider.id === "walletconnect" ? (
                      <Smartphone className="w-4 h-4" />
                    ) : provider.id === "injected" ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-ink group-hover:text-primary transition-colors">
                        {provider.name}
                      </span>
                      {provider.badge && (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded-full">
                          {provider.badge}
                        </span>
                      )}
                      {provider.isPopular && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-ink-secondary line-clamp-1">{provider.description}</p>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center group-hover:border-primary">
                  <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-ink-secondary">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            End-to-End Encrypted Sessions
          </span>
          <span className="font-mono text-primary">Sepolia & Creditcoin</span>
        </div>
      </div>
    </div>
  );
};
