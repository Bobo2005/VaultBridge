"use client";

import React, { useState, useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { wagmiConfig } from "../lib/wagmiConfig";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      {mounted ? children : <div className="min-h-screen bg-bg">{children}</div>}
    </WagmiConfig>
  );
}
