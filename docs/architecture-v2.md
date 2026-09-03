# ARCHITECTURE-V2.md — VaultBridge Platform (Full 3-Phase Architecture)

> Extends `architecture.md` (V1). Unified multi-chain verification platform on Creditcoin Testnet (CC3) with Privacy Working Capital Facilities, StreakChain Habit Attestation, Autonomous Watchtower, and Judge God-Mode Sandbox.

---

## 1. Platform Shape & Core Modules

```
VaultBridge Platform
├── Module: Privacy RWA Invoice Lending (DeFi / RWA Track)
│   ├── Dynamic Risk Tiers (Tier A 80%, Tier B 70%, Tier C 50% LTV)
│   ├── 5% Liquidator Bounty Engine (LIQUIDATOR_BOUNTY_BPS = 500)
│   ├── Continuous Linear Interest Accrual (APR) & Dynamic Pool APY
│   ├── Gasless EIP-712 Meta-Transactions (borrowWithPermit, grantAccessWithPermit)
│   └── 51,000,000 USDC On-Chain Liquidity Pool
├── Module: StreakChain (Gaming Track)
│   ├── Daily Habit Check-Ins on Sepolia (StreakRegistry.sol)
│   ├── Precompile 0x0FD2 Inclusion Attestation (StreakVerifier.sol)
│   ├── Absence-Prover Autonomous Slasher
│   └── Soulbound Non-Transferable Milestone NFT Badges (7/30/100 Days)
├── Module: Autonomous Watchtower Daemon & Real-Time SSE Pipeline
│   ├── Dual-Mode Keeper (RWA Liquidator + Streak Slasher)
│   ├── Live Server-Sent Events Stream (GET /api/stream/attestations)
│   ├── 50-Event Circular Telemetry Buffer (GET /api/attestations/history)
│   └── Merkle Patricia Trie Inspector API (POST /api/proof/inspect)
└── Module: Frontend Judge God Mode & Audit Sandbox
    ├── 1-Click Interactive Sandbox Toolbar (JudgeSandboxBar.tsx)
    ├── Interactive Merkle Patricia Trie Depth Visualizer (ProofVisualizerModal.tsx)
    ├── Institutional KPMG/Deloitte Audit Certificate Exporter (AuditCertificateModal.tsx)
    └── Tactile Web Audio API Sound Synthesizer (soundFx.ts)
```

---

## 2. Privacy Layer & Key Delegation

### 2.1 Problem
Creditcoin is a public EVM-compatible ledger. Storing invoice amounts, debtor addresses, or line items in plaintext exposes sensitive commercial secrets.

### 2.2 Design: Encrypted Payload + On-Chain Commitment
```
Owner's Browser                         Decentralized Storage         Creditcoin CC3
┌──────────────────────┐                ┌──────────────────┐     ┌─────────────────────┐
│ 1. Encrypt invoice   │──ciphertext───▶│  Encrypted blob  │     │ VaultLending.sol    │
│    with AES-256-GCM  │                │  store (IPFS)    │     │ stores:             │
│ 2. ECIES wrap key K  │                └──────────────────┘     │  commitment = SHA256│
│    for authorized    │                                         │  pointer = IPFS CID │
│    stakeholders      │                                         └─────────────────────┘
└──────────────────────┘
```

- `registerInvoice()` accepts `(commitment, pointer, attestationProof)`.
- Zero plaintext trade terms touch the blockchain or relayer.
- Only the 32-byte SHA-256 commitment hash and encrypted IPFS storage pointer are recorded on-chain.

### 2.3 `AccessRegistry.sol` Interface & EIP-712 Permits
```solidity
// Core ECIES delegation
function grantAccess(bytes32 dataId, address grantee, bytes calldata wrappedKey) external;
function grantAccessWithPermit(bytes32 dataId, address grantee, bytes calldata wrappedKey, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
function revokeAccess(bytes32 dataId, address grantee) external;
function getWrappedKey(bytes32 dataId, address requester) external view returns (bytes memory);
```

- **Selective Access**: Owners delegate wrapped keys to **Verified Auditors**, **Institutional Lenders**, or **Tax Compliance Officers**.
- **Instant Revocation**: 1-click on-chain revocation immediately wipes access.
- **Gasless EIP-712 Permits**: Meta-transaction signatures allow delegating access without holding testnet CTC for gas.

---

## 3. StreakChain Module

### 3.1 Architecture & Primitives
Reuses the Attestcoin absence-proving engine (`generateStreakAbsenceProof.ts`) to verify missed daily habit intervals trustlessly.

### 3.2 Components
- **`StreakRegistry.sol` (Ethereum Sepolia)**: Records daily `checkIn(streakId)` events with duplicate protection.
- **`StreakVerifier.sol` (Creditcoin)**: Verifies positive inclusion proofs on Precompile `0x0FD2` and mints Soulbound NFTs upon reaching milestones.
- **`StreakBadge.sol` (Creditcoin)**: Soulbound ERC-721 token overriding OpenZeppelin `_update()` to strictly enforce non-transferability.
- **`breakStreakIfMissed()`**: Permissionlessly callable with an absence proof across a 24h block range. Resets active streak to 0 while permanently preserving the all-time longest record.

---

## 4. Watchtower & Real-Time SSE Pipeline

- **`proof-pipeline/src/keeper.ts`**: Runs dual-mode background watcher:
  - **RWA Liquidator**: Monitors overdue invoices, generates absence proofs, and triggers `liquidateOnDefault` earning a **5% liquidator bounty**.
  - **Streak Slasher**: Detects missed 24h check-in boundaries and executes `breakStreakIfMissed`.
- **`GET /api/stream/attestations`**: Server-Sent Events (SSE) feed broadcasting live attestation telemetry.
- **`POST /api/proof/inspect`**: Merkle Patricia Trie inspector disassembling root, extension, branch, and leaf nodes with Precompile `0x0FD2` gas benchmarks (**45.2% gas saved** vs EVM multisig bridges).

---

## 5. Verified Deployed Contracts Matrix

| Network | Contract | Address |
|---|---|---|
| **Ethereum Sepolia** | `InvoiceRegistrar.sol` | `0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021` |
| **Ethereum Sepolia** | `StreakRegistry.sol` | `0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce` |
| **Creditcoin Testnet** | `VaultLending.sol` | `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` |
| **Creditcoin Testnet** | `AccessRegistry.sol` | `0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe` |
| **Creditcoin Testnet** | `StreakVerifier.sol` | `0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` |
| **Creditcoin Testnet** | `StreakBadge.sol` | `0xfa41181596515986C87A969F51daD5af597eB3b7` |
| **Creditcoin Testnet** | `MockERC20.sol` | `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` |
| **Creditcoin Testnet** | `IUSCVerifier Precompile` | `0x0000000000000000000000000000000000000FD2` |
