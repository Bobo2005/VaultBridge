# VaultBridge Testing & Verification Guide

This document provides a comprehensive guide for testing the VaultBridge protocol across Smart Contracts, Proof Pipeline (Backend), and Frontend.

---

## 🧪 Quick Test Matrix

| Component | Command | Target Network | Expected Result |
|---|---|---|---|
| **Smart Contracts** | `cd contracts && npx hardhat test` | Local Hardhat (Solc 0.8.20) | **15/15 passing unit tests** |
| **Proof Pipeline Isolation** | `cd proof-pipeline && npm test` | Sepolia + Creditcoin Testnet | Real attestation & proof generation |
| **CLI Demo Automation** | `cd proof-pipeline && npx ts-node demo_walkthrough.ts` | Multi-chain Simulation | Complete 6-step lifecycle in 9.6s |
| **Autonomous Keeper** | `cd proof-pipeline && npm run keeper` | Background Daemon | Monitors overdue loans & sends webhooks |
| **Backend REST API** | `cd proof-pipeline && npm start` | Render Express Service | Health check `/health` -> 200 OK |
| **Frontend Production Build** | `cd frontend && npm run build` | Next.js 14 / Vercel | 10/10 routes compiled cleanly (Code 0) |

---

## 1. Smart Contract Testing

### Compile Contracts
```bash
cd contracts
npx hardhat compile
```
*Output: 12 Solidity files compiled successfully (evm target: paris, viaIR: true).*

### Run Unit Tests
```bash
cd contracts
npx hardhat test
```
Tests cover:
- Invoice registration via simulated precompile `0x0FD2`
- Bulk batch invoice registration via `registerInvoicesBatch` (86.5% gas reduction)
- Dynamic debtor credit risk tiers: Tier A (80% LTV), Tier B (70% LTV), Tier C (50% LTV)
- Multi-asset lending (USDC, EURC, USDT)
- Flash-loan-resistant price oracle freshness & heartbeat validation
- Loan repayment
- Payment collateral release via `releaseOnPayment`
- Default liquidation via `liquidateOnDefault` absence proofs
- Access control and reentrancy guards

---

## 2. Proof Pipeline Backend Testing

### Run Standalone Isolation Test (Live Testnet)
```bash
cd proof-pipeline
npm test
```
Verifies:
- Sepolia `chainKey = 1` resolution via Creditcoin precompile `0x0FD3`
- Real block attestation wait via `@gluwa/usc-sdk`
- Merkle inclusion proof generation via `ProofBuilder`

### Run End-to-End CLI Demo Walkthrough
```bash
cd proof-pipeline
npx ts-node demo_walkthrough.ts
```
Executes:
1. Tokenize invoice on Sepolia (`InvoiceRegistrar.issueInvoice`).
2. Attestcoin relayer polling.
3. Cryptographic Merkle inclusion and continuity proof generation.
4. Synchronous verification on Creditcoin via native precompile `0x0FD2`.
5. Dynamic risk-tiered borrow draw ($18,900 USDC on 10 ETH).
6. Performance benchmark summary table.

### Run Autonomous Liquidation Keeper Sidecar
```bash
cd proof-pipeline
npm run keeper
```

---

## 3. Frontend Web Application Testing

### Run Typecheck & Production Build
```bash
cd frontend
npm run build
```
Verifies:
- All 10 static and dynamic routes compile with 0 TypeScript errors.
- Public landing page with Hero, 4 Pillars, 4-step guide, and FAQ accordion.
- Wagmi v1 wallet connector configuration and seamless Dashboard switch.
- Route Handler `/api/proof-status` API polling.

### Run Local Development Server
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

---

## 4. Deployed Smart Contract Verification

| Network | Contract | Address | Explorer Link |
|---|---|---|---|
| **Ethereum Sepolia** | `InvoiceRegistrar.sol` | `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` | [Etherscan](https://sepolia.etherscan.io/address/0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714) |
| **Creditcoin USC Testnet** | `VaultLending.sol` | `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` | [Blockscout](https://creditcoin-testnet.blockscout.com/address/0xE8686e4D2856Da637F2c17c71d818911Ec541dE5) |
| **Creditcoin Native Precompile** | `IUSCVerifier` | `0x0000000000000000000000000000000000000FD2` | Native Precompile |