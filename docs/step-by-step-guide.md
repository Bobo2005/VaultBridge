# STEP-BY-STEP-GUIDE.md — VaultBridge

> A human-readable walkthrough of the build order. Use this alongside `ai-agent-prompts.md` (paste those prompts to your agent at the matching step) and `project-plan.md` (milestone tracking).

## Step 0 — Prep (before any code)
1. Create Sepolia + Creditcoin USC testnet wallets, fund both with testnet tokens.
2. Get RPC endpoints for both chains.
3. Drop all six docs (`prd.md`, `architecture.md`, `project-plan.md`, `memory.md`, `handoff.md`, `design-system.md`) plus `file-structure.md` into your repo's `docs/` folder — your AI agent should read these before writing any code.

## Step 1 — Scaffold
Run **Prompt 1**. Confirm the folder structure matches `file-structure.md` exactly before moving on.

## Step 2 — Source-chain contract
Run **Prompt 2**, then **Prompt 3**. At the end of this step you should have a real, deployed `InvoiceRegistrar.sol` on Sepolia with a working `issueInvoice` / `payInvoice` flow you can call manually via a script or Etherscan.

**Checkpoint:** manually call `issueInvoice()` on Etherscan/a script and confirm the event fires. Don't proceed until this works.

## Step 3 — Proof pipeline (isolated) — the critical path
Run **Prompt 4**. This is the step most likely to eat your time budget — the SDK, attestation timing, and prover API are unfamiliar territory. Budget real time here and do not let the agent skip the isolation test.

**Checkpoint:** you should see a real proof generated and logged for a real Sepolia transaction, with no Creditcoin contract involved yet. If this doesn't work reliably, do not proceed to Step 4 — debug here first.

## Step 4 — Creditcoin-side contract
Run **Prompt 5**, then **Prompt 6**. This connects the proof pipeline to a real on-chain effect: registering an invoice on Creditcoin from a Sepolia-verified proof.

**Checkpoint:** issue an invoice on Sepolia → generate the proof → submit it → confirm it's registered in `VaultLending.sol` on Creditcoin. This is Milestone M2.

## Step 5 — The headline feature
Run **Prompt 7**. This is your differentiator (payment release + the absence-of-payment default trigger). Test both paths explicitly:
- Debtor pays before due date → collateral releases
- Due date passes with no payment → anyone can trigger liquidation
- Due date passes but payment *did* happen → liquidation attempt correctly fails

**Checkpoint:** all three scenarios above work on testnet. This is Milestones M3–M5.

## Step 6 — Frontend shell
Run **Prompt 8**. Get the design system, layout, and shared components in place before building any real page — this avoids rework later.

## Step 7 — Frontend pages + live demo UX
Run **Prompt 9**. This is where the product becomes demoable: dashboard, invoice list/detail, and — most importantly — the live attestation feed showing the ~15s proof verification happening in real time. This is your best "wow" moment for judges; don't rush it.

**Checkpoint:** you can walk through the entire flow — attest invoice, borrow, pay/default — purely through the UI, with wallet interactions, and see live status changes. Milestone M6.

## Step 8 — Submission polish
Run **Prompt 10**. Write the README, double-check every user story in `prd.md` §4 actually works end-to-end, and be honest in `handoff.md` about anything unfinished — judges will read the code, not just the pitch.

## Step 9 — Record the demo
Script a tight 2–3 minute video:
1. Show an invoice being attested (10s)
2. Show borrowing against it (10s)
3. Show a payment attested → collateral released, OR a missed deadline → automatic liquidation (this is the money shot — let the ~15s wait play out on screen)
4. One sentence on why this matters: "No one decided this invoice defaulted. The chain proved it."

## Step 10 — Submit
Follow the submission requirements in `prd.md` §6.2 exactly — GitHub repo with README, deck/whitepaper PDF, demo video, team info, all before Sept 6, 23:59 ET.
