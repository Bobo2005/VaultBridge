"use client";

import React, { useState, useEffect } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Key,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Shield,
  Eye,
  UserX,
  FileCheck,
  Landmark,
  Coins,
  Sparkles,
} from "lucide-react";
import {
  AuthorizedGrantee,
  getAuthorizedGrantees,
  grantAccessClient,
  revokeAccessClient,
} from "../lib/privacy";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../lib/contracts";

export interface ShareAccessPanelProps {
  invoiceId: string;
}

export type GranteeRole = "Verified Auditor (KPMG/Deloitte)" | "Institutional Lender" | "Tax Compliance Officer";

export const ShareAccessPanel: React.FC<ShareAccessPanelProps> = ({ invoiceId }) => {
  const [granteeAddress, setGranteeAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState<GranteeRole>("Verified Auditor (KPMG/Deloitte)");
  const [grantedList, setGrantedList] = useState<AuthorizedGrantee[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string; txHash?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [revokingAddress, setRevokingAddress] = useState<string | null>(null);

  const loadGrantees = () => {
    const list = getAuthorizedGrantees(invoiceId);
    setGrantedList(list);
  };

  useEffect(() => {
    loadGrantees();
  }, [invoiceId]);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!granteeAddress || !granteeAddress.startsWith("0x") || granteeAddress.length < 10) {
      setStatusMessage({ type: "error", text: "Please enter a valid recipient account address (0x...)." });
      return;
    }

    setIsProcessing(true);
    try {
      const { txHash } = await grantAccessClient(invoiceId, granteeAddress, selectedRole as any);
      loadGrantees();
      setStatusMessage({
        type: "success",
        text: `Encrypted access granted! Verified permissions authorized for ${granteeAddress.slice(0, 8)}... (${selectedRole})`,
        txHash,
      });
      setGranteeAddress("");
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to grant access" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async (address: string) => {
    setRevokingAddress(address);
    try {
      const { txHash } = await revokeAccessClient(invoiceId, address);
      loadGrantees();
      setStatusMessage({
        type: "success",
        text: `Access permanently revoked! Decryption permissions immediately removed for ${address.slice(0, 8)}...`,
        txHash,
      });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to revoke access" });
    } finally {
      setRevokingAddress(null);
    }
  };

  const setPreset = (addr: string, role: GranteeRole) => {
    setGranteeAddress(addr);
    setSelectedRole(role);
  };

  const getRoleBadge = (role: string) => {
    if (role === "Owner") {
      return "bg-primary-tint text-primary border-primary/20";
    }
    if (role.includes("Auditor")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (role.includes("Lender") || role.includes("Liquidity")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (role.includes("Tax")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-primary-tint/60 border border-primary/20 rounded-2xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-sm">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-ink">Selective Access & Privacy Controls</h4>
            <span className="px-2 py-0.5 bg-success-tint text-success rounded-full font-bold text-[10px]">
              Bank-Grade Encryption Active
            </span>
          </div>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            The invoice encryption key is securely delegated client-side for authorized recipients. Granted parties can decrypt and inspect verified business terms without exposing data publicly.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-150 ${
            statusMessage.type === "success"
              ? "bg-success-tint border-emerald-200 text-emerald-900"
              : "bg-danger-tint border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>

          {statusMessage.txHash && (
            <a
              href={EXPLORER_HELPERS.getCreditcoinTxUrl(statusMessage.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Audit Ref: {statusMessage.txHash.slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Grant Access Form Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-ink">Grant Selective Access</h3>
          </div>
          <span className="text-xs text-ink-secondary">
            Enterprise Permission Delegation
          </span>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          Delegate confidential view permissions to an institutional lender, tax compliance authority, or verified auditor. Encryption keys are securely shared with their authorized account.
        </p>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-ink-secondary">Preset Roles:</span>
          <button
            type="button"
            onClick={() => setPreset("0x789d3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f6ca2", "Verified Auditor (KPMG/Deloitte)")}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-medium text-emerald-800 transition-colors flex items-center gap-1"
          >
            <FileCheck className="w-3 h-3 text-emerald-600" />
            Verified Auditor (KPMG/Deloitte)
          </button>
          <button
            type="button"
            onClick={() => setPreset("0x9965507D1a55bcC2695C58ba16FB37d819B0A4df", "Institutional Lender")}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-[11px] font-medium text-blue-800 transition-colors flex items-center gap-1"
          >
            <Coins className="w-3 h-3 text-blue-600" />
            Institutional Lender
          </button>
          <button
            type="button"
            onClick={() => setPreset("0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", "Tax Compliance Officer")}
            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-[11px] font-medium text-purple-800 transition-colors flex items-center gap-1"
          >
            <Landmark className="w-3 h-3 text-purple-600" />
            Tax Compliance Officer
          </button>
        </div>

        <form onSubmit={handleGrant} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                Recipient Corporate / Account Address
              </label>
              <input
                type="text"
                placeholder="0x Recipient Ethereum / Creditcoin Address"
                value={granteeAddress}
                onChange={(e) => setGranteeAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-secondary mb-1">
                Designated Recipient Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-bg border border-border rounded-btn text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Verified Auditor (KPMG/Deloitte)">Verified Auditor (KPMG/Deloitte)</option>
                <option value="Institutional Lender">Institutional Lender</option>
                <option value="Tax Compliance Officer">Tax Compliance Officer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-ink-secondary">
              Immediately authorizes decryption permissions for designated party.
            </span>
            <Button
              variant="primary"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
              isLoading={isProcessing}
              type="submit"
            >
              Grant & Authorize Access
            </Button>
          </div>
        </form>
      </Card>

      {/* Active Access Management Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <div>
              <h3 className="text-base font-bold text-ink">
                Active Authorized Parties ({grantedList.length})
              </h3>
              <p className="text-[11px] text-ink-secondary">
                Manage view and audit permissions across all authorized stakeholders
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-ink-secondary">
            Privacy & Access Control Hub
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-[11px] uppercase tracking-wider text-ink-secondary">
                <th className="py-2.5 px-3 font-semibold">Authorized Party</th>
                <th className="py-2.5 px-3 font-semibold">Designated Role</th>
                <th className="py-2.5 px-3 font-semibold">Access Granted</th>
                <th className="py-2.5 px-3 font-semibold">Decryption Fingerprint</th>
                <th className="py-2.5 px-3 font-semibold text-right">Revocation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {grantedList.map((grantee) => (
                <tr key={grantee.address} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-ink">{grantee.address.slice(0, 8)}...{grantee.address.slice(-6)}</span>
                      <a
                        href={EXPLORER_HELPERS.getCreditcoinAddressUrl(grantee.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-secondary hover:text-primary"
                        title="View account details"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getRoleBadge(grantee.role)}`}>
                      {grantee.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-ink-secondary text-[11px]">
                    {grantee.grantedAt}
                  </td>

                  <td className="py-3 px-3 font-mono text-[10px] text-ink-secondary">
                    {grantee.wrappedKeyHash}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {grantee.role === "Owner" ? (
                      <span className="text-[10px] font-bold text-ink-secondary uppercase">
                        Primary Owner
                      </span>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger border-rose-200 hover:bg-danger-tint text-[11px] h-7 px-2.5"
                          icon={<Trash2 className="w-3 h-3" />}
                          isLoading={revokingAddress === grantee.address}
                          onClick={() => handleRevoke(grantee.address)}
                          title="Immediately removes all decryption permissions for this party"
                        >
                          Instant Revoke Access
                        </Button>
                        <span className="text-[9px] text-ink-secondary">
                          Immediately removes all decryption permissions for this party.
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {grantedList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-secondary text-xs">
                    No third-party addresses have been granted access.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

