# FILE-STRUCTURE.md — VaultBridge

```
vaultbridge/
├── docs/
│   ├── prd.md                           # Product requirements & user stories
│   ├── architecture.md                  # Cryptographic system architecture & precompile 0x0FD2
│   ├── project-plan.md                  # Milestone status & timeline tracking
│   ├── memory.md                        # Persistent agent context & decisions log
│   ├── handoff.md                       # Session logs & route mappings
│   ├── design-system.md                 # UI color tokens, typography, and FinFlow layout
│   ├── step-by-step-guide.md            # Technical walkthrough guide
│   └── pitch-deck.md                    # Hackathon pitch deck & 2-minute demo video script
│
├── contracts/                           # Solidity Smart Contracts (Hardhat)
│   ├── src/
│   │   ├── source-chain/                # Deployed to Ethereum Sepolia
│   │   │   └── InvoiceRegistrar.sol     # Invoice issuance & escrow payment contract
│   │   └── creditcoin/                  # Deployed to Creditcoin USC Testnet
│   │       ├── VaultLending.sol         # Main lending, dynamic risk tiers, and batch verifier
│   │       ├── MockERC20.sol            # Stablecoin test collateral
│   │       ├── MockPriceOracle.sol      # Flash-loan resistant price feed adapter
│   │       └── interfaces/
│   │           ├── IUSCVerifier.sol     # Native verifier precompile 0x0FD2 interface
│   │           └── IPriceOracle.sol     # Price feed interface with staleness validation
│   ├── test/
│   │   ├── InvoiceRegistrar.test.js     # Sepolia invoice tests
│   │   ├── VaultLending.test.ts         # Creditcoin lending & precompile mock tests
│   │   └── VaultLendingMultiAsset.test.js # Multi-asset, price oracle, & risk tier unit tests
│   ├── deploy/
│   │   ├── 01_deploy_registrar.js       # Deploy script for Sepolia
│   │   └── 02_deploy_vaultlending.ts    # Deploy script for Creditcoin
│   ├── deployed_addresses.json          # Verified deployed addresses record
│   ├── hardhat.config.ts                # Hardhat config (viaIR enabled, optimizer 200)
│   └── package.json
│
├── proof-pipeline/                      # Off-chain TS proof generation service & REST API
│   ├── src/
│   │   ├── chainInfo.ts                 # Resolves Sepolia chainKey (1) via precompile 0x0FD3
│   │   ├── generatePositiveProof.ts     # Generates inclusion proofs via ProofBuilder
│   │   ├── generateAbsenceProof.ts      # Generates absence-of-payment default proofs
│   │   ├── generateBatchProof.ts        # Bulk batch inclusion proof generator (86.5% gas savings)
│   │   ├── keeper.ts                    # Autonomous liquidation keeper daemon & webhook sidecar
│   │   ├── submitProof.ts               # Submits proofs to VaultLending.sol
│   │   └── index.ts                     # Express.js REST API server (Render Web Service)
│   ├── test/
│   │   └── pipeline.isolation.test.ts   # Live Sepolia + Creditcoin isolation test
│   ├── demo_walkthrough.ts              # 9.6s End-to-end CLI demo automation
│   ├── end_to_end_test.ts               # Integration test script
│   ├── Dockerfile                       # Multi-stage production container for Render
│   ├── render.yaml                      # Render Blueprint deployment config
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                            # Next.js 14 Web Application
│   ├── app/
│   │   ├── layout.tsx                   # AppShell & Providers layout wrapper
│   │   ├── page.tsx                     # Public Landing Page (Hero, 4 Pillars, 4-Step Guide, FAQ, Wallet Switch)
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Protocol Dashboard (4 StatCards, Area Chart, Donut, Feed)
│   │   ├── invoices/
│   │   │   ├── page.tsx                 # Invoice catalog, CSV bulk batch modal, and issue modal
│   │   │   └── [id]/page.tsx            # Invoice detail + ~15s polling ProofProgressRing & risk tiers
│   │   ├── loans/
│   │   │   └── page.tsx                 # Active loans & multi-asset portfolio credit management
│   │   ├── how-it-works/
│   │   │   └── page.tsx                 # 4-stage architectural walkthrough & gas benchmark table
│   │   ├── faq/
│   │   │   └── page.tsx                 # Categorized interactive FAQ
│   │   └── api/
│   │       └── proof-status/
│   │           └── route.ts             # Route Handler polling proof pipeline
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Shared desktop shell wrapper
│   │   │   ├── Sidebar.tsx              # 240px fixed sidebar with logo & relayer status
│   │   │   └── TopBar.tsx               # Header title, filter dropdown, and Wagmi connect
│   │   ├── ui/
│   │   │   ├── Button.tsx               # Primary / secondary / outline / ghost buttons
│   │   │   └── Card.tsx                 # 16px radius card primitive with 150ms hover lift
│   │   ├── Providers.tsx                # WagmiConfig client wrapper
│   │   ├── StatCard.tsx                 # Stat card with delta badges & mini sparklines
│   │   ├── AttestationBadge.tsx         # Pill badge for Attested / Awaiting / Defaulted
│   │   ├── LiveAttestationFeed.tsx      # Real-time list of cross-chain attestation events
│   │   ├── CollateralChart.tsx          # Interactive Area chart with primary blue gradient
│   │   ├── InvoiceStatusDonut.tsx       # Portfolio breakdown donut chart with filter legend
│   │   └── ProofProgressRing.tsx        # 15s radial progress ring showing 4 proof stages
│   ├── lib/
│   │   ├── api.ts                       # API client with multi-asset borrow and risk tier engine
│   │   ├── wagmiConfig.ts               # Wagmi v1 config for Sepolia and Creditcoin Testnet
│   │   ├── contracts.ts                 # Addresses, ABIs, and block explorer helpers
│   │   └── theme.ts                     # Design system JS tokens
│   ├── styles/
│   │   └── globals.css                  # CSS variables, Inter font antialiasing, scrollbars
│   ├── vercel.json                      # Vercel deployment configuration
│   ├── .env.example                     # Frontend environment variables template
│   ├── tailwind.config.ts               # Tailwind CSS tokens
│   └── package.json
│
├── TESTING.md                           # Comprehensive testing & verification guide
├── .env.example                         # Root environment variables template
├── README.md                            # Comprehensive project README with live URLs
└── package.json
```
