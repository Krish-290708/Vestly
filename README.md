# Vestly — Institutional-Grade ESOP Management & Market Research Platform

**Vestly** is a financial web application engineered to help startup and corporate employees understand, calculate, manage, and take strategic action on their Employee Stock Ownership Plan (ESOP) grants.

Vestly balances two core pillars:
1. **The Utility**: A personal multi-grant vesting engine, Alternative Minimum Tax (AMT) calculator, and Section 83(b) / PTEW deadline manager.
2. **The Context**: A market research hub featuring live indices, private unicorn 409A valuations, market news via Finnhub, and plain-language equity guides.

Accuracy, clarity, and trust matter more than flashy design. Every number involving assumptions is visually badged as an `ESTIMATE` with persistent statutory disclaimers.

---

## Key Modules & Features

### 1. Multi-Grant Intake & Dashboard
- **Guided Intake Wizard**: Record ISOs, NSOs, RSUs, and ESPPs with strike price, grant date, commencement date, 1-year cliff, and custom vesting schedules.
- **Single-Screen Portfolio KPI Overview**: Total granted units, total vested units, estimated vested value at latest 409A FMV, and total cost to exercise all vested options.
- **Visual Vesting Timeline**: Cumulative 48-month projection curve rendered with Recharts.
- **Grant Agreement Storage**: Upload and store original grant notices and offer letters (PDF/PNG).
- **Plain-Language Statuses**: Clearly flagged as *Vesting*, *Fully Vested*, *Expiring Soon*, or *Exercised*.

### 2. Interactive ESOP & AMT Tax Calculator
- **Mathematical Tax Engine**:
  - **ISOs**: Models paper spread at exercise as an Alternative Minimum Tax (AMT) preference item (IRC Section 56), computes AMTI exemptions and phaseouts, and distinguishes between Qualifying and Disqualifying dispositions.
  - **NSOs**: Treats spread at exercise as ordinary compensation wages subject to federal, state, and FICA/Medicare payroll withholdings.
  - **RSUs**: Models 100% of fair market value at vesting date as ordinary income.
- **Dynamic Controls**: Toggle federal tax brackets (24%–37%), state tax rates (CA, NY, WA, TX, etc.), filing status (Single vs MFJ), and holding periods (Short-term vs Long-term).

### 3. Scenario Planning & Section 83(b) Decision Engine
- **Side-by-Side Strategy Modeling**: Compare *Exercise Now & Hold* vs *Cashless Exercise at Exit* vs *Do Not Exercise / Expire* across net take-home, upfront capital risk, and effective tax rates.
- **IRS Section 83(b) Helper**: Calculates the strict 30-calendar-day postmark deadline, forecasts tax savings on early exercise, and generates a ready-to-mail certified IRS Section 83(b) election letter.

### 4. Action Center & Audit Trail
- **Milestone Deadlines**: Proactive notifications for vesting tranches, 90-day post-termination exercise windows (PTEW), and 10-year option expirations.
- **Action Controls**: Mark milestones as *Exercised*, *Sold*, *Completed*, or *Snooze 14 Days*.
- **Immutable Audit Log**: Historical log capturing every action taken per grant.

### 5. CPA & Financial Advisor Report
- **Clean Printable View**: Formatted specifically for tax advisors and wealth managers (`@media print` optimized).
- Includes portfolio aggregate totals, individual grant schedules, and tax preparation notes for IRS Forms 8801 and 1040.

### 6. Research & Learn Hub
- **Market Overview**: Major index tracking (S&P 500, Nasdaq, Dow Jones, Russell 2000) and sector momentum snapshots.
- **Company Explorer**: Searchable directory of private tech unicorns (Stripe, Databricks, Figma, Canva) and public leaders (Apple, NVIDIA) with 409A trajectories and funding histories.
- **Employer Cross-Linking**: Automatically links company profiles to your active stock grants.
- **Live News Feed**: Market and tech news via Finnhub API with category filters and outbound source links.
- **Education Center**: 7 short, skimmable explainer guides covering ISOs, NSOs, RSUs, 409A valuations, vesting cliffs, and AMT.
- **Equity Glossary**: Interactive search across 30+ financial terms.
- **Watchlist**: Follow employer or target companies to track valuation updates.

---

## Tech Stack & Architecture

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **Visualizations**: Recharts for responsive area and line charts.
- **Database**: SQLite with Prisma ORM (zero-config, typed relational models for `User`, `Company`, `Grant`, `VestingEvent`, `ActionReminder`, `AuditLog`, `WatchlistItem`).
- **Auth**: JWT session cookies with bcrypt password hashing + One-Click Demo Mode (`demo@vestly.app`).
- **Market Data APIs**: Server-side Finnhub integration with in-memory TTL caching and high-fidelity offline fallbacks.

---

## Quick Start & Running Locally

### 1. Prerequisites
- Node.js 18+ installed

### 2. Installation
```bash
# Clone or navigate to the directory
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
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Explore Instantly
Click **"Explore with Demo Account"** on the landing page or login screen to immediately test Vestly with realistic pre-loaded grants:
- **Stripe** (ISO: 12,000 units @ $8.50 strike, $26.50 409A)
- **Databricks** (NSO: 4,000 units @ $45.00 strike, $73.50 409A)
- **Figma** (RSU: 2,400 units, $32.00 409A)

---

## Environment Variables & API Keys

Create a `.env` file from `.env.example`:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secure_secret_key_here"

# Finnhub API Key (Free tier: 60 calls/min)
# Get a free key at: https://finnhub.io/
FINNHUB_API_KEY=""

# Alpha Vantage API Key (Free tier: 25 requests/day)
ALPHA_VANTAGE_API_KEY=""
```

> **Note**: If `FINNHUB_API_KEY` is left blank, Vestly operates in resilient offline mode using verified fallback snapshots and indicators so you can test all features without mandatory API sign-ups.

---

## Compliance & Legal Disclaimer

Vestly provides mathematical estimates for educational and scenario planning purposes only. It does not provide financial, investment, legal, or tax advice. Equity compensation taxation is complex and depends on household income, deductions, state residence, and AMT phaseouts. Always consult a licensed CPA or tax attorney before exercising options or making financial commitments.

