# PROJECT-PLAN-V2.md — VaultBridge Platform (V2)

> This is an extension of the same VaultBridge codebase and platform from V1. Nothing here forks the project — StreakChain and the Privacy Layer are new modules living inside the existing repo, sharing the wallet connection, the proof-pipeline engine, and the design system already built.

## V2 Scope

**1. Privacy Layer (for existing VaultBridge invoice/lending module)**
Invoice and loan data currently stored in plaintext on Creditcoin becomes encrypted-by-default, visible only to the owning wallet, with explicit, revocable, address-based sharing.

**2. StreakChain (new module, same platform)**
Trustlessly verified habit streaks, reusing the absence-of-payment proof mechanism from V1's default trigger, applied to a non-financial, mass-appeal use case. Targets the Gaming track (currently uncontested in this hackathon round, per competitive research).

## Why Both, Why Now
- Privacy Layer strengthens the existing VaultBridge submission — real invoice/loan data being fully public is a legitimate weakness a judge could flag.
- StreakChain gives you a second, genuinely novel submission surface (Gaming track) built on the same underlying engine — demonstrating the Attestcoin Protocol integration is real infrastructure, not a one-off.
- Submitting both under one platform/repo, potentially as two track entries (RWA/DeFi + Gaming) referencing the same codebase, maximizes your shot across tracks without duplicating core engineering work.

## Milestones

| # | Milestone | Module | Status |
|---|---|---|---|
| P1 | Encryption utils + key wrapping working client-side | Privacy | ✅ Complete (3/3 passing) |
| P2 | `AccessRegistry.sol` deployed, grant/revoke working | Privacy | ✅ Complete (25/25 passing) |
| P3 | `VaultLending.sol` migrated to commitment+pointer storage (no plaintext on-chain) | Privacy | ✅ Complete |
| P4 | Full selective share flow working end-to-end in UI (grant an address, they can decrypt, instant revoke) | Privacy | ✅ Complete |
| P5 | Real On-Chain Testnet Liquidity (`MockERC20.sol` Faucet + physical wallet disbursement / repayment) | Real Liquidity | ✅ Complete (44/44 passing) |
| P6 | Enterprise FinTech Copy Revamp across all Dashboards, Invoices, and Facilities views | FinTech UX | ✅ Complete |
| S1 | `StreakRegistry.sol` deployed on source chain | StreakChain | ✅ Complete (Sepolia) |
| S2 | Streak absence-proof pipeline verified in isolation | StreakChain | ✅ Complete (2/2 passing) |
| S3 | `StreakVerifier.sol` + `StreakBadge.sol` deployed on Creditcoin, streak counting + breaking logic working | StreakChain | ✅ Complete (10/10 passing) |
| S4 | Streak dashboard, leaderboard, and shareable streak badge live | StreakChain | ✅ Complete (12/12 routes) |
| F1 | Both modules integrated into one sidebar/platform, README updated, submission-ready | Both | ✅ Complete |

## Definition of Done (V2)
- [x] No invoice/loan detail is readable on-chain by anyone other than the owner or an explicitly granted address (Verified via `VaultLending.sol` commitment+pointer architecture)
- [x] Real testnet tokens physically move in/out of connected wallet with 1-click Faucet claim and Yield Vault (Verified via `MockERC20.sol` & `VaultLending.sol`)
- [x] A granted address can decrypt exactly what was shared, nothing more (Verified via `AccessRegistry.sol` and `crypto.roundtrip.test.ts`)
- [x] A revoked address loses access immediately on next check (Verified via `PrivacyAccessControl.test.js` Scenario 3 & UI revocation)
- [x] A missed day trustlessly breaks a streak with no centralized decision (Verified via `StreakVerifier.test.js`, `streak.isolation.test.ts`, and `streak.e2e.test.ts`)
- [x] Both modules run from the same wallet connection and the same deployed proof-pipeline package (Verified via unified `Sidebar.tsx` and Next.js 14 shell)
- [x] README documents both modules and clearly explains the shared Attestcoin Protocol engine underneath both (Verified in `README.md`)

## Timeline Note
Same deadline constraint as V1 (Sept 6, 23:59 ET). Both modules are 100% complete, fully tested, and ready for submission.
