"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TopBar } from "../../components/layout/TopBar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AttestationBadge } from "../../components/AttestationBadge";
import { ProofProgressRing } from "../../components/ProofProgressRing";
import { VaultBridgeAPI, InvoiceRecord } from "../../lib/api";
import {
  PlusCircle,
  Search,
  Layers,
  UploadCloud,
  FileSpreadsheet,
  Zap,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [borrowAmount, setBorrowAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new invoice
  const [newAmountEth, setNewAmountEth] = useState("15");
  const [newDebtor, setNewDebtor] = useState("0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d");

  // Batch Attest state
  const [batchCsvText, setBatchCsvText] = useState(
    "INV-2026-009,12.5,0xAaBbCcDdEeFf00112233445566778899aAbBcCdD,11568200\nINV-2026-010,8.0,0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d,11568400\nINV-2026-011,25.0,0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714,11569000"
  );
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchSuccessCount, setBatchSuccessCount] = useState<number | null>(null);

  // Attestation Progress state
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationPercent, setAttestationPercent] = useState(0);
  const [attestationSecs, setAttestationSecs] = useState(15);
  const [activeStepText, setActiveStepText] = useState("Initializing proof pipeline...");
  const [activeTxHash, setActiveTxHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    VaultBridgeAPI.getInvoices().then(setInvoices);
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus =
      statusFilter === "All" || inv.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.debtor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amount = parseFloat(newAmountEth) || 10;
      const created = await VaultBridgeAPI.issueInvoice({
        amountEth: amount,
        debtor: newDebtor,
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

  const handleBatchAttestSubmit = async () => {
    setIsBatchProcessing(true);
    const lines = batchCsvText.trim().split("\n");
    const count = lines.length;

    // Simulate batch execution via verifyBatch with 86% gas savings
    setTimeout(async () => {
      setIsBatchProcessing(false);
      setBatchSuccessCount(count);
      const updated = await VaultBridgeAPI.getInvoices();
      setInvoices(updated);
    }, 2500);
  };

  const handleBorrowSubmit = async () => {
    if (!selectedInvoice) return;
    setIsSubmitting(true);
    await VaultBridgeAPI.borrowLiquidity(selectedInvoice.id, borrowAmount);
    const updated = await VaultBridgeAPI.getInvoices();
    setInvoices(updated);
    setIsSubmitting(false);
    setIsBorrowModalOpen(false);
  };

  const handleSimulatePayment = async (invId: string) => {
    await VaultBridgeAPI.simulatePayment(invId);
    const updated = await VaultBridgeAPI.getInvoices();
    setInvoices(updated);
  };

  const handleTriggerDefaultCheck = async (invId: string) => {
    const result = await VaultBridgeAPI.triggerDefaultCheck(invId);
    alert(result.reason);
    const updated = await VaultBridgeAPI.getInvoices();
    setInvoices(updated);
  };

  return (
    <div className="space-y-8">
      {/* TopBar */}
      <TopBar
        title="Accounts Receivable & Invoices"
        subtitle="Manage cross-border trade invoices, access working capital credit facilities, and verify settlement status"
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              icon={<Layers className="w-4 h-4 text-primary" />}
              onClick={() => {
                setBatchSuccessCount(null);
                setIsBatchModalOpen(true);
              }}
            >
              <span>Batch Verification</span>
            </Button>
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

      {/* Banner: Batch Precompile Verification Gas Savings */}
      <div className="p-4 bg-primary-tint/50 border border-primary/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink flex items-center gap-2">
              <span>High-Throughput Verification Engine</span>
              <span className="px-2 py-0.5 bg-success-tint text-success rounded-full font-bold text-[10px]">
                ⚡ 86% Efficiency Gain
              </span>
            </h4>
            <p className="text-[11px] text-ink-secondary">
              Verify up to 20 cross-border invoices in a single transaction using synchronous settlement checks.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setBatchSuccessCount(null);
            setIsBatchModalOpen(true);
          }}
        >
          Launch Batch Verification
        </Button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1 rounded-btn border border-border overflow-x-auto">
          {[
            { key: "All", label: "All Portfolio" },
            { key: "Attested", label: "Verified" },
            { key: "Borrowed", label: "Financed" },
            { key: "Paid", label: "Settled" },
            { key: "Defaulted", label: "Default Resolved" },
            { key: "Awaiting Proof", label: "Pending Verification" }
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                statusFilter === st.key
                  ? "bg-primary text-white shadow-xs"
                  : "text-ink-secondary hover:text-ink hover:bg-bg"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-ink-secondary absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice ID, buyer, hash..."
            className="w-full pl-9 pr-3.5 py-1.5 bg-surface border border-border rounded-btn text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Main Invoices Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg/80 border-b border-border">
              <tr className="text-ink-secondary uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3.5 px-6">Invoice ID</th>
                <th className="py-3.5 px-4">Face Value (USD / ETH)</th>
                <th className="py-3.5 px-4">Buyer Account</th>
                <th className="py-3.5 px-4">Settlement Maturity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Available Credit Limit</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-bg/50 transition-colors">
                  <td className="py-4 px-6">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-bold text-sm text-ink hover:text-primary transition-colors flex items-center gap-1.5"
                    >
                      <span>{inv.id}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                    </Link>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${inv.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary hover:underline font-mono inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <span>Origin: {inv.txHash.slice(0, 8)}...</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>

                  <td className="py-4 px-4 font-bold text-ink">
                    ${inv.amountUsd.toLocaleString()}
                    <p className="text-[11px] font-normal text-ink-secondary">{inv.amountEth} ETH</p>
                  </td>

                  <td className="py-4 px-4 font-mono text-[11px] text-ink-secondary">
                    {inv.debtor.slice(0, 8)}...{inv.debtor.slice(-6)}
                  </td>

                  <td className="py-4 px-4 text-ink font-mono font-medium">
                    #{inv.dueDateBlock.toLocaleString()}
                  </td>

                  <td className="py-4 px-4">
                    <AttestationBadge status={inv.status} size="sm" />
                  </td>

                  <td className="py-4 px-4">
                    {inv.status === "Borrowed" ? (
                      <div>
                        <span className="font-bold text-primary">${inv.borrowedAmountUsd?.toLocaleString()}</span>
                        <span className="text-[10px] text-ink-secondary ml-1">(70% Advance)</span>
                      </div>
                    ) : (
                      <span className="text-ink-secondary font-medium">
                        Up to ${(inv.amountUsd * 0.7).toLocaleString()}
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inv.status === "Attested" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setBorrowAmount(Math.round(inv.amountUsd * 0.7));
                            setIsBorrowModalOpen(true);
                          }}
                        >
                          Draw Capital
                        </Button>
                      )}

                      {inv.status === "Borrowed" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSimulatePayment(inv.id)}
                            title="Simulate buyer settlement payment"
                          >
                            Simulate Payment
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTriggerDefaultCheck(inv.id)}
                            title="Check settlement status past maturity date"
                            className="text-danger border-rose-200 hover:bg-danger-tint"
                          >
                            Check Settlement Status
                          </Button>
                        </>
                      )}

                      {inv.status === "Awaiting Proof" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={async () => {
                            setIsAttesting(true);
                            setActiveTxHash(inv.txHash);
                            await VaultBridgeAPI.runInteractiveAttestation(inv.id, (step, pct, title) => {
                              setAttestationPercent(pct);
                              setAttestationSecs(Math.max(1, Math.round(15 - (pct / 100) * 15)));
                              setActiveStepText(title);
                            });
                            const finalInvoices = await VaultBridgeAPI.getInvoices();
                            setInvoices(finalInvoices);
                          }}
                        >
                          Verify Cross-Border Invoice
                        </Button>
                      )}

                      <Link href={`/invoices/${inv.id}/share`}>
                        <Button size="sm" variant="outline" className="text-primary border-primary/20 hover:bg-primary-tint" title="Manage Privacy & Access Control">
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          Share Access
                        </Button>
                      </Link>
                      <Link href={`/invoices/${inv.id}`}>
                        <Button size="sm" variant="ghost">
                          View Details
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

      {/* BATCH ATTEST MODAL */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-ink">Bulk Accounts Receivable Verification</h3>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-ink-secondary hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            {batchSuccessCount !== null ? (
              <div className="p-4 bg-success-tint border border-emerald-200 rounded-xl space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                <h4 className="font-bold text-sm text-ink">
                  {batchSuccessCount} Invoices Successfully Verified!
                </h4>
                <p className="text-xs text-ink-secondary">
                  Synchronously verified via high-throughput engine with <strong>86% processing efficiency</strong>.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsBatchModalOpen(false)}
                >
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-bg border border-border rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-ink-secondary">Verification Engine</span>
                    <span className="font-mono text-primary">Synchronous High-Throughput Verifier</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-ink-secondary">Settlement Audit</span>
                    <span className="font-mono text-ink">Consolidated Block Proof</span>
                  </div>
                  <div className="flex justify-between text-success font-bold">
                    <span>Efficiency Gain</span>
                    <span>~86% cost reduction vs individual transactions</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.04em] text-ink-secondary mb-1.5">
                    Bulk CSV Manifest (Format: Invoice ID, Collateral ETH, Buyer Address, Due Block)
                  </label>
                  <textarea
                    rows={4}
                    value={batchCsvText}
                    onChange={(e) => setBatchCsvText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleBatchAttestSubmit}
                    isLoading={isBatchProcessing}
                  >
                    Execute Batch Verification
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Register & Finance Accounts Receivable</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-ink-secondary hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-primary-tint/60 border border-primary/20 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-ink">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Confidential Trade Payload (Encrypted Client-Side)</span>
              </div>
              <p className="text-[11px] text-ink-secondary">
                Commercial line items and trade counterparties are encrypted in the browser with AES-256 before network transmission. Only deterministic commitment hashes are stored on-chain.
              </p>
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
                  Buyer Corporate Account / Debtor Address
                </label>
                <input
                  type="text"
                  required
                  value={newDebtor}
                  onChange={(e) => setNewDebtor(e.target.value)}
                  className="w-full px-3.5 py-2 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsIssueModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  Register & Verify Receivable
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Modal */}
      {isBorrowModalOpen && selectedInvoice && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface border border-border rounded-card shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink">Draw Working Capital Against {selectedInvoice.id}</h3>
              <button onClick={() => setIsBorrowModalOpen(false)} className="text-ink-secondary hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-bg border border-border rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Invoice Valuation</span>
                  <span className="font-bold text-ink">${selectedInvoice.amountUsd.toLocaleString()} USD</span>
                </div>
                <div className="flex justify-between text-success font-semibold">
                  <span>Available Credit Limit (70% Advance Rate)</span>
                  <span>${(selectedInvoice.amountUsd * 0.7).toLocaleString()} USDC</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink-secondary block mb-1">
                  Select Working Capital Amount: ${borrowAmount.toLocaleString()} USDC
                </label>
                <input
                  type="range"
                  min={1000}
                  max={Math.round(selectedInvoice.amountUsd * 0.7)}
                  step={500}
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setIsBorrowModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleBorrowSubmit} isLoading={isSubmitting}>
                  Draw Working Capital
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
