import React from "react";
import "../styles/globals.css";
import { AppShell } from "../components/layout/AppShell";
import { Providers } from "../components/Providers";

export const metadata = {
  title: "VaultBridge | Cross-Chain RWA Lending & StreakChain on Creditcoin",
  description:
    "Cross-chain invoice-financing & privacy-preserving RWA lending on Creditcoin, with the StreakChain habit attestation module sharing the core Attestcoin Protocol engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-ink font-sans antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
