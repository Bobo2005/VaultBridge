# 🏛️ VaultBridge Platform (V1 + V2)

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
| `VaultLending.sol` | [`0xE8686e4D2856Da637F2c17c71d818911Ec541dE5`](https://creditcoin-testnet.blockscout.com/address/0xE8686e4D2856Da637F2c17c71d818911Ec541dE5) | Privacy Working Capital Facility (**51,000,000 USDC Pool**) | ✅ Live On-Chain |
| `AccessRegistry.sol` | [`0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe`](https://creditcoin-testnet.blockscout.com/address/0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe) | Selective Access & Privacy Controls (ECIES Key Delegation) | ✅ Live On-Chain |
| `StreakVerifier.sol` | [`0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A`](https://creditcoin-testnet.blockscout.com/address/0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A) | Cross-Chain Habit Attestation & Slasher | ✅ Live On-Chain |
| `StreakBadge.sol` | [`0xfa41181596515986C87A969F51daD5af597eB3b7`](https://creditcoin-testnet.blockscout.com/address/0xfa41181596515986C87A969F51daD5af597eB3b7) | Soulbound Non-Transferable ERC-721 Badges | ✅ Live On-Chain |
| `MockERC20.sol` | [`0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714`](https://creditcoin-testnet.blockscout.com/address/0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714) | Working Capital Stablecoins (MockUSDC/EURC/USDT with Multi-Tier Faucet) | ✅ Live On-Chain |
| `MockPriceOracle.sol` | `0x2279B7A0a67E1418866B777B764380E68Fa0b3ee` | Staleness & Heartbeat Validated Price Oracle | ✅ Configured |
| `IUSCVerifier Precompile` | `0x0000000000000000000000000000000000000FD2` | Instant Verification Engine (Merkle & Header Continuity) | ⚡ Native Precompile |
| `ChainInfo Precompile` | `0x0000000000000000000000000000000000000FD3` | Cross-Chain Block Header & Height Oracle | ⚡ Native Precompile |

### Application Services

| Service | Environment | URL | Status |
|---|---|---|---|
| **Frontend Web App** | Next.js 14 (Unified App Router) | `http://localhost:3000` | 🚀 Live (13/13 routes & APIs) |
| **Proof API Server** | Node.js / Express REST Engine | `http://localhost:4000` | 🚀 Ready |
| **Autonomous Keeper** | Background Daemon Sidecar | `proof-pipeline/src/keeper.ts` | 🤖 Active |

---

## ⚡ The Core Technical Story: One Attestation Engine, Two Products

VaultBridge demonstrates that Creditcoin's **Attestcoin Protocol** (`@gluwa/usc-sdk`) is not just a single-purpose bridge, but a universal cross-chain verification primitive. 

Both platform modules share the **exact same cryptographic proof pipeline** and **native Precompile `0x0FD2`**:
1. **Positive Inclusion Proofs ("Prove it happened")**:
   - *Private Accounts Receivable Financing*: Proves a buyer settlement payment occurred on Sepolia $\to$ automatically releases escrow collateral on Creditcoin.
   - *StreakChain*: Proves a daily habit check-in occurred on Sepolia $\to$ increments active streak on Creditcoin.
2. **Absence Proofs ("Prove it DID NOT happen")**:
   - *Private Accounts Receivable Financing*: Proves zero payments occurred before the maturity due date $\to$ executes default liquidation.
   - *StreakChain*: Proves zero check-ins occurred during a 24h block range $\to$ trustlessly resets the missed streak to 0.

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
│ • Yield & Liquidity Vault (8.5% APY)         │              │ • Soulbound Non-Transferable ERC-721 badges  │
│ • Dynamic Buyer Risk Tiers (80/70/50% LTV)   │              │ • Hall of Fame leaderboard & public proofs   │
│ • High-Throughput Batching (86.5% gas saved) │              │ • Boundary grace window for timezone drifts  │
│ • Multi-stage animated loading UX feedback   │              │ • Full responsive mobile & desktop drawer    │
└──────────────────────────────────────────────┘              └──────────────────────────────────────────────┘
```

---

## 🔐 1. Privacy Layer, Working Capital Facilities & Real Liquidity (V1 + V2)

### The $3 Trillion Trade Finance Challenge
Small and medium enterprises (SMEs) face a massive liquidity trap in unpaid 30–90 day accounts receivable. Traditional financing exposes proprietary business contracts, counterparty corporate identities, and payment terms publicly on public blockchains.

### Cryptographic Architecture & Workflow
1. **Real Testnet Liquidity & Disbursement Flow (`MockERC20.sol` & `VaultLending.sol`)**:
   - **51,000,000 USDC** on-chain liquidity pool on Creditcoin Testnet.
   - Integrated public multi-tier faucet allowing users to claim **+10,000**, **+50,000**, **+100,000**, or **+1,000,000 USDC** directly in the top navigation or portfolio drawer.
   - Executing `VaultLending.borrow()` physically disburses MockUSDC from the contract directly into the borrower's connected wallet.
   - Executing `VaultLending.repay()` approves and settles principal, deducting tokens from the wallet and unlocking collateral receivables.
   - **Yield & Liquidity Vault**: Lenders deposit and withdraw liquidity (`depositLiquidity` / `withdrawLiquidity`) while earning continuous **8.50% APY**.
2. **Confidential Client-Side Payload Protection (`crypto/src/encryptPayload.ts`)**:
   - Invoices are encrypted client-side in the browser via **AES-256-GCM** using a 256-bit key.
   - The encrypted payload ciphertext is pinned to decentralized storage.
   - Computes deterministic SHA-256 commitment hash: `commitment = sha256(ciphertext)`.
3. **Zero Plaintext Leakage On-Chain (`VaultLending.sol`)**:
   - `VaultLending.registerInvoice()` stores only the 32-byte commitment and encrypted storage pointer URL.
   - Public block explorers reveal **zero confidential trade terms, counterparty identities, or invoice line items**.
4. **Selective Access & Privacy Controls (`AccessRegistry.sol`)**:
   - Borrowers selectively delegate view permissions to authorized stakeholders:
     - **`Verified Auditor (KPMG/Deloitte)`**
     - **`Institutional Lender`**
     - **`Tax Compliance Officer`**
   - The AES symmetric key is wrapped using the grantee's secp256k1 public key via ECIES and recorded on `AccessRegistry.sol`.
   - **Instant Revoke Access**: 1-click on-chain revocation immediately removes all decryption permissions for that party.
5. **Dynamic Buyer Risk Tiers**:
   - **Tier A Prime (Credit Score ≥ 750)**: **80% Advance Rate** at 4.0% APR.
   - **Tier B Standard (Credit Score 650–749)**: **70% Advance Rate** at 4.5% APR.
   - **Tier C Subprime (Credit Score < 650)**: **50% Advance Rate** at 6.5% APR.
6. **High-Throughput Verification Engine (`verifyBatch`)**:
   - Combines up to 20 cross-border invoices in 1 transaction sharing a single block header continuity proof, reducing gas costs from ~52,000 gas to ~7,000 gas per invoice (**⚡ 86.5% gas savings**).
7. **Automated Settlement & Default Resolution**:
   - If an invoice is unpaid past its settlement maturity period $H_{due}$, `keeper.ts` generates an **Absence Proof** across continuous block headers. `VaultLending.liquidateOnDefault()` executes resolution with mathematical certainty without centralized oracles.

### 🛡️ Privacy Scope & Honest Design Disclosure
- **Shipped & Verified**: Payload confidentiality (AES-256-GCM), decentralized encrypted blob storage, on-chain commitment/pointer integrity, and address-based ECIES key delegation/revocation are **100% implemented, tested, and live in the UI**.
- **Roadmap Item (Phase 3)**: Full transaction graph unlinkability (e.g. zero-knowledge stealth addresses or shielded transaction relaying) is an architectural roadmap milestone. An interactive simulator is available on `/invoices/[id]/share`.

---

## 🔥 2. StreakChain: Habit Attestation & Soulbound Badges (V2)

### Reusing the Absence Proof Engine for Gaming & Habits
StreakChain demonstrates the true power of the Attestcoin absence-proving engine outside finance. A habit streak is valid if and only if **no required check-in was missed**.

### Lifecycle & Verification
1. **Daily Check-Ins (`StreakRegistry.sol`)**:
   - Users record daily habits on Sepolia via `checkIn(streakId)`. The contract prevents duplicate check-ins for the same 24-hour day index.
2. **Attestation & Badges (`StreakVerifier.sol` & `StreakBadge.sol`)**:
   - Creditcoin `StreakVerifier.sol` verifies the inclusion proof via Precompile `0x0FD2` and increments `currentCount`.
   - When `currentCount` crosses milestone thresholds (**7 Days**, **30 Days**, **100 Days**), `StreakVerifier` dispatches an automated mint to `StreakBadge.sol`.
3. **Soulbound Non-Transferability**:
   - `StreakBadge.sol` overrides OpenZeppelin's `_update()` hook to strictly block user-to-user transfers (`transferFrom`, `safeTransferFrom`), creating authentic, non-speculative on-chain proof of discipline.
4. **Permissionless Missed-Day Streak Break**:
   - If a user misses a day, `generateStreakAbsenceProof.ts` verifies that zero `CheckedIn` events occurred in that day's block window.
   - Any hunter or competitor calls `breakStreakIfMissed()`, resetting the active streak to 0 while permanently preserving the all-time longest record.
5. **Public Verifiable Proof Certificates**:
   - Per Architecture §3.4, habit streaks are public achievements. Users can share a public read-only link (`/streaks/[id]`) that verifies on-chain proof headers and NFT badges without requiring decryption keys.

---

## 📱 3. Responsive UI Architecture & Loading States

### Full Mobile, Tablet, and Desktop Support
- **Adaptive App Shell (`AppShell.tsx`)**:
  - **Desktop (`≥ 1024px`)**: Fixed 240px enterprise navigation sidebar.
  - **Mobile & Tablet (`< 1024px`)**: Sticky top header with network/relayer status pill, animated slide-over drawer with backdrop blur, and 1-touch bottom navigation bar (**Dashboard**, **Invoices**, **Loans**, **Streaks**, **More**).
- **Responsive Modals**: All dialogs feature `max-h-[90vh] overflow-y-auto`, fluid padding, and mobile-friendly vertical action stacks.
- **Scrollable Data Tables**: Responsive `overflow-x-auto` wrappers preventing table column crushing on small touch screens.

### Multi-Stage Interactive Loading States
1. **Wallet Connection**: Animated Web3 handshake stage progress card with active provider icon and cancellation option.
2. **Draw Working Capital**: 3-stage progress bar showing LTV verification $\to$ VaultLending submission $\to$ wallet token credit.
3. **Repaying Loans**: Multi-stage progress tracking token authorization allowance and collateral escrow release.
4. **Yield & Liquidity Vault**: Stepwise progress for capital supply and pool share redemption.
5. **Faucet Minting**: Multi-tier instant claim feedback with explorer links.

---

## 📊 Precompile 0x0FD2 Gas Benchmarks

| Verification Mode | Gas per Unit | 10 Units Batch Cost | Transactions | Efficiency Gain |
|---|---|---|---|---|
| **Single Verification (`verifySingle`)** | ~52,000 gas | ~520,000 gas | 10 txs | Baseline |
| **Bulk Merkle Batching (`verifyBatch`)** | ~7,000 gas | ~70,000 gas | **1 single tx** | **⚡ 86.5% Saved** |
| **Absence Proof Header Continuity** | ~38,000 gas | N/A (1 window) | 1 tx | Zero Oracle Trust |

---

## 🧪 Automated Test Suite & Verification Results

### 1. Smart Contract Test Suite (41/41 Passing)
```bash
cd contracts
npx hardhat test
```
- `AccessRegistry Contract Tests` (7/7 passing)
- `InvoiceRegistrar Tests` (6/6 passing)
- `PrivacyAccessControl Matrix Tests` (4/4 passing)
- `StreakBadge Soulbound NFT Tests` (4/4 passing)
- `StreakRegistry Tests` (5/5 passing)
- `StreakVerifier & StreakBadge Tests` (7/7 passing, including boundary grace period)
- `VaultLending Multi-Asset & Risk Tiers Tests` (8/8 passing)

### 2. Privacy Layer Crypto Roundtrip Tests (3/3 Passing)
```bash
cd crypto
npx jest
```
- Full encrypt $\to$ wrap $\to$ unwrap $\to$ decrypt roundtrip byte-for-byte.
- Unauthorized key unwrapping rejection.
- Ciphertext tampering detection.

### 3. Proof Pipeline Isolation & E2E Tests (7/7 Passing)
```bash
cd proof-pipeline
npx jest --forceExit
```
- `pipeline.isolation.test.ts`: Positive proof attestation on Sepolia & Creditcoin.
- `streak.isolation.test.ts`: Absence proof generation on missed vs checked-in days.
- `streak.e2e.test.ts`: Full 4-step E2E lifecycle (check-in, consecutive count, blocked invalid break, verified absence reset).

### 4. Next.js 14 Production App (13/13 Routes Clean)
```bash
cd frontend
npm run build
```
- 13 static and dynamic routes compiled with **Exit Code 0**.

---

## 🚀 Quick Start & Local Execution

### 1. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Start the Backend Proof API Server
```bash
cd proof-pipeline
npm install
npm start
# REST API running on http://localhost:4000
```

### 3. Run the Autonomous Liquidation Keeper Daemon
```bash
cd proof-pipeline
npm run keeper
```

---

## 📑 Repository Documentation & Specifications

- 📖 [Product Requirements Specification (PRD)](docs/prd.md)
- 🏛 [Architecture & Cryptographic Design V2](docs/architecture-v2.md)
- 📋 [V2 Project Plan & Definition of Done](docs/project-plan-v2.md)
- 🎨 [UI Design System & Tokens](docs/design-system.md)
- 🧪 [Testing & Verification Guide](TESTING.md)
- 📝 [Engineering Memory Context](docs/memory.md)
- 🤝 [Handoff & Known Notes](docs/handoff.md)

---

## ⚖️ License

MIT License. Built for the **BUIDL CTC 2026 Fall Hackathon** (RWA/DeFi & Gaming Tracks).
