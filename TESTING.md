# 🧪 VaultBridge Testing & Verification Guide

This document provides a comprehensive guide for testing the VaultBridge protocol across Smart Contracts, Proof Pipeline (Backend), and Frontend Web App.

---

## 📊 Quick Test Matrix

| Component | Command | Target Network | Expected Result |
|---|---|---|---|
| **Smart Contracts** | `cd contracts && npx hardhat test` | Local Hardhat (Solc 0.8.20) | **41/41 passing unit tests** |
| **Privacy Crypto Utils** | `cd crypto && npx jest` | Isolated Cryptographic Engine | **3/3 passing roundtrip tests** |
| **Proof Pipeline Isolation** | `cd proof-pipeline && npx jest --forceExit` | Sepolia + Creditcoin Testnet | **7/7 passing live attestation tests** |
| **CLI Demo Walkthrough** | `cd proof-pipeline && npx ts-node demo_walkthrough.ts` | Multi-chain Simulation | Complete 6-step lifecycle in 9.6s |
| **Autonomous Keeper Daemon** | `cd proof-pipeline && npm run keeper` | Background Daemon Sidecar | Monitors overdue loans & sends webhooks |
| **Backend REST API** | `cd proof-pipeline && npm start` | Node.js / Express Server | Health check `/health` -> 200 OK |
| **Frontend Production Build** | `cd frontend && npm run build` | Next.js 14 App Router | **13/13 routes compiled cleanly (Code 0)** |

---

## 1. Smart Contract Testing (41/41 Passing)

```bash
cd contracts
npx hardhat test
```

### Test Coverage Highlights:
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
npx jest
```

Verifies:
- Complete client-side **AES-256-GCM** encryption and decryption roundtrip.
- Asymmetric **ECIES** key wrapping using grantee secp256k1 public keys and unwrapping via private keys.
- Deterministic SHA-256 commitment generation: `commitment = sha256(ciphertext)`.
- Anti-tampering ciphertext verification.

---

## 3. Proof Pipeline Backend Testing (7/7 Passing)

```bash
cd proof-pipeline
npx jest --forceExit
```

Verifies:
- **`pipeline.isolation.test.ts`**: Positive Merkle proof generation and continuous block continuity proof verified on Creditcoin Precompile `0x0FD2`.
- **`streak.isolation.test.ts`**: Absence proof generation over 24-hour block ranges.
- **`streak.e2e.test.ts`**: Full 4-step life-cycle (Sepolia check-in $\to$ consecutive count increment $\to$ illegal break rejection $\to$ verified absence streak reset).

---

## 4. Interactive End-to-End UI Testing Guide

### A. Working Capital Loan Draw & Real-Time Balance Drop
1. Connect your wallet on **Creditcoin Testnet (Chain ID: `102031`)**.
2. Click **"+50k USDC"** or **"Claim Testnet USDC"** in the TopBar / Portfolio Drawer.
3. Open **[Loans](http://localhost:3000/loans)** $\to$ Click **"Draw Working Capital"**.
4. Select `USDC` (or `EURC`/`USDT`) and enter the draw amount up to your credit limit.
5. Click **"Authorize & Draw Capital"**. Watch the **3-stage animated progress bar** (LTV check $\to$ contract execution $\to$ wallet credit).
6. Open the **Portfolio Drawer** to see your updated total valuation and physical token balance.

### B. Repaying Loan & Releasing Collateral
1. On the **[Loans](http://localhost:3000/loans)** page under **Active Credit Positions**, click **"Authorize & Repay Loan"**.
2. Click **"Step 1: Authorize USDC Transfer"** (watch animated allowance loader).
3. Click **"Step 2: Settle Principal & Release Collateral"**.
4. Tokens are deducted from your wallet balance in real-time, the loan status updates to **Settled**, and collateral receivable is unlocked.

### C. Yield & Liquidity Vault (Supply & Withdraw)
1. On the **[Loans](http://localhost:3000/loans)** page, click **"Yield & Liquidity Vault"**.
2. **Deposit**: Supply USDC to earn **8.50% APY**. Watch the animated deposit loading progress.
3. **Withdraw**: Switch to the **Withdraw** tab, enter the amount, and confirm redemption back into your wallet.

### D. Judge Speedrun Demo (10-Second Walkthrough)
1. Click **"⚡ Judge Speedrun Demo"** in the TopBar.
2. Click **"Speedrun All (8s)"** to experience the 4-step cross-chain lifecycle:
   - *Step 1: Client-Side AES-256-GCM Encryption*
   - *Step 2: Precompile 0x0FD2 Verification*
   - *Step 3: Tier A Working Capital Draw*
   - *Step 4: Soulbound Milestone NFT Badge Minting*

---

## 5. Deployed & Verified Contracts

| Network | Contract | Address | Explorer Link |
|---|---|---|---|
| **Ethereum Sepolia** | `InvoiceRegistrar.sol` | `0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021` | [Etherscan](https://sepolia.etherscan.io/address/0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021) |
| **Ethereum Sepolia** | `StreakRegistry.sol` | `0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce` | [Etherscan](https://sepolia.etherscan.io/address/0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce) |
| **Creditcoin Testnet** | `VaultLending.sol` | `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xE8686e4D2856Da637F2c17c71d818911Ec541dE5) |
| **Creditcoin Testnet** | `AccessRegistry.sol` | `0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe) |
| **Creditcoin Testnet** | `StreakVerifier.sol` | `0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A) |
| **Creditcoin Testnet** | `StreakBadge.sol` | `0xfa41181596515986C87A969F51daD5af597eB3b7` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xfa41181596515986C87A969F51daD5af597eB3b7) |
| **Creditcoin Testnet** | `MockERC20.sol` | `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714) |
| **Creditcoin Testnet** | `IUSCVerifier Precompile` | `0x0000000000000000000000000000000000000FD2` | Native Precompile |
| **Creditcoin Testnet** | `ChainInfo Precompile` | `0x0000000000000000000000000000000000000FD3` | Native Precompile |