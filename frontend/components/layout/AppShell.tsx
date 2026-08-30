"use client";

import React from "react";
import { Sidebar } from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-bg text-ink font-sans antialiased">
      {/* 240px Fixed Sidebar per design-system.md */}
      <Sidebar />

      {/* Main Content Area per design-system.md Section 3: --bg background, 32px padding, max-width content area */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
