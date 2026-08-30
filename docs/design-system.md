# DESIGN-SYSTEM.md — VaultBridge

> Visual direction adapted from the uploaded FinFlow reference: clean fintech SaaS dashboard, generous whitespace, soft-shadow cards, blue-primary palette, sidebar navigation, live data widgets. Applied here to an invoice-collateral / cross-chain-attestation dashboard.

## 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#2563EB` | Primary buttons, active nav item, links, chart lines |
| `--primary-dark` | `#1D4ED8` | Button hover/active state |
| `--primary-tint` | `#EFF6FF` | Icon backgrounds, active nav background, badge fills |
| `--ink` | `#0F172A` | Headings, primary text |
| `--ink-secondary` | `#64748B` | Body/secondary text |
| `--border` | `#E2E8F0` | Card borders, dividers |
| `--surface` | `#FFFFFF` | Card/panel backgrounds |
| `--bg` | `#F8FAFC` | Page background |
| `--success` | `#16A34A` | Positive deltas, "Paid" / "Attested" status |
| `--success-tint` | `#F0FDF4` | Success badge background |
| `--danger` | `#DC2626` | Negative deltas, "Defaulted" / "Liquidated" status |
| `--danger-tint` | `#FEF2F2` | Danger badge background |
| `--warning` | `#D97706` | "Pending attestation" / "Awaiting proof" status |
| `--warning-tint` | `#FFFBEB` | Warning badge background |

## 2. Typography
- **Font:** Inter (or system fallback: `-apple-system, "Segoe UI", sans-serif`)
- **H1 (page title):** 32px / 700 / `--ink`
- **H2 (section title):** 20px / 600 / `--ink`
- **Card stat value:** 28px / 700 / `--ink`
- **Body:** 14px / 400 / `--ink-secondary`
- **Label/eyebrow:** 12px / 600 / uppercase / `--ink-secondary`, letter-spacing 0.04em

## 3. Layout
- **Sidebar:** 240px fixed width, white background, right border `--border`. Logo top-left, nav items with icon + label, active item gets `--primary-tint` background + `--primary` text/icon + left accent bar.
- **Main content:** `--bg` background, 32px padding, max-width content area, top bar with page title + date range/status filter + wallet connect button (replaces "notification/avatar" from reference).
- **Grid:** 4-column stat card row on desktop → collapses to 2-column (tablet) → 1-column (mobile).
- **Cards:** white surface, 1px `--border`, `border-radius: 16px`, `box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 1px 8px rgba(15,23,42,0.04)`, padding 20–24px.

## 4. Core Components

### Stat Card
Mirrors the FinFlow "Total Revenue / Total Expenses" cards:
- Label (small, secondary) top-left
- Large value bottom-left
- Delta badge top-right (green up / red down, small pill)
- Optional mini sparkline beneath value

VaultBridge stat cards (replace FinFlow's finance metrics):
`Total Collateral Attested` · `Active Loans` · `Available Credit` · `Attestations Pending`

### Attestation Status Badge
Pill-shaped, 12px text, matches status colors above:
- `Attested` → success tint
- `Awaiting Proof` → warning tint (use subtle pulse/spinner animation)
- `Defaulted` → danger tint
- `Borrowed` → primary tint

### Live Attestation Feed (replaces "Recent Transactions")
List rows: icon badge (colored circle with initial/icon) + invoice ID + amount + status badge + timestamp. When a proof is actively being generated, show a live countdown/progress ring for the ~15s attestation wait — this is a key "wow" UI moment, make it visually prominent, not buried.

### Collateral / Loan Chart (replaces "Cash Flow" chart)
Line chart, `--primary` stroke, soft gradient fill beneath (`--primary-tint` fading to transparent), showing total attested collateral value over time.

### Invoice Status Donut (replaces "Expense Breakdown")
Donut chart segmented by invoice status (Attested / Borrowed / Paid / Defaulted), legend to the right with colored dots + percentages, matching the FinFlow donut layout exactly.

### Buttons
- Primary: `--primary` fill, white text, `border-radius: 10px`, subtle shadow, hover → `--primary-dark`
- Secondary: white fill, `--border` outline, `--ink` text

## 5. Motion
- Card hover: subtle lift (`translateY(-2px)`, shadow increase), 150ms ease
- Proof verification moment: progress ring animates 0→100% over the attestation wait, then a checkmark pulse + status badge color transition on success — this should feel like the emotional centerpiece of the demo

## 6. Tone
Trustworthy, precise, data-forward — same register as the FinFlow reference (not playful/crypto-native, not overly technical). Avoid heavy "Web3" visual clichés (neon gradients, glow effects); keep it reading as serious fintech infrastructure.
