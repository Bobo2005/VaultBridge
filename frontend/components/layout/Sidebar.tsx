"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Coins,
  Activity,
  HelpCircle,
  Flame,
  Trophy,
  Award,
  ShieldCheck,
  ExternalLink,
  Lock,
  X,
  Layers
} from "lucide-react";

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const navSections: NavSection[] = [
  {
    title: "LENDING & RWA",
    items: [
      {
        name: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        name: "Invoices",
        href: "/invoices",
        icon: FileText,
      },
      {
        name: "Loans & Credit",
        href: "/loans",
        icon: Coins,
      },
    ],
  },
  {
    title: "STREAKCHAIN",
    items: [
      {
        name: "Habits & Streaks",
        href: "/streaks",
        icon: Flame,
        badge: "V2",
      },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      {
        name: "How it Works",
        href: "/how-it-works",
        icon: Activity,
      },
      {
        name: "FAQ & Docs",
        href: "/faq",
        icon: HelpCircle,
      },
    ],
  },
];

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onClose }) => {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`
        bg-surface border-r border-border flex flex-col justify-between select-none
        ${
          isMobile
            ? "w-full max-w-[280px] h-full z-50 overflow-y-auto"
            : "w-[240px] shrink-0 min-h-screen sticky top-0 h-screen z-30 hidden lg:flex"
        }
      `}
    >
      {/* Top Header: Logo */}
      <div className="overflow-y-auto flex-1">
        <div className="h-20 flex items-center justify-between px-6 border-b border-border">
          <Link href="/" onClick={handleLinkClick} className="flex items-center gap-3 group">
            {/* Custom cryptographic bridge mark */}
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30 group-hover:bg-primary-dark transition-colors shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 19V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 19V13C9 12.4477 9.44772 12 10 12H14C14.5523 12 15 12.4477 15 13V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M2 19H22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="5" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-ink flex items-center gap-1.5">
                <span>VaultBridge</span>
              </div>
              <p className="text-[11px] font-medium text-ink-secondary">
                Attestcoin Protocol
              </p>
            </div>
          </Link>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-bg transition-colors"
              aria-label="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Grouped Navigation Sections */}
        <nav className="p-3 space-y-5 mt-2">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-secondary/80">
                {section.title}
              </div>

              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname?.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`
                      relative flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                      ${
                        isActive
                          ? "bg-primary-tint text-primary font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-primary before:rounded-r"
                          : "text-ink-secondary hover:text-ink hover:bg-bg"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-primary"
                            : "text-ink-secondary group-hover:text-ink"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-tint text-primary rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Protocol Engine Status Card */}
      <div className="p-4 border-t border-border">
        <div className="bg-bg border border-border/80 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-secondary">
              Relayer Engine
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-1 pt-1 border-t border-border/60 text-[11px]">
            <div className="flex items-center justify-between text-ink-secondary">
              <span>Verification</span>
              <span className="font-mono font-semibold text-primary">0x0FD2</span>
            </div>
            <div className="flex items-center justify-between text-ink-secondary">
              <span>Source</span>
              <span className="font-medium text-ink">Sepolia (1)</span>
            </div>
            <div className="flex items-center justify-between text-ink-secondary">
              <span>Settlement</span>
              <span className="font-medium text-ink">Creditcoin 3</span>
            </div>
          </div>

          <a
            href="https://creditcoin.org"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1 w-full pt-1.5 text-[11px] font-semibold text-primary hover:text-primary-dark transition-colors"
          >
            <span>Shared USC Engine</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  );
};
