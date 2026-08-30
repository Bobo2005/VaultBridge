import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563EB",
          dark: "#1D4ED8",
          tint: "#EFF6FF",
        },
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#64748B",
        },
        border: "#E2E8F0",
        surface: "#FFFFFF",
        bg: "#F8FAFC",
        success: {
          DEFAULT: "#16A34A",
          tint: "#F0FDF4",
        },
        danger: {
          DEFAULT: "#DC2626",
          tint: "#FEF2F2",
        },
        warning: {
          DEFAULT: "#D97706",
          tint: "#FFFBEB",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 8px rgba(15, 23, 42, 0.04)",
        cardHover: "0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
        badge: "9999px",
      },
      letterSpacing: {
        eyebrow: "0.04em",
      },
    },
  },
  plugins: [],
};

export default config;