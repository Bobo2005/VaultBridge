"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "../../components/layout/TopBar";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AttestationBadge } from "../../components/AttestationBadge";
import { VaultBridgeAPI, LoanRecord, InvoiceRecord } from "../../lib/api";
import { BorrowModal } from "../../components/loans/BorrowModal";
import { RepayLoanModal } from "../../components/loans/RepayLoanModal";
import { LenderPoolModal } from "../../components/loans/LenderPoolModal";
import { subscribeToBalanceUpdates } from "../../lib/balanceCache";
import {
  Coins,
  ShieldCheck,
  ExternalLink,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  PiggyBank,
  PlusCircle,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Modals state
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isRepayModalOpen, setIsRepayModalOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);

  const [selectedInvoiceForBorrow, setSelectedInvoiceForBorrow] = useState<InvoiceRecord | null>(null);
  const [selectedLoanForRepay, setSelectedLoanForRepay] = useState<LoanRecord | null>(null);

  const loadData = async () => {
    const fetchedLoans = await VaultBridgeAPI.getLoans();
    const fetchedInvoices = await VaultBridgeAPI.getInvoices();
    setLoans(fetchedLoans);
    setInvoices(fetchedInvoices);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToBalanceUpdates(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const totalBorrowedUsd = loans.reduce(
    (sum, l) => sum + (l.status === "Active" ? l.principalUsd : 0),
    0
  );

  const attestedInvoices = invoices.filter((i) => i.status === "Attested");

  const handleOpenBorrow = (inv?: InvoiceRecord) => {
    if (inv) {
      setSelectedInvoiceForBorrow(inv);
    } else if (attestedInvoices.length > 0) {
      setSelectedInvoiceForBorrow(attestedInvoices[0]);
    } else if (invoices.length > 0) {
      setSelectedInvoiceForBorrow(invoices[0]);
    }
    setIsBorrowModalOpen(true);
  };

  const handleOpenRepay = (loan: LoanRecord) => {
    setSelectedLoanForRepay(loan);
    setIsRepayModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* TopBar with Quick Action to Provide Liquidity */}
      <TopBar
        title="Working Capital Credit Facilities"
        subtitle="Multi-asset working capital facilities secured by verified cross-border accounts receivable"
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<PiggyBank className="w-3.5 h-3.5 text-primary" />}
              onClick={() => setIsPoolModalOpen(true)}
            >
              Yield & Liquidity Vault
            </Button>
            {attestedInvoices.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                icon={<PlusCircle className="w-3.5 h-3.5" />}
                onClick={() => handleOpenBorrow()}
              >
                Draw Working Capital
              </Button>
            )}
          </div>
        }
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Working Capital Drawn"
          value={`$${(totalBorrowedUsd / 1000).toFixed(0)}K`}
          unit="USDC"
          delta={{ value: "18.4%", isPositive: true, label: "utilization" }}
          subtitle="Secured by Verified Trade Escrow"
        />
        <StatCard
          title="Avg. Advance Rate"
          value="70%"
          unit="Dynamic"
          badgeStatus="Borrowed"
          subtitle="Tier A (80%), Tier B (70%), Tier C (50%)"
        />
        <StatCard
          title="Facility Health Factor"
          value="1.43"
          badgeStatus="Best rate"
          subtitle="Overcollateralized at 143%"
        />
        <StatCard
          title="Yield Vault APY"
          value="8.50%"
          badgeStatus="Active"
          subtitle="Institutional Stable Yield"
        />
      </section>

      {/* Lender Liquidity Provider Interactive Banner */}
      <Card className="bg-gradient-to-r from-primary-tint via-surface to-emerald-500/10 border-primary/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Institutional Yield Vault
            </span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 8.5% APY
            </span>
          </div>
          <h3 className="text-xl font-bold text-ink tracking-tight">
            Supply Liquidity to the Yield & Liquidity Vault
          </h3>
          <p className="text-xs text-ink-secondary leading-relaxed">
            Deposit capital into the VaultBridge Yield & Liquidity Vault. Institutional borrowers draw working capital against verified receivables while you earn continuous yield.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={<PiggyBank className="w-4 h-4" />}
            onClick={() => setIsPoolModalOpen(true)}
          >
            Open Yield & Liquidity Vault
          </Button>
        </div>
      </Card>

      {/* Attested Invoices Available to Borrow */}
      {attestedInvoices.length > 0 && (
        <Card className="p-0 overflow-hidden border-emerald-200">
          <div className="p-5 bg-emerald-50/40 border-b border-emerald-200/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Verified Receivables Ready for Working Capital Draw
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Instant verification confirmed. Disburse funds directly to your connected wallet up to your credit limit.
              </p>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {attestedInvoices.map((inv) => {
              const maxLtv = inv.ltvBps ? inv.ltvBps / 100 : 70;
              const maxDraw = Math.floor((inv.amountUsd * maxLtv) / 100);
              return (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg/40 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{inv.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-tint text-primary">
                        {inv.riskTier || "Tier B (70% Advance)"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Valuation: <strong>${inv.amountUsd.toLocaleString()}</strong> ({inv.amountEth} ETH) • Maturity Block #{inv.dueDateBlock.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-ink-secondary uppercase font-semibold">Available Credit Limit</span>
                      <p className="font-bold text-success text-sm">${maxDraw.toLocaleString()} USDC</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Coins className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenBorrow(inv)}
                    >
                      Draw Working Capital
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Loans Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-ink">Active Credit Positions</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Working capital drawn against verified cross-border accounts receivable
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg/80 border-b border-border">
              <tr className="text-ink-secondary uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-6">Credit ID</th>
                <th className="py-3.5 px-4">Collateral Receivable</th>
                <th className="py-3.5 px-4">Principal Drawn</th>
                <th className="py-3.5 px-4">Currency</th>
                <th className="py-3.5 px-4">Advance Rate</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-bg/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-ink">
                    {loan.id}
                    <p className="text-[10px] text-ink-secondary font-mono">Credit Facility</p>
                  </td>

                  <td className="py-4 px-4 font-semibold text-primary">
                    <Link href={`/invoices/${loan.invoiceId}`} className="hover:underline inline-flex items-center gap-1">
                      <span>{loan.invoiceId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                    <p className="text-[10px] text-ink-secondary font-mono">Maturity Block #{loan.dueDateBlock.toLocaleString()}</p>
                  </td>

                  <td className="py-4 px-4 font-bold text-ink">
                    ${loan.principalUsd.toLocaleString()}
                    <p className="text-[10px] text-ink-secondary font-normal">APR: {loan.apr}% Fixed</p>
                  </td>

                  <td className="py-4 px-4 font-mono font-bold text-ink">
                    <span className="px-2 py-0.5 rounded-md bg-primary-tint text-primary text-[10px]">
                      {loan.currency}
                    </span>
                  </td>

                  <td className="py-4 px-4">
                    <span className="font-bold text-primary">{loan.ltvPercent}% Advance</span>
                    <div className="w-20 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${loan.ltvPercent}%` }}></div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        loan.status === "Active"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : loan.status === "Repaid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {loan.status === "Active" ? "Active Line" : loan.status === "Repaid" ? "Settled" : "Defaulted"}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {loan.status === "Active" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenRepay(loan)}
                        >
                          Authorize & Repay Loan
                        </Button>
                      )}
                      <Link href={`/invoices/${loan.invoiceId}`}>
                        <Button size="sm" variant="ghost">
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      {selectedInvoiceForBorrow && (
        <BorrowModal
          isOpen={isBorrowModalOpen}
          onClose={() => {
            setIsBorrowModalOpen(false);
            loadData();
          }}
          invoice={selectedInvoiceForBorrow}
          onSuccess={() => loadData()}
        />
      )}

      {selectedLoanForRepay && (
        <RepayLoanModal
          isOpen={isRepayModalOpen}
          onClose={() => {
            setIsRepayModalOpen(false);
            loadData();
          }}
          loan={selectedLoanForRepay}
          onSuccess={() => loadData()}
        />
      )}

      <LenderPoolModal
        isOpen={isPoolModalOpen}
        onClose={() => setIsPoolModalOpen(false)}
      />
    </div>
  );
}

