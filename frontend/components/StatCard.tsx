import React from "react";
import { Card } from "./ui/Card";
import { AttestationBadge, AttestationStatus } from "./AttestationBadge";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badgeStatus?: AttestationStatus;
  badgeText?: string;
  unit?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  delta,
  badgeStatus,
  badgeText,
  unit,
  icon,
  sparklineData,
  className = "",
}) => {
  const statusToDisplay = badgeStatus || badgeText;

  return (
    <Card className={`flex flex-col justify-between ${className}`}>
      {/* Top Header: Label (eyebrow) + Delta badge or Status badge or Icon */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">
          {title}
        </span>

        <div className="flex items-center gap-1.5">
          {delta && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                delta.isPositive
                  ? "bg-success-tint text-success"
                  : "bg-danger-tint text-danger"
              }`}
            >
              <span>{delta.isPositive ? "↑" : "↓"}</span>
              <span>{delta.value}</span>
              {delta.label && (
                <span className="text-[10px] opacity-75 ml-0.5">{delta.label}</span>
              )}
            </span>
          )}

          {statusToDisplay && (
            <AttestationBadge status={statusToDisplay} size="sm" />
          )}

          {icon && !delta && !statusToDisplay && (
            <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Main Value & Unit */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-[28px] font-bold leading-[36px] text-ink tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-[14px] font-semibold text-ink-secondary">{unit}</span>
        )}
      </div>

      {/* Subtitle / Helper description */}
      {subtitle && (
        <p className="text-[13px] font-normal leading-[18px] text-ink-secondary mt-1">
          {subtitle}
        </p>
      )}

      {/* Optional Mini Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-border flex items-end gap-1.5 h-7">
          {sparklineData.map((val, idx) => {
            const max = Math.max(...sparklineData, 1);
            const heightPct = Math.max(15, Math.min(100, (val / max) * 100));
            return (
              <div
                key={idx}
                className="flex-1 bg-primary/20 hover:bg-primary rounded-t-sm transition-all duration-150 cursor-pointer"
                style={{ height: `${heightPct}%` }}
                title={`Period ${idx + 1}: ${val}`}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
};
