"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useNetwork } from "wagmi";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import {
  X,
  Coins,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  CachedWalletBalances,
  fetchWalletBalancesWithCache,
  subscribeToBalanceUpdates,
} from "../../lib/balanceCache";
import { ClaimFaucetButton } from "./ClaimFaucetButton";

export interface WalletBalancesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletBalancesDrawer: React.FC<WalletBalancesDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const [cachedData, setCachedData] = useState<CachedWalletBalances | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentAddress = address || "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2";
  const currentChainId = chain?.id || 102031;

  const loadBalances = async (force: boolean = false) => {
    setIsRefreshing(true);
    const data = await fetchWalletBalancesWithCache(currentAddress, currentChainId, force);
    setCachedData(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadBalances(false);
      const unsubscribe = subscribeToBalanceUpdates(() => {
        loadBalances(true);
      });
      return () => unsubscribe();
    }
  }, [isOpen, currentAddress, currentChainId]);

  if (!isOpen) return null;

  const ageSeconds = cachedData ? Math.floor((Date.now() - cachedData.timestamp) / 1000) : 0;

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in duration-150">
      <div className="bg-surface border-l border-border shadow-2xl max-w-md w-full h-full p-4 sm:p-6 space-y-6 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">Multi-Asset Portfolio</h3>
                <p className="text-[11px] text-ink-secondary">Cached RPC Balance Layer</p>
              </div>
            </div>
            <button onClick={onClose} className="text-ink-secondary hover:text-ink transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Total Value Banner */}
          <Card className="bg-primary text-white space-y-1 shadow-md">
            <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">
              Total Portfolio Valuation
            </span>
            <h2 className="text-3xl font-bold tracking-tight">
              ${cachedData?.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
            </h2>
            <div className="flex items-center justify-between pt-2 text-[10px] text-white/80 border-t border-white/10">
              <span>{chain?.name || "Creditcoin Testnet"}</span>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" /> Cached {ageSeconds}s ago (15s TTL)
              </span>
            </div>
          </Card>

          {/* Testnet Token Claim Quick Action */}
          <ClaimFaucetButton variant="banner" />

          {/* Tokens List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink uppercase tracking-wider text-[11px]">
                Assets on {chain?.name || "Creditcoin"}
              </span>
              <button
                onClick={() => loadBalances(true)}
                disabled={isRefreshing}
                className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>Refresh RPC</span>
              </button>
            </div>

            <div className="divide-y divide-border/60 border border-border rounded-xl bg-bg/50">
              {cachedData?.balances.map((t) => (
                <div key={t.symbol} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{t.symbol}</span>
                      <span className="text-[11px] text-ink-secondary font-normal">{t.name}</span>
                    </div>
                    <p className="font-mono text-ink text-xs font-semibold mt-0.5">{t.formatted}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-ink text-xs">
                      ${t.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-success font-semibold">Ready for Collateral</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-border flex items-center justify-between text-[11px] text-ink-secondary">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            RPC Rate Limit Protected
          </span>
          <Button variant="primary" size="sm" onClick={onClose} className="w-full sm:w-auto">
            Close Drawer
          </Button>
        </div>
      </div>
    </div>
  );
};
