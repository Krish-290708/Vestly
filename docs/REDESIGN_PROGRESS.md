# Vestly Redesign Progress Tracker

## Weights & Progress Table

| Phase | Name | Weight | Cumulative | Items Done | Total Items | Phase % | Weighted % | Status |
|---|---|---|---|---|---|---|---|---|
| P0 | Safety Net and Prerequisites | 5% | 5% | 11 | 11 | 100% | 5.0% | COMPLETE |
| P1 | Design System | 10% | 15% | 8 | 8 | 100% | 10.0% | COMPLETE |
| P2 | App Shell, Navigation and Flow | 12% | 27% | 10 | 10 | 100% | 12.0% | COMPLETE |
| P3 | Landing and Auth | 8% | 35% | 9 | 9 | 100% | 8.0% | COMPLETE |
| P4 | Overview (Dashboard) | 9% | 44% | 12 | 12 | 100% | 9.0% | COMPLETE |
| P5 | Grants | 11% | 55% | 10 | 10 | 100% | 11.0% | COMPLETE |
| P6 | Calculator and Scenarios | 12% | 67% | 12 | 12 | 100% | 12.0% | COMPLETE |
| P7 | Action Centre and Reports | 8% | 75% | 7 | 7 | 100% | 8.0% | COMPLETE |
| P8 | Research | 12% | 87% | 9 | 9 | 100% | 12.0% | COMPLETE |
| P9 | Learn Hub | 8% | 95% | 0 | 8 | 0% | 0.0% | Not Started |
| P10 | Polish, Accessibility, Final Checks | 5% | 100% | 0 | 9 | 0% | 0.0% | Not Started |
| **Total** | | **100%** | | 88 | 97 | | **87.0%** | |

---

## Phase Checklists

### Phase 0: Safety Net and Prerequisites (Weight 5%)
- [x] 0.1 Git safety: status clean, tag `pre-redesign` on `main`, branch `ui-redesign`, `.gitignore` has `audit/ .env *.db storage/ .redesign/ node_modules .next` (verified with `git check-ignore`).
- [x] 0.2 Tracking: `docs/REDESIGN_PROGRESS.md` created with weights, checklists, and template.
- [x] 0.3 Baseline: Run `npm install`, `npx prisma generate`, `npx prisma db push`, `npm run prisma:seed`, `npm run build`. Record results.
- [x] 0.4 Tooling: Add `vitest`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `eslint-config-next`. Setup `.eslintrc.json`. Run `npx playwright install chromium`.
- [x] 0.5 Baseline visuals: Playwright script capturing screenshots of every route at 1440x900 and 390x844 into `.redesign/before/` (authenticated via `/api/auth/demo`).
- [x] 0.6 Unit tests: Configure Vitest for `npm test`. Port `tests/calculations.test.ts` to Vitest. Delete `tests/test-calculations.js` and `tests/run-tests.js`. Add tests for 10-unit grant, `cliffMonths = 0`, ISO/NSO outcomes. Verify mutation failure.
- [x] 0.7 Section 83(b) calculation & reminder fix: Deadline = purchase date + 30 days in `calculate83bAnalysis`, scenarios caller, and `api/grants/route.ts`. Create general reminder at grant intake without countdown; dated reminder at exercise. Add unit tests.
- [x] 0.8 Private upload pipeline: Files saved to `storage/uploads/<userId>/`, MIME validation, 10MB limit. Serve via authenticated `GET /api/grants/[id]/document`. Remove `public/uploads`.
- [x] 0.9 Format library: `src/lib/format.ts` implementing `money()`, `compactMoney()`, `units()`, `percent()`, `date()`, `relativeDays()`, `signedMoney()`, with comprehensive tests.
- [x] 0.10 Transactional grant creation: Wrap grant + vesting events + reminders creation in `prisma.$transaction`.
- [x] 0.11 Prisma schema & seed enhancements: Add `User.filingStatus`, `User.stateCode`, `User.annualIncome`, `WatchlistItem.note`, `SavedScenario`, `LearnProgress`. Run `npx prisma db push` and update seed.

### Phase 1: Design System (Weight 10%)
- [x] 1.1 Typography and CSS variables for both themes per C1/C2; no-flash inline theme script; `tailwind.config.ts` updated; old colors and custom shadows removed.
- [x] 1.2 UI Primitives in `src/components/ui/` (Button, LinkButton, Field, Input, Select, Textarea, Checkbox, Switch, Tabs, Table, Badge, Callout, Dialog, Popover, Tooltip, Skeleton, EmptyState, Stat, Stepper, ProgressBar, KeyValueList, Section, PageHeader, Footnotes).
- [x] 1.3 `Figure` component (number + footnote marker + "How is this calculated?" popover), `Money`, `Units`, `DateText`.
- [x] 1.4 Toast system: `ToastProvider` + `useToast()`; replace `alert()`/`confirm()`.
- [x] 1.5 Flat chart theme `src/components/charts/theme.tsx` reading CSS variables, today marker, accessible text summary.
- [x] 1.6 `Logo` SVG component (stepped line + wordmark) and `app/icon.svg`, zero Sparkles.
- [x] 1.7 Dev-only route `/dev/styleguide` showcasing all primitives in light/dark with contrast checks.
- [x] 1.8 `docs/COPY_GUIDE.md` and check scripts (`check-copy.mjs`, `check-style.mjs`), `npm run check:copy`, `npm run check:style`.

### Phase 2: App Shell, Navigation and Flow (Weight 12%)
- [x] 2.1 Route groups with `git mv`: `(marketing)`, `(auth)`, `(app)`, `(content)` with dedicated layouts.
- [x] 2.2 `middleware.ts` for route protection and `?next=` handling.
- [x] 2.3 Navigation: replace internal `<a href>` with `next/link`, external links with `rel="noopener noreferrer"`.
- [x] 2.4 Signed-in shell with collapsible sidebar (three groups), top bar, breadcrumbs, command palette trigger, theme toggle, mobile bottom bar.
- [x] 2.5 Command palette (Ctrl/Cmd+K) with search API `GET /api/search?q=`.
- [x] 2.6 `GrantContext` + `?grant=` context persistence.
- [x] 2.7 `NextSteps` component wiring journey links.
- [x] 2.8 Segment `loading.tsx` skeletons, `error.tsx`, `not-found.tsx`.
- [x] 2.9 New structured footer (Product, Research, Learn sitemap, refresh timestamp, disclaimer).
- [x] 2.10 Settings page `/settings` with Profile, Tax defaults, Notifications, Appearance, Data export/deletion.

### Phase 3: Landing and Auth (Weight 8%)
- [x] 3.1 Hero with interactive "Your grant" live sliders.
- [x] 3.2 "How an option grant works" horizontal timeline with live worked example.
- [x] 3.3 "Four kinds of equity" comparison table linking to Learn.
- [x] 3.4 "What Vestly does" 6 alternating feature rows with live components.
- [x] 3.5 "A worked example" 3-outcome ruled table.
- [x] 3.6 Research and learn live preview strip.
- [x] 3.7 "What Vestly does not do" plain-text truth bullets.
- [x] 3.8 FAQ native `<details>` with 10 questions.
- [x] 3.9 Auth pages two-column layout with inline validation and password rules.

### Phase 4: Overview (Dashboard) (Weight 9%)
- [x] 4.1 PageHeader "Your equity" with dynamic summary sentence.
- [x] 4.2 "Needs attention" reminders list (or calm empty state).
- [x] 4.3 Figure strip: vested value, exercise cost, net before tax (unclamped negatives).
- [x] 4.4 "What if the price changes" FMV multiple controls (x0.5, x1, x2, x5).
- [x] 4.5 Cumulative stacked vesting chart with today/cliff markers and summary.
- [x] 4.6 Next 12 months schedule and next 10 vest events table.
- [x] 4.7 Allocation bars by company and grant type; concentration notice.
- [x] 4.8 Dense sortable 7-column grants table linking to detail.
- [x] 4.9 Watchlist strip.
- [x] 4.10 Recent activity (`AuditLog`) and personalized "Learn next" suggestions.
- [x] 4.11 Real-data computed first-run checklist.
- [x] 4.12 `NextSteps` and skeleton loading states; verify >= 2200px rendered height.

### Phase 5: Grants (Weight 11%)
- [x] 5.1 `/grants` list with search, filters, sorting, table/Gantt timeline view, CSV export.
- [x] 5.2 Add/edit grant 4-step Stepper modal with live vesting/dates review.
- [x] 5.3 `/grants/[id]` detail page with sticky in-page section navigation.
- [x] 5.4 Summary terms in `KeyValueList` with derived values.
- [x] 5.5 Vesting per-grant chart with markers and full schedule table.
- [x] 5.6 Value modeling at multiples, cost, spread, estimated tax via `Figure`.
- [x] 5.7 Exercise event recording (`POST/GET /api/grants/[id]/exercise`), ISO countdown, 83(b) reminder trigger.
- [x] 5.8 Key dates timeline with idempotent "Add to Actions" buttons.
- [x] 5.9 Secure document management, notes, audit trail.
- [x] 5.10 Safe grant editing (PATCH) and confirmation dialog for deletion.

### Phase 6: Calculator and Scenarios (Weight 12%)
- [x] 6.1 Calculator layout: Assumptions panel (left), Result (right), saved defaults, 50 states + DC tax rates.
- [x] 6.2 Contextual glossary definitions on all inputs.
- [x] 6.3 Waterfall breakdown and step-by-step formula explanation.
- [x] 6.4 Unclamped negative net proceeds handling.
- [x] 6.5 Pure calculation functions: `breakEvenExitPrice()`, `amtSensitivity()`, sensitivity table.
- [x] 6.6 Compare mode, `SavedScenario` persistence, drawer, export.
- [x] 6.7 `/scenarios/strategy` exercise strategies with exit price sliders.
- [x] 6.8 `/scenarios/tender` tender-offer modeler with cost basis fix.
- [x] 6.9 `/scenarios/83b` dedicated standalone page, countdown, checklist, printable letter.
- [x] 6.10 `/scenarios/leaving` departure planning with `planDeparture()` and reminder generation.
- [x] 6.11 `/scenarios/dilution` equity dilution modeler with `modelDilution()`.
- [x] 6.12 Cross-navigation from Overview and Grants with preselected context.

### Phase 7: Action Centre and Reports (Weight 8%)
- [x] 7.1 Actions views: List, Calendar, Timeline; filters, bulk complete/snooze.
- [x] 7.2 Snooze presets and completed archive with outcome tracking.
- [x] 7.3 Action handling side-panel with checklists.
- [x] 7.4 Idempotent auto-generation of all reminder types.
- [x] 7.5 Export to RFC 5545 `.ics` calendar format; CSV export.
- [x] 7.6 Reports: Portfolio summary, Grant ledger, Tax-year report, Advisor pack.
- [x] 7.7 Clean print styling, light paper theme enforcement, CSV downloads.

### Phase 8: Research (Weight 12%)
- [x] 8.1 Markets overview with status, index table, sector ETF quotes, 5-second timeout, graceful degradation.
- [x] 8.2 Market dynamics educational explainers.
- [x] 8.3 Verified companies dataset with funding, valuation, and 409A metrics.
- [x] 8.4 Company detail `/research/companies/[slug]` with funding timeline and user equity overlay.
- [x] 8.5 Company comparison tool `/research/compare`.
- [x] 8.6 Financial news with sample labelling and source transparency.
- [x] 8.7 Watchlist management with editable notes.
- [x] 8.8 Option pool modeler `/pool` with typed sample data and `projectPoolRunway()`.
- [x] 8.9 Logged-out access and responsive verification.

### Phase 9: Learn Hub (Weight 8%)
- [ ] 9.1 Learn index with search, starter guide, and 5 learning paths.
- [ ] 9.2 Article reader `/learn/[slug]` with reading progress, takeaways, tool links.
- [ ] 9.3 24 comprehensive markdown articles covering core equity topics.
- [ ] 9.4 Verified calculations in examples tested via Vitest.
- [ ] 9.5 Glossary with 80+ terms and A-Z index.
- [ ] 9.6 Inline `<Term>` component with hover definitions.
- [ ] 9.7 Offer evaluation checklist tool.
- [ ] 9.8 10-question equity knowledge quiz.

### Phase 10: Polish, Accessibility, Final Checks (Weight 5%)
- [ ] 10.1 Full WCAG AA audit with `@axe-core/playwright`; keyboard walkthrough of J1-J3.
- [ ] 10.2 Responsive verification across 360px to 1920px viewports; `.redesign/after/` screenshots.
- [ ] 10.3 Performance optimization and layout stability checks.
- [ ] 10.4 Automated style gate (zero banned styles) and copy gate (zero banned words).
- [ ] 10.5 Full test suite, lint, typecheck, build, and seed validation on fresh database.
- [ ] 10.6 Content volume and page height verification script.
- [ ] 10.7 Comprehensive documentation updates (`README.md`, `docs/ARCHITECTURE.md`).
- [ ] 10.8 Limitations disclosure and before/after visual audit catalog.
- [ ] 10.9 Final review report and branch handoff.

---

## Decisions Taken
- Initialized branch `ui-redesign` from `main` with safety tag `pre-redesign`.
- Retained strict zero-data-loss and non-destructive git practices.

---

## Known Limitations
- Tax calculations model US federal tax and simplified state rates; not formal tax advice.
- Private company FMV relies on user-provided inputs or verified sample records.

---

## Latest Report

### Phase 8: Research
- **Checklist:** 9/9 items done in this phase (100%)
- **Overall progress:** 87% complete
- **Progress bar:** `[█████████████████░░░] 87%` (88/97 items total)

**DONE:**
- 8.1 Markets overview (`/research/market`): Ruled index benchmark table (S&P 500, Nasdaq, Dow Jones, Russell 2000), sector ETF quote grid (XLK, XLC, XLF, XLY, XLV, XLE), market session status badge (Open / Closed / Pre-market), strict 5-second timeout via `AbortSignal.timeout(5000)`, and graceful offline degradation with verified fallbacks
- 8.2 Market dynamics educational explainers: 4 educational cards explaining public comparable multiples and 409A appraisals, interest rate discount rates on venture valuations, secondary market discounts vs preferred stock, and IPO listing readiness
- 8.3 Verified companies dataset (`/research/companies`): Ledger-style table featuring private venture valuations, latest 409A appraisal marks, common vs preferred discounts, sector filters, public/private toggles, search filtering, and active user grant indicators
- 8.4 Company detail (`/research/companies/[slug]` & `/api/market/companies/[slug]`): Comprehensive profile with capital structure metrics, chronological funding rounds timeline (Seed through Series D / Tender), 409A price progression table, watchlist toggle with diligence notes, and personalized user equity overlay for active option holders
- 8.5 Company comparison tool (`/research/compare`): Multi-company side-by-side comparison matrix (up to 3 companies) evaluating valuation, 409A per share, standard option pool sizing (12-15%), post-termination exercise windows (90-day vs 10-year), and user holdings
- 8.6 Financial news (`/research/news`): Category-filtered market wire with source transparency callout, sample vs live wire verification badges, relative publication timestamps, and external link compliance
- 8.7 Watchlist management (`/research/watchlist`): Followed companies list with inline editable diligence notes backed by `PATCH /api/watchlist`, current 409A valuation, direct links to company profiles, remove actions, and EmptyState
- 8.8 Option pool modeler (`/pool` & `src/lib/calculations/pool.ts`): Pure calculation engine `projectPoolRunway()` with typed company presets (Stripe, Databricks, Figma, Anthropic) and custom parameter support; hero figure strip (pool %, overhang %, unallocated reserve, runway quarters), department distribution table, and 8-quarter depletion trajectory table with low-reserve warnings
- 8.9 Logged-out access and responsive verification: Full public unauthenticated access across all `/research/*` routes in `middleware.ts`, with graceful elevation for user equity overlays and watchlist tracking

**NOT DONE:**
- None for Phase 8

**CHANGED:**
- 11 files changed (+2,100 / -850 lines)
- `src/lib/calculations/pool.ts` (new)
- `src/lib/finnhub.ts` (modified: 5-second timeout, sector ETFs, session status)
- `src/app/api/watchlist/route.ts` (modified: PATCH for notes)
- `src/app/api/market/companies/[slug]/route.ts` (new)
- `src/app/(content)/research/market/page.tsx` (rewritten)
- `src/app/(content)/research/companies/page.tsx` (rewritten)
- `src/app/(content)/research/companies/[slug]/page.tsx` (new)
- `src/app/(content)/research/compare/page.tsx` (new)
- `src/app/(content)/research/news/page.tsx` (rewritten)
- `src/app/(content)/research/watchlist/page.tsx` (rewritten)
- `src/app/(app)/pool/page.tsx` (rewritten)
- `tests/research.test.ts` (new: 7 unit tests)
- `docs/REDESIGN_PROGRESS.md`
- 0 new runtime dependencies added

**VERIFIED:**
- tests: 60 passed, 0 failed across 9 test suites
- tsc: clean, 0 errors
- build: clean, all 44 static pages + dynamic routes compiled
- style gate: Sparkles 2 | bg-gradient 0 | rounded-2xl/3xl 13 | slate- 191 | emerald- 51 | emoji 1 (slate reduced by 149, emerald by 51, rounded-2xl by 15; zero violations in new Phase 8 code)
- copy gate: banned words found 1 (0 in Phase 8 code; 1 remaining in unmigrated `learn/page.tsx`)

**HOW TO SEE IT:**
- Run `npm run dev` and navigate to `http://localhost:3000/research/market`
- View market session status, benchmark quotes table, sector ETF performance grid, and the 4 market dynamics explainers
- Visit `http://localhost:3000/research/companies` to browse verified companies with sector and status filters
- Click any company (e.g. `/research/companies/stripe`) to inspect funding timeline, 409A history, user holdings overlay, and add a watchlist note
- Visit `http://localhost:3000/research/compare` to compare Stripe, Databricks, and Figma side-by-side
- Visit `http://localhost:3000/research/news` to review curated articles with verification status tags
- Visit `http://localhost:3000/research/watchlist` to view followed companies and edit diligence notes
- Visit `http://localhost:3000/pool` to model option pool runway, test company presets, and inspect the 8-quarter depletion table

**NEXT:**
- Phase 9: Learn Hub (Weight 8%, cumulative 95%)
- Learn index with search (`/learn`), Article reader (`/learn/[slug]`), 24 comprehensive markdown equity articles, calculation verification via Vitest, Glossary with 80+ terms and A-Z index (`/learn/glossary`), Inline `<Term>` component, Offer checklist tool (`/learn/checklist`), and 10-question equity quiz (`/learn/quiz`).

