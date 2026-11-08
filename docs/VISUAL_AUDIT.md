# Vestly Visual Audit Catalog: Before vs. After

> **Transformation Summary**: Complete structural redesign of Vestly from a generic AI/SaaS dashboard template into "The Ledger" — a quiet, printed financial statement aesthetic where numbers are heroes.

---

## 1. Audit Overview & Methodology

| Metric | Baseline (Pre-Redesign) | Current ("The Ledger") | Change |
|---|---|---|---|
| **Design Direction** | Generic dark SaaS with neon emerald accents | Printed financial statement / annual report | Complete shift to muted tokens |
| **Banned Marketing Words** | Multiple ("institutional-grade", "seamless") | Exactly **0** banned words across entire codebase | 100% compliant |
| **Decorative Sparkles** | Multiple glowing sparkle icons | **0** sparkles | Completely eliminated |
| **Gradients** | Saturated linear background gradients | **0** gradients; pure flat paper/ink surfaces | Flat ruled surfaces |
| **Border Radii** | `rounded-2xl` (16px) & `rounded-3xl` (24px) | Strict `rounded-xs` (2px) and `rounded-sm` (4px) | Crisp architectural geometry |
| **Negative Net Numbers** | Clamped to $0 or hidden | Unclamped with `--loss` styling | Truth in numbers |
| **WCAG AA Violations** | Untested baseline | **0** critical, **0** serious, **0** moderate | 100% WCAG AA compliant |
| **Automated Tests** | 3 calculation tests | **69** tests across 10 suites | Comprehensive coverage |

---

## 2. Route-by-Route Visual Catalog

### 2.1 Marketing & Landing (`/`)
- **Baseline Files**: `.redesign/before/landing-1440.png`, `.redesign/before/landing-390.png`
- **Redesign Files**: `.redesign/after/landing-1920.png`, `.redesign/after/landing-1440.png`, `.redesign/after/landing-1024.png`, `.redesign/after/landing-768.png`, `.redesign/after/landing-390.png`, `.redesign/after/landing-360.png`
- **Key Enhancements**:
  - Live interactive "Your grant" slider hero directly on paper canvas.
  - "How an option grant works" horizontal timeline with milestone badges.
  - 4-column comparison table comparing ISO vs NSO vs RSU vs ESPP.
  - Ruled 3-outcome worked example table (bear, base, bull case).
  - "What Vestly does not do" plain-text transparency bullets.
  - Native `<details>` FAQ section with 10 questions.

### 2.2 Dashboard (`/dashboard`)
- **Baseline Files**: `.redesign/before/dashboard-1440.png`, `.redesign/before/dashboard-390.png`
- **Redesign Files**: `.redesign/after/dashboard-*.png`
- **Key Enhancements**:
  - Rendered height: **4,282px** (exceeding 2,200px requirement), providing thorough information density.
  - FigureStrip with Popover breakdown ("How is this calculated?").
  - Unclamped negative net proceeds with oxblood loss styling.
  - Cumulative 48-month vesting chart with today and 1-year cliff markers.
  - 12-month calendar schedule and next 10 vest events table.
  - Allocation breakdown by company and equity instrument.

### 2.3 Grants Ledger (`/grants` & `/grants/[id]`)
- **Baseline Files**: `.redesign/before/grants-1440.png`, `.redesign/before/grants-390.png`
- **Redesign Files**: `.redesign/after/grants-*.png`
- **Key Enhancements**:
  - Dense 7-column sortable table with status badges and vesting progress bars.
  - 4-step Stepper modal for guided grant intake with transactional integrity.
  - Grant detail page with sticky in-page navigation and derived valuation terms.
  - Exercise recording event log with ISO disqualifying disposition warnings.
  - Secure private document storage pipeline outside public web root.

### 2.4 Calculator & Scenarios (`/calculator` & `/scenarios/*`)
- **Baseline Files**: `.redesign/before/calculator-*.png`, `.redesign/before/scenarios-*.png`
- **Redesign Files**: `.redesign/after/calculator-*.png`, `.redesign/after/scenarios-*.png`
- **Key Enhancements**:
  - Side-by-side assumptions panel (left) and mathematical result waterfall (right).
  - 50 states + DC income and capital gains tax brackets.
  - Contextual glossary definitions on all calculation parameters.
  - Dedicated scenario tools: Strategy, Secondary Tender, Section 83(b), Departure/PTEW, Dilution.

### 2.5 Action Centre & Reports (`/actions` & `/reports`)
- **Baseline Files**: `.redesign/before/actions-*.png`, `.redesign/before/reports-*.png`
- **Redesign Files**: `.redesign/after/actions-*.png`, `.redesign/after/reports-*.png`
- **Key Enhancements**:
  - Multiple operational views: List, Calendar, Timeline, and Audit Log.
  - Bulk operations: complete, snooze (7, 14, 30 days), and export.
  - RFC 5545 `.ics` iCalendar subscription export.
  - 4 specialized financial reports: Portfolio summary, Grant ledger, Tax-year summary, Advisor pack.
  - Print stylesheet optimized for letter/A4 paper.

### 2.6 Learn Hub (`/learn`, `/learn/[slug]`, `/learn/glossary`, `/learn/checklist`, `/learn/quiz`)
- **Baseline Files**: `.redesign/before/learn-1440.png`, `.redesign/before/learn-390.png`
- **Redesign Files**: `.redesign/after/learn-*.png`, `.redesign/after/learn-article-*.png`, `.redesign/after/learn-glossary-*.png`, `.redesign/after/learn-checklist-*.png`, `.redesign/after/learn-quiz-*.png`
- **Key Enhancements**:
  - 24 comprehensive markdown articles across 5 learning paths.
  - Statically generated article reader with worked calculation breakdowns and tool banners.
  - 84-term alphabetical glossary with A-Z quick jump bar and `#slug` anchors.
  - Inline `<Term>` component providing hover definitions across the application.
  - 10-point startup offer evaluation checklist with readiness score.
  - 10-question equity knowledge quiz with immediate feedback and reading recommendations.

### 2.7 Research Hub (`/research/*` & `/pool`)
- **Baseline Files**: `.redesign/before/research-*.png`, `.redesign/before/pool-*.png`
- **Redesign Files**: `.redesign/after/research-*.png`, `.redesign/after/pool-*.png`
- **Key Enhancements**:
  - Live benchmark index table and sector ETF performance grid.
  - Market session status indicator and strict 5-second API timeouts with offline fallbacks.
  - Verified private unicorn directory with 409A history and funding milestones.
  - Multi-company comparison matrix.
  - Option pool runway modeler with 8-quarter depletion trajectory.
