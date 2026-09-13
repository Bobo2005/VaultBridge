"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { JudgeSandboxBar } from "../JudgeSandboxBar";
import {
  LayoutDashboard,
  FileText,
  Coins,
  Flame,
  Menu,
  X,
  Zap,
  ExternalLink,
  HelpCircle,
  Activity,
} from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const mobileNavItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Invoices", href: "/invoices", icon: FileText },
    { name: "Loans", href: "/loans", icon: Coins },
    { name: "Streaks", href: "/streaks", icon: Flame, badge: "V2" },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased flex flex-col lg:flex-row">
      {/* Desktop Sticky Sidebar (lg: 1024px+) */}
      <Sidebar />

      {/* Mobile Top Header (< lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between shadow-xs">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs shadow-primary/30 shrink-0">
            <svg
              className="w-4 h-4"
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
            <div className="font-bold text-sm tracking-tight text-ink flex items-center gap-1">
              <span>VaultBridge</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary-tint text-primary border border-primary/20">
                CC3
              </span>
            </div>
            <p className="text-[10px] text-ink-secondary leading-none">
              Attestcoin Protocol
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-tint text-success border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            0x0FD2 Live
          </span>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-btn bg-bg hover:bg-surface border border-border text-ink transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-ink" />
            ) : (
              <Menu className="w-5 h-5 text-ink" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Slide-over Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative z-50 flex-1 max-w-[280px] bg-surface h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar isMobile onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-32 lg:pb-8 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (< lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border flex items-center justify-around py-1.5 px-2 shadow-lg">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors relative ${
                isActive
                  ? "text-primary font-bold"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-ink-secondary"}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[8px] font-bold bg-primary text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.name}</span>
            </Link>
          );
        })}

        {/* More button to toggle drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
            isMobileMenuOpen ? "text-primary font-bold" : "text-ink-secondary hover:text-ink"
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="mt-0.5">More</span>
        </button>
      </nav>

      {/* Global Interactive Judge Sandbox Toolbar */}
      <JudgeSandboxBar />
    </div>
  );
};
