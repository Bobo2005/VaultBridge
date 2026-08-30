# PRD.md — VaultBridge

## 1. Problem
Invoice-backed lending on-chain today relies on either (a) centralized parties manually marking invoices "paid" or "defaulted," or (b) centralized oracles that reintroduce single-point-of-failure vulnerabilities. Small-and-medium enterprises (SMEs) face a **$3 Trillion** working capital liquidity trap in unpaid 30–90 day invoices.

## 2. Solution
VaultBridge allows businesses to tokenize unpaid invoices as RWA collateral on Ethereum Sepolia, borrow liquidity in stablecoins (`USDC`, `EURC`, `USDT`) on Creditcoin, and have **repayment or default determined trustlessly** via the **Attestcoin Protocol** (`@gluwa/usc-sdk`):
- **Positive Proof**: Proves payment transaction presence on Sepolia, releasing collateral in 1 block (~15s).
- **Absence Proof (Attested Default Trigger)**: Proves zero payment transactions occurred before the due date block, enabling permissionless liquidation without human discretion.

## 3. Target User (MVP)
Fintech suppliers, institutional lenders, and SME borrowers who hold unpaid trade invoices and need instant liquidity against verified cryptographic collateral.

## 4. Core User Stories & Feature Matrix

| # | Feature | User Story | Implementation |
|---|---|---|---|
| 1 | **Invoice Attestation** | As a borrower, I want to tokenize and attest my Sepolia invoice. | `InvoiceRegistrar.issueInvoice` + `VaultLending.registerInvoice` (Precompile `0x0FD2`). |
| 2 | **Bulk Batch Attest** | As an enterprise, I want to attest up to 20 invoices in 1 transaction. | `registerInvoicesBatch` via `IUSCVerifier.verifyBatch` (**⚡ 86.5% gas savings**). |
| 3 | **Dynamic Tiered Borrowing** | As a borrower, I want to draw multi-asset liquidity based on debtor credit tier. | Tier A (80% LTV), Tier B (70% LTV), Tier C (50% LTV) in USDC/EURC/USDT. |
| 4 | **Collateral Release** | As a debtor, I want my escrow payment on Sepolia to release collateral on Creditcoin. | `InvoiceRegistrar.payInvoice` + `VaultLending.releaseOnPayment`. |
| 5 | **Autonomous Default Trigger** | As a protocol lender, I want overdue loans liquidated automatically. | Autonomous `keeper.ts` generates absence proofs and calls `liquidateOnDefault`. |
| 6 | **Live Attestation UX** | As a judge/user, I want to observe proof generation in real time. | `ProofProgressRing` radial countdown ring (~15s) polling `/api/proof-status`. |

## 5. Scope & Enhanced Architecture
- **Source Chain**: Ethereum Sepolia (`InvoiceRegistrar.sol`).
- **Execution Chain**: Creditcoin USC Testnet (`VaultLending.sol`).
- **Cryptographic Engine**: Native Precompile `0x000...0FD2` (`verifySingle` & `verifyBatch`).
- **Price Oracle**: `MockPriceOracle.sol` with freshness & heartbeat staleness validation.
- **Backend Service**: Express REST API on Render (`proof-pipeline/render.yaml` & `Dockerfile`).
- **Automation Daemon**: Liquidation Keeper Sidecar with Discord & Telegram webhook alerts.
- **Frontend**: Next.js 14 App Router on Vercel with Wagmi v1 wallet connect.

## 6. Success Criteria (Hackathon Top 1 Alignment)
- ✅ Dual Attestcoin Protocol integration (positive inclusion proof + novel absence-of-payment proof).
- ✅ Live testnet deployment on Sepolia and Creditcoin USC testnet.
- ✅ Precompile `0x0FD2` performance benchmarks (28,500 gas single, ~7,000 gas batch).
- ✅ Clean, institutional UI adhering to `docs/design-system.md`.
- ✅ Pitch deck and 2-minute demo video script (`docs/pitch-deck.md`).
