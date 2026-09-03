# 🧪 VaultBridge Testing & Verification Guide

This document provides a comprehensive guide for testing the VaultBridge protocol across Smart Contracts, Privacy Layer, Proof Watchtower Pipeline (Backend), and Frontend Web App.

---

## 📊 Quick Test Matrix

| Component | Command | Target Network | Expected Result |
|---|---|---|---|
| **Smart Contracts & Economics** | `cd contracts && npx hardhat test` | Local Hardhat (Solc 0.8.20) | **51/51 passing unit & economic tests** |
| **Privacy Crypto Utils** | `cd crypto && npm test` | Isolated Cryptographic Engine | **3/3 passing roundtrip tests** |
| **Proof Watchtower & SSE** | `cd proof-pipeline && npx jest test/watchtower.e2e.test.ts` | Isolated Prover & Express Server | **8/8 passing watchtower tests** |
| **Streak Isolation Proofs** | `cd proof-pipeline && npx jest test/streak.isolation.test.ts` | Creditcoin + Sepolia Tests | **2/2 passing absence tests** |
| **Autonomous Watchtower Daemon** | `cd proof-pipeline && npm run keeper` | Background Daemon Sidecar | Dual-mode RWA liquidator & streak slasher |
| **Proof REST API & SSE Server** | `cd proof-pipeline && npm run dev` | Node.js / Express Server | Live SSE on `/api/stream/attestations` |
| **Frontend Production Build** | `cd frontend && npm run build` | Next.js 14 App Router | **13/13 routes compiled cleanly (Code 0)** |

---

## 1. Smart Contract Testing (51/51 Passing)

```bash
cd contracts
npx hardhat test
```

### Test Coverage Highlights:
- **`VaultLendingEconomics.test.js` (10/10)**:
  - **5% Liquidator Keeper Bounty**: Verifies `LIQUIDATOR_BOUNTY_BPS = 500` (5.0%) disbursed to liquidator upon absence proof verification.
  - **Dynamic APR & Interest Accrual**: Verifies linear second-by-second accrued interest calculations across Tier A (4.0%), Tier B (4.5%), and Tier C (6.5%).
  - **Dynamic Pool Utilization & Lender APY**: Validates pool utilization and lender yield.
  - **Partial Repayments**: Verifies `repayPartial()` and `releaseOnPartialPayment()`.
  - **EIP-712 Gasless Meta-Transactions**: Tests `borrowWithPermit` and `grantAccessWithPermit`.
- **`AccessRegistry Contract Tests` (7/7)**: Validates granular ECIES key delegation for Verified Auditors, Institutional Lenders, and Tax Officers, plus instant 1-click on-chain revocation.
- **`InvoiceRegistrar Tests` (6/6)**: Validates Sepolia invoice tokenization, event emissions, duplicate prevention, and debtor authorization.
- **`PrivacyAccessControl Matrix Tests` (4/4)**: Enforces role-based permission verification.
- **`StreakBadge Soulbound NFT Tests` (4/4)**: Proves badges are non-transferable via OpenZeppelin's `_update()` hook override.
- **`StreakRegistry Tests` (5/5)**: Enforces 1-checkin-per-day cadence on Ethereum Sepolia.
- **`StreakVerifier & StreakBadge Tests` (7/7)**: Validates Precompile `0x0FD2` inclusion proofs, milestone badge triggers (7, 30, 100 days), deduplication, and timezone boundary grace windows (23:59:45 UTC).
- **`VaultLending Multi-Asset & Risk Tiers Tests` (8/8)**: Validates Tier A (80% LTV), Tier B (70% LTV), Tier C (50% LTV), flash-loan resistant oracle checks, repayment collateral release, and default liquidation.

---

## 2. Privacy Layer Crypto Roundtrip Tests (3/3 Passing)

```bash
cd crypto
npm test
```

Verifies:
- Complete client-side **AES-256-GCM** encryption and decryption roundtrip.
- Asymmetric **ECIES** key wrapping using grantee secp256k1 public keys and unwrapping via private keys.
- Deterministic SHA-256 commitment generation: `commitment = sha256(ciphertext)`.
- Anti-tampering ciphertext verification.

---

## 3. Proof Watchtower Pipeline Testing (10/10 Passing)

```bash
cd proof-pipeline
npx jest test/watchtower.e2e.test.ts test/streak.isolation.test.ts
```

Verifies:
- **`watchtower.e2e.test.ts` (8/8)**:
  - Telemetry event broadcasting and 50-item circular buffer retention.
  - Merkle Patricia Trie depth layer disassembly (Root, Extension, Branch, Leaf).
  - Precompile `0x0FD2` gas benchmarks (**45.2% gas savings**).
  - Express endpoints (`/health`, `/api/status`, `/api/attestations/history`, `POST /api/proof/inspect`).
  - Watchtower daemon lifecycle, heartbeat scans, and overdue loan detection.
- **`streak.isolation.test.ts` (2/2)**: Absence proof generation over 24-hour block ranges.

---

## 4. Interactive End-to-End UI Testing Guide

### A. 1-Click Judge "God Mode" Sandbox Toolbar
1. On any page in the web app, find the floating **"⚡ Judge Sandbox God Mode"** toolbar at the bottom.
2. Click **"1. RWA Happy Path"** to execute instant client-side encryption $\to$ on-chain registration $\to$ 80% Tier A draw $\to$ debtor payment $\to$ Precompile `0x0FD2` release.
3. Click **"2. Default & Bounty"** to trigger absence proof generation past due date $\to$ 5% keeper bounty claim.
4. Click **"3. Streak & Slasher"** to attest 7-day habit check-ins $\to$ mint Soulbound NFT badge $\to$ simulate missed day slash.
5. Click **"10s Speedrun"** to open the complete visual walkthrough.

### B. Merkle Patricia Trie Proof Visualizer
1. Click **"Merkle Inspector"** in the Judge Sandbox toolbar (or **"Inspect Merkle Trie"** on any invoice detail page).
2. Explore the interactive 4-layer depth graph:
   - *Layer 0 (Root Node)*: Block Header Transactions Root.
   - *Layer 1 (Extension Node)*: Compact path nibbles.
   - *Layer 2 (Branch Node)*: Intermediate 16-child routing slot.
   - *Layer 3 (Leaf Node)*: RLP-encoded settlement transaction.
3. View the native Precompile `0x0FD2` gas benchmark comparison (**28,500 gas vs 52,000 gas**).

### C. Institutional Compliance & Proof Audit Certificate
1. Navigate to **[Invoices](http://localhost:3000/invoices)** $\to$ Click any invoice (e.g. `INV-2026-001`).
2. Click **"Audit Certificate"** in the top breadcrumb bar.
3. Inspect the official verification seal, deterministic SHA-256 commitment hash, IPFS pointer, and ECIES viewing key delegation log.
4. Click **"Print / Save PDF"** to export a clean, bank-grade compliance certificate.

---

## 5. Deployed & Verified Contracts

| Contract / Precompile | Network | Address |
|---|---|---|
| `InvoiceRegistrar.sol` | Ethereum Sepolia (`11155111`) | `0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021` |
| `StreakRegistry.sol` | Ethereum Sepolia (`11155111`) | `0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce` |
| `VaultLending.sol` | Creditcoin Testnet (`102031`) | `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` |
| `AccessRegistry.sol` | Creditcoin Testnet (`102031`) | `0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe` |
| `StreakVerifier.sol` | Creditcoin Testnet (`102031`) | `0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` |
| `StreakBadge.sol` | Creditcoin Testnet (`102031`) | `0xfa41181596515986C87A969F51daD5af597eB3b7` |
| `MockERC20.sol` | Creditcoin Testnet (`102031`) | `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` |
| `IUSCVerifier Precompile` | Creditcoin Testnet (`102031`) | `0x0000000000000000000000000000000000000FD2` |
| `ChainInfo Precompile` | Creditcoin Testnet (`102031`) | `0x0000000000000000000000000000000000000FD3` |