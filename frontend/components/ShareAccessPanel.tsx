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
} from "lucide-react";
import {
  getAuthorizedAddresses,
  grantAccessClient,
  revokeAccessClient,
} from "../lib/privacy";
import { CONTRACT_ADDRESSES, EXPLORER_HELPERS } from "../lib/contracts";

export interface ShareAccessPanelProps {
  invoiceId: string;
}

export const ShareAccessPanel: React.FC<ShareAccessPanelProps> = ({ invoiceId }) => {
  const [granteeAddress, setGranteeAddress] = useState("");
  const [grantedList, setGrantedList] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const list = getAuthorizedAddresses(invoiceId);
    setGrantedList(list);
  }, [invoiceId]);

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!granteeAddress || !granteeAddress.startsWith("0x") || granteeAddress.length < 10) {
      setStatusMessage({ type: "error", text: "Please enter a valid Ethereum address (0x...)." });
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      grantAccessClient(invoiceId, granteeAddress);
      setGrantedList(getAuthorizedAddresses(invoiceId));
      setStatusMessage({
        type: "success",
        text: `Access granted! Wrapped symmetric key registered on AccessRegistry for ${granteeAddress.slice(0, 10)}...`,
      });
      setGranteeAddress("");
      setIsProcessing(false);
    }, 600);
  };

  const handleRevoke = (address: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      revokeAccessClient(invoiceId, address);
      setGrantedList(getAuthorizedAddresses(invoiceId));
      setStatusMessage({
        type: "success",
        text: `Access revoked! Address ${address.slice(0, 10)}... cannot decrypt the invoice ciphertext anymore.`,
      });
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-primary-tint/60 border border-primary/20 rounded-2xl flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-ink flex items-center gap-2">
            <span>AccessRegistry.sol Access Delegation</span>
            <span className="px-2 py-0.5 bg-success-tint text-success rounded-full font-bold text-[10px]">
              Active ECIES Wrapping
            </span>
          </h4>
          <p className="text-[11px] text-ink-secondary leading-relaxed">
            The symmetric key <strong>K</strong> is wrapped with the recipient's public key and stored on Creditcoin. Only authorized addresses can retrieve their wrapped key and decrypt the confidential invoice metadata.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
            statusMessage.type === "success"
              ? "bg-success-tint border-emerald-200 text-emerald-900"
              : "bg-danger-tint border-rose-200 text-rose-900"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grant Access Form Card */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-ink">Grant Encrypted Access</h3>
        </div>

        <p className="text-xs text-ink-secondary">
          Enter an auditor, lender, or buyer address. The protocol will wrap the secret key for them and emit an <code>AccessGranted</code> event on Creditcoin.
        </p>

        <form onSubmit={handleGrant} className="space-y-3 pt-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x Grantee Ethereum / Creditcoin Address"
              value={granteeAddress}
              onChange={(e) => setGranteeAddress(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-btn text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-secondary">
              Need a contact? Select from the Address Book in the top navigation bar.
            </span>
            <Button
              variant="primary"
              size="md"
              icon={<UserPlus className="w-4 h-4" />}
              isLoading={isProcessing}
              type="submit"
            >
              Grant Access
            </Button>
          </div>
        </form>
      </Card>

      {/* Authorized Addresses List Card */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h3 className="text-base font-bold text-ink">
              Authorized Addresses ({grantedList.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-ink-secondary">
            Contract: {(CONTRACT_ADDRESSES?.creditcoin?.accessRegistry || "0x6b175474e89094c44da98b954eedeac495271d0f").slice(0, 8)}...
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {grantedList.map((addr, idx) => (
            <div key={addr} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-ink">{addr}</span>
                  {idx === 0 ? (
                    <span className="px-2 py-0.5 bg-primary-tint text-primary text-[10px] font-bold rounded-full">
                      Owner
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-success-tint text-success text-[10px] font-bold rounded-full">
                      Granted
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-ink-secondary">
                  Wrapped key available on <code>AccessRegistry.getWrappedKey()</code>
                </p>
              </div>

              {idx !== 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-danger border-rose-200 hover:bg-danger-tint self-start sm:self-auto"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => handleRevoke(addr)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}

          {grantedList.length === 0 && (
            <div className="py-6 text-center text-ink-secondary text-xs">
              No third-party addresses have been granted access.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
