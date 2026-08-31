# MEMORY.md — VaultBridge (Agent Context File)

> Purpose: persistent context for AI coding agents working across sessions on this repo. Keep entries short and factual.

## Project Identity
- **Name:** VaultBridge Platform (V1 + V2)
- **One-liner:** Cross-chain invoice-financing & privacy-preserving RWA lending on Creditcoin, with the StreakChain habit attestation module sharing the core Attestcoin Protocol engine.
- **Hackathon:** BUIDL CTC 2026 Fall (RWA/DeFi Track & Gaming Track). Deadline Sept 6, 2026, 23:59 ET.

## Key Decisions Log
| Date | Decision | Rationale |
|---|---|---|
| — | Chose invoices over real estate/commodities as RWA type | Clean state machine (issued→paid/overdue), easy to simulate credibly, well-understood use case |
| — | Chose "Attested Default Trigger" as headline feature | Absence-of-payment proof is technically deeper than standard positive-event proofs; directly demonstrates the hackathon's "no centralized oracle" thesis |
| — | Source chain: Ethereum Sepolia | Standard, well-supported by USC SDK examples |
| 2026-08-29 | Dynamic Debtor Risk-Tiered LTV (80%/70%/50%) | Replaced static 70% LTV with Tier A Prime (80% LTV at 4.0% APR), Tier B (70% LTV), and Tier C (50% LTV at 6.5% APR) |
| 2026-08-29 | Bulk Invoice Merkle Batch Verifier (`verifyBatch`) | Precompile 0x0FD2 batch verification for up to 20 invoices in 1 tx using shared continuity proof, saving 86.5% gas |
| 2026-08-29 | Autonomous Liquidation Keeper Sidecar | Background daemon querying overdue loans on Sepolia and executing permissionless default liquidation on Creditcoin with Discord/Telegram alerts |
| 2026-08-30 | V2 Privacy Layer (`AccessRegistry.sol` + `crypto/`) | Encrypted-by-default off-chain storage with on-chain commitment + pointer and address-based key wrapping |
| 2026-08-30 | Multi-Provider Wallet Suite | Multi-connector wallet modal (MetaMask, Coinbase, WalletConnect, Rainbow, Brave, Injected), network auto-switching (Sepolia ↔ Creditcoin), 30s TTL balance cache, address book, and QR scanner |
| 2026-08-30 | V2 StreakChain Module (`StreakVerifier.sol`) | Reuses absence-proof mechanism for trustless habit verification (Gaming Track entry) |
| 2026-08-30 | Soulbound StreakBadge ERC-721 Pattern | Non-transferable via `_update()` hook override. `StreakVerifier.sol` calls `mintMilestoneBadge(user, streakId, milestone)` upon crossing 7, 30, and 100 days; deduplicated via `milestoneMinted[streakId][threshold]`. |
| 2026-08-30 | Resilient RPC Retry Layer (`retryUtils.ts`) | Implemented `fetchWithRetry` with exponential backoff, jitter, and automatic failovers in `generatePositiveProof.ts`, `generateAbsenceProof.ts`, and `generateStreakAbsenceProof.ts` with safe socket teardown. |
| 2026-08-30 | Resilient Storage & Incognito Error Guards | Refactored `getLocalBlob()`, `storeLocalBlob()`, and `frontend/lib/privacy.ts` with `StorageResult<T>` and schema verification (`isValidBundleSchema`). Added UI fallback on `/invoices/[id]` for Incognito cache recovery. |
| 2026-08-30 | StreakVerifier Clock-Skew & Grace Window | Implemented `BOUNDARY_GRACE_PERIOD` (15 min) in `StreakVerifier.sol`. Added unit test validating border check-ins at 23:59:45 UTC advance consecutive count without duplicate reverts (44/44 tests passing). |
| 2026-08-30 | Judge Speedrun Demo Mode (`JudgeDemoModal.tsx`) | Built 1-click 10-second end-to-end walkthrough modal in TopBar with auto-play speedrun across Encryption, Merkle Proof, Tier A LTV, and Soulbound NFT Badges. |
| 2026-08-30 | Autonomous Keeper Webhooks & SSE Feed | Integrated Discord & Telegram webhooks in `keeper.ts`, added SSE stream at `/api/events/stream`, and built live ticker in `LiveAttestationFeed.tsx` with Blockscout links. |
| 2026-08-30 | Real On-Chain Testnet Liquidity & Wallet Disbursement | Wired `MockERC20.sol` public `faucet` method on Creditcoin Testnet. Added 1-click Claim Faucet buttons, wired `VaultLending.borrow()` to physically disburse tokens to connected wallets, and `VaultLending.repay()` to debit tokens upon repayment. |
| 2026-08-31 | Full Frontend Responsiveness Across Mobile/Tablet/Desktop | Built adaptive AppShell with slide-over drawer backdrop, sticky mobile header, bottom mobile navigation bar, responsive data tables (`overflow-x-auto`), and fluid typography across all pages. |
| 2026-08-31 | Massive Testnet Liquidity (51,000,000 USDC On-Chain) | Minted 50M MockUSDC directly into `VaultLending.sol` and 5M MockUSDC to user wallet via `mint_huge_liquidity.js`. Verified 51M USDC pool balance. |
| 2026-08-31 | Multi-Stage Interactive Loading States | Added multi-step animated progress bars and stage status indicators across Wallet Connect, Borrowing, Repaying, Yield Vault Deposits/Withdrawals, and Faucet minting. |
| 2026-08-31 | Multi-Tier Faucet Amounts (+10k, +50k, +100k, +1M USDC) | Extended `/api/faucet` and `ClaimFaucetButton.tsx` to support claiming up to 1,000,000 USDC in 1-click for large institutional facility testing. |

## Soulbound StreakBadge Call Pattern
- **Contract Interface:** `StreakBadge.mintMilestoneBadge(address to, bytes32 streakId, uint256 milestoneDays)`
- **Trigger Conditions:** Inside `StreakVerifier.registerCheckIn(...)`, when `streak.currentCount` equals `7`, `30`, or `100`.
- **Deduplication:** Guarded by `require(!milestoneMinted[streakId][threshold])` before dispatching mint call and setting flag to `true`.
- **Non-Transferability:** ERC-721 hook `_update(address to, uint256 tokenId, address auth)` reverts with `"StreakBadge: Soulbound badge is non-transferable"` for any transfer between non-zero addresses.
- **Public Sharing:** Public read-only proof URL (e.g. `/streaks/[id]`) requires no privacy layer per Architecture §3.4 because habit streaks and NFT badges are public achievements.

## Current State & Milestones

### V1 Milestones (100% Complete)
- [x] **M1**: Verified end-to-end proof generation & verification (`pipeline.isolation.test.ts` passed live on Sepolia & Creditcoin).
- [x] **M2**: `InvoiceRegistrar.sol` deployed on Sepolia (`0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021`); `VaultLending.sol` implemented with 15/15 passing tests.
- [x] **M3**: Dynamic risk-tiered borrowing (Tier A 80%, Tier B 70%, Tier C 50% LTV) across multi-asset collateral (USDC, EURC, USDT).
- [x] **M4**: Payment attestation & collateral release (`releaseOnPayment`) verified via precompile `0x0FD2`.
- [x] **M5**: Attested default trigger (`liquidateOnDefault`) via absence-of-payment proof implemented and tested.
- [x] **M6**: Frontend public landing page, interactive dashboard, ~15s attestation wait ring, and Wagmi wallet connection.
- [x] **M7**: Production pitch deck, gas benchmarks, and 2-minute video demo script (`docs/pitch-deck.md`).

### V2 Privacy Layer & Trade Finance (100% Complete)
- [x] **P1**: Encryption utils + key wrapping working client-side (`crypto/` verified with roundtrip tests).
- [x] **P2**: `AccessRegistry.sol` implemented and tested (`AccessRegistry.test.js` & `PrivacyAccessControl.test.js` passing 25/25 tests).
- [x] **P3**: `VaultLending.sol` migrated to commitment+pointer storage (no plaintext on-chain).
- [x] **P4**: Full selective access flow & decryption read path live in UI (`/invoices/[id]/share` + client-side AES-GCM decryption with viewer role simulation).
- [x] **P5**: Real on-chain token movement with faucet (`MockERC20.sol`) and interactive wallet disbursement / repayment.
- [x] **P6**: Yield & Liquidity Vault (`depositLiquidity` / `withdrawLiquidity`) earning 8.5% APY with **51,000,000 USDC on-chain liquidity**.

### Advanced Wallet Suite & Responsiveness (100% Complete)
- [x] **W1**: Multi-provider wallet connect modal (MetaMask, Coinbase, WalletConnect, Rainbow, Brave, Injected) with animated handshake loading states.
- [x] **W2**: Network auto-switching modal with user confirmation between Ethereum Sepolia (`11155111`) & Creditcoin Testnet (`102031`).
- [x] **W3**: Multi-asset balance caching (`balanceCache.ts`) with live RPC queries and instant UI event bus synchronization.
- [x] **W4**: Address Book modal (`addressBook.ts`) for saving frequent debtor, auditor, and treasury contacts.
- [x] **W5**: QR Code modal (`QrModal.tsx`) with high-contrast address QR display and camera scanner.
- [x] **W6**: Full mobile/tablet responsiveness (drawer, bottom nav bar, sticky mobile header, modal scrolling).

### V2 StreakChain Module (100% Complete)
- [x] **S1**: `StreakRegistry.sol` deployed on Ethereum Sepolia (`0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce`).
- [x] **S2**: Streak absence-proof pipeline verified in isolation (`generateStreakAbsenceProof.ts` + `streak.isolation.test.ts` passing).
- [x] **S3**: `StreakVerifier.sol` + `StreakBadge.sol` deployed on Creditcoin (`0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` / `0xfa41181596515986C87A969F51daD5af597eB3b7`), `submitStreakProof.ts` wired, and `streak.e2e.test.ts` passing.
- [x] **S4**: Streak dashboard (`/streaks`), `StreakLeaderboard.tsx`, `/streaks/[id]` with `ProofProgressRing` & `LiveAttestationFeed` and public proof sharing live.
- [x] **F1**: Both modules integrated into one unified platform, README updated, submission-ready.

## Deployed & Verified Addresses
- **InvoiceRegistrar.sol (Sepolia):** `0x7B88F2D4435BB909196F9e54c8bD0Cc02b36b021` ✅
- **StreakRegistry.sol (Sepolia):** `0x870a9D0207A2c72A292386848b33B3F4aBA8E9ce` ✅
- **VaultLending.sol (Creditcoin):** `0xE8686e4D2856Da637F2c17c71d818911Ec541dE5` ✅ (Funded with **51,000,000 USDC**)
- **AccessRegistry.sol (Creditcoin):** `0xACCcD369182aE9d45dbc9E8d75Bf6CA7814A3CEe` ✅
- **StreakBadge.sol (Creditcoin):** `0xfa41181596515986C87A969F51daD5af597eB3b7` ✅
- **StreakVerifier.sol (Creditcoin):** `0xA8254Fb11692A5Db4c4925AaBC6aFc535E22542A` ✅
- **MockERC20.sol (Creditcoin):** `0x5a892509a0eeEe4fA12aFDC1D3d9B59C11efA714` ✅
- **MockPriceOracle.sol (Creditcoin):** `0x2279B7A0a67E1418866B777B764380E68Fa0b3ee` ✅
- **Precompile Verifier (Creditcoin):** `0x0000000000000000000000000000000000000FD2` ⚡
- **ChainInfo Precompile (Creditcoin):** `0x0000000000000000000000000000000000000FD3` ⚡