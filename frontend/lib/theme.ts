/**
 * VaultBridge Design System Theme Tokens
 * Strictly adhering to docs/design-system.md
 */

export const colors = {
  // Primary action colors
  primary: {
    DEFAULT: "#2563EB", // Primary buttons, active nav item, links, chart lines
    dark: "#1D4ED8",    // Button hover/active state
    tint: "#EFF6FF",    // Icon backgrounds, active nav background, badge fills
  },
  // Typography colors
  ink: {
    DEFAULT: "#0F172A", // Headings, primary text
    secondary: "#64748B", // Body/secondary text
  },
  // Structural colors
  border: "#E2E8F0",    // Card borders, dividers
  surface: "#FFFFFF",   // Card/panel backgrounds
  bg: "#F8FAFC",        // Page background

  // State indicators
  success: {
    DEFAULT: "#16A34A", // Positive deltas, "Paid" / "Attested" status
    tint: "#F0FDF4",    // Success badge background
  },
  danger: {
    DEFAULT: "#DC2626",  // Negative deltas, "Defaulted" / "Liquidated" status
    tint: "#FEF2F2",    // Danger badge background
  },
  warning: {
    DEFAULT: "#D97706", // "Pending attestation" / "Awaiting proof" status
    tint: "#FFFBEB",    // Warning badge background
  },
} as const;

export const typography = {
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  h1: "text-[32px] font-bold leading-[40px] text-[#0F172A] tracking-tight",
  h2: "text-[20px] font-semibold leading-[28px] text-[#0F172A]",
  cardStat: "text-[28px] font-bold leading-[36px] text-[#0F172A] tracking-tight",
  body: "text-[14px] font-normal leading-[20px] text-[#64748B]",
  eyebrow: "text-[12px] font-semibold uppercase tracking-[0.04em] text-[#64748B]",
} as const;

export const shadows = {
  card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 8px rgba(15, 23, 42, 0.04)",
  cardHover: "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
} as const;

export const radii = {
  card: "16px",
  button: "10px",
  badge: "9999px",
} as const;

export const transitions = {
  cardHover: "transition-all duration-150 ease hover:-translate-y-[2px] hover:shadow-cardHover",
  buttonHover: "transition-colors duration-150 ease",
} as const;