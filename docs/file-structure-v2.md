# FILE-STRUCTURE-V2.md — VaultBridge Platform (Privacy Layer + StreakChain)

> Additions to the V1 structure in `file-structure.md`. Existing folders are extended, not replaced.

```
vaultbridge/
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   ├── architecture-v2.md               # NEW
│   ├── project-plan.md
│   ├── project-plan-v2.md               # NEW
│   ├── file-structure.md
│   ├── file-structure-v2.md             # NEW (this file)
│   ├── ai-agent-prompts.md
│   ├── ai-agent-prompts-v2.md           # NEW
│   ├── memory.md
│   ├── handoff.md
│   └── design-system.md
│
├── contracts/
│   ├── source-chain/
│   │   ├── InvoiceRegistrar.sol
│   │   ├── StreakRegistry.sol           # NEW
│   │   └── test/
│   │       ├── InvoiceRegistrar.t.sol
│   │       └── StreakRegistry.t.sol     # NEW
│   │
│   ├── creditcoin/
│   │   ├── VaultLending.sol             # MODIFIED — commitment+pointer storage
│   │   ├── AccessRegistry.sol           # NEW — privacy sharing
│   │   ├── StreakVerifier.sol           # NEW
│   │   ├── StreakBadge.sol              # NEW — ERC-721 milestone badges
│   │   ├── interfaces/
│   │   │   └── IUSCVerifier.sol
│   │   └── test/
│   │       ├── VaultLending.t.sol
│   │       ├── AccessRegistry.t.sol     # NEW
│   │       ├── StreakVerifier.t.sol     # NEW
│   │       └── PrivacyAccessControl.t.sol  # NEW — unauthorized/granted/revoked scenarios
│   │
│   ├── hardhat.config.ts
│   └── deploy/
│       ├── 01_deploy_registrar.ts
│       ├── 02_deploy_vaultlending.ts
│       ├── 03_deploy_accessregistry.ts  # NEW
│       ├── 04_deploy_streakregistry.ts  # NEW
│       └── 05_deploy_streakverifier.ts  # NEW
│
├── proof-pipeline/
│   ├── src/
│   │   ├── chainInfo.ts
│   │   ├── generatePositiveProof.ts
│   │   ├── generateAbsenceProof.ts
│   │   ├── generateStreakAbsenceProof.ts  # NEW — reuses same primitives, streak-specific
│   │   ├── submitProof.ts
│   │   └── index.ts
│   ├── test/
│   │   ├── pipeline.isolation.test.ts
│   │   └── streak.isolation.test.ts     # NEW
│   └── package.json
│
├── crypto/                              # NEW — privacy layer encryption utilities
│   ├── src/
│   │   ├── encryptPayload.ts            # symmetric encrypt of invoice/loan data
│   │   ├── wrapKey.ts                   # wrap symmetric key with a wallet pubkey
│   │   ├── unwrapKey.ts                 # unwrap on the reading side
│   │   └── blobStorage.ts               # push/pull ciphertext to IPFS or backend
│   └── test/
│       └── crypto.roundtrip.test.ts     # encrypt → wrap → unwrap → decrypt integrity check
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     # Platform overview (both modules)
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── share/page.tsx       # NEW — grant/revoke access UI
│   │   ├── loans/
│   │   │   └── page.tsx
│   │   ├── streaks/                     # NEW
│   │   │   ├── page.tsx                 # Dashboard + leaderboard
│   │   │   └── [id]/page.tsx            # Detail + live attestation feed (reused pattern)
│   │   └── api/
│   │       ├── proof-status/route.ts
│   │       └── streak-status/route.ts   # NEW
│   ├── components/
│   │   ├── ui/
│   │   ├── StatCard.tsx
│   │   ├── AttestationBadge.tsx
│   │   ├── LiveAttestationFeed.tsx
│   │   ├── CollateralChart.tsx
│   │   ├── InvoiceStatusDonut.tsx
│   │   ├── ProofProgressRing.tsx
│   │   ├── ShareAccessPanel.tsx         # NEW — grant/revoke by address
│   │   ├── StreakLeaderboard.tsx        # NEW
│   │   └── StreakBadgeCard.tsx          # NEW
│   ├── lib/
│   │   ├── wagmiConfig.ts
│   │   ├── contracts.ts                 # ABIs + addresses (now includes AccessRegistry, StreakVerifier, StreakBadge)
│   │   └── theme.ts
│   ├── styles/
│   │   └── globals.css
│   ├── tailwind.config.ts
│   └── package.json
│
├── .env.example
├── README.md                            # MODIFIED — documents both modules + privacy layer
└── package.json
```

## Notes
- `crypto/` is a new top-level package, kept independent so it can be unit-tested for correctness (encrypt/wrap/unwrap round-trip) without touching contracts or the frontend.
- `StreakBadge.sol` is deliberately separate from `StreakVerifier.sol` so minting logic doesn't complicate the core streak-counting/breaking logic.
- Sidebar navigation in `frontend/app/layout.tsx` gets two top-level sections: **Lending** (Invoices, Loans) and **Streaks** — same shell, same wallet connection, per `architecture-v2.md` §4.
