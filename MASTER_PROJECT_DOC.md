# 🏛️ VaultBridge Platform: Master Technical Specification & Architecture Document

> **Universal Trustless Cross-Chain Verification & Working Capital Credit Facilities on Creditcoin**  
> **Built for the BUIDL CTC 2026 Fall Hackathon (RWA/DeFi Track & Gaming Track)**  
> **Powered by the Attestcoin Protocol (`@gluwa/usc-sdk`) and Native Precompile `0x0FD2`**

---

## 📑 Table of Contents
1. [Executive Summary & Core Thesis](#1-executive-summary--core-thesis)
2. [Dual-Product Architecture: One Engine, Two Products](#2-dual-product-architecture-one-engine-two-products)
3. [Cryptographic Deep-Dive & Privacy Architecture](#3-cryptographic-deep-dive--privacy-architecture)
4. [Smart Contract Architecture & Verified Deployments](#4-smart-contract-architecture--verified-deployments)
5. [Complete Repository File Structure](#5-complete-repository-file-structure)
6. [Lending Economics, Risk Tiers, 5% Bounty & Dynamic APR](#6-lending-economics-risk-tiers-5-bounty--dynamic-apr)
7. [StreakChain: Habit Attestation & Soulbound Badges](#7-streakchain-habit-attestation--soulbound-badges)
8. [Autonomous Watchtower Daemon, SSE Stream & Merkle Inspector API](#8-autonomous-watchtower-daemon-sse-stream--merkle-inspector-api)
9. [Frontend UI/UX Architecture & Judge God Mode Sandbox](#9-frontend-uiux-architecture--judge-god-mode-sandbox)
10. [Test Matrix & Performance Benchmarks](#10-test-matrix--performance-benchmarks)
11. [Production Deployment & Quick Start Guide](#11-production-deployment--quick-start-guide)

---

## 1. Executive Summary & Core Thesis

### The $3 Trillion Problem in Trade Finance
Small and medium-sized enterprises (SMEs) worldwide face a chronic liquidity gap exceeding **$3 Trillion** in unpaid 30–90 day accounts receivable. While invoice factoring can provide immediate working capital, traditional blockchain implementations suffer from two fatal flaws:
1. **Zero Data Privacy**: Placing invoice amounts, buyer names, payment terms, and corporate identities on a public blockchain exposes trade secrets and violates corporate compliance.
2. **Centralized Oracle & Multisig Vulnerability**: Traditional cross-chain lending relies on centralized oracle networks or federated multisigs (e.g., LayerZero, Wormhole) that introduce counterparty risk, custodial bridge hacks, and high gas overhead.

### The VaultBridge Solution
VaultBridge solves both challenges by leveraging Creditcoin’s native **Attestcoin Protocol** (`@gluwa/usc-sdk`) and **Universal Smart Contract (USC) Precompile `0x0FD2`**:
- **Zero Plaintext On-Chain**: Invoices are encrypted client-side via **AES-256-GCM**. Only a 32-byte SHA-256 commitment and decentralized storage pointer live on-chain.
- **Selective Privacy & Revocation**: Borrowers delegate viewing keys to designated roles (Auditors, Institutional Lenders, Tax Authorities) via **ECIES** key wrapping with instant 1-click on-chain revocation (`AccessRegistry.sol`).
- **Mathematical Zero-Oracle Settlement**: Creditcoin's native consensus verifies Ethereum Sepolia block headers and transaction inclusion/absence proofs directly via Precompile `0x0FD2`.
- **5% Liquidator Bounty Game Theory**: Autonomous watchtower keepers are incentivized with a **5.0% bounty** (`LIQUIDATOR_BOUNTY_BPS = 500`) to prove defaults trustlessly via absence proofs.
- **Shared Primitive for Gaming**: Reuses the exact same absence-proof engine for **StreakChain**, a verifiable habit-tracking module awarding non-transferable Soulbound ERC-721 badges.

---

## 2. Dual-Product Architecture: One Engine, Two Products

```
                           ┌────────────────────────────────────────────────────────┐
                           │         Shared Attestcoin Cryptographic Engine         │
                           │   @gluwa/usc-sdk • Precompile 0x0FD2 • Absence Prover   │
                           └───────────────────────────┬────────────────────────────┘
                                                       │
                        ┌──────────────────────────────┴──────────────────────────────┐
                        ▼                                                             ▼
 ┌──────────────────────────────────────────────┐              ┌──────────────────────────────────────────────┐
 │  1. PRIVATE ACCOUNTS RECEIVABLE FINANCING    │              │       2. STREAKCHAIN HABIT ATTESTATION       │
 │                (RWA/DeFi Track)              │              │                 (Gaming Track)               │
 ├──────────────────────────────────────────────┤              ├──────────────────────────────────────────────┤
 │ • 51M USDC on-chain pool & multi-tier faucet │              │ • Daily habit check-ins on Sepolia           │
 │ • Client-side AES-256-GCM confidential data  │              │ • Precompile 0x0FD2 inclusion attestation    │
 │ • Selective Access & Instant Revocation      │              │ • Absence proof resets missed streaks to 0   │
 │ • 5% Liquidator Bounty (LIQUIDATOR_BOUNTY)   │              │ • Soulbound Non-Transferable ERC-721 badges  │
 │ • Dynamic Buyer Risk Tiers (80/70/50% LTV)   │              │ • Autonomous Slasher Watchtower Daemon       │
 │ • Continuous linear interest accrual (APR)   │              │ • Hall of Fame leaderboard & public proofs   │
 │ • Gasless EIP-712 permit meta-transactions   │              │ • Boundary grace window for timezone drifts  │
 │ • High-Throughput Batching (86.5% gas saved) │              │ • Tactile sound chimes & live SSE stream     │
 └──────────────────────────────────────────────┘              └──────────────────────────────────────────────┘
```

---

## 3. Cryptographic Deep-Dive & Privacy Architecture

### 3.1 Positive Inclusion Proofs ("Prove It Happened")
- **RWA Financing**: When a debtor settles an invoice on Ethereum Sepolia, `InvoiceRegistrar.payInvoice()` emits `InvoicePaid`. The Attestcoin relayer commits the Sepolia block header to Creditcoin. `ProofBuilder` generates a Merkle Patricia Trie inclusion proof proving the payment transaction occurred. Calling `VaultLending.releaseOnPayment()` with this proof immediately unlocks collateral escrow on Creditcoin.
- **StreakChain**: When a user checks in via `StreakRegistry.checkIn()`, the Merkle proof is passed to `StreakVerifier.registerCheckIn()`, which increments the consecutive streak count and triggers Soulbound badge minting.

### 3.2 Negative Absence Proofs ("Prove It DID NOT Happen")
- **RWA Default Liquidation**: If an invoice reaches its maturity due date $H_{due}$ without payment, `generateAbsenceProof.ts` verifies that **zero** `InvoicePaid` events exist across all consecutive block headers $[H_{issue}, H_{due}]$. `VaultLending.liquidateOnDefault()` triggers collateral liquidation and awards a **5% liquidator bounty** to the caller.
- **StreakChain Missed-Day Slasher**: If a user misses a 24-hour check-in window $[B_{start}, B_{end}]$, `generateStreakAbsenceProof.ts` proves that zero `CheckedIn` events occurred. Anyone can call `StreakVerifier.breakStreakIfMissed()`, resetting the active streak to 0 while preserving their all-time longest record.

### 3.3 Confidentiality & Key Delegation Workflow
1. **Client-Side Encryption (`crypto/src/encryptPayload.ts`)**: Browser generates a random 256-bit symmetric key $K$ and encrypts invoice line items using **AES-256-GCM**.
2. **Deterministic Hash Commitment**: Computes `commitment = SHA256(ciphertext)`.
3. **ECIES Asymmetric Key Wrapping**: Key $K$ is encrypted using the recipient's secp256k1 public key via Elliptic Curve Integrated Encryption Scheme (ECIES).
4. **On-Chain Access Registry (`AccessRegistry.sol`)**: Stores `(dataId, grantee) => wrappedKey`.
5. **Instant Revocation**: `revokeAccess(dataId, grantee)` removes the stored wrapped key, instantly terminating access.
6. **Gasless EIP-712 Meta-Transactions**: Users can delegate access or borrow funds gaslessly by signing EIP-712 typed data payloads (`grantAccessWithPermit` and `borrowWithPermit`).

---

## 4. Smart Contract Architecture & Verified Deployments

### Ethereum Sepolia (Source Chain — Chain ID: `11155111`)

| Contract | Address | Explorer Link | Purpose |
|---|---|---|---|
| `InvoiceRegistrar.sol` | `0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021` | [Etherscan](https://sepolia.etherscan.io/address/0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021) | Invoice issuance, escrow, and debtor payment settlement |
| `StreakRegistry.sol` | `0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce` | [Etherscan](https://sepolia.etherscan.io/address/0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce) | Daily habit check-in registry with duplicate protection |

### Creditcoin USC Testnet (Execution Chain — Chain ID: `102031`)

| Contract / Primitive | Address | Explorer Link | Purpose |
|---|---|---|---|
| `VaultLending.sol` | `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xE8686e4D2856Da637F2c17c71d818911Ec541dE5) | Privacy credit facility (**51M USDC Pool**, 5% Liquidator Bounty, Dynamic APR) |
| `AccessRegistry.sol` | `0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe) | Address-scoped ECIES key delegation, instant revocation & EIP-712 permits |
| `StreakVerifier.sol` | `0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A) | Cross-chain habit attestation, milestone dispatcher & autonomous slasher |
| `StreakBadge.sol` | `0xfa41181596515986C87A969F51daD5af597eB3b7` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xfa41181596515986C87A969F51daD5af597eB3b7) | Soulbound Non-Transferable ERC-721 Badges (7/30/100 Days) |
| `MockERC20.sol` | `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714) | Working Capital Stablecoins (MockUSDC/EURC/USDT with Multi-Tier Faucet) |
| `MockPriceOracle.sol` | `0x2279B7A0a67E1418866B777B764380E68Fa0b3ee` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0x2279B7A0a67E1418866B777B764380E68Fa0b3ee) | Staleness & Heartbeat Validated Price Oracle |
| `IUSCVerifier Precompile` | `0x0000000000000000000000000000000000000FD2` | Native Precompile | Native Merkle Patricia Trie & Block Header Continuity Verifier |
| `ChainInfo Precompile` | `0x0000000000000000000000000000000000000FD3` | Native Precompile | Cross-Chain Block Header & Height Oracle |

### Live Verified On-Chain Transactions (Ethereum Sepolia)
- **Invoice Issuance (`INV-SEP-001` on Block #11691999):** [`0xe1f5cb5a7ca82a8af42198fa747400d8f9e872b41d7d6a0883807a26de2d8a5b`](https://sepolia.etherscan.io/tx/0xe1f5cb5a7ca82a8af42198fa747400d8f9e872b41d7d6a0883807a26de2d8a5b)
- **Streak Creation (`STRK-SEP-001`):** [`0x7d7ce5a932be78f6ac9fedbf1ec4f9d3a9ab648fb6613a23ec159ec282d3fac2`](https://sepolia.etherscan.io/tx/0x7d7ce5a932be78f6ac9fedbf1ec4f9d3a9ab648fb6613a23ec159ec282d3fac2)
- **Streak Daily Check-In:** [`0x1ff751198acc721a2624b3030e4495560e2dbbacaf5618a4ee9a3033201b0c37`](https://sepolia.etherscan.io/tx/0x1ff751198acc721a2624b3030e4495560e2dbbacaf5618a4ee9a3033201b0c37)

---

## 5. Complete Repository File Structure

```
VaultBridge/
├── contracts/                                # Smart Contracts on Hardhat & Solidity 0.8.20
│   ├── src/
│   │   ├── creditcoin/
│   │   │   ├── VaultLending.sol              # 5% Bounty, Dynamic APR, Continuous Interest, EIP-712
│   │   │   ├── AccessRegistry.sol            # ECIES Key Delegation & Gasless EIP-712 Permit
│   │   │   ├── StreakVerifier.sol            # Habit Attestation & Autonomous Slasher
│   │   │   ├── StreakBadge.sol               # Soulbound Non-Transferable ERC-721 Badges
│   │   │   ├── MockERC20.sol                 # Multi-Tier Faucet Stablecoin (51M Pool)
│   │   │   └── MockPriceOracle.sol           # Chainlink-Compatible Price Oracle
│   │   └── source-chain/
│   │       ├── InvoiceRegistrar.sol          # Sepolia Invoice Tokenization & Escrow
│   │       └── StreakRegistry.sol            # Sepolia Daily Habit Check-In Registry
│   └── test/
│       ├── VaultLendingEconomics.test.js     # Comprehensive Hardhat Suite (51/51 Passing)
│       └── ...
├── crypto/                                   # Client-Side Cryptographic Privacy SDK
│   ├── src/
│   │   ├── encryptPayload.ts                 # AES-256-GCM Encryption & SHA-256 Commitment
│   │   ├── ecies.ts                          # secp256k1 ECIES Asymmetric Key Wrapping
│   │   └── index.ts
│   └── test/
│       └── crypto.test.ts                    # Privacy Layer Unit Suite (3/3 Passing)
├── proof-pipeline/                           # Off-Chain Proof Watchtower & SSE Telemetry Server
│   ├── src/
│   │   ├── index.ts                          # Express REST Server & SSE Stream Engine
│   │   ├── keeper.ts                         # Dual-Mode Watchtower & Autonomous Slasher
│   │   ├── telemetry.ts                      # 50-Event Circular Buffer & Event Broadcaster
│   │   ├── merkleInspector.ts                # Cryptographic Proof Inspector & Gas Calculator
│   │   ├── generatePositiveProof.ts          # Merkle Patricia Trie Inclusion Generator
│   │   ├── generateAbsenceProof.ts           # RWA Absence-of-Payment Prover
│   │   ├── generateStreakAbsenceProof.ts     # StreakChain Missed-Day Absence Prover
│   │   ├── generateBatchProof.ts             # 20-Tx High-Throughput Batch Prover
│   │   └── submitProof.ts                    # On-Chain Precompile Dispatcher
│   └── test/
│       ├── watchtower.e2e.test.ts            # Watchtower, SSE & Inspector Suite (8/8 Passing)
│       └── streak.isolation.test.ts          # Absence Prover Isolation Suite (2/2 Passing)
├── frontend/                                 # Next.js 14 Web App
│   ├── app/                                  # App Router (13/13 Routes & APIs)
│   │   ├── page.tsx                          # Landing Page & Global Stats
│   │   ├── dashboard/page.tsx                # Portfolio & Working Capital Overview
│   │   ├── invoices/page.tsx                 # Accounts Receivable Directory & Tokenizer
│   │   ├── invoices/[id]/page.tsx            # Invoice Detail, Audit Cert & Merkle Inspector
│   │   ├── invoices/[id]/share/page.tsx      # Privacy Hub & Key Delegation
│   │   ├── loans/page.tsx                    # Liquidity Pool & Credit Facility Manager
│   │   ├── streaks/page.tsx                  # StreakChain Habits & Hall of Fame
│   │   ├── streaks/[id]/page.tsx             # Public Verifiable Proof Certificate
│   │   ├── how-it-works/page.tsx             # Interactive Architecture Guide
│   │   └── faq/page.tsx                      # Protocol FAQ & Security Disclosures
│   ├── components/
│   │   ├── JudgeSandboxBar.tsx               # 1-Click Interactive "Judge God Mode" Sandbox
│   │   ├── JudgeDemoModal.tsx                # 10s Speedrun Walkthrough Modal
│   │   ├── ProofVisualizerModal.tsx          # Interactive Merkle Patricia Trie Inspector
│   │   ├── AuditCertificateModal.tsx         # Institutional KPMG/Deloitte Audit Cert Exporter
│   │   ├── LiveAttestationFeed.tsx           # Real-Time SSE Stream with Audio Feedback
│   │   ├── layout/AppShell.tsx               # Responsive Multi-Device Layout Wrapper
│   │   └── ...
│   └── lib/
│       ├── soundFx.ts                        # Web Audio API Sound Synthesizer
│       ├── contracts.ts                      # Multi-Chain ABIs & Network Helpers
│       └── privacy.ts                        # Browser AES/ECIES Privacy Pipeline
└── docs/                                     # Technical Documentation & Guides
```

---

## 6. Lending Economics, Risk Tiers, 5% Bounty & Dynamic APR

### 6.1 Dynamic Buyer Risk Tiers & Continuous Interest Accrual
VaultBridge employs continuous linear second-by-second interest accrual settled dynamically upon repayment:

$$\text{Accrued Interest} = \frac{\text{Principal} \times \text{APR} \times (t_{\text{current}} - t_{\text{start}})}{365 \times 86400 \times 10000}$$

| Buyer Risk Tier | Minimum Credit Score | Advance Rate (LTV) | Borrower APR | Default Penalty |
|---|---|---|---|---|
| **Tier A (Prime)** | $\ge 750$ (BMW, Siemens) | **80.0%** | **4.00%** | 5.0% |
| **Tier B (Standard)** | $650 - 749$ (Standard Corp) | **70.0%** | **4.50%** | 7.5% |
| **Tier C (Subprime)** | $< 650$ (Emerging SME) | **50.0%** | **6.50%** | 12.0% |

### 6.2 5% Liquidator Keeper Bounty Engine
To guarantee decentralized insolvency resolution, `VaultLending.sol` pays `LIQUIDATOR_BOUNTY_BPS = 500` (5.0%) directly to any third-party watchtower or keeper who submits a verified absence-of-payment proof past the maturity due date:

$$\text{Bounty Amount} = \frac{\text{Recovered Collateral} \times 500}{10000} = 5.0\%$$

---

## 7. StreakChain: Habit Attestation & Soulbound Badges

StreakChain reuses the exact same Attestcoin absence-proving engine for verifiable gamified habits:
1. **Daily Check-Ins (`StreakRegistry.sol`)**: Check-ins on Sepolia prevent duplicate entries per 24-hour day index.
2. **Attestation & Milestone Badges (`StreakVerifier.sol` & `StreakBadge.sol`)**: Precompile `0x0FD2` inclusion proofs increment streak counts and mint non-transferable Soulbound NFTs at 7, 30, and 100 days.
3. **Autonomous Slasher**: Missed 24-hour intervals trigger absence proofs that permissionlessly reset active streaks to 0 while permanently preserving the all-time longest record.

---

## 8. Autonomous Watchtower Daemon, SSE Stream & Merkle Inspector API

- **Dual-Mode Autonomous Watchtower (`proof-pipeline/src/keeper.ts`)**: Continuously monitors overdue loans and missed streak intervals with automatic RPC reconnection and Discord/Telegram webhook alerts.
- **Server-Sent Events (SSE) Stream (`GET /api/stream/attestations`)**: Broadcasts real-time events (`BlockHeaderPolled`, `InclusionProofGenerated`, `AbsenceProofGenerated`, `StreakSlashed`, `LiquidationExecuted`) to connected frontends.
- **Circular Buffer History (`GET /api/attestations/history`)**: Returns the last 50 attestation operations with latency (ms) and gas benchmarks.
- **Cryptographic Proof Inspector API (`POST /api/proof/inspect`)**: Disassembles raw proofs into tree layers (Root $\to$ Extension $\to$ Branch $\to$ Leaf) with native Precompile `0x0FD2` gas benchmarks (**45.2% gas saved** vs EVM multisig bridges).

---

## 9. Frontend UI/UX Architecture & Judge God Mode Sandbox

- **1-Click "Judge God Mode" Floating Toolbar (`JudgeSandboxBar.tsx`)**: Mounted globally in `AppShell` with instant 1-click execution for Scenario 1 (Happy Path RWA), Scenario 2 (Absence Proof Default + 5% Bounty), Scenario 3 (Streak Milestone & Slasher), and 10s Speedrun Modal.
- **Interactive Merkle Patricia Trie Visualizer Modal (`ProofVisualizerModal.tsx`)**: Interactive tree diagram breaking down Sepolia block headers, intermediate branch nibbles, and RLP transaction payloads with gas benchmark comparisons.
- **Institutional Compliance & Proof Audit Certificate (`AuditCertificateModal.tsx`)**: Bank-grade compliance certificate on `/invoices/[id]` with SHA-256 commitment hash, IPFS pointer, ECIES delegation log, on-chain Creditcoin attestation tx hash, and 1-click Print / Save PDF.
- **Tactile Web Audio API Sound Effects (`soundFx.ts`)**: Lightweight sound synthesizer providing tactile clicks, ascending verification chimes, soulbound NFT fanfare arpeggios, and slasher alerts.
- **Live SSE Integration (`LiveAttestationFeed.tsx`)**: Real-time event feed directly connected to backend Watchtower SSE stream.

---

## 10. Test Matrix & Performance Benchmarks

| Component / Layer | Test Suite | Result |
|---|---|---|
| **Smart Contracts (`contracts/`)** | Hardhat Unit Suite + `VaultLendingEconomics.test.js` | ✅ **51 / 51 Passed (100%)** |
| **Privacy Cryptography (`crypto/`)** | `crypto.test.ts` (AES-256-GCM, ECIES secp256k1) | ✅ **3 / 3 Passed (100%)** |
| **Proof Watchtower (`proof-pipeline/`)** | `watchtower.e2e.test.ts`, `streak.isolation.test.ts` | ✅ **10 / 10 Passed (100%)** |
| **Frontend Web App (`frontend/`)** | `next build` static & dynamic route compilation | ✅ **13 / 13 Routes Compiled** |

---

## 11. Production Deployment & Quick Start Guide

### 1. Installation
```bash
git clone https://github.com/Bobo2005/VaultBridge.git
cd VaultBridge
npm install
cd contracts && npm install && cd ..
cd proof-pipeline && npm install && cd ..
cd crypto && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Run Test Suites
```bash
cd contracts && npx hardhat test && cd ..
cd crypto && npm test && cd ..
cd proof-pipeline && npx jest test/watchtower.e2e.test.ts && cd ..
```

### 3. Launch Services
```bash
# Terminal 1: Proof Pipeline & SSE Engine
cd proof-pipeline && npm run dev

# Terminal 2: Autonomous Watchtower Daemon
cd proof-pipeline && npm run keeper

# Terminal 3: Frontend Web Application
cd frontend && npm run dev
```

---

*Authored for the BUIDL CTC 2026 Fall Hackathon. Built on Creditcoin.*
