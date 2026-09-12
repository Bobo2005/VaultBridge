# 🎯 Prompt & Context Engineering Playbook
## Strategies for Maximizing Agentic AI Performance in Complex Systems

> **Author:** VaultBridge Engineering Team  
> **Platform Case Study:** VaultBridge Cross-Chain Protocol (BUIDL CTC 2026 Fall Hackathon)  
> **Models Applied:** Anthropic Claude (Claude 3.5 Sonnet / Agentic Coding Workflows)  
> **Document Status:** Official Best-Practices Guide  

---

## 📑 Executive Summary

In frontier software engineering, pairing with large language models (LLMs) is no longer limited to inline autocompletion. When building multi-chain architectures, cryptographic zero-knowledge pipelines, and distributed backends, developer interaction shifts to **Agentic Engineering**: directing autonomous AI agents that read repositories, write multi-file code, execute terminal commands, and debug complex test suites.

However, the primary bottleneck in agentic coding is not the model’s raw intelligence—it is **context management and prompt structure**. Without disciplined strategies, agents suffer from **context rot**, hallucinate incompatible interfaces, introduce regressions, and become trapped in repetitive debugging loops.

This playbook provides a comprehensive guide to the strategies, mental models, and prompt architectures developed and proven during the development of the **VaultBridge** platform.

```
                                  THE CONTEXT HIERARCHY
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  TIER 1: CANONICAL GROUND TRUTH (Static Specs)                                          │
│  • docs/prd.md  • docs/architecture.md  • docs/design-system.md  • docs/file-structure.md│
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ Referenced by pointer, never re-typed
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  TIER 2: LIVING STATE & MEMORY (Dynamic State)                                          │
│  • docs/memory.md (Contract addresses, chain IDs, verification status)                  │
│  • docs/handoff.md (End-of-session state, active threads, blockers)                     │
└───────────────────────────────────────────┬─────────────────────────────────────────────┘
                                            │ Appended & updated as the final step of every turn
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  TIER 3: EPHEMERAL PROMPT CHUNK (Single Atomic Objective)                              │
│  • Exactly 1 objective  • Concrete input/output  • Isolated verification step          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. The Three-Tier Context Architecture

The most critical mistake developers make when working with AI agents is treating every chat prompt as an isolated, blank canvas or dumping the entire repository into the chat window. To achieve high precision, context must be stratified into three distinct layers:

### Tier 1: Canonical Ground Truth (Static Specifications)
Never describe your full business logic, design tokens, or smart contract architectures inside interactive chat prompts. Instead, author permanent, canonical markdown documents in a dedicated `docs/` folder:
- **`docs/prd.md`**: Business logic, user stories, math equations, and authorization constraints.
- **`docs/architecture.md`**: System component boundaries, RPC endpoints, event signatures, and precompile interfaces.
- **`docs/design-system.md`**: Color palette, typography scales, button states, and spacing tokens.
- **`docs/file-structure.md`**: Approved directory trees that prevent the agent from creating arbitrary or duplicate files.

> **Prompting Strategy:** Never type: *"We want an invoice contract that takes these 5 fields and emits this event..."*  
> Instead, type: *"Read `docs/architecture.md` Section 2.1 and implement `contracts/src/source-chain/InvoiceRegistrar.sol` strictly matching the specified interface and event signatures."*

### Tier 2: Living Memory & State (`memory.md` & `handoff.md`)
AI context windows are ephemeral, but codebases are stateful. To maintain continuous coherence across long-running tasks or multi-day sessions, implement a living memory architecture:
- **`docs/memory.md` (The Protocol RAM)**: Contains deployed contract addresses across all networks (e.g. Ethereum Sepolia and Creditcoin Testnet), verified transaction hashes, verified block heights, and major architectural decisions.
- **`docs/handoff.md` (The Execution Stack)**: Contains end-of-session summaries, current test pass rates, active bugs, and the immediate next prompt to run.
- **The Golden Mandate:** Every engineering prompt given to the agent must conclude with:  
  *“As your final action, update the checklist in `docs/memory.md` and append an entry to `docs/handoff.md` summarizing the changes and next steps.”*

### Tier 3: The Ephemeral Task Prompt
The prompt itself should only contain the immediate atomic directive, pointing down to Tier 1 for specifications and Tier 2 for current state.

---

## 2. Prompt Structuring: The COVE Framework

Monolithic prompts (*"Build the private invoice lending feature and connect it to the dashboard"*) fail because the search space is too wide. The agent attempts to generate everything simultaneously, resulting in incomplete files, missing dependencies, and syntax errors.

Instead, every prompt must follow the **COVE** framework:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [C] CONTEXT POINTER  --> Explicit file paths defining constraints and schemas        │
│ [O] OBJECTIVE        --> Exactly ONE atomic, focused deliverable                     │
│ [V] VERIFICATION     --> The precise test command or script to prove correctness     │
│ [E] EXIT CONDITION   --> State update and memory persistence before stopping         │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

### Comparative Breakdown:

| Factor | ❌ Flawed Monolithic Approach | ✅ The COVE Method (VaultBridge Standard) |
|---|---|---|
| **Scope** | Vague, sprawling, multi-component. | Single atomic deliverable. |
| **Context** | Inlined casually into the chat prompt. | Anchored to ground-truth markdown documentation. |
| **Verification** | Assumes code works if it looks correct. | Requires automated test execution before completion. |
| **Continuity** | Context disappears when chat ends. | Commits state to `memory.md` and `handoff.md`. |

---

## 3. The "Isolation-First" Staging Pipeline

When developing complex systems (such as VaultBridge's cross-chain Attestcoin protocol), never allow the agent to attempt an end-to-end integration immediately. Divide development into four strictly gated stages:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Stage 1:      │       │   Stage 2:      │       │   Stage 3:      │       │   Stage 4:      │
│ Isolated Spike  │ ───>  │ Contract Mock   │ ───>  │ E2E Integration │ ───>  │ Presentation &  │
│ (Pure SDK/Math) │       │ (Hardhat Tests) │       │ (Live Testnet)  │       │ God Mode UI     │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

### Stage 1: The Isolated Spike (Pure SDK & Math)
* **Goal**: Validate external SDKs, cryptographic algorithms, or third-party APIs in a standalone CLI script.
* **VaultBridge Example**: Claude built `proof-pipeline/test/pipeline.isolation.test.ts` to test `@gluwa/usc-sdk` against live Sepolia RPCs. The script ran standalone to measure the real ~15-second attestation wait time.
* **Guardrail**: The agent was forbidden from connecting this logic to Creditcoin smart contracts until the isolated proof generator returned a mathematically verified output.

### Stage 2: Contract Logic in Isolation (Mocks & Unit Tests)
* **Goal**: Build the smart contract logic with full unit tests using mocked dependencies.
* **VaultBridge Example**: Claude implemented `VaultLending.sol` in Hardhat with a stubbed precompile verifier at `0x0FD2`. It verified the 5% liquidator bounty math, risk-tiered LTV calculations, and partial repayments across 51 test cases.

### Stage 3: Live End-to-End Integration
* **Goal**: Connect the isolated spike to the deployed contract on real testnets.
* **VaultBridge Example**: Claude implemented `submitProof.ts`, taking live Merkle proofs generated in Stage 1 and submitting them directly to `VaultLending.sol` on the Creditcoin USC Testnet.

### Stage 4: Frontend Presentation & "God Mode"
* **Goal**: Build the user interface, real-time event feeds, and presentation sandboxes only after the underlying engine is proven reliable.

---

## 4. Negative Prompting & Strict Guardrails

Frontier LLMs have an inherent bias toward "helpfulness," which frequently translates into over-refactoring, modifying working code, or generating synthetic placeholder data. Use **negative constraints** to enforce boundaries:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               NEGATIVE PROMPT MATRIX                                   │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ CONSTRAINT TYPE               │ DIRECTIVE TEMPLATE                                     │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ No Premature Wiring           │ "Do NOT connect this to the frontend or any smart       │
│                               │  contract yet. This must run as a standalone script."  │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Preservation of Existing Code │ "Do NOT alter unrelated comments, docstrings, or method│
│                               │  signatures. Edit ONLY lines explicitly requested."    │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Zero-Placeholder Rule         │ "Do NOT use mock data, dummy stubs, or // TODO comments│
│                               │  Implement full parsing or throw an explicit error."   │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Dependency Discipline         │ "Do NOT install external animation or sound packages.   │
│                               │  Use native Web Audio API and standard Tailwind CSS."  │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 5. Combating Context Rot: The Feedback Loop

Context rot occurs when a conversation becomes polluted with repetitive error traces, huge terminal outputs, or hallucinated debugging paths. When context rot sets in, model reasoning degrades rapidly.

### Rules for Clean Context Hygiene:

1. **Never Dump Raw Logs**: Do not paste 500 lines of terminal output into the chat. Extract the top 5-10 lines of the stack trace and the exact file and line number:
   > *"Hardhat test failed in `VaultLendingEconomics.test.js:84` with error: `VM Exception: Division by zero at line 142 in VaultLending.sol`."*
2. **Use Surgical Line-Range Pointers**: When directing code edits, refer to exact line ranges:
   > *"In `contracts/src/creditcoin/VaultLending.sol#L140-L155`, use OpenZeppelin's `Math.mulDiv` to calculate interest before assigning to `accruedInterest`."*
3. **Session Re-anchoring**: Whenever a major milestone is completed (e.g., finishing the contracts and moving to frontend development), start a fresh chat session. Because `docs/memory.md` and `docs/handoff.md` exist in the repo, the agent can instantly re-anchor itself without carrying forward baggage from past iterations.

---

## 6. Prompt Engineering Templates Used in VaultBridge

### Template 1: Smart Contract Implementation
```markdown
Read docs/architecture.md Section [X] and docs/prd.md Section [Y].
Implement [ContractName.sol] in contracts/src/[dir]/.
Constraints:
- Use Solidity 0.8.20 and OpenZeppelin contracts.
- Strictly implement the interfaces defined in docs/architecture.md.
- Implement comprehensive events for all state changes.
Write a Hardhat test suite in contracts/test/[ContractName].test.js covering:
- Happy path execution.
- Unauthorized caller reverts.
- Edge cases and arithmetic overflow protection.
Run `npx hardhat test` to verify all tests pass.
As your final action, update docs/memory.md and docs/handoff.md.
```

### Template 2: Cryptographic / Proof Generation
```markdown
Read docs/architecture-v2.md Section [Z].
Implement [moduleName].ts in [package]/src/.
Requirements:
- Implement client-side AES-256-GCM encryption and ECIES secp256k1 key wrapping.
- Generate deterministic SHA-256 commitments: commitment = sha256(ciphertext).
Write an isolated roundtrip test in [package]/test/[moduleName].roundtrip.test.ts proving:
- encrypt -> wrapKey -> unwrapKey -> decrypt reproduces the exact original payload.
Run `npm test` to verify. Do NOT wire to smart contracts or frontend yet.
Record passing results in docs/memory.md and append to docs/handoff.md.
```

### Template 3: Judge Presentation & "God Mode"
```markdown
Read docs/design-system.md.
Build [SandboxBar].tsx mounted globally in the AppShell layout.
Requirements:
- Floating, high-contrast, dark-mode glassmorphic dock.
- Provide 1-click execution buttons for Scenario 1, Scenario 2, and Scenario 3.
- Integrate tactile audio feedback using native browser Web Audio API in lib/soundFx.ts.
- Ensure all interactive elements have descriptive IDs for testing.
Verify that `npm run build` compiles cleanly with zero TypeScript errors.
```

---

## 7. Summary: The Golden Rules of Agentic Vibe Coding

1. **Context is King:** The quality of the agent's output is directly proportional to the clarity of your markdown specifications in `docs/`.
2. **State is Persistent:** Use `memory.md` and `handoff.md` to turn disconnected chat interactions into an evolving engineering project.
3. **Isolate Hard Problems:** Never build integrations on top of untested foundations. Isolate external SDKs first.
4. **Automate Verification:** Never accept code without an automated test command proving it executes cleanly.
5. **Control Scope with Negatives:** Use explicit negative constraints to keep the agent focused on the task at hand.
