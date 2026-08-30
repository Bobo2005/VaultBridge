"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "../../components/layout/TopBar";
import { StatCard } from "../../components/StatCard";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AttestationBadge } from "../../components/AttestationBadge";
import { VaultBridgeAPI, LoanRecord, InvoiceRecord } from "../../lib/api";
import { Coins, ShieldCheck, ExternalLink, ArrowUpRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  useEffect(() => {
    VaultBridgeAPI.getLoans().then(setLoans);
    VaultBridgeAPI.getInvoices().then(setInvoices);
  }, []);

  const totalBorrowedUsd = loans.reduce(
    (sum, l) => sum + (l.status === "Active" ? l.principalUsd : 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* TopBar */}
      <TopBar
        title="Active Loans & Credit Lines"
        subtitle="Multi-asset credit lines against cryptographic cross-chain attested invoice collateral"
      />

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Principal Drawn"
          value={`$${(totalBorrowedUsd / 1000).toFixed(0)}K`}
          unit="USDC"
          delta={{ value: "18.4%", isPositive: true, label: "utilization" }}
          subtitle="Backed by Sepolia RWA Escrow"
        />
        <StatCard
          title="Avg. Portfolio LTV"
          value="70%"
          unit="Dynamic"
          badgeStatus="Borrowed"
          subtitle="Tier A (80%), Tier B (70%), Tier C (50%)"
        />
        <StatCard
          title="Protocol Health Factor"
          value="1.43"
          badgeStatus="Best rate"
          subtitle="Overcollateralized at 143%"
        />
        <StatCard
          title="Default Risk"
          value="0.0%"
          badgeStatus="Attested"
          subtitle="Protected by Absence Proof Engine"
        />
      </section>

      {/* Loans Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-ink">Active Loan Positions</h3>
          <p className="text-xs text-ink-secondary mt-0.5">
            Credit drawn on Creditcoin USC layer against attested Ethereum Sepolia invoices
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg/80 border-b border-border">
              <tr className="text-ink-secondary uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-6">Loan ID</th>
                <th className="py-3.5 px-4">Collateral Invoice</th>
                <th className="py-3.5 px-4">Principal Drawn</th>
                <th className="py-3.5 px-4">Currency</th>
                <th className="py-3.5 px-4">LTV Ratio</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-bg/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-ink">
                    {loan.id}
                    <p className="text-[10px] text-ink-secondary font-mono">Creditcoin USC</p>
                  </td>

                  <td className="py-4 px-4 font-semibold text-primary">
                    <Link href={`/invoices/${loan.invoiceId}`} className="hover:underline inline-flex items-center gap-1">
                      <span>{loan.invoiceId}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                    <p className="text-[10px] text-ink-secondary font-mono">Due Block #{loan.dueDateBlock.toLocaleString()}</p>
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
                    <span className="font-bold text-primary">{loan.ltvPercent}% LTV</span>
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
                      {loan.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {loan.status === "Active" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            await VaultBridgeAPI.simulatePayment(loan.invoiceId);
                            const updated = await VaultBridgeAPI.getLoans();
                            setLoans(updated);
                          }}
                        >
                          Repay
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
    </div>
  );
}
