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
  size?: "sm" | "md";
  showPulse?: boolean;
  className?: string;
}

export const AttestationBadge: React.FC<AttestationBadgeProps> = ({
  status,
  size = "md",
  showPulse,
  className = "",
}) => {
  const normStatus = status.trim();

  // Status mapping strictly adhering to docs/design-system.md Section 4
  let styleClasses = "bg-primary-tint text-primary border-blue-200/70";
  let isWarning = false;

  switch (normStatus) {
    case "Attested":
    case "Paid":
      // success tint: #F0FDF4 fill, #16A34A text
      styleClasses = "bg-success-tint text-success border-emerald-200/80";
      break;

    case "Awaiting Proof":
    case "Pending":
      // warning tint: #FFFBEB fill, #D97706 text, with animated pulse dot
      styleClasses = "bg-warning-tint text-warning border-amber-200/80";
      isWarning = true;
      break;

    case "Defaulted":
    case "Liquidated":
      // danger tint: #FEF2F2 fill, #DC2626 text
      styleClasses = "bg-danger-tint text-danger border-rose-200/80";
      break;

    case "Borrowed":
    default:
      // primary tint: #EFF6FF fill, #2563EB text
      styleClasses = "bg-primary-tint text-primary border-blue-200/80";
      break;
  }

  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[11px]"
      : "px-2.5 py-1 text-[12px]";

  const shouldPulse = showPulse ?? isWarning;

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
      <span>{normStatus}</span>
    </span>
  );
};
