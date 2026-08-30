"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";

export interface InvoiceStatusDonutProps {
  className?: string;
  onFilterStatus?: (status: string | null) => void;
}

export const InvoiceStatusDonut: React.FC<InvoiceStatusDonutProps> = ({
  className = "",
  onFilterStatus,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const segments = [
    { label: "Attested", value: "48%", count: 12, amount: "$1.36M", color: "#16A34A" }, // success
    { label: "Borrowed", value: "32%", count: 8, amount: "$895K", color: "#2563EB" },  // primary
    { label: "Paid", value: "14%", count: 4, amount: "$380K", color: "#38BDF8" },      // sky blue
    { label: "Defaulted", value: "6%", count: 1, amount: "$40.5K", color: "#DC2626" },  // danger
  ];

  const handleSelect = (label: string) => {
    const next = selectedSegment === label ? null : label;
    setSelectedSegment(next);
    onFilterStatus?.(next);
  };

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">
            PORTFOLIO BREAKDOWN
          </span>
          <h3 className="text-[18px] font-bold text-ink tracking-tight mt-0.5">
            Invoice Status
          </h3>
        </div>
        {selectedSegment && (
          <button
            onClick={() => handleSelect(selectedSegment)}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background ring */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#F1F5F9"
              strokeWidth="4.2"
            />

            {/* Attested segment (48%) */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#16A34A"
              strokeWidth={selectedSegment === "Attested" ? "5.8" : "4.5"}
              strokeDasharray="48, 100"
              strokeDashoffset="0"
              className="cursor-pointer transition-all duration-150"
              onClick={() => handleSelect("Attested")}
            />

            {/* Borrowed segment (32%) */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#2563EB"
              strokeWidth={selectedSegment === "Borrowed" ? "5.8" : "4.5"}
              strokeDasharray="32, 100"
              strokeDashoffset="-48"
              className="cursor-pointer transition-all duration-150"
              onClick={() => handleSelect("Borrowed")}
            />

            {/* Paid segment (14%) */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#38BDF8"
              strokeWidth={selectedSegment === "Paid" ? "5.8" : "4.5"}
              strokeDasharray="14, 100"
              strokeDashoffset="-80"
              className="cursor-pointer transition-all duration-150"
              onClick={() => handleSelect("Paid")}
            />

            {/* Defaulted segment (6%) */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#DC2626"
              strokeWidth={selectedSegment === "Defaulted" ? "5.8" : "4.5"}
              strokeDasharray="6, 100"
              strokeDashoffset="-94"
              className="cursor-pointer transition-all duration-150"
              onClick={() => handleSelect("Defaulted")}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-bold text-ink">25</span>
            <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">Invoices</span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2">
          {segments.map((seg) => {
            const isSelected = selectedSegment === seg.label;
            return (
              <div
                key={seg.label}
                onClick={() => handleSelect(seg.label)}
                className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer text-xs font-semibold transition-all ${
                  isSelected ? "bg-primary-tint/70 text-primary ring-1 ring-primary/30" : "hover:bg-bg"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                  <span className="text-ink">{seg.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-ink-secondary text-[11px]">{seg.amount}</span>
                  <span className="font-bold text-ink w-8 text-right">{seg.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default InvoiceStatusDonut;
