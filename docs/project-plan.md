# PROJECT-PLAN.md — VaultBridge

## Timeline & Hackathon Status (BUIDL CTC 2026 Fall Hackathon — RWA Track)

| Phase | Task | Output | Status |
|---|---|---|---|
| 1 | Chain setup: Sepolia + Creditcoin USC testnet RPCs, funded wallets, `@gluwa/usc-sdk` install, confirm `chainKey` resolution | Working dev environment | ✅ Complete |
| 2 | `InvoiceRegistrar.sol` on Sepolia: issue + pay functions | Deployed source-chain contract (`0x5a89...A714`) | ✅ Complete |
| 3 | Proof pipeline service: positive inclusion proofs, absence proofs, and Express REST API | Verified proof generation on Render | ✅ Complete |
| 4 | `VaultLending.sol` on Creditcoin: registration + borrow logic, precompile `0x0FD2` verification | Deployed & tested execution contract | ✅ Complete |
| 5 | Attested Default Trigger logic (absence-of-payment proof engine) | Zero-oracle liquidation complete | ✅ Complete |
| 6 | Bulk Merkle Batch Verifier (`verifyBatch` on Precompile `0x0FD2`) | Up to 20 invoices in 1 tx (**86.5% gas savings**) | ✅ Complete |
| 7 | Multi-Asset Collateral & Dynamic Debtor Risk Tiers (80%/70%/50% LTV) | Tiered lending with price oracle staleness validation | ✅ Complete |
| 8 | Autonomous Liquidation Keeper Daemon & Webhooks Sidecar (`keeper.ts`) | Automated default execution + Discord/Telegram alerts | ✅ Complete |
| 9 | Public Landing Page & Dashboard: Hero, 4 Pillars, 4-Step Guide, FAQ, Wagmi wallet connect | Production Next.js 14 Web App (Vercel-ready) | ✅ Complete |
| 10 | Final pitch deck, 2-minute video demo script, and complete technical docs | Hackathon submission ready | ✅ Complete |

## Milestones / Definition of Done
- [x] **M1**: Can generate and verify a real proof end-to-end (`pipeline.isolation.test.ts` passed live on Sepolia & Creditcoin).
- [x] **M2**: `InvoiceRegistrar.sol` deployed on Sepolia; `VaultLending.sol` implemented and tested with precompile `0x0FD2`.
- [x] **M3**: Dynamic risk-tiered borrowing (Tier A 80%, Tier B 70%, Tier C 50% LTV) across multi-asset collateral (USDC, EURC, USDT).
- [x] **M4**: Payment on Sepolia correctly releases collateral via payment inclusion proof.
- [x] **M5**: Missed deadline correctly and permissionlessly triggers liquidation via absence-of-payment proof.
- [x] **M6**: Frontend public landing page, interactive dashboard, ~15s attestation wait ring, CSV bulk batch uploader, and Wagmi wallet connection.
- [x] **M7**: README, technical pitch deck, 2-minute video demo script, and test documentation ready for submission.

## Competitive Positioning
Existing Creditcoin RWA/lending projects price collateral via internal reputation data or subjective valuation. VaultBridge is differentiated by:
1. Using the Attestcoin Protocol for **both** onboarding verification and trustless, permissionless default enforcement via negative/absence proofs.
2. Slashing enterprise gas costs by **86.5%** via bulk batching on native precompile `0x0FD2`.
3. Offering dynamic risk-adjusted LTV credit lines and autonomous keeper liquidation sidecars.