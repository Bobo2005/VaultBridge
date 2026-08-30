"use client";

import React, { useState } from "react";
import { Card } from "./ui/Card";

interface DataPoint {
  label: string;
  collateral: number; // in thousands
  borrowed: number;   // in thousands
}

const chartData30D: DataPoint[] = [
  { label: "Aug 01", collateral: 1420, borrowed: 990 },
  { label: "Aug 05", collateral: 1680, borrowed: 1150 },
  { label: "Aug 10", collateral: 1890, borrowed: 1320 },
  { label: "Aug 15", collateral: 2150, borrowed: 1500 },
  { label: "Aug 20", collateral: 2420, borrowed: 1690 },
  { label: "Aug 25", collateral: 2650, borrowed: 1850 },
  { label: "Aug 29", collateral: 2840, borrowed: 1980 },
];

export const CollateralChart: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [activeRange, setActiveRange] = useState<"7D" | "30D" | "90D">("30D");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const data = chartData30D;
  const maxVal = 3200;
  const minVal = 800;

  // Chart coordinates calculation (viewBox 0 0 500 200)
  const width = 500;
  const height = 180;
  const paddingX = 20;
  const paddingY = 20;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.collateral - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    const yBorrowed = height - paddingY - ((d.borrowed - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
    return { x, y, yBorrowed, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cx1 = prev.x + (p.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (p.x - prev.x) / 2;
    const cy2 = p.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <Card className={`space-y-4 ${className}`}>
      {/* Header with Title and Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">
            Collateral Analytics
          </span>
          <div className="flex items-baseline gap-3 mt-0.5">
            <h3 className="text-[20px] font-bold text-ink tracking-tight">
              ${(activePoint.collateral / 1000).toFixed(2)}M
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-tint px-2 py-0.5 rounded-full">
              ↑ +18.4% this month
            </span>
          </div>
        </div>

        {/* Range Toggle Buttons */}
        <div className="flex items-center gap-1 bg-bg p-1 rounded-btn border border-border self-start sm:self-auto">
          {(["7D", "30D", "90D"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setActiveRange(r)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                activeRange === r
                  ? "bg-surface text-primary shadow-xs font-bold"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-48 sm:h-56 pt-2 select-none">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft gradient fill per design-system.md: --primary-tint fading to transparent */}
            <linearGradient id="collateralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="40" x2={width} y2="40" stroke="#F1F5F9" strokeDasharray="3 3" />
          <line x1="0" y1="90" x2={width} y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
          <line x1="0" y1="140" x2={width} y2="140" stroke="#F1F5F9" strokeDasharray="3 3" />

          {/* Gradient Area Fill */}
          <path d={areaD} fill="url(#collateralGrad)" />

          {/* Primary Stroke Line */}
          <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

          {/* Interactive Hover Nodes */}
          {points.map((p, idx) => (
            <g
              key={p.label}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible touch target */}
              <rect
                x={p.x - 20}
                y="0"
                width="40"
                height={height}
                fill="transparent"
              />

              {hoveredIdx === idx && (
                <>
                  <line
                    x1={p.x}
                    y1={p.y}
                    x2={p.x}
                    y2={height}
                    stroke="#94A3B8"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="6"
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth="3"
                    className="shadow-md"
                  />
                </>
              )}
            </g>
          ))}
        </svg>

        {/* Floating Tooltip when hovered */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 bg-ink text-white px-3 py-1.5 rounded-lg text-xs shadow-lg pointer-events-none transform -translate-x-1/2"
            style={{ left: `${(points[hoveredIdx].x / width) * 100}%` }}
          >
            <div className="font-semibold">{points[hoveredIdx].label}</div>
            <div className="text-blue-300">Collateral: ${(points[hoveredIdx].collateral / 1000).toFixed(2)}M</div>
            <div className="text-slate-300">Borrowed: ${(points[hoveredIdx].borrowed / 1000).toFixed(2)}M</div>
          </div>
        )}
      </div>

      {/* Footer Metrics Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border text-center">
        <div>
          <span className="text-[11px] font-medium text-ink-secondary">Total Attested</span>
          <p className="text-sm font-bold text-ink">$2.84M</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-ink-secondary">Active Drawn (70% Max)</span>
          <p className="text-sm font-bold text-primary">$1.98M</p>
        </div>
        <div>
          <span className="text-[11px] font-medium text-ink-secondary">Available Headroom</span>
          <p className="text-sm font-bold text-success">$860K</p>
        </div>
      </div>
    </Card>
  );
};

export default CollateralChart;
