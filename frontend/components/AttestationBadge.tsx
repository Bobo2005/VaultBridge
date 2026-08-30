import React from "react";

export type AttestationStatus =
  | "Attested"
  | "Awaiting Proof"
  | "Pending"
  | "Defaulted"
  | "Borrowed"
  | "Paid"
  | "Liquidated"
  | string;

export interface AttestationBadgeProps {
  status: AttestationStatus;
  label?: string;
  size?: "sm" | "md";
  showPulse?: boolean;
  className?: string;
}

export const AttestationBadge: React.FC<AttestationBadgeProps> = ({
  status,
  label,
  size = "md",
  showPulse,
  className = "",
}) => {
  const normStatus = status.trim();

  // Status mapping strictly adhering to docs/design-system.md Section 4
  let styleClasses = "bg-primary-tint text-primary border-blue-200/70";
  let isWarning = false;
  let defaultLabel = normStatus;

  switch (normStatus) {
    case "Attested":
      styleClasses = "bg-success-tint text-success border-emerald-200/80";
      defaultLabel = "Verified";
      break;

    case "Paid":
      styleClasses = "bg-success-tint text-success border-emerald-200/80";
      defaultLabel = "Settled";
      break;

    case "Awaiting Proof":
    case "Pending":
      styleClasses = "bg-warning-tint text-warning border-amber-200/80";
      isWarning = true;
      defaultLabel = "Pending Verification";
      break;

    case "Defaulted":
    case "Liquidated":
      styleClasses = "bg-danger-tint text-danger border-rose-200/80";
      defaultLabel = normStatus === "Liquidated" ? "Liquidated" : "Default Resolved";
      break;

    case "Borrowed":
      styleClasses = "bg-primary-tint text-primary border-blue-200/80";
      defaultLabel = "Financed";
      break;

    default:
      styleClasses = "bg-primary-tint text-primary border-blue-200/80";
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-[12px]";

  const shouldPulse = showPulse ?? isWarning;
  const displayText = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-badge border ${sizeClasses} ${styleClasses} whitespace-nowrap shadow-xs ${className}`}
    >
      {shouldPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-warning"></span>
        </span>
      )}
      <span>{displayText}</span>
    </span>
  );
};
