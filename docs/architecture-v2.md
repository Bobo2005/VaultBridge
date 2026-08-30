# ARCHITECTURE-V2.md — VaultBridge Platform (Privacy Layer + StreakChain)

> Extends `architecture.md` (V1). Same platform, same wallet, same proof-pipeline package. This document covers only what's new.

## 1. Platform Shape (recap)

```
VaultBridge Platform
├── Module: Invoice Lending (V1)         ← now gets the Privacy Layer
├── Module: StreakChain (V2, new)
└── Shared: wallet connection, proof-pipeline engine, design system, sidebar shell
```

---

## 2. Privacy Layer

### 2.1 Problem
Creditcoin is a public EVM-compatible ledger. Storing invoice amounts, debtor addresses, or loan status in plaintext means anyone can read them, forever. "Private unless shared" must be designed in — it isn't free.

### 2.2 Design: encrypted payload + on-chain commitment

```
Owner's browser                         Off-chain storage         Creditcoin
┌─────────────────────┐                ┌──────────────────┐     ┌─────────────────────┐
│ 1. Encrypt invoice    │──ciphertext──▶│  Encrypted blob    │     │ VaultLending.sol     │
│    data with random   │               │  store (IPFS or    │     │ stores:               │
│    symmetric key K     │               │  backend)           │     │  commitment = hash(   │
│ 2. Wrap K with owner's │               └──────────────────┘     │    ciphertext)         │
│    wallet pubkey        │                                        │  pointer = blob CID     │
└─────────────────────┘                                        └─────────────────────┘
```

- `registerInvoice()` and related functions on `VaultLending.sol` are updated to accept `(commitment, pointer, attestationProof)` instead of plaintext fields.
- The Attestcoin proof still verifies the underlying source-chain transaction happened — proving existence doesn't require revealing contents. This part of V1 is unchanged.
- Only the *storage* of invoice/loan metadata changes, not the proof mechanism.

### 2.3 `AccessRegistry.sol` (new contract, Creditcoin)

```solidity
// Simplified interface
grantAccess(bytes32 dataId, address grantee, bytes wrappedKeyForGrantee)
revokeAccess(bytes32 dataId, address grantee)
getWrappedKey(bytes32 dataId, address requester) returns (bytes)
```

- `grantAccess`: owner's client re-encrypts symmetric key `K` using the grantee's public key (derivable from their wallet, via e.g. `eth_getEncryptionPublicKey`-style flow or a registered public key), stores the wrapped key on-chain against `(dataId, grantee)`.
- `revokeAccess`: deletes that entry. Grantee immediately loses the ability to fetch a usable wrapped key.
- `getWrappedKey`: any address can call this for a `dataId`; it only returns a non-empty result if the caller is the owner or has been explicitly granted.
- The wrapped key itself is small (encrypted key material, not the data) — cheap to store on-chain even though the invoice data itself lives off-chain.

### 2.4 Read flow (for owner or a granted address)
1. Call `getWrappedKey(dataId, myAddress)` on `AccessRegistry.sol`.
2. If non-empty, unwrap it locally using the caller's private key (via wallet signature/decrypt prompt).
3. Fetch the ciphertext blob from off-chain storage using the `pointer` from `VaultLending.sol`.
4. Decrypt locally. Nothing sensitive ever touches a server in plaintext.

### 2.5 What this does and doesn't give you
- **Does:** hides invoice/loan contents from the public by default; gives the owner explicit, revocable, address-scoped sharing.
- **Doesn't (yet):** hide the *existence* of an invoice/loan, its owner's address, or timing metadata — those remain visible on-chain, same as V1. Full unlinkability would require zk techniques — call this out explicitly as a roadmap item in the submission, not something silently missing.

---

## 3. StreakChain Module

### 3.1 Concept
Reuses V1's hardest-won capability — proving the *absence* of a qualifying transaction — applied to habit streaks instead of loan defaults.

### 3.2 Components

**`StreakRegistry.sol` (source chain)**
- `checkIn(streakId)` — records a qualifying daily action as a transaction (in the MVP, this can be a direct user check-in transaction; a stretch goal is reading from an external app's existing transaction, e.g. a GitHub commit or Strava-linked event, if a suitable source-chain adapter exists)
- Emits `CheckedIn(streakId, dayIndex, timestamp)`

**Proof pipeline extension — `generateStreakAbsenceProof.ts`**
- Same primitives as V1's `generateAbsenceProof.ts` (`waitUntilHeightAttested`, `ProverAPIProofGenerator`), applied per-day: prove no `CheckedIn` event exists for `streakId` within a given day's block range.

**`StreakVerifier.sol` (Creditcoin)**
- `registerCheckIn(proofData)` — verifies a positive check-in proof, increments streak count
- `breakStreakIfMissed(streakId, dayIndex, proofData)` — permissionlessly callable; verifies the absence proof for that day, and if valid, resets the streak count to zero — no app, no admin, decides this; the chain proves it
- On milestone streak counts (e.g. 7, 30, 100 days), mints a non-transferable badge (ERC-721 or soulbound-style) to the user's wallet

### 3.3 Data Model

```
Streak {
  id: bytes32
  owner: address
  currentCount: uint256
  longestCount: uint256
  lastCheckInDay: uint256
  status: enum { Active, Broken }
}
```

### 3.4 Frontend
- `app/streaks/page.tsx` — dashboard: active streaks, leaderboard, StatCards (Current Streak, Longest Streak, Days Verified)
- `app/streaks/[id]/page.tsx` — detail view with the same live attestation feed / progress-ring pattern from V1's invoice detail page, reused directly
- "Share your streak" — generates a public, read-only proof link (no privacy layer needed here — streaks are meant to be shown off, unlike invoice data)

---

## 4. Shared Engine, Two Products
Both modules call the exact same `proof-pipeline/` functions for the "prove it happened" and "prove it didn't happen" cases — only the contract they submit to and the data shape differs. This is the core platform story: **one trustless attestation engine, two genuinely different real-world applications.**
