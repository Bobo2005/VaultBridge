"use client";

import React, { useState } from "react";
import { Button } from "../ui/Button";
import { useAccount, useDisconnect, useNetwork } from "wagmi";
import {
  Wallet,
  Calendar,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  QrCode,
  BookUser,
  ArrowRightLeft,
  Coins,
  Zap,
} from "lucide-react";
import { WalletConnectModal } from "../wallet/WalletConnectModal";
import { NetworkSwitchModal } from "../wallet/NetworkSwitchModal";
import { AddressBookModal } from "../wallet/AddressBookModal";
import { QrModal } from "../wallet/QrModal";
import { WalletBalancesDrawer } from "../wallet/WalletBalancesDrawer";
import { JudgeDemoModal } from "../JudgeDemoModal";
import { ClaimFaucetButton } from "../wallet/ClaimFaucetButton";

export interface TopBarProps {
  title: string;
  subtitle?: string;
  className?: string;
  showFilter?: boolean;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
  actionButton?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  className = "",
  showFilter = true,
  filterOptions = ["All Time", "Last 30 Days", "This Quarter"],
  selectedFilter = "Last 30 Days",
  onFilterChange,
  actionButton,
}) => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();

  const [activeFilter, setActiveFilter] = useState(selectedFilter);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals state
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isNetworkModalOpen, setIsNetworkModalOpen] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBalancesDrawerOpen, setIsBalancesDrawerOpen] = useState(false);
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState(false);

  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "0x789d...6ca2";

  const handleFilterSelect = (filter: string) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
    onFilterChange?.(filter);
  };

  return (
    <>
      <header
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border mb-8 ${className}`}
      >
        {/* Title + Subtitle */}
        <div>
          <h1 className="text-[32px] font-bold leading-[40px] text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] font-normal leading-[20px] text-ink-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right Controls: Faucet Claim + Judge Demo + Filter + Wallet Tools + Action / Wallet Connect */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* 1-Click Testnet Token Claim Button */}
          <ClaimFaucetButton />

          {/* Judge Speedrun Demo Quick Action */}
          <button
            onClick={() => setIsJudgeDemoOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/10 hover:from-amber-500/25 hover:to-primary/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 rounded-btn text-xs font-bold shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
            title="Launch 10-Second Judge Speedrun Demo"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>Speedrun Demo</span>
          </button>

          {/* Address Book Quick Tool */}
          <button
            onClick={() => setIsAddressBookOpen(true)}
            className="p-2 bg-surface hover:bg-bg border border-border rounded-btn text-ink-secondary hover:text-primary transition-all shadow-xs"
            title="Address Book"
          >
            <BookUser className="w-4 h-4" />
          </button>

          {/* QR Code Quick Tool */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="p-2 bg-surface hover:bg-bg border border-border rounded-btn text-ink-secondary hover:text-primary transition-all shadow-xs"
            title="QR Code & Mobile Scanner"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Cached Portfolio Balances Drawer */}
          <button
            onClick={() => setIsBalancesDrawerOpen(true)}
            className="p-2 bg-surface hover:bg-bg border border-border rounded-btn text-ink-secondary hover:text-primary transition-all shadow-xs"
            title="Cached Portfolio Balances"
          >
            <Coins className="w-4 h-4" />
          </button>

          {/* Date / Status Filter Dropdown */}
          {showFilter && (
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-surface border border-border rounded-btn text-xs font-semibold text-ink-secondary hover:text-ink hover:border-slate-300 transition-all shadow-xs cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-ink-secondary" />
                <span>{activeFilter}</span>
                <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-1.5 w-40 bg-surface border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleFilterSelect(opt)}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors hover:bg-bg cursor-pointer ${
                        activeFilter === opt
                          ? "text-primary font-semibold bg-primary-tint"
                          : "text-ink"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Optional Custom Action Button */}
          {actionButton}

          {/* Network Switcher Button */}
          <button
            onClick={() => setIsNetworkModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface hover:bg-bg border border-border rounded-btn text-xs font-medium text-ink-secondary shadow-xs transition-colors cursor-pointer"
            title="Click to Switch Network"
          >
            <span className="w-2 h-2 rounded-full bg-success"></span>
            <span className="font-semibold text-ink">
              {chain?.name || "Creditcoin Testnet"}
            </span>
            <ArrowRightLeft className="w-3 h-3 text-ink-secondary ml-0.5" />
          </button>

          {/* Wallet Connect Button with Multi-Provider Modal */}
          {isConnected ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-primary-tint border border-primary/20 rounded-btn text-xs font-semibold text-primary shadow-xs">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="font-mono">{formattedAddress}</span>
              <button
                onClick={() => disconnect()}
                className="ml-1 text-[10px] text-ink-secondary hover:text-danger underline cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="md"
              icon={<Wallet className="w-4 h-4" />}
              onClick={() => setIsConnectModalOpen(true)}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

      {/* Modals */}
      <JudgeDemoModal
        isOpen={isJudgeDemoOpen}
        onClose={() => setIsJudgeDemoOpen(false)}
      />

      <WalletConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />

      <NetworkSwitchModal
        isOpen={isNetworkModalOpen}
        onClose={() => setIsNetworkModalOpen(false)}
        targetChainId={chain?.id === 102031 ? 11155111 : 102031}
      />

      <AddressBookModal
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
      />

      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      <WalletBalancesDrawer
        isOpen={isBalancesDrawerOpen}
        onClose={() => setIsBalancesDrawerOpen(false)}
      />
    </>
  );
};