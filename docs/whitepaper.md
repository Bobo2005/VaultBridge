# 🏛️ VaultBridge Platform: Technical Whitepaper

> **Universal Trustless Cross-Chain Verification & Working Capital Credit Facilities on Creditcoin**  
> **Built for the BUIDL CTC 2026 Fall Hackathon (RWA/DeFi Track & Gaming Track)**  
> **Powered by the Attestcoin Protocol (`@gluwa/usc-sdk`) and Native Precompile `0x0FD2`**

---

## 1. Executive Summary & Vision

**VaultBridge** is a decentralized, privacy-preserving cross-chain credit and verification infrastructure built natively on **Creditcoin**. By leveraging Creditcoin’s native **Universal Smart Contract (USC)** architecture, the **Attestcoin Protocol**, and native EVM **Precompile `0x0FD2`**, VaultBridge replaces centralized oracle networks and multisig bridge dependencies with synchronous cryptographic verification.

The platform establishes a unified cryptographic primitive that powers two distinct market verticals:
1. **Confidential Accounts Receivable Financing (RWA/DeFi Track)**: Unlocking liquidity for small and medium enterprises (SMEs) against unpaid 30–90 day trade invoices tokenized on Ethereum Sepolia, secured by client-side AES-256-GCM encryption, ECIES key delegation, continuous linear APR accrual, 5% liquidator bounty game theory, and an active **51,000,000 USDC** on-chain lending pool.
2. **StreakChain Habit Attestation (Gaming Track)**: A verifiable on-chain habit tracking module awarding non-transferable Soulbound ERC-721 milestone badges (7, 30, 100 days), with mathematical absence proofs trustlessly slashing missed streaks.

---

## 2. The $3 Trillion Market Problem

Global trade finance suffers from a **$3 Trillion liquidity trap**. SMEs routinely wait 30 to 90 days for buyer settlements on delivered invoices. Traditional blockchain factoring models fail due to:
- **Plaintext Data Exposure**: Public ledgers expose confidential trade agreements, counterparty corporate identities, pricing structures, and debt obligations publicly.
- **Multisig & Oracle Vulnerabilities**: Cross-chain lending protocols depend on trusted third-party oracles (Chainlink Automation) or federated multisigs (LayerZero, Wormhole), presenting single points of failure and security risks.
- **Rigid Liquidity & High Gas**: Static advance rates fail to reward high-credit debtors, while individual cross-chain verification costs scale linearly.

---

## 3. Cryptographic Architecture & Attestcoin Engine

### 3.1 Dual-Attestation Modes (Precompile `0x0FD2`)
- **Positive Inclusion Proofs ("Prove It Happened")**: Cryptographic Merkle Patricia Trie proofs proving that an invoice settlement or daily habit check-in occurred on Sepolia. Upon verification by Precompile `0x0FD2`, `VaultLending.sol` releases escrowed collateral or increments habit streak counts.
- **Negative Absence Proofs ("Prove It DID NOT Happen")**: Mathematical verification across consecutive block headers proving zero payment or check-in events occurred. This trustlessly executes default liquidations or resets missed habit streaks without third-party oracle intervention.

### 3.2 Privacy Layer & Selective Key Delegation
- **AES-256-GCM Encryption**: Raw invoice line items are encrypted in the browser with a random 256-bit symmetric key. Only a 32-byte hash commitment (`sha256(ciphertext)`) and decentralized storage pointer are recorded on Creditcoin.
- **ECIES Asymmetric Key Wrapping**: The symmetric key is encrypted using the public keys of authorized stakeholders (Auditors, Institutional Lenders, Tax Authorities) and stored in `AccessRegistry.sol`.
- **Instant 1-Click Revocation**: Borrowers can instantly revoke viewing permissions on-chain, permanently terminating key retrieval for that entity.
- **Gasless EIP-712 Meta-Transactions**: Delegation and borrowing support EIP-712 typed data signatures (`grantAccessWithPermit`, `borrowWithPermit`).

---

## 4. Lending Economics, Game Theory & 5% Liquidator Bounty

### 4.1 Verified Liquidity Pool (51,000,000 USDC)
- `VaultLending.sol` is capitalized with **51,000,000.0 MockUSDC** on Creditcoin USC Testnet.
- **Multi-Tier Faucet**: Instant claims for **+10k**, **+50k**, **+100k**, and **+1M USDC** for institutional facility testing.
- **Yield & Liquidity Vault**: Capital providers earn dynamic APY on deposited assets based on pool utilization.

### 4.2 Dynamic Debtor Risk Tiers & Continuous Interest Accrual
Interest accrues linearly on a second-by-second basis settled upon repayment:

$$\text{Interest} = \frac{\text{Principal} \times \text{APR} \times \Delta t}{365 \times 86400 \times 10000}$$

| Risk Tier | Minimum Credit Score | Advance Rate (Max LTV) | Borrower APR | Default Penalty |
|---|---|---|---|---|
| **Tier A (Prime)** | $\ge 750$ (BMW, Siemens) | **80.00%** | 4.00% | 5.0% |
| **Tier B (Standard)** | $650 - 749$ (Standard Corp) | **70.00%** | 4.50% | 7.5% |
| **Tier C (Subprime)** | $< 650$ (Emerging SME) | **50.00%** | 6.50% | 12.0% |

### 4.3 5% Liquidator Keeper Bounty Engine
`VaultLending.sol` pays `LIQUIDATOR_BOUNTY_BPS = 500` (5.0%) directly to watchtowers who prove default via absence proofs:

$$\text{Bounty Reward} = \frac{\text{Recovered Collateral} \times 500}{10000} = 5.0\%$$

### 4.4 High-Throughput Merkle Batching (`verifyBatch`)
`VaultLending.registerInvoicesBatch()` aggregates up to **20 invoices in a single transaction** sharing one block continuity proof, reducing gas costs from ~52,000 gas to ~7,000 gas per invoice (**⚡ 86.5% Gas Savings**).

---

## 5. Autonomous Watchtower Daemon & Live SSE Telemetry

- **Dual-Mode Watchtower (`keeper.ts`)**: Background daemon monitoring overdue invoices and missed streaks, executing automated absence proofs and claiming 5% bounties.
- **Server-Sent Events (SSE) Stream (`GET /api/stream/attestations`)**: Real-time attestation stream broadcasting to connected clients.
- **Merkle Patricia Trie Inspector API (`POST /api/proof/inspect`)**: Disassembles trie layers (Root, Extension, Branch, Leaf) with Precompile `0x0FD2` gas benchmarks.

---

## 6. Frontend Judge God Mode & Institutional Compliance

- **Judge God Mode Toolbar (`JudgeSandboxBar.tsx`)**: Sticky 1-click sandbox simulating Scenario 1 (RWA Happy Path), Scenario 2 (Absence Proof Default + 5% Bounty), Scenario 3 (Streak Milestone & Slasher), and 10s Speedrun Modal.
- **Proof Visualizer Modal (`ProofVisualizerModal.tsx`)**: Interactive Merkle Patricia Trie depth graph showing Sepolia block headers, intermediate nibbles, and RLP payloads.
- **Institutional Audit Certificate (`AuditCertificateModal.tsx`)**: Bank-grade verification certificate on `/invoices/[id]` with SHA-256 commitment hash, IPFS pointer, ECIES delegation log, on-chain proof tx hashes, and 1-click PDF print export.
- **Tactile Sound Effects (`soundFx.ts`)**: Zero-dependency Web Audio API sound synthesis.

---

*Authored for the BUIDL CTC 2026 Fall Hackathon. Built on Creditcoin.*
