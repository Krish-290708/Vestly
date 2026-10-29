# Vestly Redesign Progress Tracker

## Weights & Progress Table

| Phase | Name | Weight | Cumulative | Items Done | Total Items | Phase % | Weighted % | Status |
|---|---|---|---|---|---|---|---|---|
| P0 | Safety Net and Prerequisites | 5% | 5% | 11 | 11 | 100% | 5.0% | COMPLETE |
| P1 | Design System | 10% | 15% | 8 | 8 | 100% | 10.0% | COMPLETE |
| P2 | App Shell, Navigation and Flow | 12% | 27% | 10 | 10 | 100% | 12.0% | COMPLETE |
| P3 | Landing and Auth | 8% | 35% | 9 | 9 | 100% | 8.0% | COMPLETE |
| P4 | Overview (Dashboard) | 9% | 44% | 0 | 12 | 0% | 0.0% | Not Started |
| P5 | Grants | 11% | 55% | 0 | 10 | 0% | 0.0% | Not Started |
| P6 | Calculator and Scenarios | 12% | 67% | 0 | 12 | 0% | 0.0% | Not Started |
| P7 | Action Centre and Reports | 8% | 75% | 0 | 7 | 0% | 0.0% | Not Started |
| P8 | Research | 12% | 87% | 0 | 9 | 0% | 0.0% | Not Started |
| P9 | Learn Hub | 8% | 95% | 0 | 8 | 0% | 0.0% | Not Started |
| P10 | Polish, Accessibility, Final Checks | 5% | 100% | 0 | 9 | 0% | 0.0% | Not Started |
| **Total** | | **100%** | | | | | **35%** | |

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
- [ ] 4.1 PageHeader "Your equity" with dynamic summary sentence.
- [ ] 4.2 "Needs attention" reminders list (or calm empty state).
- [ ] 4.3 Figure strip: vested value, exercise cost, net before tax (unclamped negatives).
- [ ] 4.4 "What if the price changes" FMV multiple controls (x0.5, x1, x2, x5).
- [ ] 4.5 Cumulative stacked vesting chart with today/cliff markers and summary.
- [ ] 4.6 Next 12 months schedule and next 10 vest events table.
- [ ] 4.7 Allocation bars by company and grant type; concentration notice.
- [ ] 4.8 Dense sortable 7-column grants table linking to detail.
- [ ] 4.9 Watchlist strip.
- [ ] 4.10 Recent activity (`AuditLog`) and personalized "Learn next" suggestions.
- [ ] 4.11 Real-data computed first-run checklist.
- [ ] 4.12 `NextSteps` and skeleton loading states; verify >= 2200px rendered height.

### Phase 5: Grants (Weight 11%)
- [ ] 5.1 `/grants` list with search, filters, sorting, table/Gantt timeline view, CSV export.
- [ ] 5.2 Add/edit grant 4-step Stepper modal with live vesting/dates review.
- [ ] 5.3 `/grants/[id]` detail page with sticky in-page section navigation.
- [ ] 5.4 Summary terms in `KeyValueList` with derived values.
- [ ] 5.5 Vesting per-grant chart with markers and full schedule table.
- [ ] 5.6 Value modeling at multiples, cost, spread, estimated tax via `Figure`.
- [ ] 5.7 Exercise event recording (`POST/GET /api/grants/[id]/exercise`), ISO countdown, 83(b) reminder trigger.
- [ ] 5.8 Key dates timeline with idempotent "Add to Actions" buttons.
- [ ] 5.9 Secure document management, notes, audit trail.
- [ ] 5.10 Safe grant editing (PATCH) and confirmation dialog for deletion.

### Phase 6: Calculator and Scenarios (Weight 12%)
- [ ] 6.1 Calculator layout: Assumptions panel (left), Result (right), saved defaults, 50 states + DC tax rates.
- [ ] 6.2 Contextual glossary definitions on all inputs.
- [ ] 6.3 Waterfall breakdown and step-by-step formula explanation.
- [ ] 6.4 Unclamped negative net proceeds handling.
- [ ] 6.5 Pure calculation functions: `breakEvenExitPrice()`, `amtSensitivity()`, sensitivity table.
- [ ] 6.6 Compare mode, `SavedScenario` persistence, drawer, export.
- [ ] 6.7 `/scenarios/strategy` exercise strategies with exit price sliders.
- [ ] 6.8 `/scenarios/tender` tender-offer modeler with cost basis fix.
- [ ] 6.9 `/scenarios/83b` dedicated standalone page, countdown, checklist, printable letter.
- [ ] 6.10 `/scenarios/leaving` departure planning with `planDeparture()` and reminder generation.
- [ ] 6.11 `/scenarios/dilution` equity dilution modeler with `modelDilution()`.
- [ ] 6.12 Cross-navigation from Overview and Grants with preselected context.

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

### Phase 3: Landing and Auth
- **Checklist:** 9/9 items done in this phase (100%)
- **Overall progress:** 35% complete
- **Progress bar:** `[███████░░░░░░░░░░░░░] 35%` (38/108 items total)

**DONE:**
- 3.1 Hero: left-aligned H1 from C6, plain supporting sentence, "Try it with sample data" and "Sign in" buttons, and on the right an interactive "Your grant" illustration with sliders (units, strike, FMV, months elapsed) evaluated live with 4-year schedule / 12-month cliff and statutory AMT estimate; labelled "Illustration, not advice" (no pill badge, no sparkles)
- 3.2 "How an option grant works": 5-node horizontal milestone timeline (grant, cliff at month 12, monthly vesting, exercise, sale) with two descriptive lines per node and a live computed worked example table beneath
- 3.3 "Four kinds of equity": structured ruled comparison table covering ISO, NSO, RSU, and ESPP (who receives it, strike price, when taxed, AMT exposure, where common) with deep links to Learn guides
- 3.4 "What Vestly does": 6 alternating feature rows pairing copy with live interactive components (multi-grant vesting engine, exercise cost & tax waterfall, multi-scenario exit comparison, deadline & 83(b) tracking, CPA report pack preview, company valuation comps)
- 3.5 "A worked example": Alex's 10,000 ISO grant modeled across 3 real outcomes (exercise and hold, cashless at exit, walk away) evaluated live via `modelScenarios()` with detailed tax footnotes
- 3.6 Research and learn preview: live market index strip from `/api/market/indices` with real data source attribution ("Live quote engine" or "Sample data (offline)"), 3 featured equity guide links, and deterministic "Term of the day" from the glossary
- 3.7 "What Vestly does not do": 5 explicit operating truth bullets (US federal rules only, manual 409A inputs, educational modeling not tax advice, zero brokerage connections, private local SQLite storage)
- 3.8 FAQ: 10 native `<details>` accordions with direct answers covering ISO/NSO, strike price, cliff, departure windows, AMT, 83(b), data security, CPA export, and zero cost, plus closing call-to-action
- 3.9 Auth pages: two-column responsive layout for `/login` and `/register` (left: what is in sample data, what is stored, local privacy guarantee; right: form with inline field errors, show/hide password toggle, dynamic password complexity rules, and conditional Google OAuth button)

**NOT DONE:**
- None for Phase 3

**CHANGED:**
- 11 files changed, +1,240 / -280 lines
- 0 new runtime dependencies added
- 1 new test file: `tests/landing-auth.test.ts` (5 tests)

**VERIFIED:**
- tests: 31 passed, 0 failed (4 test files: shell-settings, landing-auth, document, calculations)
- lint: 0 errors
- tsc: clean, 0 errors
- build: clean, all 38 routes prerendered / dynamic matching specifications

**STYLE GATE:**
- Sparkles 6 | bg-gradient 1 | rounded-2xl/3xl 48 | slate- 774 | emerald- 242 | emoji 1

**COPY GATE:**
- banned words found: 4 (0 in new landing and auth code; remaining 4 in legacy unmigrated pages)

**HOW TO SEE IT:**
- Run `npm run dev` and navigate to `http://localhost:3000`
- Interact with the "Your grant" sliders in the hero to see live vesting and AMT spread estimates update
- Scroll through the 5-node grant lifecycle timeline, 4-equity comparison table, 6 capability rows, and Alex's worked example
- Review market indices and the deterministic "Term of the day"
- Expand the 10 FAQ questions
- Visit `http://localhost:3000/login` and `http://localhost:3000/register` to view the two-column layout, password rules checkmarks, and instant demo access

**NEXT:**
- Phase 4: Overview (Dashboard) (Weight 9%, cumulative 44%)
- Redesigning `/dashboard` into "The Ledger" format with PageHeader "Your equity", unclamped net proceeds (fixing underwater options bug), FMV multiple controls (x0.5, x1, x2, x5), stacked vesting chart with today/cliff markers, 12-month schedule table, and allocation bars.

