/**
 * 24 Equity Educational Articles
 * "The Ledger" Design System — Clear, factual financial reference guides
 */

export interface LearnArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Foundations' | 'Taxation' | 'Liquidity' | 'Legal' | 'Evaluation';
  path: string;
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  content: string;
  relatedTool?: {
    label: string;
    href: string;
  };
  workedCalculation?: {
    description: string;
    units: number;
    strikePrice: number;
    fmvAtExercise: number;
    spread: number;
    taxEstimate: number;
  };
}

export const LEARN_PATHS = [
  {
    id: 'foundations',
    title: 'Foundations of startup equity',
    description: 'Core concepts: stock options, instruments, vesting schedules, and share classes.',
    articleCount: 5,
  },
  {
    id: 'taxation',
    title: 'Tax planning and AMT mastery',
    description: 'Alternative minimum tax, Section 83(b) elections, state rates, and credit recovery.',
    articleCount: 5,
  },
  {
    id: 'liquidity',
    title: 'Liquidity, secondaries, and exits',
    description: 'Secondary market tenders, IPO lockups, M&A cash/stock deals, and net settlement.',
    articleCount: 5,
  },
  {
    id: 'legal',
    title: 'Legal rights and departure planning',
    description: 'Post-termination exercise windows, 10-year expiration, and transfer restrictions.',
    articleCount: 5,
  },
  {
    id: 'evaluation',
    title: 'Offer evaluation and cap table dilution',
    description: 'Assessing job offers, dilution through venture rounds, and option pool sizing.',
    articleCount: 4,
  },
];

export const LEARN_ARTICLES: LearnArticle[] = [
  // PATH 1: Foundations
  {
    id: 'esop-basics',
    slug: 'esop-basics',
    title: 'ESOP basics: how startup stock options work',
    category: 'Foundations',
    path: 'Foundations of startup equity',
    readTime: '4 min read',
    summary: 'Stock options grant the right to buy company shares at a locked-in strike price. Learn how value is created, what risks exist, and how options differ from common stock.',
    keyTakeaways: [
      'An option is a contract granting the right to purchase shares at a fixed strike price.',
      'Vesting requires continuous service before you earn the right to exercise.',
      'Options only produce net value when the exit share price exceeds the strike price plus taxes.',
      'Underwater options carry zero cash value but create no obligation to purchase.',
    ],
    relatedTool: { label: 'Model an exit scenario', href: '/calculator' },
    workedCalculation: {
      description: '10,000 options granted at $2.00 strike price, company exits at $20.00 per share.',
      units: 10000,
      strikePrice: 2.0,
      fmvAtExercise: 20.0,
      spread: 180000,
      taxEstimate: 45000,
    },
    content: `
### What is an employee stock option?
A stock option is an agreement between an employer and an employee. It grants the employee the legal right—without obligation—to buy a set number of company common shares at a fixed price, known as the **strike price** (or exercise price).

The company board sets the strike price at or above fair market value (FMV) on the date of grant, following an independent Section 409A appraisal.

### How equity creates value
Suppose an employee receives a grant of 10,000 options with a strike price of $2.00 per share.
- Cost to exercise all shares: 10,000 × $2.00 = $20,000
- If the company exits at $20.00 per share, gross proceeds equal 10,000 × $20.00 = $200,000
- Gross pre-tax profit: $200,000 − $20,000 = $180,000

If the share price falls below $2.00, the options are "underwater". The employee simply lets them expire without paying the exercise cost.
    `,
  },
  {
    id: 'iso-vs-nso-vs-rsu',
    slug: 'iso-vs-nso-vs-rsu',
    title: 'ISO vs NSO vs RSU vs ESPP: comparing equity types',
    category: 'Foundations',
    path: 'Foundations of startup equity',
    readTime: '5 min read',
    summary: 'Understanding statutory incentive stock options, non-qualified options, restricted stock units, and employee stock purchase plans.',
    keyTakeaways: [
      'ISOs can qualify for long-term capital gains tax treatment but can trigger Alternative Minimum Tax (AMT).',
      'NSOs trigger ordinary income tax and mandatory payroll withholding upon exercise.',
      'RSUs carry a $0 strike price and are taxed as W-2 compensation upon vesting.',
      'ESPP plans offer discounted share purchases through payroll deductions.',
    ],
    relatedTool: { label: 'Compare exercise strategies', href: '/scenarios/strategy' },
    content: `
### Four primary equity structures
Startup compensation typically uses one of four instruments:

1. **Incentive Stock Options (ISOs)**: Available only to US employees. No regular income tax is withheld at exercise, though the spread between strike and FMV is an AMT preference item under IRC Section 56(b)(3).
2. **Non-Qualified Stock Options (NSOs)**: Available to employees, contractors, and advisors. The spread at exercise is treated as ordinary compensation subject to federal, state, and FICA withholding.
3. **Restricted Stock Units (RSUs)**: Common in late-stage and public firms. Shares are delivered upon vesting with zero purchase price, and the full market value is taxed as compensation.
4. **Employee Stock Purchase Plans (ESPP)**: Permitted under IRC Section 423, allowing employees to purchase company stock at up to a 15% discount using post-tax payroll contributions.
    `,
  },
  {
    id: 'vesting-and-cliffs',
    slug: 'understanding-vesting-and-cliffs',
    title: 'Vesting schedules, one-year cliffs, and acceleration clauses',
    category: 'Foundations',
    path: 'Foundations of startup equity',
    readTime: '4 min read',
    summary: 'How time-based vesting works, why the one-year cliff is standard, and how single-trigger vs double-trigger acceleration clauses protect employees in acquisitions.',
    keyTakeaways: [
      'The standard venture schedule is 4-year vesting with a 12-month cliff (25% at month 12, monthly thereafter).',
      'Leaving before month 12 results in 0% vested shares.',
      'Single-trigger acceleration vests shares immediately upon an acquisition.',
      'Double-trigger acceleration requires an acquisition plus termination without cause.',
    ],
    relatedTool: { label: 'View your vesting schedule', href: '/grants' },
    content: `
### The 4-year / 1-year cliff standard
Vesting aligns incentives by requiring service before equity ownership transfers to the employee:
- **Months 1–11**: 0% vested.
- **Month 12 (The cliff)**: 25% of total granted units vest on the 1-year anniversary.
- **Months 13–48**: Remaining 75% vests in 36 equal monthly tranches (1/48th of the grant per month).

### Acceleration provisions
In an acquisition, unvested shares are subject to plan terms:
- **Single trigger**: 100% of unvested shares accelerate immediately upon change of control.
- **Double trigger**: Unvested shares accelerate only if (1) the company is acquired, AND (2) the employee is terminated without cause within 12 months.
    `,
  },
  {
    id: 'strike-price-and-fmv',
    slug: 'strike-price-vs-fmv',
    title: 'Strike price vs fair market value: understanding your spread',
    category: 'Foundations',
    path: 'Foundations of startup equity',
    readTime: '4 min read',
    summary: 'The relationship between your exercise price and independent 409A valuations determines both economic profit and potential tax liabilities.',
    keyTakeaways: [
      'The strike price is fixed for the life of the option (up to 10 years).',
      'Fair market value (FMV) changes periodically via board-approved 409A appraisals.',
      'Spread per share equals current FMV minus strike price.',
      'Exercising when spread is zero minimizes taxable phantom income.',
    ],
    relatedTool: { label: 'Model sensitivity to FMV changes', href: '/calculator' },
    content: `
### Defining the spread
The financial value of a stock option is driven by the **spread**:
$$\\text{Spread per share} = \\text{Current FMV} - \\text{Strike price}$$

For example, with 5,000 options at a $1.00 strike price and a current 409A valuation of $8.00:
- Spread per share: $7.00
- Aggregate spread: 5,000 × $7.00 = $35,000

This $35,000 represents the pre-tax paper gain on exercise. For NSOs, this entire amount is subject to ordinary income taxes in the year of exercise.
    `,
  },
  {
    id: 'common-vs-preferred',
    slug: 'common-vs-preferred-shares',
    title: 'Common stock vs preferred stock: liquidation preferences',
    category: 'Foundations',
    path: 'Foundations of startup equity',
    readTime: '5 min read',
    summary: 'Why investors receive preferred stock while employees hold common stock, and how liquidation preference multiples affect payout waterfalls.',
    keyTakeaways: [
      'Preferred stock carries downside liquidation protections and senior claims on exit cash.',
      'Employees receive common stock, which is subordinate to investor preferred capital.',
      '1x non-participating preference is the modern venture standard.',
      'In a low-valuation exit, preferred claims can absorb all proceeds, leaving common at $0.',
    ],
    relatedTool: { label: 'Model dilution and financing rounds', href: '/scenarios/dilution' },
    content: `
### Share class rights
Venture-backed cap tables contain two primary share classes:
- **Preferred stock**: Issued to venture investors in priced rounds (Series Seed, A, B, etc.). Carries liquidation preference, board representation, anti-dilution rights, and protective veto provisions.
- **Common stock**: Issued to founders and employees upon option exercise. Subordinate to preferred stock in bankruptcy and liquidation waterfalls.

### Liquidation preferences explained
A 1x liquidation preference ensures preferred investors receive their original invested capital back before common shareholders receive any exit proceeds. In a $50M exit where investors contributed $60M of preferred capital, common shares receive zero unless investors convert to common stock.
    `,
  },

  // PATH 2: Taxation
  {
    id: 'amt-deep-dive',
    slug: 'amt-deep-dive-for-iso',
    title: 'Alternative Minimum Tax (AMT) for ISO holders: complete guide',
    category: 'Taxation',
    path: 'Tax planning and AMT mastery',
    readTime: '6 min read',
    summary: 'The alternative minimum tax calculation, exemption phase-outs, tentative minimum tax rates (26% and 28%), and how to avoid unexpected paper tax liabilities.',
    keyTakeaways: [
      'AMT applies when you exercise ISOs and hold the shares past the calendar year-end.',
      'The exercise spread (FMV minus strike) is added to alternative minimum taxable income (AMTI).',
      'The statutory exemption protects moderate earners but phases out at higher income thresholds.',
      'Selling in the same calendar year creates a disqualifying disposition and eliminates AMT.',
    ],
    relatedTool: { label: 'Calculate AMT exposure', href: '/calculator' },
    workedCalculation: {
      description: 'Single filer with $160,000 salary exercises 15,000 ISOs at $1.50 strike when FMV is $12.00.',
      units: 15000,
      strikePrice: 1.5,
      fmvAtExercise: 12.0,
      spread: 157500,
      taxEstimate: 36500,
    },
    content: `
### The AMT mechanism
Under IRC Section 56(b)(3), the spread on an ISO exercise is an adjustment item for the Alternative Minimum Tax:
$$\\text{AMT adjustment} = \\text{Units} \\times (\\text{FMV at exercise} - \\text{Strike price})$$

If the Tentative Minimum Tax computed on your adjusted income exceeds your regular federal income tax, you pay the difference as AMT on IRS Form 6251.

### Disqualifying disposition safety valve
If the company value drops substantially after you exercise, holding the shares can leave you with an AMT bill on phantom value that no longer exists. Selling the shares before December 31 of the same tax year constitutes a **disqualifying disposition**, collapsing the transaction into ordinary income based on the actual sale price.
    `,
  },
  {
    id: 'early-exercise-83b',
    slug: 'early-exercise-and-83b-election',
    title: 'Early exercise and Section 83(b) elections: the 30-day window',
    category: 'Taxation',
    path: 'Tax planning and AMT mastery',
    readTime: '5 min read',
    summary: 'Filing an 83(b) election locks in ordinary income on day one when fair market value equals strike price, starting the capital gains clock early.',
    keyTakeaways: [
      'The Section 83(b) election must be filed within strict 30 calendar days of exercise.',
      'Zero extension or late-filing relief exists under federal tax law.',
      'Filing with FMV equal to strike results in $0 recognized taxable spread.',
      'Always send via USPS Certified Mail with Return Receipt Requested as proof of mailing.',
    ],
    relatedTool: { label: 'Section 83(b) deadline & letter generator', href: '/scenarios/83b' },
    content: `
### The 30-day election rule
Under Section 83(a), property transferred in connection with services is taxed as it vests. By filing a timely election under Section 83(b), an employee elects to recognize ordinary income at the time of transfer rather than at vesting:
$$\\text{Taxable spread at grant} = \\text{Purchase price} - \\text{FMV} = \\$0$$

### Critical filing protocol
1. Complete the Section 83(b) letter with taxpayer identification, company details, share count, and fair market value.
2. Mail to the designated IRS Internal Revenue Service Center for your legal residence within **30 calendar days** of the grant or early exercise date.
3. Deliver a copy to your employer and retain proof of USPS postmark in your permanent tax files.
    `,
  },
  {
    id: 'qualifying-dispositions',
    slug: 'qualifying-vs-disqualifying-dispositions',
    title: 'Qualifying vs disqualifying dispositions: long-term capital gains',
    category: 'Taxation',
    path: 'Tax planning and AMT mastery',
    readTime: '4 min read',
    summary: 'Holding requirements for favorable federal tax treatment: 2 years from grant date and 1 year from exercise date.',
    keyTakeaways: [
      'A qualifying disposition requires meeting two separate statutory holding periods.',
      'All profit above strike price is taxed at long-term capital gains rates (0%, 15%, or 20%).',
      'Disqualifying dispositions reclassify the exercise spread as ordinary compensation.',
      'Holding periods are tracked strictly by calendar dates.',
    ],
    relatedTool: { label: 'Record an exercise event', href: '/grants' },
    content: `
### The two-part holding requirement
Under IRC Section 422(a)(1), an ISO sale qualifies for long-term capital gains rates only if both conditions are met:
1. The sale occurs at least **2 years from the date of grant**; AND
2. The sale occurs at least **1 year from the date of exercise**.

If both criteria are satisfied, the entire difference between the net sale proceeds and your strike price cost is taxed as long-term capital gain.
    `,
  },
  {
    id: 'state-tax-impact',
    slug: 'state-tax-rates-on-equity',
    title: 'State income tax rates and multistate equity allocation',
    category: 'Taxation',
    path: 'Tax planning and AMT mastery',
    readTime: '5 min read',
    summary: 'How state tax rates vary from 0% to 13.3% and how state revenue departments allocate taxable spread when employees move between states during vesting.',
    keyTakeaways: [
      'States tax equity based on where services were performed between grant and vesting.',
      'Moving states does not eliminate tax liability to your prior state of employment.',
      'High-tax states (California, New York, New Jersey) enforce strict sourcing audits.',
      'Always use blended state rates when modeling multi-year vesting across locations.',
    ],
    relatedTool: { label: 'Calculate state tax rates', href: '/calculator' },
    content: `
### Multistate sourcing rules
When an employee receives options while working in California (up to 13.3% rate) and subsequently relocates to Texas (0% rate), California requires prorated tax based on workdays performed in California between the grant date and each vest date:
$$\\text{Sourced percentage} = \\frac{\\text{California workdays during vesting}}{\\text{Total workdays during vesting}}$$

Tax software must account for both resident state rules and non-resident source obligations.
    `,
  },
  {
    id: 'amt-credit-recovery',
    slug: 'recovering-amt-credit-form-8801',
    title: 'Recovering your AMT credit: IRS Form 8801 and future tax offsets',
    category: 'Taxation',
    path: 'Tax planning and AMT mastery',
    readTime: '4 min read',
    summary: 'How Minimum Tax Credit (MTC) carryforwards work, why AMT paid on ISO exercise is not lost forever, and how to recover it in post-exit tax years.',
    keyTakeaways: [
      'AMT paid on ISO exercise generates a Minimum Tax Credit (MTC) under IRC Section 53.',
      'The credit carries forward indefinitely until utilized; it never expires.',
      'You use the credit on IRS Form 8801 in years when your regular tax exceeds tentative minimum tax.',
      'Dual cost basis tracking is mandatory: regular tax basis vs AMT tax basis.',
    ],
    relatedTool: { label: 'Model tax scenarios', href: '/scenarios' },
    content: `
### Understanding the Minimum Tax Credit
Because the AMT adjustment on an ISO exercise is a "timing difference" rather than an "exclusion item", you receive credit for the tax paid.

When you sell the underlying shares in a qualifying disposition:
- Your **regular tax basis** equals the strike price paid.
- Your **AMT basis** equals the FMV at exercise.

Because your regular taxable gain will be higher than your AMT gain at sale, your regular tax will exceed tentative minimum tax, allowing you to use prior Form 8801 credits to reduce your tax bill.
    `,
  },

  // PATH 3: Liquidity
  {
    id: 'secondary-sales-tenders',
    slug: 'secondary-market-tender-offers',
    title: 'Secondary market tender offers: mechanics and company approval',
    category: 'Liquidity',
    path: 'Liquidity, secondaries, and exits',
    readTime: '5 min read',
    summary: 'How company-sponsored tender offers work, eligibility caps, transaction fees, and deciding between immediate liquidity vs long-term upside.',
    keyTakeaways: [
      'Company-sponsored tenders provide structured liquidity without private market broker fees.',
      'Participation is typically capped at a percentage of vested holdings (e.g. 10%–25%).',
      'Companies often restrict sales to accredited secondary buyers or institutional funds.',
      'Tender offer prices may be discounted compared to the most recent preferred valuation round.',
    ],
    relatedTool: { label: 'Model a tender offer', href: '/scenarios/tender' },
    content: `
### Company-sponsored tender offers
In a private company tender offer, an institutional buyer (or the company itself) offers to purchase a predetermined volume of vested shares from employees.

Key parameters include:
- **Eligible shares**: Typically only vested common shares and vested options.
- **Participation cap**: E.g., 20% of vested holdings to prevent excessive employee liquidation.
- **Transaction fees**: Usually 1% to 3% deducted from net proceeds.
- **Tax treatment**: If exercising options concurrently to sell, net settlement is treated as ordinary income or capital gains depending on holding status.
    `,
  },
  {
    id: 'ipo-mechanics',
    slug: 'ipo-mechanics-and-lockups',
    title: 'IPO mechanics: S-1 filings, pricing day, and the 180-day lockup',
    category: 'Liquidity',
    path: 'Liquidity, secondaries, and exits',
    readTime: '5 min read',
    summary: 'The timeline from confidential filing to public listing, underwriter lockup agreements, insider trading windows, and 10b5-1 trading plans.',
    keyTakeaways: [
      'The standard underwriter lockup agreement restricts employee sales for 180 days post-IPO.',
      'Some modern IPOs feature early lockup release triggers tied to share price performance.',
      'Employees are subject to quarterly blackout periods around corporate earnings releases.',
      'Pre-scheduled Rule 10b5-1 trading plans protect against insider trading allegations.',
    ],
    relatedTool: { label: 'Research public comps', href: '/research/market' },
    content: `
### The 180-day lockup agreement
When a company goes public, underwriters require all insiders and employees to sign a **lockup agreement**. This legally prevents selling shares on the open market for 180 days following the IPO, preventing sudden market oversupply while the public price stabilizes.

Employees holding options expiring during the lockup must plan exercises in advance to avoid expiration before liquidity is permitted.
    `,
  },
  {
    id: 'acquisitions-cash-vs-stock',
    slug: 'ma-acquisitions-cash-vs-stock',
    title: 'M&A acquisitions: cash vs stock transactions and escrows',
    category: 'Liquidity',
    path: 'Liquidity, secondaries, and exits',
    readTime: '5 min read',
    summary: 'How mergers and acquisitions affect employee options: cash payouts, buyer stock substitution, earn-outs, and indemnification escrow holds.',
    keyTakeaways: [
      'Cash acquisitions trigger immediate taxable events on all cashed-out options.',
      'Stock-for-stock acquisitions can defer taxes by rolling private options into buyer options.',
      '10% to 15% of proceeds are commonly held in escrow for 12–18 months for indemnity claims.',
      'Unvested options may be assumed by the acquirer or cancelled with replacement retention bonuses.',
    ],
    relatedTool: { label: 'Model departure and exit', href: '/scenarios/leaving' },
    content: `
### Deal consideration types
When a private company is acquired:
- **All-cash deal**: Vested options are cancelled in exchange for cash equal to the net spread ($$\\text{Per-share offer} - \\text{Strike price}$$). Taxable immediately in the year received.
- **Stock-for-stock deal**: Vested and unvested options are converted into options of the acquiring public company using an exchange ratio based on the relative valuation.
- **Indemnity escrows**: A portion of sale proceeds is held by a third-party escrow agent to cover breach-of-warranty claims by the buyer.
    `,
  },
  {
    id: 'private-liquidity-platforms',
    slug: 'private-secondary-platforms',
    title: 'Secondary liquidity platforms: Forge, CartaX, and EquityZen',
    category: 'Liquidity',
    path: 'Liquidity, secondaries, and exits',
    readTime: '4 min read',
    summary: 'How broker-dealers match employee sellers with institutional buyers, company ROFR rights, and transaction structuring.',
    keyTakeaways: [
      'Direct secondary transactions require explicit approval from the company board.',
      'Most startup bylaws include a Right of First Refusal (ROFR) allowing the company to match the offer.',
      'Secondary transaction fees range from 2.5% to 5% per side.',
      'Forward contracts and synthetic derivative structures carry significant tax and legal risk.',
    ],
    relatedTool: { label: 'Track company valuations', href: '/research/companies' },
    content: `
### Direct secondary sales
Secondary broker-dealers allow verified shareholders of late-stage private companies to sell shares directly to qualified institutional buyers.

Before executing a private trade:
1. Verify company share transfer restrictions in the bylaws.
2. Submit the proposed deal to the company for Right of First Refusal (ROFR) review (typically a 30-day window).
3. The board must formally approve the transfer to update the official cap table.
    `,
  },
  {
    id: 'exercising-without-cash',
    slug: 'cashless-exercise-strategies',
    title: 'Exercising without cash: net settlement and exercise loans',
    category: 'Liquidity',
    path: 'Liquidity, secondaries, and exits',
    readTime: '5 min read',
    summary: 'Cashless exercise mechanisms, sell-to-cover, non-recourse financing funds, and the risk profile of borrowing to exercise private equity.',
    keyTakeaways: [
      'Cashless exercise is only available when an active liquidity event or public market exists.',
      'Sell-to-cover withholds shares automatically to satisfy the strike cost and tax withholding.',
      'Non-recourse financing firms fund exercise costs in exchange for a share of future exit proceeds.',
      'Never borrow personal recourse funds against volatile, illiquid private shares.',
    ],
    relatedTool: { label: 'Compare exercise strategies', href: '/scenarios/strategy' },
    content: `
### Cashless exercise mechanics
In a cashless exercise (standard for public companies and tender offers), the employee pays $0 out-of-pocket:
- A portion of the exercised shares is sold immediately on the market.
- Proceeds from that sale fund the strike price and statutory tax withholding.
- The remaining net shares (or cash) are deposited into the employee account.

For private pre-IPO companies without liquidity, third-party non-recourse financing funds provide capital in exchange for the return of capital plus a carried-interest percentage of future proceeds.
    `,
  },

  // PATH 4: Legal
  {
    id: 'ptew-departure-guide',
    slug: 'what-happens-to-options-if-i-leave',
    title: 'Post-Termination Exercise Windows (PTEW): 90 days vs 10 years',
    category: 'Legal',
    path: 'Legal rights and departure planning',
    readTime: '5 min read',
    summary: 'Why traditional 90-day windows force employees to forfeit earned equity, how modern extended windows work, and ISO-to-NSO conversion rules.',
    keyTakeaways: [
      'Standard option plans mandate exercising within 90 days of termination or forfeiting shares.',
      'Extended windows (5–10 years) provide time to await liquidity before paying exercise costs.',
      'ISOs convert automatically to NSOs under federal tax law after 90 days post-termination.',
      'Always confirm your specific grant agreement PTEW terms before submitting a resignation.',
    ],
    relatedTool: { label: 'Plan your departure', href: '/scenarios/leaving' },
    content: `
### The 90-day exercise constraint
Under IRC Section 422, an incentive stock option must be exercised within 3 months of leaving employment to retain statutory ISO status. Historically, companies wrote this 90-day limit into option agreements as a blanket cutoff for all exercise.

### The statutory ISO conversion rule
If a company offers an extended 7-year or 10-year exercise window, the options can still be exercised after day 90. However, **they convert by operation of federal tax law into Non-Qualified Stock Options (NSOs)** on day 91. When exercised later, the spread is subject to ordinary income tax rates rather than AMT.
    `,
  },
  {
    id: 'option-expiration-rules',
    slug: 'option-expiration-rules-10-years',
    title: 'Option expiration rules: the 10-year statutory ceiling',
    category: 'Legal',
    path: 'Legal rights and departure planning',
    readTime: '4 min read',
    summary: 'Federal tax law imposes a strict 10-year maximum lifespan on stock option grants. What happens when your grant approaches year 10 without an IPO.',
    keyTakeaways: [
      'ISOs cannot have an expiration date exceeding 10 years from the date of grant.',
      'Expired options are voided permanently and return to the corporate pool.',
      'Companies can amend or extend NSO expiration, but ISOs cannot exceed 10 years.',
      'Review expiration dates at least 12 months in advance to plan financing.',
    ],
    relatedTool: { label: 'Review key grant dates', href: '/grants' },
    content: `
### The 10-year statutory limit
Under IRC Section 422(b)(2), an option grant cannot be exercised after the expiration of 10 years from the date it was granted.

For early startup employees at companies that remain private for over a decade, this creates an existential cliff: you must either fund the exercise and any associated tax liability, or lose the equity entirely.
    `,
  },
  {
    id: 'information-rights-inspection',
    slug: 'shareholder-information-rights',
    title: 'Shareholder information rights: what you can legally inspect',
    category: 'Legal',
    path: 'Legal rights and departure planning',
    readTime: '4 min read',
    summary: 'Section 220 of the Delaware General Corporation Law and what financial disclosures option holders vs registered stockholders are entitled to inspect.',
    keyTakeaways: [
      'Option holders do not have formal statutory inspection rights until they exercise shares.',
      'Delaware DGCL Section 220 grants registered stockholders the right to inspect books and records for a proper purpose.',
      'Companies must provide basic financial disclosures for Rule 701 compliance when granting over $10M.',
      'Exercising at least one share establishes formal stockholder inspection standing.',
    ],
    relatedTool: { label: 'Research verified companies', href: '/research/companies' },
    content: `
### Option holders vs stockholders
Until an employee exercises an option, they hold only a contractual right to buy shares, not actual corporate stock. Consequently, statutory shareholder rights under Delaware law (DGCL Section 220) do not apply.

Once exercised into common stock, shareholders with a "proper purpose" can inspect corporate bylaws, stock ledgers, financial statements, and board meeting minutes related to valuation and share dilution.
    `,
  },
  {
    id: 'right-of-first-refusal',
    slug: 'right-of-first-refusal-rofr',
    title: 'Right of First Refusal (ROFR) and share transfer restrictions',
    category: 'Legal',
    path: 'Legal rights and departure planning',
    readTime: '4 min read',
    summary: 'How bylaws restrict private stock sales, the 30-day corporate matching window, co-sale rights, and board discretion clauses.',
    keyTakeaways: [
      'The company has the contractual right to purchase shares on the exact terms of an outside offer.',
      'Investors typically hold secondary co-sale rights allowing them to participate in employee transfers.',
      'Attempting to transfer shares without board approval renders the transaction void under bylaws.',
      'Board approval is almost universally required for private share transfers.',
    ],
    relatedTool: { label: 'Company research hub', href: '/research/market' },
    content: `
### Mechanics of the ROFR
When an employee receives a bona fide third-party offer to purchase private shares:
1. The employee must serve formal written notice to the corporate secretary.
2. The company has 30 days to exercise its **Right of First Refusal** to buy the shares at the proposed price.
3. If the company waives its right, major venture investors may have secondary ROFR or co-sale rights.
4. Only after all rights are formally waived can the sale proceed to the third-party buyer.
    `,
  },
  {
    id: 'termination-for-cause',
    slug: 'termination-for-cause-and-clawbacks',
    title: 'Good leaver vs bad leaver clauses and unvested forfeitures',
    category: 'Legal',
    path: 'Legal rights and departure planning',
    readTime: '4 min read',
    summary: 'How employment separation agreements define good leavers vs bad leavers, clawback provisions, non-competes, and intellectual property covenants.',
    keyTakeaways: [
      'Voluntary resignations and layoffs without cause are typically treated as good leavers.',
      'Termination for cause can trigger immediate forfeiture of even vested unexercised options.',
      'Some agreements contain company repurchase rights for exercised shares at original cost.',
      'Non-disparagement and IP assignment sign-offs are routinely required for departure vesting.',
    ],
    relatedTool: { label: 'Departure planning checklist', href: '/scenarios/leaving' },
    content: `
### Defining leaver status
Option agreements categorize departing team members into distinct legal classes:
- **Good leaver**: Standard resignation, reduction in force (RIF), or termination without cause. Vested options remain exercisable through the standard PTEW window.
- **Bad leaver**: Termination for gross misconduct, fraud, or violation of confidentiality covenants. Unexercised vested options are often cancelled immediately, and some agreements permit the company to repurchase already-exercised shares at the original strike price.
    `,
  },

  // PATH 5: Evaluation & Dilution
  {
    id: 'evaluating-equity-offers',
    slug: 'how-to-evaluate-a-startup-job-offer',
    title: 'How to evaluate a startup job offer: shares vs percentages',
    category: 'Evaluation',
    path: 'Offer evaluation and cap table dilution',
    readTime: '5 min read',
    summary: 'Never judge an equity offer solely by share count. The essential 5-point checklist for evaluating startup compensation packages.',
    keyTakeaways: [
      '10,000 shares is meaningless without knowing the fully diluted share count.',
      'Always calculate ownership percentage: shares divided by fully diluted shares.',
      'Ask for the latest 409A valuation, latest preferred round price, and capital raised.',
      'Verify vesting schedule, cliff, PTEW window, and early exercise availability.',
    ],
    relatedTool: { label: 'Offer evaluation checklist', href: '/learn/checklist' },
    content: `
### The share count trap
A candidate offered "20,000 options" might receive 0.1% or 0.001% of a company depending on the share denominator:
$$\\text{Ownership percentage} = \\frac{\\text{Offered shares}}{\\text{Fully diluted shares}} \\times 100$$

### The essential 5 questions to ask
1. What is the total fully diluted share count today?
2. What was the post-money valuation and share price of the most recent preferred round?
3. What is the current 409A fair market value per share?
4. What is the post-termination exercise window (90 days or extended)?
5. Does the plan permit early exercise with an 83(b) election?
    `,
  },
  {
    id: 'cap-table-dilution',
    slug: 'venture-capital-dilution-rounds',
    title: 'Venture capital dilution: from Series Seed to Series E',
    category: 'Evaluation',
    path: 'Offer evaluation and cap table dilution',
    readTime: '5 min read',
    summary: 'How issuing new shares to investors dilutes percentage ownership while increasing the total dollar value of employee equity.',
    keyTakeaways: [
      'Each priced venture round typically dilutes existing shareholders by 15% to 25%.',
      'Dilution is mathematically normal: a smaller slice of a much larger pie.',
      'Pre-money valuation plus new investment equals post-money valuation.',
      'Unallocated option pool expansions dilute existing common shareholders before investment.',
    ],
    relatedTool: { label: 'Model venture round dilution', href: '/scenarios/dilution' },
    workedCalculation: {
      description: 'Employee holds 1.0% ownership before a $20M Series B round raised at an $80M pre-money valuation.',
      units: 10000,
      strikePrice: 1.0,
      fmvAtExercise: 10.0,
      spread: 90000,
      taxEstimate: 22500,
    },
    content: `
### Mathematical mechanics of dilution
When a startup raises capital, it does not transfer existing shares from founders to investors. It **authorizes and issues new shares**:
$$\\text{New investor ownership} = \\frac{\\text{Capital raised}}{\\text{Post-money valuation}} = \\frac{\\$20\\text{M}}{\\$100\\text{M}} = 20\\%$$

Existing shareholders are diluted by the incoming investor fraction:
$$\\text{New employee ownership} = \\text{Prior ownership} \\times (1 - 0.20) = 1.0\\% \\times 0.80 = 0.80\\%$$

Although ownership dropped from 1.0% to 0.80%, the value of the company increased from $20M to $100M, so the dollar value of the holding grew from $200k to $800k.
    `,
  },
  {
    id: 'option-pool-overhang',
    slug: 'option-pool-expansion-and-overhang',
    title: 'Option pool expansion, overhang ratios, and hiring runway',
    category: 'Evaluation',
    path: 'Offer evaluation and cap table dilution',
    readTime: '5 min read',
    summary: 'How venture investors require option pool "shuffle" increases prior to closing rounds, and why unallocated pool reserves dilute employees.',
    keyTakeaways: [
      'Investors frequently require expanding the option pool to 10%–15% pre-money.',
      'Because pool expansion occurs pre-money, existing shareholders absorb 100% of the dilution.',
      'Overhang measures total granted plus ungranted pool shares divided by total authorized shares.',
      'Monitor quarterly burn rates to anticipate when the board will expand the pool.',
    ],
    relatedTool: { label: 'Model option pool runway', href: '/pool' },
    content: `
### The option pool shuffle
When a term sheet specifies a "15% unallocated post-closing option pool", venture capitalists mandate that the expansion occur **before** the new investment:
- The expansion shares are added to the pre-money cap table.
- Existing founders and employees absorb 100% of the dilution from the expanded pool.
- The incoming investor receives their full agreed percentage completely undiluted by the pool creation.
    `,
  },
  {
    id: 'down-rounds-anti-dilution',
    slug: 'down-rounds-and-anti-dilution-clauses',
    title: 'Down rounds, anti-dilution clauses, and pay-to-play rules',
    category: 'Evaluation',
    path: 'Offer evaluation and cap table dilution',
    readTime: '6 min read',
    summary: 'What happens when a company raises capital at a lower valuation: broad-based weighted average anti-dilution adjustments, recapitalizations, and common stock wipeouts.',
    keyTakeaways: [
      'A down round occurs when share price is lower than the previous financing round.',
      'Broad-based weighted average anti-dilution adjusts the conversion price of prior preferred stock.',
      'Anti-dilution adjustments issue extra common shares to investors, heavily diluting employees.',
      'Pay-to-play provisions require investors to participate in down rounds or lose preferred rights.',
    ],
    relatedTool: { label: 'Model down round exit scenarios', href: '/scenarios/dilution' },
    content: `
### How anti-dilution protections work
If a company raises Series B at $10.00/share and later raises Series C at $5.00/share (a 50% down round), the Series B investors' anti-dilution clause activates.

Under **Broad-Based Weighted Average** anti-dilution, the conversion ratio of Series B preferred stock to common stock increases:
$$\\text{New conversion price} = P_1 \\times \\frac{A + B}{A + C}$$

This awards additional common shares to past investors without requiring more money, shifting cap table percentage away from employee common stockholders toward investors.
    `,
  },
];
