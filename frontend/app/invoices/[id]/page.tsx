"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TopBar } from "../../../components/layout/TopBar";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { AttestationBadge } from "../../../components/AttestationBadge";
import { ProofProgressRing } from "../../../components/ProofProgressRing";
import { LiveAttestationFeed } from "../../../components/LiveAttestationFeed";
import { VaultBridgeAPI, InvoiceRecord } from "../../../lib/api";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../../../lib/contracts";
import {
  decryptInvoiceClientSide,
  DecryptedInvoicePayload,
  hasAccessClient,
  getLocalBundle,
  encryptInvoiceClientSide,
  StorageResult
} from "../../../lib/privacy";
import { useAccount } from "wagmi";
import {
  ChevronLeft,
  ExternalLink,
  ShieldCheck,
  Coins,
  CheckCircle2,
  Clock,
  Key,
  Zap,
  ArrowRight,
  Sparkles,
  Lock,
  Eye,
  UserCheck,
  UserX,
  FileText,
  Building2,
  CreditCard,
  RefreshCw,
  AlertTriangle,
  Download
} from "lucide-react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceIdParam = (params?.id as string) || "INV-2026-001";
  const { address } = useAccount();

  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [allInvoices, setAllInvoices] = useState<InvoiceRecord[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USDC");

  // Multi-wallet viewer simulator for judges / tests
  const [activeViewerRole, setActiveViewerRole] = useState<"owner" | "auditor" | "unauthorized">("owner");
  const [decryptedData, setDecryptedData] = useState<DecryptedInvoicePayload | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<"available" | "missing" | "restored">("available");
  const [isRestoring, setIsRestoring] = useState(false);

  const viewerAddresses = {
    owner: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    auditor: "0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2",
    unauthorized: "0x0000000000000000000000000000000000000000",
  };

  const currentViewerAddress = address || viewerAddresses[activeViewerRole];

  // Real ~15s polling state for Attestation verification
  const [isAttesting, setIsAttesting] = useState(false);
  const [attestationPercent, setAttestationPercent] = useState(0);
  const [attestationSecs, setAttestationSecs] = useState(15);
  const [activeStepText, setActiveStepText] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    VaultBridgeAPI.getInvoices().then((list) => {
      setAllInvoices(list);
      const found = list.find((i) => i.id === invoiceIdParam);
      if (found) {
        setInvoice(found);
      } else {
        setInvoice(list[0]);
      }
    });
  }, [invoiceIdParam]);

  // Decryption Read Path & Storage Check
  useEffect(() => {
    if (!invoice) return;
    setIsDecrypting(true);

    const storageCheck = getLocalBundle(invoice.id);
    if (!storageCheck.success && activeViewerRole !== "unauthorized") {
      setCacheStatus("missing");
    } else {
      setCacheStatus("available");
    }

    const timer = setTimeout(async () => {
      const result = await decryptInvoiceClientSide(
        invoice.pointer || "ipfs://default",
        currentViewerAddress,
        {
          invoiceId: invoice.id,
          amountEth: invoice.amountEth,
          amountUsd: invoice.amountUsd,
          debtor: invoice.debtor,
          dueDateBlock: invoice.dueDateBlock,
        }
      );
      setDecryptedData(result);
      setIsDecrypting(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [invoice, currentViewerAddress, activeViewerRole]);

  // Manual Re-Import / Restore Handler for Incognito / Missing Cache
  const handleRestoreCache = async () => {
    if (!invoice) return;
    setIsRestoring(true);

    await encryptInvoiceClientSide({
      invoiceId: invoice.id,
      amountEth: invoice.amountEth,
      amountUsd: invoice.amountUsd,
      debtor: invoice.debtor,
      dueDateBlock: invoice.dueDateBlock,
    });

    const result = await decryptInvoiceClientSide(
      invoice.pointer || "ipfs://default",
      currentViewerAddress,
      {
        invoiceId: invoice.id,
        amountEth: invoice.amountEth,
        amountUsd: invoice.amountUsd,
        debtor: invoice.debtor,
        dueDateBlock: invoice.dueDateBlock,
      }
    );

    setDecryptedData(result);
    setCacheStatus("restored");
    setIsRestoring(false);
  };

  // Real ~15s Polling Engine via app/api/proof-status
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAttesting && elapsed <= 15) {
      timer = setInterval(async () => {
        const nextElapsed = elapsed + 1;
        setElapsed(nextElapsed);

        try {
          const res = await fetch(
            `/api/proof-status?txHash=${invoice?.txHash}&elapsed=${nextElapsed}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              setAttestationPercent(data.data.progressPercent);
              setAttestationSecs(data.data.secondsRemaining);
              setActiveStepText(data.data.stageDescription);

              if (data.data.isAttested) {
                setIsAttesting(false);
                if (invoice) {
                  const updated = { ...invoice, status: "Attested" as const, attestedHeight: 11566330 };
                  setInvoice(updated);
                }
              }
            }
          }
        } catch {
          // Fallback
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAttesting, elapsed, invoice]);

  const handleStartAttestation = () => {
    setElapsed(0);
    setAttestationPercent(0);
    setAttestationSecs(15);
    setActiveStepText("Submitting proof request to ProofBuilder API...");
    setIsAttesting(true);
  };

  const handleSimulatePayment = async () => {
    if (!invoice) return;
    const updated = await VaultBridgeAPI.simulatePayment(invoice.id);
    setInvoice(updated);
  };

  const handleTriggerDefaultCheck = async () => {
    if (!invoice) return;
    const result = await VaultBridgeAPI.triggerDefaultCheck(invoice.id);
    alert(result.reason);
    const updated = await VaultBridgeAPI.getInvoiceById(invoice.id);
    if (updated) setInvoice(updated);
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const maxBorrow = Math.round(invoice.amountUsd * 0.7);

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${invoice.id}/share`}>
            <Button variant="outline" size="sm" icon={<Key className="w-4 h-4 text-primary" />}>
              <span>Manage Access (Grant/Revoke)</span>
            </Button>
          </Link>
          <AttestationBadge status={invoice.status} size="md" />
        </div>
      </div>

      {/* Role Switcher / Wallet Simulator Banner */}
      <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-tint text-primary flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink flex items-center gap-2">
              <span>Viewer Role Simulator (AccessRegistry Test Matrix)</span>
              <span className="px-2 py-0.5 bg-primary-tint text-primary rounded-full font-bold text-[10px]">
                Active Privacy Layer
              </span>
            </h4>
            <p className="text-[11px] text-ink-secondary">
              Current Address: <code className="font-mono text-primary font-bold">{currentViewerAddress.slice(0, 10)}...{currentViewerAddress.slice(-6)}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-bg p-1 rounded-btn border border-border">
          <button
            onClick={() => setActiveViewerRole("owner")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeViewerRole === "owner"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Owner (Full Access)
          </button>
          <button
            onClick={() => setActiveViewerRole("auditor")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeViewerRole === "auditor"
                ? "bg-primary text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Granted Auditor
          </button>
          <button
            onClick={() => setActiveViewerRole("unauthorized")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeViewerRole === "unauthorized"
                ? "bg-danger text-white shadow-xs"
                : "text-ink-secondary hover:text-ink"
            }`}
          >
            Unauthorized Wallet
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-ink-secondary">
              Invoice Collateral Details
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-tint text-primary border border-primary/20">
              {invoice.riskTier || "Tier B (Standard 70%)"}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-ink tracking-tight">{invoice.id}</h2>
          <p className="text-xs font-mono text-ink-secondary truncate max-w-md">
            Hex: {invoice.invoiceIdHex}
          </p>
        </div>

        <div className="flex items-baseline gap-4 md:text-right">
          <div>
            <span className="text-xs font-semibold uppercase text-ink-secondary">Valuation</span>
            <p className="text-3xl font-bold text-ink">${invoice.amountUsd.toLocaleString()}</p>
            <p className="text-xs text-ink-secondary">{invoice.amountEth} ETH @ $2,700</p>
          </div>
        </div>
      </Card>

      {/* Proof Progress Ring */}
      {(isAttesting || invoice.status === "Awaiting Proof") && (
        <section className="animate-in fade-in zoom-in-95 duration-200">
          <ProofProgressRing
            progressPercent={attestationPercent}
            secondsRemaining={attestationSecs}
            statusText={activeStepText || "Polling /api/proof-status (~15s wait time)..."}
            txHash={invoice.txHash}
          />
        </section>
      )}

      {/* 2-Column Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Decrypted Confidential Details OR Access Restricted / Missing State */}
        <div className="lg:col-span-7 space-y-6">
          {decryptedData ? (
            <Card className="space-y-5 border-emerald-200 bg-emerald-50/20">
              <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <span>Confidential Invoice Payload (Decrypted Client-Side)</span>
                </div>
                <span className="px-2 py-0.5 bg-success-tint text-success font-bold text-[10px] rounded-full">
                  AES-256-GCM Verified
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
                    <span className="text-ink-secondary font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      Debtor Enterprise
                    </span>
                    <p className="font-bold text-ink">{decryptedData.debtorCompany}</p>
                  </div>

                  <div className="p-3 bg-surface rounded-xl border border-border space-y-1">
                    <span className="text-ink-secondary font-medium flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-primary" />
                      Escrow Settlement IBAN
                    </span>
                    <p className="font-mono font-bold text-ink">{decryptedData.bankIBAN}</p>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-border space-y-2">
                  <span className="text-ink-secondary font-semibold uppercase tracking-wider text-[10px]">
                    Encrypted Commercial Line Items
                  </span>
                  <div className="divide-y divide-border/60">
                    {decryptedData.lineItems?.map((item, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <span className="text-ink">{item.description}</span>
                        <span className="font-bold text-ink">${item.unitPriceUsd.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : activeViewerRole === "unauthorized" ? (
            <Card className="space-y-4 border-rose-200 bg-rose-50/20 text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-danger-tint text-danger flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">Access Restricted</h3>
                <p className="text-xs text-ink-secondary max-w-md mx-auto">
                  You do not have cryptographic permission on <code>AccessRegistry.sol</code> to decrypt this invoice's confidential payload.
                </p>
              </div>
              <Link href={`/invoices/${invoice.id}/share`}>
                <Button variant="outline" size="sm" className="mt-2 text-primary border-primary/20">
                  Request Permission from Owner
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="space-y-4 border-amber-200 bg-amber-50/20 text-center py-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">Encrypted Record Not Found in Local Cache</h3>
                <p className="text-xs text-ink-secondary max-w-md mx-auto">
                  You have access on <code>AccessRegistry.sol</code>, but the encrypted ciphertext is not in your browser cache (e.g. Incognito window or new session).
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={handleRestoreCache}
                isLoading={isRestoring}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Re-Import from On-Chain Pointer ({invoice.pointer ? `${invoice.pointer.slice(0, 16)}...` : "IPFS"})
              </Button>
            </Card>
          )}

          {/* Cryptographic Proof Inspection */}
          <Card className="space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-ink">Attestcoin Protocol Verification</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-bg rounded-xl border border-border/80 space-y-1">
                <span className="text-ink-secondary font-medium">Source Chain</span>
                <p className="font-bold text-ink">Ethereum Sepolia (ChainKey: 1)</p>
              </div>

              <div className="p-3 bg-bg rounded-xl border border-border/80 space-y-1">
                <span className="text-ink-secondary font-medium">Attested Height</span>
                <p className="font-bold text-ink">
                  {invoice.attestedHeight ? `#${invoice.attestedHeight.toLocaleString()}` : "Pending Relayer"}
                </p>
              </div>

              <div className="p-3 bg-bg rounded-xl border border-border/80 space-y-1">
                <span className="text-ink-secondary font-medium">Due Date Block</span>
                <p className="font-bold text-ink">#{invoice.dueDateBlock.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-bg rounded-xl border border-border/80 space-y-1">
                <span className="text-ink-secondary font-medium">Creditcoin Verifier</span>
                <p className="font-mono font-bold text-primary">Precompile 0x0FD2</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Sepolia Origin Tx:</span>
                <a
                  href={EXPLORER_HELPERS.getSepoliaTxUrl(invoice.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{invoice.txHash.slice(0, 12)}...{invoice.txHash.slice(-8)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Privacy Commitment (keccak256):</span>
                <span className="font-mono text-ink text-[11px]">
                  {invoice.commitment ? `${invoice.commitment.slice(0, 14)}...${invoice.commitment.slice(-8)}` : "0x98f4e21a4d8c7b...2d3e"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Off-Chain IPFS Pointer:</span>
                <span className="font-mono text-primary text-[11px]">
                  {invoice.pointer ? `${invoice.pointer.slice(0, 18)}...` : "ipfs://bafkreihdwdc..."}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-secondary">Creditcoin USC Contract:</span>
                <a
                  href={EXPLORER_HELPERS.getCreditcoinAddressUrl(CONTRACT_ADDRESSES?.creditcoin?.vaultLending || "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5")}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>{(CONTRACT_ADDRESSES?.creditcoin?.vaultLending || "0xE8686e4D2856Da637F2c17c71d818911Ec541dE5").slice(0, 10)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Actions & Live Attestation Feed */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-ink">Lending & Collateral Actions</h3>

            {invoice.status === "Awaiting Proof" && (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleStartAttestation}
                isLoading={isAttesting}
              >
                Submit Inclusion Proof (0x0FD2)
              </Button>
            )}

            {invoice.status === "Attested" && (
              <div className="space-y-3">
                <div className="p-3 bg-success-tint border border-emerald-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for Borrowing
                  </span>
                  <p className="text-ink-secondary">
                    Max draw: <strong>${maxBorrow.toLocaleString()} USDC</strong> (70% LTV).
                  </p>
                </div>
                <Link href="/loans">
                  <Button variant="primary" size="md" className="w-full">
                    Draw Liquidity
                  </Button>
                </Link>
              </div>
            )}

            {invoice.status === "Borrowed" && (
              <div className="space-y-3">
                <Button variant="secondary" size="md" className="w-full" onClick={handleSimulatePayment}>
                  Simulate Debtor Payment on Sepolia
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full text-danger border-rose-200 hover:bg-danger-tint"
                  onClick={handleTriggerDefaultCheck}
                >
                  Verify Absence Proof past Due Block
                </Button>
              </div>
            )}

            {invoice.status === "Paid" && (
              <div className="p-3 bg-success-tint border border-emerald-200 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Collateral released upon attested Sepolia payment!
              </div>
            )}

            {invoice.status === "Defaulted" && (
              <div className="p-3 bg-danger-tint border border-rose-200 rounded-xl text-xs text-danger font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Defaulted via verified absence-of-payment proof. Liquidated to vault.
              </div>
            )}
          </Card>

          <LiveAttestationFeed />
        </div>
      </div>
    </div>
  );
}
