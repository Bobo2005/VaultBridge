# 🏛️ VaultBridge Platform (V1 + V2 + V3)

> **Universal Trustless Cross-Chain Verification & Working Capital Credit Facilities on Creditcoin**  
> Built for the **BUIDL CTC 2026 Fall Hackathon (RWA/DeFi Track & Gaming Track)**  
> Powered by the **Attestcoin Protocol** (`@gluwa/usc-sdk`) and native **Precompile `0x0FD2`**.

---

## 🌐 Live Deployments & Network Details

### Ethereum Sepolia (Source Chain — Chain ID: `11155111`)

| Contract | Address | Purpose | Status |
|---|---|---|---|
| `InvoiceRegistrar.sol` | [`0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021`](https://sepolia.etherscan.io/address/0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021) | Accounts Receivable Tokenization & Escrow | ✅ Verified Live |
| `StreakRegistry.sol` | [`0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce`](https://sepolia.etherscan.io/address/0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce) | Habit Streak Daily Check-In Registry | ✅ Verified Live |

### Creditcoin USC Testnet (Execution Chain — Chain ID: `102031`)

| Contract / Precompile | Address | Purpose | Status |
|---|---|---|---|
| `VaultLending.sol` | [`0xE8686e4D2856Da637F2c17c71d818911Ec541dE5`](https://creditcoin-testnet.blockscout.com/address/0xE8686e4D2856Da637F2c17c71d818911Ec541dE5) | Privacy Working Capital Facility (**51M USDC Pool**, 5% Liquidator Bounty, Dynamic APR) | ✅ Live On-Chain |
| `AccessRegistry.sol` | [`0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe`](https://creditcoin-testnet.blockscout.com/address/0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe) | Selective Access, ECIES Key Delegation & Gasless EIP-712 Permits | ✅ Live On-Chain |
| `StreakVerifier.sol` | [`0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A`](https://creditcoin-testnet.blockscout.com/address/0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A) | Cross-Chain Habit Attestation & Autonomous Slasher | ✅ Live On-Chain |
| `StreakBadge.sol` | [`0xfa41181596515986C87A969F51daD5af597eB3b7`](https://creditcoin-testnet.blockscout.com/address/0xfa41181596515986C87A969F51daD5af597eB3b7) | Soulbound Non-Transferable ERC-721 Badges (7/30/100 Days) | ✅ Live On-Chain |
| `MockERC20.sol` | [`0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714`](https://creditcoin-testnet.blockscout.com/address/0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714) | Working Capital Stablecoins (MockUSDC/EURC/USDT with Multi-Tier Faucet) | ✅ Live On-Chain |
| `MockPriceOracle.sol` | `0x2279B7A0a67E1418866B777B764380E68Fa0b3ee` | Staleness & Heartbeat Validated Price Oracle | ✅ Configured |
| `IUSCVerifier Precompile` | `0x0000000000000000000000000000000000000FD2` | Instant Verification Engine (Merkle & Header Continuity) | ⚡ Native Precompile |
| `ChainInfo Precompile` | `0x0000000000000000000000000000000000000FD3` | Cross-Chain Block Header & Height Oracle | ⚡ Native Precompile |

### Application Services & APIs

| Service | Environment | URL / Port | Status |
|---|---|---|---|
| **Frontend Web App** | Next.js 14 App Router + TailwindCSS | `http://localhost:3000` | 🚀 Live (13/13 routes) |
| **Proof API & SSE Engine** | Express REST Server + SSE Stream | `http://localhost:4000` | 🚀 Live (SSE + Merkle API) |
| **Autonomous Watchtower** | Dual-Mode Liquidator & Slasher Daemon | `proof-pipeline/src/keeper.ts` | 🤖 Active & Connected |

---

## ⚡ The Core Technical Story: One Attestation Engine, Two Products

VaultBridge demonstrates that Creditcoin's **Attestcoin Protocol** (`@gluwa/usc-sdk`) is a universal, mathematical cross-chain verification primitive. Both platform modules share the **exact same cryptographic proof pipeline** and **native Precompile `0x0FD2`**:

1. **Positive Inclusion Proofs ("Prove it happened")**:
   - *Private Accounts Receivable Financing*: Proves a buyer settlement payment occurred on Sepolia $\to$ automatically releases escrow collateral on Creditcoin.
   - *StreakChain*: Proves a daily habit check-in occurred on Sepolia $\to$ increments active streak on Creditcoin and mints Soulbound badges.
2. **Negative Absence Proofs ("Prove it DID NOT happen")**:
   - *Private Accounts Receivable Financing*: Proves zero payments occurred before the maturity due date $\to$ executes default liquidation and rewards liquidator with a **5% bounty**.
   - *StreakChain*: Proves zero check-ins occurred during a 24h block range $\to$ trustlessly slashes the missed streak to 0.

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

## 🚀 Key Upgrades Across the 3-Phase Roadmap

### 💎 Phase 1: Smart Contract Game Theory, Economics & Cryptographic Rigor
- **5% Liquidator Bounty Engine**: `VaultLending.sol` pays `LIQUIDATOR_BOUNTY_BPS = 500` (5.0%) directly to watchtower keepers upon verified absence-of-payment default liquidations.
- **Dynamic APR & Continuous Interest Accrual**:
  - Tier A (4.0%), Tier B (4.5%), Tier C (6.5%) risk APRs.
  - Continuous linear second-by-second accrued interest calculation: $\text{Interest} = \frac{\text{Principal} \times \text{APR} \times \Delta t}{365 \times 86400 \times 10000}$.
  - Dynamic pool utilization and lender APY calculation (`getPoolUtilizationAndApy`).
- **Partial Repayments & Milestone Invoicing**: Added `repayPartial(loanId, amount)` and `releaseOnPartialPayment(...)`.
- **Gasless EIP-712 Meta-Transactions**: Implemented OpenZeppelin `EIP712` for `borrowWithPermit` and `grantAccessWithPermit`.
- **Pluggable Verifier Interface**: Upgraded `VaultLending.sol` to support customizable verifiers while defaulting to native Precompile `0x0FD2`.

### 🤖 Phase 2: Autonomous Watchtower, SSE Telemetry & Proof Visualizer API
- **Dual-Mode Watchtower Daemon (`keeper.ts`)**:
  - **RWA Liquidator**: Monitors overdue borrowed invoices past `dueDateBlock` on Sepolia. Automatically proves absence of payment, executes `liquidateOnDefault`, and claims the 5% bounty.
  - **Streak Slasher**: Scans active streaks in `StreakVerifier.sol`. Detects missed 24h intervals, generates `generateStreakAbsenceProof`, and slashes broken streaks.
- **Server-Sent Events (SSE) Stream**: `GET /api/stream/attestations` broadcasts live real-time events (`BlockHeaderPolled`, `InclusionProofGenerated`, `AbsenceProofGenerated`, `StreakSlashed`, `LiquidationExecuted`).
- **Circular Buffer & Telemetry History**: `GET /api/attestations/history` maintains the last 50 attestation operations with latency (ms) and gas benchmarks.
- **Cryptographic Merkle Patricia Trie Inspector API**: `POST /api/proof/inspect` disassembles raw proofs into tree layers (Root $\to$ Extension $\to$ Branch $\to$ Leaf) with native Precompile `0x0FD2` gas benchmarks (**45.2% gas saved** vs EVM bridges).

### ⚡ Phase 3: Frontend Judge "God Mode", Interactive Merkle Visualizer & Polish
- **1-Click "Judge God Mode" Floating Toolbar (`JudgeSandboxBar.tsx`)**:
  - Sticky, unobtrusive glassmorphism toolbar mounted globally in `AppShell`.
  - **Scenario 1 (Happy Path RWA)**: Encrypt $\to$ Register $\to$ Draw 80% Tier A $\to$ Debtor Settles $\to$ Escrow Unlocked.
  - **Scenario 2 (Absence Proof Default & Bounty)**: Fast-forward block $\to$ Absence proof generated $\to$ Watchtower claims 5% bounty $\to$ Collateral liquidated.
  - **Scenario 3 (Streak Milestone & Slasher)**: 7-day daily check-in verification $\to$ Soulbound NFT Badge minted $\to$ Missed day slashed.
  - **10s Speedrun Modal**: Complete 4-step visual walkthrough (`JudgeDemoModal.tsx`).
- **Interactive Merkle Patricia Trie Proof Visualizer (`ProofVisualizerModal.tsx`)**:
  - Visual depth tree diagram breaking down Sepolia block headers, intermediate branch nibbles, and RLP transaction payloads.
  - Gas benchmark display: **28,500 gas (0x0FD2)** vs **52,000 gas (Multisig bridge)**.
- **Institutional Proof & Compliance Audit Certificate (`AuditCertificateModal.tsx`)**:
  - Bank-grade audit certificate on `/invoices/[id]` containing SHA-256 commitment hash, IPFS storage pointer, ECIES key delegation log, on-chain Creditcoin attestation tx hash, and **1-click Print / Save PDF** action.
- **Tactile Web Audio API Sound Effects (`soundFx.ts`)**:
  - Zero-dependency audio feedback for tactile button clicks, ascending verification chimes, soulbound NFT fanfare arpeggios, and slasher alerts.
- **Live SSE Integration (`LiveAttestationFeed.tsx`)**:
  - Real-time event stream directly connected to backend Watchtower SSE stream.

---

## 🔐 Cryptographic Deep-Dive & Privacy Architecture

### 1. Confidential Client-Side Payload Protection (`crypto/src/encryptPayload.ts`)
- Invoices are encrypted in the browser via **AES-256-GCM** using a 256-bit symmetric key.
- Encrypted ciphertext blob is pinned to decentralized storage.
- Computes deterministic SHA-256 commitment hash: `commitment = sha256(ciphertext)`.

### 2. Zero Plaintext Leakage On-Chain (`VaultLending.sol`)
- `VaultLending.registerInvoice()` stores only the 32-byte commitment and encrypted storage pointer.
- Public block explorers reveal **zero confidential trade terms, counterparty identities, or invoice line items**.

### 3. Selective Access & Instant Revocation (`AccessRegistry.sol`)
- Borrowers selectively delegate view permissions to authorized stakeholders:
  - **`Verified Auditor (KPMG/Deloitte)`**
  - **`Institutional Lender`**
  - **`Tax Compliance Officer`**
- The AES symmetric key is wrapped using the grantee's secp256k1 public key via **ECIES** and recorded on `AccessRegistry.sol`.
- **Instant Revoke Access**: 1-click on-chain revocation immediately removes all decryption permissions.

---

## 🧪 Verification & Test Results

| Component / Layer | Test Suite | Result |
|---|---|---|
| **Smart Contracts (`contracts/`)** | Hardhat Unit Suite + `VaultLendingEconomics.test.js` | ✅ **51 / 51 Passed (100%)** |
| **Privacy Cryptography (`crypto/`)** | `crypto.test.ts` (AES-256-GCM, ECIES secp256k1) | ✅ **3 / 3 Passed (100%)** |
| **Proof Watchtower (`proof-pipeline/`)** | `watchtower.e2e.test.ts`, `streak.isolation.test.ts` | ✅ **10 / 10 Passed (100%)** |
| **Frontend Web App (`frontend/`)** | `npm run build` static & dynamic route compilation | ✅ **13 / 13 Routes Compiled** |

---

## 🛠️ Quick Start & Local Execution

### Prerequisites
- Node.js `v18.0.0+`
- npm `v9.0.0+`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Bobo2005/VaultBridge.git
cd VaultBridge

# Install root dependencies
npm install

# Install contracts, proof pipeline, crypto, and frontend dependencies
cd contracts && npm install && cd ..
cd proof-pipeline && npm install && cd ..
cd crypto && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Run Test Suites
```bash
# Test Smart Contracts (Economics, 5% Bounty, Dynamic APR, EIP-712)
cd contracts && npx hardhat test && cd ..

# Test Cryptographic Privacy Layer (AES-256-GCM, ECIES)
cd crypto && npm test && cd ..

# Test Autonomous Watchtower, SSE Stream & Proof Inspector API
cd proof-pipeline && npx jest test/watchtower.e2e.test.ts && cd ..
```

### 3. Start Proof Pipeline & SSE API Server
```bash
cd proof-pipeline
npm run dev
# Server running at http://localhost:4000
# SSE Telemetry Stream at http://localhost:4000/api/stream/attestations
```

### 4. Start Autonomous Watchtower Daemon
```bash
cd proof-pipeline
npm run keeper
```

### 5. Launch Frontend Web App
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

---

## 🏆 Hackathon Submission Metadata

- **Event**: BUIDL CTC 2026 Fall Hackathon
- **Tracks**: **RWA / DeFi Track** (Primary) & **Gaming Track** (Secondary)
- **Core Technology**: Creditcoin Universal Smart Contract (USC), Native Precompile `0x0FD2`, Precompile `0x0FD3`, `@gluwa/usc-sdk`, OpenZeppelin EIP-712, ECIES secp256k1, AES-256-GCM.
- **License**: MIT
