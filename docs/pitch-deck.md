# 🏆 VaultBridge — Hackathon Pitch Deck & Video Demo Script

> **Track**: Real-World Assets (RWA) & Cross-Chain Lending  
> **Hackathon**: BUIDL CTC 2026 Fall Hackathon  
> **Project Name**: VaultBridge  
> **Tagline**: Cross-Chain Invoice Financing & Attested Default Liquidation Protocol on Creditcoin  

---

## 📑 Slide Deck Content

### Slide 1: The Problem — The $3 Trillion Invoice Liquidity Trap
- Small and medium enterprises (SMEs) have over **$3 Trillion** locked in unpaid 30–90 day invoices.
- **Why Web3 invoice financing has failed until today:**
  - Traditional protocols rely on **centralized oracle attestations** or manual multisig flags to declare when an invoice is "paid" or "defaulted."
  - This reintroduces counterparty, fraud, and single-point-of-failure risks that blockchains were built to eliminate.

---

### Slide 2: The Solution — VaultBridge
- **VaultBridge** enables businesses to tokenize unpaid invoices on source chains (Ethereum Sepolia) as RWA collateral and draw instant multi-asset liquidity (`USDC`, `EURC`, `USDT`) on Creditcoin (Universal Smart Contract layer).
- **100% Trustless Enforcement:**
  - **Repayment:** Verified via cryptographic **Merkle inclusion proofs** of Sepolia payment transactions.
  - **Default Liquidation:** Verified via **cryptographic absence-of-payment proofs** across attested block history.
  - **Zero Oracles. Zero Admin Keys. Synchronous Verification.**

---

### Slide 3: The Secret Weapon — Native Precompile `0x000...0FD2`
- Traditional cross-chain bridges take minutes/hours and require trusting an off-chain committee.
- VaultBridge calls Creditcoin’s native verifier precompile `0x0FD2` **synchronously in 1 transaction**:
  $$\text{IUSCVerifier}(0x0\text{FD}2).\text{verify}(\text{chainKey}, \text{height}, \text{encodedTx}, \text{merkleProof}, \text{continuityProof})$$
- Verified in ~28,500 gas with 1-block deterministic settlement.
- **Bulk Batching (`verifyBatch`)**: Verifies up to 20 invoices in a single transaction sharing 1 continuity proof for **⚡ 86.5% gas savings** (~7,000 gas per invoice).

---

### Slide 4: Dynamic Risk-Tiered LTV & Multi-Asset Collateral
- **Tier A (Prime Debtors)**: **80% LTV** (`8000` bps) at 4.0% APR.
- **Tier B (Standard Debtors)**: **70% LTV** (`7000` bps) at 4.5% APR.
- **Tier C (Subprime Debtors)**: **50% LTV** (`5000` bps) at 6.5% APR.
- **Flash-Loan-Resistant Oracle**: Freshness & heartbeat checks protect against sandwich attacks.

---

### Slide 5: Differentiating Innovation — The "Attested Default Trigger" & Keeper Daemon
1. When an invoice reaches its due date block ($H_{\text{due}}$), the debtor's payment window closes.
2. Our **Autonomous Liquidation Keeper Sidecar** (`keeper.ts`) continuously monitors overdue loans.
3. The protocol verifies that the continuous attested block range $[0, H_{\text{due}}]$ contains **no qualifying payment transaction**.
4. The smart contract automatically liquidates the collateral with instant **Discord & Telegram webhook alerts**.

---

### Slide 6: System Architecture & Workflow

```
[ Ethereum Sepolia (Source) ]
   └── InvoiceRegistrar.sol (issueInvoice, payInvoice)
              │
              ▼
[ Proof Pipeline Service (@gluwa/usc-sdk) ]
   ├── PrecompileChainInfoProvider + ProofBuilder
   ├── Bulk Batch Verifier (86% Gas Reduction)
   └── Autonomous Liquidation Keeper (Discord/Telegram Alerts)
              │
              ▼
[ Creditcoin USC Testnet (Execution) ]
   └── VaultLending.sol ──▶ Native Precompile 0x0FD2
```

---

## 🎬 2-Minute Demo Video Script

*Target Duration: 2 Minutes (120 Seconds)*  
*Recording Setup: Screen recording of Dashboard (`http://localhost:3000`), Sepolia Etherscan, and terminal CLI demo.*

---

### ⏱️ 0:00 – 0:25 | The Hook & Problem (25s)
- **Visual**: Camera / Clean title slide showing VaultBridge interface.
- **Voiceover**:
  > "Hi everyone, this is VaultBridge. In global trade, over three trillion dollars in capital is trapped in unpaid 30-to-90 day invoices. While on-chain invoice financing has huge potential, every existing solution relies on centralized oracles or manual admin keys to decide whether an invoice was paid or defaulted. Today, we've built the first trustless, cross-chain invoice lending protocol powered by Creditcoin and the Attestcoin Protocol."

---

### ⏱️ 0:25 – 0:55 | Tokenizing & Registering Collateral (30s)
- **Visual**: Click "Tokenize Invoice" on the dashboard. Enter 10 ETH (~$27,000 USD). Watch the 15-second radial progress ring activate.
- **Voiceover**:
  > "Let's tokenize an invoice for 10 ETH issued to a debtor on Ethereum Sepolia. When we submit, our Proof Pipeline monitors block attestations on Creditcoin. Notice this live radial progress ring: once the Sepolia block header is attested, our backend generates a cryptographic Merkle inclusion proof and passes it to `VaultLending.sol` on Creditcoin. Through Creditcoin’s native verifier precompile `0x0FD2`, the proof is verified synchronously in a single transaction, locking the invoice as verified RWA collateral."

---

### ⏱️ 0:55 – 1:20 | Dynamic Risk-Tiered Borrowing (25s)
- **Visual**: Move to the Invoices table. Click "Borrow". Select "Tier A Prime (80% LTV)" and choose "USDC". Click "Draw Liquidity".
- **Voiceover**:
  > "Now with verified collateral on Creditcoin, the business can immediately draw multi-asset liquidity. Our dynamic risk engine grants up to 80% LTV for Tier A prime debtors. We disburse $21,600 in USDC instant liquidity while the invoice remains locked in escrow."

---

### ⏱️ 1:20 – 1:45 | Bulk Batching & 86% Gas Savings (25s)
- **Visual**: Click "Batch Attest". Show the CSV bulk uploader and the 86% gas savings badge.
- **Voiceover**:
  > "For enterprise suppliers with dozens of invoices, our Bulk Batch Verifier calls `verifyBatch` on Precompile `0x0FD2`, combining up to 20 invoices under one shared block continuity proof to slash gas costs by 86.5%."

---

### ⏱️ 1:45 – 2:00 | The Attested Default Engine & Conclusion (15s)
- **Visual**: Show the terminal running `keeper.ts` and the Discord webhook alert.
- **Voiceover**:
  > "And if a debtor misses their deadline? Our autonomous Liquidation Keeper generates a mathematical absence-of-payment proof, triggering permissionless default liquidation on-chain. Zero oracles. Pure cryptographic verification. That is VaultBridge on Creditcoin. Thank you!"

---

## 📊 Evaluation Matrix Alignment (Top 1 Checklist)

| Judging Criteria | How VaultBridge Wins |
|---|---|
| **Attestcoin Integration** | Uses native precompile `0x0FD2` for positive inclusion proofs (repayments), bulk batch verification (`verifyBatch`), and novel negative absence-of-payment proofs (defaults). |
| **Technical Complexity** | Multi-chain contract architecture (Sepolia + Creditcoin USC), dynamic risk tiers (80%/70%/50%), multi-asset price oracle, Express REST API, and autonomous keeper sidecar. |
| **User Experience** | Institutional fintech UI matching FinFlow design tokens, live attestation countdown rings, interactive SVG charts, and CSV bulk batch attestation. |
| **Real-World Impact** | Unlocks working capital for the $3T global SME invoice financing market. |
