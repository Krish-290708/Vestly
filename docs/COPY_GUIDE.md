# Vestly Copy & Tone Guide: "The Ledger"

This document establishes the official tone, copywriting standards, typography conventions, and editorial rules for Vestly. Every interface screen, button, modal, report, and documentation page must adhere to these rules.

---

## 1. Core Philosophy: The Printed Ledger

Vestly is designed to feel like a well-set personal financial statement: quiet, printed, precise, and understated. Numbers are the heroes.

- **Audience**: Employees holding stock options and equity grants, often with limited financial or tax knowledge.
- **Tone**: A careful, knowledgeable friend who understands equity compensation. Calm, factual, never breathless.
- **Perspective**: Second person ("you", "your equity", "your grant").
- **Voice**: Active verbs, short declarative sentences, and concrete numbers instead of vague adjectives.
- **Honesty**: Zero hype, zero fabricated metrics, no marketing puffery. Every estimated number is labelled as an estimate with an as-of date and calculation breakdown.

---

## 2. Banned Marketing Jargon (Zero Tolerance)

The automated copy gate (`npm run check:copy`) scans the codebase and flags these words. None of them may appear anywhere in customer-facing copy, labels, tooltips, or documentation:

| Banned Word / Term | Why It Is Banned | Preferred Replacement |
|---|---|---|
| **Premium** | Unearned status signal; SaaS cliché | Specify the exact feature or remove entirely. |
| **Seamless / Seamlessly** | Empty filler; nothing in tax/finance is truly seamless | "Directly", "automatically", or describe the actual mechanism. |
| **Unlock / Unlocks / Unlocking** | Gamified cliché; implies artificial gating | "See", "calculate", "view", "reveal", "qualify for". |
| **Elevate / Elevates / Elevating** | Corporate hype verb | "Improve", "increase", "deepen", "clarify". |
| **Empower / Empowers / Empowering** | Overused tech platitude | "Help you calculate", "give you visibility into", "let you decide". |
| **Leverage / Leveraging** | Jargon noun repurposed as a lazy verb | "Use", "apply", "take advantage of". |
| **Supercharge / Supercharged** | Aggressive cartoon metaphor | "Accelerate", "model", "calculate", "expand". |
| **Robust / Robustness** | Empty engineer-speak | "Accurate", "verified", "tested", or describe the specific safeguard. |
| **Comprehensive / Comprehensively** | Vague claim that promises everything | "Full", "complete", "detailed", or state the exact scope. |
| **Cutting-edge** | Tech marketing trope | Omit. Let the utility speak for itself. |
| **Institutional-grade** | False authority; Vestly is an employee educational tool | "Carefully calculated", "grounded in IRS rules", "verified". |
| **Journey / Journeys** | Overdramatizes financial planning | "Plan", "timeline", "process", "schedule", "equity". |
| **Game-changing** | Hyperbole | Omit. |
| **AI-powered / AI** | Fashionable buzzword; Vestly runs deterministic mathematical models | "Deterministic calculations", "modeled projections", "tax formulas". |

---

## 3. Prohibited Visual & Structural Clichés

A dedicated style gate (`npm run check:style`) tracks and enforces the elimination of visual noise:

1. **No Sparkles icons**: Never use `Sparkles` or magic wand icons. Vestly does math, not magic.
2. **No background gradients (`bg-gradient-*`)**: Backgrounds are solid paper or surface tokens. Charts use flat, solid fills.
3. **No bubble cards (`rounded-2xl`, `rounded-3xl`)**: Radii are 2px to 4px (hairline rounded) or 6px for dialogs.
4. **No legacy dark navy/slate themes**: Delete hardcoded `slate-*` and `emerald-*` classes. Use semantic tokens: `paper`, `surface`, `sunk`, `rule`, `ink`, `muted`, `accent`, `gain`, `loss`, `warn`, `info`.
5. **No emoji in UI text**: Avoid decorative emojis (📈, 🚀, 💡, 💰, ✨). Icons must be Lucide SVG (16px, 1.5px stroke) and reserved strictly for navigation and explicit user actions. Never place icons inside tinted square tiles.
6. **No "three identical cards with an icon" rows**: Use ruled tables, asymmetric 8/4 or 7/5 grids, and key-value lists instead of repetitive card grids.
7. **No pill badge above the H1**: Avoid the generic startup template layout of a floating pill badge above a centered title.
8. **No center-aligned multi-paragraph body text**: Left-align headings and text. Center alignment is reserved solely for 404 and clean empty states.
9. **No exclamation marks ("!")**: Financial statements do not shout.
10. **No taglines in threes**: Banned: "Track. Model. Act." or "Simple. Fast. Secure."

---

## 4. Typography & Casing Rules

### Sentence Case Everywhere
All headings, subheadings, navigation items, table column headers, and button labels must use **sentence case**:
- **Correct**: "Add a grant", "Your equity", "What is an incentive stock option?", "Download tax summary"
- **Incorrect**: "Add A Grant", "Your Equity", "What Is An Incentive Stock Option?", "Download Tax Summary"

*Exception: Proper nouns and legal acronyms retain standard casing (e.g., ISO, NSO, RSU, ESPP, IRS, Form 3921, AMT, Section 83(b)).*

### Numbers and Currency
- Always apply `tabular-nums` (`font-mono` or `font-variant-numeric: tabular-nums`) to figures and financial tables so digits align vertically.
- **Currency formatting**:
  - Values $\ge \$100$: round to whole dollars without cents (`$142,500`, not `$142,500.00`).
  - Values $<\$100$ (e.g. share strike prices, FMV per share): show two decimal places (`$24.50`, `$0.75`).
- **Signs and colors**:
  - Positive numbers use `text-gain` with an explicit `+` sign or plain text (e.g. `+$45,200`).
  - Negative numbers use `text-loss` with an explicit `-` sign (e.g. `-$12,400`).
  - Never rely on color alone to communicate gains or losses; always include the algebraic sign.

### Dates
- Standard format: `d MMM yyyy` (e.g. `18 Oct 2026`).
- Never use ordinal suffixes: use `18 Oct 2026`, not `18th Oct 2026`.
- For deadlines and milestones, pair the date with relative days: `18 Oct 2026 (in 14 days)`.

---

## 5. Truth in Labelling & Estimates

1. **Estimates**: Every calculated projection, tax liability, or valuation is an estimate. It must be clearly labelled as such:
   - Use the `Figure` component with a superscript footnote marker (`*` or numerical footnote).
   - Provide an expandable "How is this calculated?" popover displaying inputs, formulas, and assumptions.
2. **As-of Dates**: Market data, company valuations, and tax brackets must cite their as-of date (e.g. `FMV $32.00 as of 12 Oct 2026`).
3. **Sample Data**: Demo portfolios or mocked grants must state "Sample data" prominently. Never pretend sample numbers are live user holdings.
4. **Disclaimers**: State clearly on financial summaries:
   > "Vestly is an educational and modeling tool for understanding equity compensation. It is not financial, legal, or tax advice. Consult a certified CPA or tax professional before making exercise decisions."

---

## 6. Before & After Rewrite Catalog

| Context | Before (Legacy SaaS / AI Template) | After (The Ledger Standard) |
|---|---|---|
| **Overview Header** | "Equity Portfolio Dashboard / Real-time vesting progression, exercise costs, and FMV valuation models" | **Your equity**<br>"3 grants across 3 employers. Next vest: 250 units on 1 Nov 2026 (in 11 days)." |
| **Hero Value Prop** | "Make confident decisions on your stock options." | "Know what your stock options are worth, what exercising them will cost, and which dates you cannot miss." |
| **Platform Mission** | "Engineered to empower employees with institutional-grade equity modeling" | "Vestly is a free tool for working out what your equity might be worth. It is not tax advice." |
| **Demo CTA** | "Explore with Demo Portfolio" | "Try it with sample data" |
| **Empty State** | "Add your first stock option grant to unlock vesting projections, AMT calculation, and deadline tracking." | "Add a grant to see when it vests and what it could cost to exercise." |
| **Scenario Planning** | "Unlock Long-Term Capital Gains with our AI-powered scenario calculator" | "Qualify for Long-Term Capital Gains by holding exercised ISO shares for at least one year." |
| **Action Reminder** | "Never miss a critical deadline again with automated smart notifications!" | "Section 83(b) election due in 24 days (9 Nov 2026). IRS deadline cannot be extended." |
| **Tax Estimation** | "Leverage cutting-edge tax engine for seamless AMT calculations" | "Estimated AMT liability for 2026: $14,200 based on $25.00 spread at exercise." |
| **Research Hub** | "Supercharge your market intelligence with institutional-grade comps" | "Compare your private valuation multiple against median public multiples in your sector." |

---

## 7. Verification Checklist for Authors

Before committing any UI change or copy:
- [ ] Heading and buttons are in sentence case.
- [ ] No banned marketing words present.
- [ ] No `Sparkles`, gradients, or decorative emoji.
- [ ] Dates match `18 Oct 2026` pattern.
- [ ] Currency numbers have no cents if $\ge \$100$.
- [ ] Projections carry an "Estimated" label and calculation explanation.
- [ ] `npm run check:copy` and `npm run check:style` have been run.
