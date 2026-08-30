# AI-AGENT-PROMPTS.md — VaultBridge

> Paste these into your AI coding agent (Claude Code, Cursor, etc.) **in order**. Each assumes the previous step is done and the docs (`prd.md`, `architecture.md`, `memory.md`, `design-system.md`, `file-structure.md`) are in the repo/context. Update `memory.md` and `handoff.md` after each prompt completes — tell the agent to do this as its last action in every prompt.

---

### Prompt 1 — Scaffold the repo
```
Read docs/prd.md, docs/architecture.md, and docs/file-structure.md in this repo.
Scaffold the full project structure exactly as described in file-structure.md, with
empty/stub files where content doesn't exist yet (contracts, proof-pipeline, frontend
folders, package.json files with reasonable dependencies for Hardhat + TypeScript +
Next.js + Tailwind + wagmi). Do not implement logic yet. After scaffolding, update
docs/memory.md's "Current State" checklist and append a session entry to docs/handoff.md.
```

### Prompt 2 — InvoiceRegistrar.sol (source chain)
```
Implement contracts/source-chain/InvoiceRegistrar.sol per docs/architecture.md section 2.1.
Functions: issueInvoice(invoiceId, amount, debtor, dueDateBlock) and payInvoice(invoiceId),
emitting InvoiceIssued and InvoicePaid events with all fields needed for later proof
generation. Keep it minimal — no business logic beyond storing/emitting. Write Hardhat
tests covering issuance, payment, double-payment prevention, and event correctness.
Update docs/memory.md and docs/handoff.md when done.
```

### Prompt 3 — Deploy InvoiceRegistrar to Sepolia
```
Write a Hardhat deploy script (deploy/01_deploy_registrar.ts) for InvoiceRegistrar.sol
targeting Ethereum Sepolia, using environment variables from .env.example for RPC URL
and private key. Deploy it, confirm the deployment, and record the deployed address in
docs/memory.md under a new "Deployed Addresses" section.
```

### Prompt 4 — Proof pipeline: chain info + positive proof (isolated)
```
Using @gluwa/usc-sdk (with ethers.js v6), implement proof-pipeline/src/chainInfo.ts to
resolve the Sepolia chainKey via PrecompileChainInfoProvider, and
proof-pipeline/src/generatePositiveProof.ts to: call waitUntilHeightAttested for a given
Sepolia block, then use ProverAPIProofGenerator to generate an inclusion proof for a
given transaction hash. Write an isolation test (proof-pipeline/test/pipeline.isolation.test.ts)
that runs this against the real deployed InvoiceRegistrar from Prompt 3 using a dummy
issueInvoice() transaction. Do NOT wire this to any Creditcoin contract yet — this step
must work fully standalone first, per project-plan.md's risk note. Report the actual
attestation wait time you observed. Update memory.md and handoff.md.
```

### Prompt 5 — VaultLending.sol core (Creditcoin side)
```
Implement contracts/creditcoin/VaultLending.sol per docs/architecture.md sections 2.3 and
3 (data model). Implement registerInvoice(proofData) which verifies the proof via the
native precompile at 0x0FD2 (wrap this call in contracts/creditcoin/interfaces/IUSCVerifier.sol
for readability) and stores the Invoice struct. Implement borrow(invoiceId, amount) with a
fixed 70% LTV cap against attested invoice amount, paying out a mock ERC20. Write tests
using a mocked/stubbed precompile response since 0x0FD2 won't exist in a local test env.
Update memory.md and handoff.md.
```

### Prompt 6 — Deploy VaultLending + wire real proof submission
```
Write deploy/02_deploy_vaultlending.ts targeting Creditcoin USC testnet, deploy the mock
ERC20 and VaultLending.sol, and record addresses in memory.md. Then implement
proof-pipeline/src/submitProof.ts to take a generated proof from generatePositiveProof.ts
and call registerInvoice() on the deployed VaultLending contract. Run a full manual
end-to-end test: issue a real invoice on Sepolia, generate the proof, submit it, confirm
the invoice is registered on Creditcoin. Update memory.md's Current State checklist —
this completes Milestone M2 from project-plan.md.
```

### Prompt 7 — Payment release + the Attested Default Trigger (core feature)
```
Implement releaseOnPayment(proofData) on VaultLending.sol (verifies InvoicePaid proof,
marks loan repaid, releases collateral claim) and liquidateOnDefault(proofData) implementing
the absence-of-payment logic described in architecture.md section 4: verify via the
precompile that the attested block range up to dueDateBlock contains no valid InvoicePaid
event for this invoiceId, then trigger liquidation. This function must be callable by
anyone (permissionless). Implement the corresponding proof-pipeline/src/generateAbsenceProof.ts.
Write tests for: successful payment release, and successful/blocked liquidation attempts
(before and after due date, with and without a real payment). This is the project's
headline differentiating feature — be thorough. Update memory.md and handoff.md.
```

### Prompt 8 — Frontend: design system + core layout
```
Read docs/design-system.md fully. Implement frontend/lib/theme.ts and tailwind.config.ts
using its exact color tokens, typography scale, and spacing rules. Build the sidebar +
top bar layout described in design-system.md section 3, and the reusable components
StatCard, AttestationBadge, and the base card/button primitives per section 4. Do not
build page content yet — this prompt is purely the shared UI shell and design tokens.
```

### Prompt 9 — Frontend: dashboard, invoice flow, live attestation feed
```
Build the dashboard (app/page.tsx) with four StatCards (Total Collateral Attested, Active
Loans, Available Credit, Attestations Pending), the CollateralChart, and InvoiceStatusDonut
per design-system.md. Build app/invoices/page.tsx (list, using AttestationBadge for status)
and app/invoices/[id]/page.tsx with LiveAttestationFeed and ProofProgressRing showing the
real ~15s attestation wait (poll app/api/proof-status/route.ts, which should call the
proof-pipeline service). Wire wagmi for wallet connect and read/write calls to VaultLending.sol
using lib/contracts.ts. Update memory.md and handoff.md — this completes Milestone M6.
```

### Prompt 10 — Polish, submission docs, and demo readiness
```
Review the full flow against docs/prd.md section 4 (core user stories) and confirm each
is fully functional end-to-end on testnet. Write a comprehensive README.md at the repo
root covering setup, deployed addresses, and how the Attestcoin Protocol integration works
(pull directly from architecture.md section 4 for the absence-of-payment explanation —
this is what judges will read first). List any remaining bugs or rough edges honestly in
docs/handoff.md. Do not fabricate features that aren't working.
```
