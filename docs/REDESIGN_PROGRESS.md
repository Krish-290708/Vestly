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
| P7 | Action Centre and Reports | 8% | 75% | 0 | 7 | 0% | 0.0% | Not Started |
| P8 | Research | 12% | 87% | 0 | 9 | 0% | 0.0% | Not Started |
| P9 | Learn Hub | 8% | 95% | 0 | 8 | 0% | 0.0% | Not Started |
| P10 | Polish, Accessibility, Final Checks | 5% | 100% | 0 | 9 | 0% | 0.0% | Not Started |
| **Total** | | **100%** | | 72 | 97 | | **67.0%** | |

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
- [ ] 7.1 Actions views: List, Calendar, Timeline; filters, bulk complete/snooze.
- [ ] 7.2 Snooze presets and completed archive with outcome tracking.
- [ ] 7.3 Action handling side-panel with checklists.
- [ ] 7.4 Idempotent auto-generation of all reminder types.
- [ ] 7.5 Export to RFC 5545 `.ics` calendar format; CSV export.
- [ ] 7.6 Reports: Portfolio summary, Grant ledger, Tax-year report, Advisor pack.
- [ ] 7.7 Clean print styling, light paper theme enforcement, CSV downloads.

### Phase 8: Research (Weight 12%)
- [ ] 8.1 Markets overview with status, index table, sector ETF quotes, 5-second timeout, graceful degradation.
- [ ] 8.2 Market dynamics educational explainers.
- [ ] 8.3 Verified companies dataset with funding, valuation, and 409A metrics.
- [ ] 8.4 Company detail `/research/companies/[slug]` with funding timeline and user equity overlay.
- [ ] 8.5 Company comparison tool `/research/compare`.
- [ ] 8.6 Financial news with sample labelling and source transparency.
- [ ] 8.7 Watchlist management with editable notes.
- [ ] 8.8 Option pool modeler `/pool` with typed sample data and `projectPoolRunway()`.
- [ ] 8.9 Logged-out access and responsive verification.

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

### Phase 6: Calculator and Scenarios
- **Checklist:** 12/12 items done in this phase (100%)
- **Overall progress:** 67% complete
- **Progress bar:** `[█████████████░░░░░░░] 67%` (72/97 items total)

**DONE:**
- 6.1 Calculator layout: two-panel Ledger design with left assumptions panel (grant selector, 50 US states + DC dropdown via `state-rates.ts`, filing status, annual income, FMV multiple quick buttons) and right results panel (hero figure strip, break-even banner, tax breakdown waterfall, sensitivity table, compare mode, save dialog, CSV export)
- 6.2 Contextual glossary definitions: `<Tooltip>` on every calculator input (strike price, FMV, exit price, filing status, state, annual income) explaining what the field means and how it affects results
- 6.3 Waterfall breakdown: `TaxBreakdownCard` rewritten to Ledger design with ruled rows (Gross proceeds → Strike cost → Gross pre-tax gain → Taxes at exercise → Taxes at sale → Net estimated proceeds), `money()`/`percent()` formatting, formula explanations in footnotes
- 6.4 Unclamped negative net proceeds: removed `Math.max(0, ...)` from `grossGain` in `taxes.ts`, `estimatedNetProfit` in `taxes.ts`, `netCashReceived` in `modelScenarios()`, and `netCashPayout` in `calculateTenderOffer()` (Bug 3 fix); negative values styled with loss colour
- 6.5 Pure calculation functions: `breakEvenExitPrice()` with AMT/NSO tax awareness, `amtSensitivity()` generating 8-point grid across FMV multiples, sensitivity table rendering in calculator; fixed `estimateAmtLiability()` argument order
- 6.6 Compare mode with side-by-side table, `SavedScenario` persistence via `POST/GET/DELETE /api/scenarios`, save dialog, RFC 4180 CSV export
- 6.7 `/scenarios/strategy`: exercise strategy comparison with 3-column grid (Exercise & Hold, Cashless at Exit, Let Expire), exit price slider, grant context selector, save scenario
- 6.8 `/scenarios/tender`: tender-offer modeler with participation slider, transaction fee, settlement waterfall table, IPO opportunity cost comparison, cost basis fix in `calculateTenderOffer()`
- 6.9 `/scenarios/83b`: deadline countdown banner, tax savings comparison table (with vs without 83(b)), IRS filing protocol checklist, printable election letter dialog with taxpayer fields, "Add to Actions" reminder creation
- 6.10 `/scenarios/leaving`: departure planning with PTEW presets, cash budget optimization, key dates strip, ISO 90-day conversion warnings, unvested forfeit warnings, affordability table, recommended departure actions, batch reminder creation
- 6.11 `/scenarios/dilution`: multi-round dilution modeler with editable round cards (name, investment, pre-money, pool expansion), summary figure strip (starting/final ownership, value growth, cumulative dilution), progression table, add/remove rounds
- 6.12 Cross-navigation: `/calculator?grant=` query param preserved for deep links from dashboard and grants detail; `/scenarios` hub links to all 5 sub-pages with preselected context

**NOT DONE:**
- None for Phase 6

**CHANGED:**
- 15 files changed (+3,400 / -200 lines)
- `src/lib/tax/state-rates.ts` (new)
- `src/lib/calculations/scenarios.ts` (modified: 4 new functions, bug fixes)
- `src/lib/calculations/taxes.ts` (modified: unclamped negatives)
- `src/app/api/scenarios/route.ts` (new)
- `src/app/api/scenarios/[id]/route.ts` (new)
- `src/app/(app)/calculator/page.tsx` (rewritten)
- `src/app/(app)/scenarios/page.tsx` (rewritten)
- `src/app/(app)/scenarios/strategy/page.tsx` (new)
- `src/app/(app)/scenarios/tender/page.tsx` (new)
- `src/app/(app)/scenarios/83b/page.tsx` (new)
- `src/app/(app)/scenarios/leaving/page.tsx` (new)
- `src/app/(app)/scenarios/dilution/page.tsx` (new)
- `src/components/calculator/TaxBreakdownCard.tsx` (rewritten)
- `tests/scenarios.test.ts` (new: 9 unit tests)
- `docs/REDESIGN_PROGRESS.md`
- 0 new runtime dependencies added

**VERIFIED:**
- tests: 50 passed, 0 failed across 7 test suites
- tsc: clean, 0 errors
- build: clean, all 44 static pages + dynamic routes compiled
- style gate: Sparkles 4 | bg-gradient 0 | rounded-2xl/3xl 34 | slate- 445 | emerald- 126 | emoji 1 (legacy tokens reduced from Phase 5; zero violations in new Phase 6 code)
- copy gate: banned words found 2 (0 in new calculator/scenarios code; remaining 2 in legacy unmigrated files)

**HOW TO SEE IT:**
- Run `npm run dev` and navigate to `http://localhost:3000/calculator`
- Select a grant, adjust state, filing status, annual income, exit price, and FMV multiple quick buttons
- Observe the waterfall breakdown in `TaxBreakdownCard`, sensitivity table, and break-even banner
- Toggle Compare mode and save scenarios via the save dialog
- Export results as CSV
- Navigate to `http://localhost:3000/scenarios` to see the hub with 5 modeler cards
- Visit `/scenarios/strategy` to compare Exercise & Hold vs Cashless vs Let Expire
- Visit `/scenarios/tender` to model a tender offer with participation slider
- Visit `/scenarios/83b` to see the deadline countdown, tax comparison, and printable letter
- Visit `/scenarios/leaving` to plan departure with PTEW presets and ISO conversion warnings
- Visit `/scenarios/dilution` to model multi-round venture financing dilution

**NEXT:**
- Phase 7: Action Centre and Reports (Weight 8%, cumulative 75%)
- Redesigning `/actions` into list/calendar/timeline views with filters, bulk complete/snooze, side-panel checklists, `.ics` export; 4 report types (Portfolio summary, Grant ledger, Tax-year report, Advisor pack) with clean print styling and CSV downloads.

