# Vestly — Equity Management & Scenario Modeling Platform

> **Design Direction**: "The Ledger" — Quiet, printed, precise financial statement aesthetic. Numbers are heroes.  
> 🌐 **Local Web Application**: **[http://localhost:3000](http://localhost:3000)**  
> ⚡ **Launch**: Run `python Vestly.py` or `npm run dev`

**Vestly** is a financial web application engineered to help startup employees understand, model, calculate, and take strategic action on their stock options (ISOs and NSOs), Restricted Stock Units (RSUs), and Employee Stock Purchase Plans (ESPPs).

Accuracy, clarity, and mathematical precision take precedence over flashy visuals. Numbers are displayed in full monospace with tabular alignment, negative net values are never clamped to zero, and all figures carry explicit calculation notes and statutory disclaimers.

---

## Key Modules

### 1. Overview & Dashboard (`/dashboard`)
- **FigureStrip**: Hero KPI strip featuring vested value, exercise capital required, and pre-tax net proceeds with unclamped negative handling.
- **Vesting Progression**: Cumulative 48-month projection curve with today's marker and 1-year cliff indicator.
- **Schedule**: 12-month calendar horizon and next 10 vesting events breakdown table.
- **Concentration Analysis**: Allocation bars by company and equity instrument type.

### 2. Grants Ledger & Intake (`/grants` & `/grants/[id]`)
- **Dense Ruled Table**: 7-column sortable ledger of all active, exercised, and unvested grants.
- **4-Step Intake Stepper**: Guided grant intake modal with transactional database integrity (`prisma.$transaction`).
- **Grant Detail View**: Sticky in-page navigation, derived terms, exercise history, and timeline.
- **Secure Document Pipeline**: Upload and serve original grant notices from private storage (`storage/uploads/<userId>/`).

### 3. Interactive Tax & ESOP Calculator (`/calculator`)
- **Side-by-Side Analysis**: Assumptions panel (left) and step-by-step mathematical result waterfall (right).
- **Alternative Minimum Tax (AMT)**: Models tentative minimum tax under IRC Section 55 & 56, computing AMTI exemptions, phaseouts, and dual-bracket rates.
- **50 States + DC**: State income tax and capital gains brackets across all US jurisdictions.
- **Compare Mode**: Side-by-side evaluation of two exit valuations and holding periods.

### 4. Scenario Planning Engines (`/scenarios/*`)
- **Exercise Strategy (`/scenarios/strategy`)**: Compare *Exercise & Hold* vs *Cashless Exercise at Exit* vs *Expire* across net proceeds and capital risk.
- **Secondary Tender Offer (`/scenarios/tender`)**: Model company-sponsored tender sales with correct cost basis allocation and tax withholdings.
- **Section 83(b) Election (`/scenarios/83b`)**: 30-day postmark countdown, tax savings analysis, and auto-generated ready-to-mail IRS election letter.
- **Departure Planning (`/scenarios/leaving`)**: 90-day vs extended 10-year post-termination exercise windows (PTEW) and ISO-to-NSO conversion tracking.
- **Venture Dilution (`/scenarios/dilution`)**: Model cap table dilution across Seed through Series D rounds with option pool reserves.

### 5. Action Centre & Reports (`/actions` & `/reports`)
- **Multiple Views**: Operational List, Calendar, Timeline, and immutable Audit Log.
- **Bulk Operations**: Bulk mark completed, snooze (7, 14, 30 days), and export.
- **Calendar Sync**: RFC 5545 `.ics` iCalendar export for Google Calendar, Apple Calendar, and Outlook.
- **Advisor Pack Reports**: 4 clean print-styled financial statements optimized for tax preparers and wealth advisors.

### 6. Learn Hub (`/learn`)
- **24 Educational Guides**: Clear financial reference articles covering equity foundations, taxation, liquidity, and legal rights.
- **Equity Glossary (`/learn/glossary`)**: Alphabetical index of 84 defined terms with A–Z jump navigation and `#slug` anchors.
- **Inline `<Term>` Component**: Interactive hover tooltips providing instant definitions throughout the application.
- **Offer Checklist (`/learn/checklist`)**: 10-point diligence framework for evaluating startup equity offers before signing.
- **Equity Quiz (`/learn/quiz`)**: 10-question self-assessment testing practical understanding of AMT, PTEW, and dilution.

### 7. Research Hub (`/research/*` & `/pool`)
- **Market Benchmarks (`/research/market`)**: Major indices (S&P 500, Nasdaq, Dow Jones, Russell 2000) and sector ETF performance with 5-second API timeouts and offline fallbacks.
- **Verified Companies (`/research/companies`)**: Directory of private tech unicorns (Stripe, Databricks, Figma, Canva) with funding history and 409A trajectories.
- **Company Comparison (`/research/compare`)**: Side-by-side comparison matrix across valuation, 409A marks, and option pool sizing.
- **Option Pool Modeler (`/pool`)**: Department allocations and 8-quarter depletion runway forecasting.

---

## Tech Stack & Architecture

- **Framework**: Next.js 14 (App Router), React 18, TypeScript 5.
- **Styling**: Tailwind CSS with custom CSS variables for light ("Paper") and dark ("Ledger") themes.
- **Database**: SQLite with Prisma ORM (ACID transactional integrity).
- **Icons**: Lucide React.
- **Charts**: Recharts with flat theme reading CSS variables.
- **Testing & Quality**: Vitest, Playwright, `@axe-core/playwright`, custom style and copy gate scanners.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed

### 2. Installation & Database Setup
```bash
# Clone or navigate to the repository
cd ESOPs

# Install dependencies
npm install

# Initialize and seed database
npx prisma generate
npx prisma db push
node prisma/seed.js
```

### 3. Launch Development Server
```bash
# Option A: Python launcher (verifies DB and opens browser)
python Vestly.py

# Option B: Standard NPM command
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Sample Account
Click **"Try with sample data"** on the landing page or login screen to immediately test Vestly with realistic pre-loaded grants (Stripe ISO, Databricks NSO, Figma RSU).

---

## Quality & Verification Gates

```bash
# Run full Vitest test suite (69 tests across 10 suites)
npm test

# Run TypeScript typecheck
npx tsc --noEmit

# Run Next.js production build (71 routes)
npm run build

# Run Copy Gate audit (enforces 0 banned buzzwords)
npm run check:copy -- --report

# Run Style Gate audit (enforces 0 sparkles, 0 gradients)
npm run check:style

# Run WCAG AA accessibility audit (100% clean across 16 views)
node scripts/audit-accessibility.mjs

# Run Content volume & page height audit
node scripts/verify-content-height.mjs
```

---

## Regulatory & Legal Disclaimer

Vestly provides mathematical estimates for educational and scenario planning purposes only. It does not provide legal, tax, or investment advice. Federal and state tax laws, Alternative Minimum Tax thresholds, and corporate securities regulations vary by jurisdiction and individual filing status. Always consult a licensed Certified Public Accountant (CPA) or tax attorney before exercising options or making tax elections.
