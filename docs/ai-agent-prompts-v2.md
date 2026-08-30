# AI-AGENT-PROMPTS-V2.md — VaultBridge Platform (Privacy Layer + StreakChain)

> Continues from `ai-agent-prompts.md` (V1, Prompts 1–10). Paste these in order. Each assumes `docs/architecture-v2.md`, `docs/project-plan-v2.md`, and `docs/file-structure-v2.md` are in the repo and readable. Every prompt ends with updating `memory.md` and `handoff.md`, same discipline as V1.

---

### Prompt 11 — Scaffold V2 additions
```
Read docs/architecture-v2.md, docs/project-plan-v2.md, and docs/file-structure-v2.md.
Scaffold every new file and folder listed in file-structure-v2.md (crypto/, new contracts,
new frontend routes/components) as stubs — no logic yet. Do not modify existing V1 files
beyond what file-structure-v2.md explicitly marks as MODIFIED. Update docs/memory.md's
Current State checklist to include the V2 milestones from project-plan-v2.md.
```

### Prompt 12 — Encryption utilities (crypto package)
```
Implement crypto/src/encryptPayload.ts (generate a random symmetric key, encrypt arbitrary
JSON with it, e.g. AES-GCM), crypto/src/wrapKey.ts (wrap that symmetric key using a
recipient's public key), and crypto/src/unwrapKey.ts (the inverse). Implement
crypto/src/blobStorage.ts with push/pull functions against IPFS (or a simple backend
store if IPFS setup is out of scope — note which one you chose in memory.md). Write
crypto/test/crypto.roundtrip.test.ts proving encrypt → wrap → unwrap → decrypt returns
the original payload byte-for-byte. Update memory.md and handoff.md.
```

### Prompt 13 — AccessRegistry.sol
```
Implement contracts/creditcoin/AccessRegistry.sol per docs/architecture-v2.md section 2.3:
grantAccess(dataId, grantee, wrappedKeyForGrantee), revokeAccess(dataId, grantee),
getWrappedKey(dataId, requester) — returning a non-empty result only for the owner or an
explicitly granted address. Write contracts/creditcoin/test/AccessRegistry.t.sol and
contracts/creditcoin/test/PrivacyAccessControl.t.sol covering: owner can always read,
granted address can read after grant, revoked address cannot read after revoke, and a
never-granted address gets nothing. Update memory.md and handoff.md.
```

### Prompt 14 — Migrate VaultLending.sol to commitment+pointer storage
```
Modify contracts/creditcoin/VaultLending.sol so registerInvoice() and related functions
accept (commitment, pointer, attestationProof) instead of plaintext invoice fields, per
docs/architecture-v2.md section 2.2. The attestation proof verification logic via
precompile 0x0FD2 is unchanged — only the stored data shape changes. Update existing
VaultLending.t.sol tests to match the new signature. Deploy the updated contract to
Creditcoin USC testnet and record the new address in memory.md. This completes
Milestone P3.
```

### Prompt 15 — Frontend: encrypt-on-write for invoices
```
In frontend/app/invoices, wire the invoice creation flow to: encrypt the invoice data
client-side using crypto/src/encryptPayload.ts, push the ciphertext via
crypto/src/blobStorage.ts, compute the commitment, and call the updated registerInvoice()
with (commitment, pointer, proof). Confirm no plaintext invoice field is ever sent in a
transaction or stored anywhere unencrypted. Update memory.md and handoff.md.
```

### Prompt 16 — Frontend: decrypt-on-read + Share Access UI
```
Build frontend/app/invoices/[id]/share/page.tsx (ShareAccessPanel.tsx component) letting
the owner enter a wallet address and call grantAccess() / revokeAccess() on
AccessRegistry.sol. Build the read path: on the invoice detail page, call getWrappedKey(),
unwrap locally if a result is returned, fetch and decrypt the ciphertext blob, and render
the plaintext only if decryption succeeds — otherwise show a clear "you don't have access"
state instead of an error. Test as both the owner and a second wallet: confirm the second
wallet sees nothing until granted, sees the data once granted, and loses access once
revoked. This completes Milestone P4 — the full Privacy Layer definition of done. Update
memory.md and handoff.md.
```

### Prompt 17 — StreakRegistry.sol (source chain)
```
Implement contracts/source-chain/StreakRegistry.sol per docs/architecture-v2.md section
3.2: checkIn(streakId) emitting CheckedIn(streakId, dayIndex, timestamp), preventing
duplicate check-ins for the same day. Write StreakRegistry.t.sol covering normal check-in,
duplicate-check-in rejection, and event correctness. Deploy to Sepolia and record the
address in memory.md.
```

### Prompt 18 — Streak absence-proof pipeline (isolated)
```
Implement proof-pipeline/src/generateStreakAbsenceProof.ts, reusing the same
waitUntilHeightAttested and ProverAPIProofGenerator primitives as
generateAbsenceProof.ts from V1, but scoped per-day: given a streakId and a dayIndex,
prove no CheckedIn event exists for that streak within that day's block range. Write
proof-pipeline/test/streak.isolation.test.ts against the real deployed StreakRegistry
from Prompt 17, testing both a day with a real check-in (proof should fail to find
absence) and a day with none (absence proof should succeed). Do not wire this to any
Creditcoin contract yet — test fully standalone first, same discipline as V1 Prompt 4.
Update memory.md and handoff.md.
```

### Prompt 19 — StreakVerifier.sol (Creditcoin)
```
Implement contracts/creditcoin/StreakVerifier.sol per docs/architecture-v2.md section 3.2
and the data model in section 3.3: registerCheckIn(proofData) verifying a positive proof
and incrementing currentCount/updating lastCheckInDay; breakStreakIfMissed(streakId,
dayIndex, proofData) — permissionlessly callable — verifying the absence proof and
resetting currentCount to zero if valid. Write StreakVerifier.t.sol with mocked precompile
responses covering: successful check-in, successful break on a real missed day, and a
blocked break attempt when a check-in actually exists for that day. Update memory.md and
handoff.md.
```

### Prompt 20 — Deploy StreakVerifier + wire full streak proof submission
```
Write deploy/05_deploy_streakverifier.ts, deploy to Creditcoin USC testnet, record the
address in memory.md. Extend proof-pipeline/src/submitProof.ts (or add a
submitStreakProof.ts) to submit both positive check-in proofs and absence-break proofs to
the deployed StreakVerifier. Run a full manual end-to-end test: check in on Sepolia,
generate + submit the proof, confirm currentCount increments on Creditcoin; then simulate
a missed day, generate + submit the absence proof, confirm the streak resets. This
completes Milestone S1–S3.
```

### Prompt 21 — StreakBadge.sol (milestone NFTs)
```
Implement contracts/creditcoin/StreakBadge.sol as a non-transferable (soulbound-style)
ERC-721. StreakVerifier.sol should call into it to mint a badge when currentCount crosses
milestone thresholds (7, 30, 100 days) — decide the exact call pattern and document it in
memory.md. Write tests confirming badges mint at the right thresholds and cannot be
transferred. Deploy and record the address.
```

### Prompt 22 — Frontend: Streaks dashboard + detail view
```
Build frontend/app/streaks/page.tsx per docs/architecture-v2.md section 3.4 and
design-system.md: StatCards (Current Streak, Longest Streak, Days Verified),
StreakLeaderboard.tsx, and frontend/app/streaks/[id]/page.tsx reusing the
LiveAttestationFeed and ProofProgressRing components from the invoice flow to show the
real attestation wait for a check-in. Wire wallet reads/writes against StreakVerifier.sol
and StreakBadge.sol via lib/contracts.ts. This completes Milestone S4.
```

### Prompt 23 — Shared platform navigation + StreakBadgeCard
```
Update frontend/app/layout.tsx sidebar to show two top-level sections — Lending
(Invoices, Loans) and Streaks — under one shell, one wallet connection, per
architecture-v2.md section 4. Build StreakBadgeCard.tsx to display earned badges, and a
public read-only "share your streak" link (no privacy layer needed here, per
architecture-v2.md section 3.4 — streaks are meant to be shown, unlike invoice data).
Update memory.md and handoff.md.
```

### Prompt 24 — Full regression pass
```
Walk through every user story in prd.md plus the new Privacy Layer and StreakChain flows
end-to-end on testnet: invoice attestation with encryption, share/revoke access as a
second wallet, streak check-in, and a real missed-day streak break. Fix anything broken.
Do not mark project-plan-v2.md's Definition of Done items as complete unless you have
actually verified them live, not just that the code compiles.
```

### Prompt 25 — README + submission readiness (both modules)
```
Rewrite README.md to document the full platform: the shared Attestcoin Protocol engine,
the Invoice Lending module (including the Privacy Layer — explain the encrypted
payload/on-chain commitment design honestly, including that full unlinkability is a
roadmap item, not shipped), and the StreakChain module (explain the absence-proof reuse
explicitly — this is your strongest technical story). List all deployed contract
addresses on both chains. Note any known rough edges honestly in handoff.md. Do not
fabricate functionality that isn't actually working end-to-end.
```
