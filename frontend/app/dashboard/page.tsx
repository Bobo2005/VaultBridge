"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "../../components/layout/TopBar";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AttestationBadge } from "../../components/AttestationBadge";
import { CollateralChart } from "../../components/CollateralChart";
import { InvoiceStatusDonut } from "../../components/InvoiceStatusDonut";
import { LiveAttestationFeed } from "../../components/LiveAttestationFeed";
import { ProofProgressRing } from "../../components/ProofProgressRing";
import { VaultBridgeAPI, InvoiceRecord } from "../../lib/api";
import {
  PlusCircle,
  Coins,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  Layers,
  X,
  ExternalLink,
} from "lucide-react";

import { useAccount, useWalletClient } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { CONTRACT_ADDRESSES, INVOICE_REGISTRAR_ABI, VAULT_LENDING_ABI } from "../../lib/contracts";
import { recordLocalTokenTransaction, invalidateBalanceCache, triggerBalanceRefresh } from "../../lib/balanceCache";

export default function DashboardPage() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [borrowAmount, setBorrowAmount] = useState<number>(18900);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDC");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new invoice
  const [newAmountEth, setNewAmountEth] = useState("10");
  const [newDebtor, setNewDebtor] = useState("0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d");
  const [newRiskTier, setNewRiskTier] = useState<"Tier A (Prime 80%)" | "Tier B (Standard 70%)" | "Tier C (Subprime 50%)">("Tier B (Standard 70%)");

  // Attestation Progress state
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationPercent, setAttestationPercent] = useState(0);
  const [attestationSecs, setAttestationSecs] = useState(15);
  const [activeStepText, setActiveStepText] = useState("Initializing proof pipeline...");
  const [activeTxHash, setActiveTxHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    VaultBridgeAPI.getInvoices().then(setInvoices);
  }, []);

  const totalCollateralUsd = invoices.reduce((sum, i) => sum + i.amountUsd, 0);
  const totalBorrowedUsd = invoices.reduce(
    (sum, i) => sum + (i.borrowedAmountUsd || (i.status === "Borrowed" ? i.amountUsd * 0.7 : 0)),
    0
  );
  const availableCreditUsd = Math.max(0, totalCollateralUsd * 0.7 - totalBorrowedUsd);
  const pendingCount = invoices.filter((i) => i.status === "Awaiting Proof").length;

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amount = parseFloat(newAmountEth) || 10;
      let liveTxHash = "";

      if (walletClient && address) {
        try {
          const invoiceBytes32 = ("0x" +
            Array.from({ length: 64 }, () =>
              Math.floor(Math.random() * 16).toString(16)
            ).join("")) as `0x${string}`;
          const amountWei = parseEther(amount.toString());
          const dueDateBlock = BigInt(11566330 + 1000);

          liveTxHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESSES.sepolia.invoiceRegistrar as `0x${string}`,
            abi: [
              {
                inputs: [
                  { name: "invoiceId", type: "bytes32" },
                  { name: "amount", type: "uint256" },
                  { name: "debtor", type: "address" },
                  { name: "dueDateBlock", type: "uint256" },
                ],
                name: "issueInvoice",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
              },
            ],
            functionName: "issueInvoice",
            args: [invoiceBytes32, amountWei, newDebtor as `0x${string}`, dueDateBlock],
          });
        } catch (contractErr) {
          console.warn("Live Sepolia issue fallback:", contractErr);
        }
      }

      const created = await VaultBridgeAPI.issueInvoice({
        amountEth: amount,
        debtor: newDebtor,
        riskTier: newRiskTier,
        txHash: liveTxHash || undefined,
      });

      setIsIssueModalOpen(false);
      setIsSubmitting(false);

      setIsAttesting(true);
      setActiveTxHash(created.txHash);
      const updated = await VaultBridgeAPI.getInvoices();
      setInvoices(updated);

      await VaultBridgeAPI.runInteractiveAttestation(created.id, (step, pct, title) => {
        setAttestationPercent(pct);
        setAttestationSecs(Math.max(1, Math.round(15 - (pct / 100) * 15)));
        setActiveStepText(title);
      });

      const finalInvoices = await VaultBridgeAPI.getInvoices();
      setInvoices(finalInvoices);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const handleBorrowSubmit = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);

    if (walletClient && address) {
      try {
        const invoiceIdBytes32 = (selectedInvoice.invoiceIdHex ||
          "0xdcd053978e3815f282693bb3040b7bdc9ed6f82ca5abfae5af6ee25f3d15cd2d") as `0x${string}`;
        const amountWei = parseUnits(borrowAmount.toString(), 18);

        await walletClient.writeContract({
          address: CONTRACT_ADDRESSES.creditcoin.vaultLending as `0x${string}`,
          abi: [
            {
              inputs: [
                { name: "invoiceId", type: "bytes32" },
                { name: "amount", type: "uint256" },
              ],
              name: "borrow",
              outputs: [{ name: "loanId", type: "bytes32" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "borrow",
          args: [invoiceIdBytes32, amountWei],
        });
      } catch (err) {
        console.warn("Live Creditcoin borrow fallback:", err);
      }
    }

    await VaultBridgeAPI.borrowLiquidity(selectedInvoice.id, borrowAmount, selectedCurrency);
    if (address) {
      recordLocalTokenTransaction(address, selectedCurrency, borrowAmount);
      invalidateBalanceCache(address, 102031);
      triggerBalanceRefresh();
    }
    const updated = await VaultBridgeAPI.getInvoices();
    setInvoices(updated);
    setIsSubmitting(false);
    setIsBorrowModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* TopBar */}
      <TopBar
        title="Trade Finance & Portfolio Dashboard"
        subtitle="Verified accounts receivable financing, dynamic working capital facilities, and instant settlement verification"
        actionButton={
          <div className="flex items-center gap-2">
            <Link href="/invoices">
              <Button variant="secondary" size="md" icon={<Layers className="w-4 h-4 text-primary" />}>
                <span>Batch Verification</span>
              </Button>
            </Link>
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" />}
              onClick={() => setIsIssueModalOpen(true)}
            >
              <span>Finance New Invoice</span>
            </Button>
          </div>
        }
      />

      {/* Proof Progress Ring if verifying */}
      {isAttesting && (
        <section className="animate-in fade-in zoom-in-95 duration-200">
          <ProofProgressRing
            progressPercent={attestationPercent}
            secondsRemaining={attestationSecs}
            statusText={activeStepText || "Instant Verification Engine active (~15s settlement check)..."}
            txHash={activeTxHash}
          />
        </section>
      )}

      {/* 4 Hero Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Verified Accounts Receivable"
          value={`$${(totalCollateralUsd / 1000).toFixed(0)}K`}
          unit="USD"
          delta={{ value: "18.4%", isPositive: true, label: "trade volume" }}
          subtitle="Secured by Cross-Border Escrow"
          sparklineData={[40, 52, 60, 75, 82, 95, 110]}
        />

        <StatCard
          title="Working Capital Drawn"
          value={`$${(totalBorrowedUsd / 1000).toFixed(0)}K`}
          unit="USDC"
          badgeStatus="Borrowed"
          subtitle="8 Active Credit Lines · Avg 4.5% APR"
          sparklineData={[20, 28, 35, 45, 55, 68, 74]}
        />

        <StatCard
          title="Available Credit Limit"
          value={`$${(availableCreditUsd / 1000).toFixed(0)}K`}
          unit="USDC"
          badgeStatus="Best rate"
          subtitle="Dynamic 50%–80% Advance Rate"
          sparklineData={[80, 75, 70, 65, 60, 58, 55]}
        />

        <StatCard
          title="Pending Verification"
          value={pendingCount.toString()}
          unit="Invoices"
          badgeStatus={pendingCount > 0 ? "Awaiting Proof" : "Attested"}
          subtitle="Instant Verification Engine: Real-Time"
          sparklineData={[1, 3, 2, 4, 2, 1, pendingCount]}
        />
      </section>

      {/* 2-Column Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Collateral Growth Area Chart */}
        <div className="lg:col-span-8 space-y-8">
          <CollateralChart />

          {/* Quick Invoices Table */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-ink">Recent Accounts Receivable</h3>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Audited & verified synchronously via the Instant Verification Engine
                </p>
              </div>
              <Link href="/invoices">
                <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  View All Portfolio
                </Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bg/80 border-b border-border">
                  <tr className="text-ink-secondary uppercase font-semibold text-[11px] tracking-wider">
                    <th className="py-3 px-6">Invoice ID</th>
                    <th className="py-3 px-4">Face Value</th>
                    <th className="py-3 px-4">Buyer Risk Tier</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-ink">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-primary transition-colors">
                          {inv.id}
                        </Link>
                        <p className="text-[10px] text-ink-secondary font-mono">{inv.debtor.slice(0, 8)}...</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink">
                        ${inv.amountUsd.toLocaleString()}
                        <span className="text-[10px] font-normal text-ink-secondary block">{inv.amountEth} ETH</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-tint text-primary border border-primary/20">
                          {inv.riskTier || "Tier B (70%)"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <AttestationBadge status={inv.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Donut Breakdown & Live Feed */}
        <div className="lg:col-span-4 space-y-8">
          <InvoiceStatusDonut />
          <LiveAttestationFeed invoices={invoices} />
        </div>
      </section>

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-ink">Register & Finance Accounts Receivable</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="p-1 rounded-lg text-ink-secondary hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-ink-secondary mb-1.5">
                  Invoice Face Value (ETH / Collateral)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newAmountEth}
                  onChange={(e) => setNewAmountEth(e.target.value)}
                  className="w-full px-3.5 py-2 bg-bg border border-border rounded-btn text-sm font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-ink-secondary mb-1.5">
                  Buyer Credit Rating & Advance Rate
                </label>
                <select
                  value={newRiskTier}
                  onChange={(e) => setNewRiskTier(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-bg border border-border rounded-btn text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Tier A (Prime 80%)">Tier A (Prime Corporate) — 80% Advance Rate (4.0% APR)</option>
                  <option value="Tier B (Standard 70%)">Tier B (Standard Commercial) — 70% Advance Rate (4.5% APR)</option>
                  <option value="Tier C (Subprime 50%)">Tier C (Higher Risk) — 50% Advance Rate (6.5% APR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-ink-secondary mb-1.5">
                  Buyer Corporate Account / Counterparty Address
                </label>
                <input
                  type="text"
                  required
                  value={newDebtor}
                  onChange={(e) => setNewDebtor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-2">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
                  Register & Verify Receivable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}