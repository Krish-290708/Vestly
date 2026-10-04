export interface EducationalArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  keyTakeaways: string[];
}

export interface GlossaryTerm {
  term: string;
  category: 'Basics' | 'Taxes' | 'Legal' | 'Market';
  shortDefinition: string;
  detailedExplanation: string;
  example?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "409A Valuation",
    category: "Legal",
    shortDefinition: "An independent appraisal of the fair market value (FMV) of a private company's common stock.",
    detailedExplanation: "Under Section 409A of the US Internal Revenue Code, private companies must obtain an independent appraisal at least once every 12 months (or after a material financing event) to set the minimum strike price for stock option grants.",
    example: "If Stripe's latest 409A valuation is $26.00/share, any new employee stock options must be granted with a strike price of at least $26.00 to avoid severe IRS penalties."
  },
  {
    term: "Incentive Stock Option (ISO)",
    category: "Basics",
    shortDefinition: "A type of stock option eligible for special preferential federal tax treatment if holding requirements are met.",
    detailedExplanation: "ISOs can only be granted to employees. Unlike NSOs, no ordinary income tax is withheld at exercise, though the paper spread between FMV and strike is subject to Alternative Minimum Tax (AMT). If held 2 years from grant and 1 year from exercise, all profit is taxed at Long-Term Capital Gains rates.",
    example: "Exercising an ISO with a $2 strike when FMV is $10 creates an $8/share paper spread for AMT, but no immediate payroll or regular income tax."
  },
  {
    term: "Non-Qualified Stock Option (NSO)",
    category: "Basics",
    shortDefinition: "A stock option that does not qualify for special ISO tax treatment; spread is taxed as ordinary income at exercise.",
    detailedExplanation: "NSOs can be granted to employees, advisors, and contractors. Upon exercise, the difference between the FMV and strike price is treated as compensation and taxed as ordinary income with mandatory federal, state, and FICA/Medicare withholding.",
    example: "Exercising 1,000 NSOs at $5 strike when FMV is $20 triggers $15,000 of ordinary W-2 taxable income at exercise."
  },
  {
    term: "Restricted Stock Unit (RSU)",
    category: "Basics",
    shortDefinition: "A grant representing a promise to deliver common shares once vesting criteria are satisfied.",
    detailedExplanation: "RSUs have no strike price ($0 cost). Upon vesting, the full fair market value of the vested shares is taxed immediately as ordinary compensation income. Typically, companies automatically withhold shares (sell-to-cover) to pay the tax.",
    example: "100 RSUs vesting when the stock is $50 represents $5,000 of compensation; ~35 shares might be sold to cover taxes, delivering 65 net shares."
  },
  {
    term: "Alternative Minimum Tax (AMT)",
    category: "Taxes",
    shortDefinition: "A parallel tax system designed to ensure individuals with substantial paper deductions or preferential income pay a minimum tax.",
    detailedExplanation: "For ISO holders, the spread at exercise (FMV minus strike price) is an AMT preference item. If your calculated Tentative Minimum Tax exceeds your regular federal income tax, you must pay the difference as AMT for that tax year. You receive an AMT credit for future years.",
    example: "Exercising ISOs in a high-valuation company may generate a six-figure AMT paper tax bill even though you haven't sold the private shares."
  },
  {
    term: "Section 83(b) Election",
    category: "Taxes",
    shortDefinition: "An election filed with the IRS within 30 days of receiving unvested equity to recognize income immediately.",
    detailedExplanation: "If your company permits early exercise of unvested options, filing an 83(b) election allows you to pay taxes on the spread today (which is usually $0 or minimal) rather than when the shares vest years later at potentially much higher valuations.",
    example: "Filing an 83(b) on 10,000 shares at a $0.10 strike when FMV is $0.10 results in $0 tax today and resets the capital gains holding period immediately."
  },
  {
    term: "Post-Termination Exercise Window (PTEW)",
    category: "Legal",
    shortDefinition: "The time window an employee has to exercise vested options after resigning or being terminated.",
    detailedExplanation: "Historically, standard option plans only provided 90 days after departure to exercise, after which unexercised options are forfeited. Some forward-thinking startups now offer extended windows of 5 to 10 years.",
    example: "Leaving your job on March 1st with a 90-day window means you must fund the exercise cost and tax liability by May 30th or lose your equity permanently."
  },
  {
    term: "Vesting Cliff",
    category: "Basics",
    shortDefinition: "A milestone period (usually 1 year) before which zero equity vests.",
    detailedExplanation: "Under a standard 4-year vesting schedule with a 1-year cliff, if an employee leaves before 12 months, they walk away with 0% vested shares. At the 12-month mark, 25% vests in a single lump sum, followed by monthly vesting.",
    example: "At 11 months, you have 0 shares; on your 1-year anniversary, 250 of your 1,000 shares vest instantly."
  },
  {
    term: "Strike Price (Exercise Price)",
    category: "Basics",
    shortDefinition: "The fixed price per share that you must pay to purchase your stock options.",
    detailedExplanation: "Set at or above the Fair Market Value (409A) on the date your grant is approved by the Board of Directors.",
    example: "If your strike price is $3.00, you pay $3.00 per share regardless of whether the company is later valued at $30 or $300."
  },
  {
    term: "Qualifying Disposition",
    category: "Taxes",
    shortDefinition: "A sale of ISO shares that qualifies for preferential long-term capital gains tax treatment.",
    detailedExplanation: "Requires holding the shares for at least 2 years from the original grant date AND at least 1 year from the exercise date. If met, your entire profit (Sale Price - Strike Price) is taxed as long-term capital gains.",
    example: "Granted in Jan 2022, exercised in Feb 2023, sold in March 2024: meets both criteria (2+ yrs from grant, 1+ yr from exercise), qualifying for LTCG."
  }
];

export const EDUCATIONAL_ARTICLES: EducationalArticle[] = [
  {
    id: "esop-basics-101",
    slug: "esop-basics",
    title: "ESOP Basics: How Startup Stock Options Actually Work",
    category: "Foundations",
    readTime: "4 min read",
    summary: "Stock options give you the right—not the obligation—to buy shares of your company at a locked-in price. Here is how they create wealth and what risks exist.",
    keyTakeaways: [
      "An option is a contract to buy a share at a fixed strike price, not an actual share of stock yet.",
      "Vesting means you earn your options over time, usually over 4 years with a 1-year cliff.",
      "To turn options into real shares, you must 'exercise' them by paying the strike price.",
      "Profit is made when the company's value at exit exceeds your strike price plus any taxes paid."
    ],
    content: `
### What Is an Option?
When a company offers you stock options, they are not giving you shares today. Instead, they are giving you a **financial contract**: the legal right to purchase a specific number of common shares at a predetermined, locked-in price called the **strike price** (or exercise price).

### How Value Is Created
Imagine you join an early-stage company and receive 10,000 options with a strike price of **$2.00 per share**. Five years later, the company goes public or is acquired for **$30.00 per share**.
- Total cost to buy your shares: 10,000 × $2.00 = **$20,000**
- Total value of your shares at exit: 10,000 × $30.00 = **$300,000**
- Your gross profit: **$280,000** (before taxes)

If the company's share price drops below $2.00, your options are "underwater"—meaning they have no intrinsic value, but you also have no obligation to buy them.

### Key Milestones in an Option's Life
1. **Grant Date**: The date your equity is approved by the Board of Directors.
2. **Vesting Commencement Date**: When your clock starts ticking.
3. **Cliff**: Typically 1 year where 0% vests until you hit month 12.
4. **Exercise**: When you write a check to purchase the shares.
5. **Liquidity Event**: When shares can actually be sold for cash (IPO, tender offer, acquisition).
    `
  },
  {
    id: "iso-vs-nso-vs-rsu",
    slug: "iso-vs-nso-vs-rsu",
    title: "ISO vs NSO vs RSU vs ESPP: The Complete Comparison",
    category: "Taxes & Equity Types",
    readTime: "6 min read",
    summary: "Understanding the crucial differences between equity instruments. Tax treatment at exercise and sale can differ by tens of thousands of dollars.",
    keyTakeaways: [
      "ISOs offer preferential tax treatment but can trigger Alternative Minimum Tax (AMT) upon exercise.",
      "NSOs are simpler but trigger immediate ordinary income taxes and payroll withholdings upon exercise.",
      "RSUs have no strike price ($0) and are taxed as cash compensation on the day each tranche vests.",
      "ESPP lets you buy company stock at a discount (often 15%) through automated payroll deductions."
    ],
    content: `
### The Equity Spectrum
Not all startup equity is created equal. Depending on the company's stage and your employment status, you will receive one of four main equity types:

#### 1. Incentive Stock Options (ISOs)
- **Who receives them**: Full-time US employees only.
- **Tax at exercise**: $0 regular income tax, but the spread (FMV minus Strike) is counted as an **AMT preference item**.
- **Tax at sale**: If held 2 years from grant and 1 year from exercise (Qualifying Disposition), entire gain is taxed at lower **Long-Term Capital Gains rates (15% to 20%)**.
- **Best for**: Early to growth-stage startups where long-term upside is substantial.

#### 2. Non-Qualified Stock Options (NSOs)
- **Who receives them**: Employees, contractors, board members, advisors.
- **Tax at exercise**: The spread is treated as **W-2 wages** and taxed immediately at Ordinary Income rates (up to 37% Federal + State + FICA/Medicare).
- **Tax at sale**: Future gains above the exercise FMV are capital gains.
- **Best for**: Contractors, late-stage grants, or employees post-ISO limit ($100k/yr).

#### 3. Restricted Stock Units (RSUs)
- **Who receives them**: Late-stage private unicorns and public companies (e.g., Google, Meta, Stripe).
- **Cost**: $0 strike price.
- **Tax at vest**: Automatically taxed as ordinary income on the day they vest. Companies usually sell a fraction of shares ("sell to cover") to pay withholding taxes.
- **Best for**: Derisked companies where shares have reliable, liquid market value.
    `
  },
  {
    id: "understanding-409a-valuations",
    slug: "what-is-a-409a-valuation",
    title: "What is a 409A Valuation and Why Does it Matter to You?",
    category: "Valuations",
    readTime: "4 min read",
    summary: "Private companies don't trade on public stock exchanges. The 409A valuation is the regulatory anchor that dictates your strike price and paper tax liability.",
    keyTakeaways: [
      "A 409A is an independent third-party appraisal of a private company's common stock.",
      "It must be updated at least once every 12 months or whenever a new funding round closes.",
      "Common stock 409A is usually 20% to 50% lower than preferred stock paid by venture capitalists.",
      "A rising 409A increases the paper tax spread if you exercise ISOs or NSOs."
    ],
    content: `
### Why Private Companies Need 409A Appraisals
Public company stocks have continuous prices set by open market trading. Private companies do not. In 2004, the US Congress created Section 409A of the Internal Revenue Code to stop executives from granting deeply discounted options without paying proper income tax.

### Common Stock vs Preferred Stock
When venture capitalists invest in a startup, they purchase **Preferred Stock**—which comes with special rights like liquidation preferences and anti-dilution clauses. 

Employees receive **Common Stock**. Because common stock lacks these protective investor rights, an independent appraiser applies a "minority discount" and "marketability discount", valuing common stock at a fraction (often 25% to 50%) of the preferred round price.

### How 409A Impacts Your Wallet
1. **Strike Price on New Grants**: Your strike price cannot be lower than the 409A valuation on the day the board grants your options.
2. **Taxes Upon Exercise**: When you exercise an option, the IRS calculates your taxable "spread" using the latest 409A:
$$\\text{Spread} = \\text{Units} \\times (\\text{Latest 409A} - \\text{Strike Price})$$
A rising 409A increases your taxable spread, which can create significant AMT (for ISOs) or ordinary income tax (for NSOs).
    `
  },
  {
    id: "amt-explained-simply",
    slug: "amt-explained",
    title: "The Alternative Minimum Tax (AMT) Demystified",
    category: "Taxes & Equity Types",
    readTime: "5 min read",
    summary: "The unexpected six-figure paper tax bill that shocks startup employees: how the AMT works, why it triggers on ISO exercises, and how to plan ahead.",
    keyTakeaways: [
      "AMT only applies to Incentive Stock Options (ISOs) when you exercise and hold private shares.",
      "You are taxed on 'phantom income' (the paper difference between FMV and strike) even though you received zero cash.",
      "You receive an AMT Credit (Form 8801) which can offset regular tax in future years when you sell.",
      "Exercising early when the 409A is close to your strike price minimizes or eliminates AMT exposure."
    ],
    content: `
### The Phantom Tax Trap
Every year, hundreds of startup employees face a surprise tax bill from the IRS for exercising their ISOs. This is caused by the **Alternative Minimum Tax (AMT)**.

Under regular tax rules, exercising an ISO does not trigger income tax because you haven't sold anything. But under the AMT rules, the spread between the Fair Market Value and your strike price is added to your Alternative Minimum Taxable Income (AMTI).

### How AMT Is Calculated
1. Calculate your regular federal income tax on your salary and standard deductions.
2. Calculate your Alternative Minimum Taxable Income:
$$\\text{AMTI} = \\text{Salary} + \\text{ISO Exercise Spread}$$
3. Subtract the statutory AMT Exemption amount ($85,700 for Single, $133,300 for Married Filing Jointly).
4. Apply the 26% / 28% AMT tax rates to the remaining taxable base.
5. Compare the two: If your Tentative Minimum Tax is higher than your Regular Tax, you must pay the difference as AMT!

### The Silver Lining: AMT Credit
The AMT you pay on an ISO exercise is not lost forever. It generates a **Minimum Tax Credit (MTC)** via IRS Form 8801. When you eventually sell your shares in a qualifying disposition, you can use this credit to reduce your regular federal taxes.
    `
  },
  {
    id: "vesting-and-cliffs",
    slug: "understanding-vesting-and-cliffs",
    title: "Understanding Vesting Schedules, Cliffs, and Acceleration",
    category: "Foundations",
    readTime: "4 min read",
    summary: "Vesting protects companies from people leaving with large ownership stakes. Learn how cliffs work, what monthly vesting looks like, and single vs double-trigger acceleration.",
    keyTakeaways: [
      "The industry standard is a 4-year schedule with a 1-year cliff (25% at 12 months, 1/48th monthly thereafter).",
      "If you leave at 11 months, you walk away with zero equity.",
      "Single-trigger acceleration vests shares upon company acquisition.",
      "Double-trigger acceleration requires both an acquisition AND termination of employment without cause."
    ],
    content: `
### The 4-Year / 1-Year Cliff Standard
Startups grant equity to incentivize employees to stay and build long-term value. The gold standard schedule is **4-year vesting with a 1-year cliff**:
- **Year 1 (Months 1–11)**: 0% vested.
- **Month 12 (The Cliff)**: Exactly 25% vests in one lump tranche on your one-year anniversary.
- **Months 13–48**: The remaining 75% vests in equal monthly increments (1/48th or ~2.083% of your total grant each month).

### Acceleration Clauses
What happens to your unvested shares if the startup is acquired?
- **Single Trigger**: Unvested shares automatically vest immediately upon change of control / acquisition. (Rare for non-founders).
- **Double Trigger**: Requires two events: (1) The company is acquired, AND (2) You are terminated without cause or resign with good reason within 12 months of the acquisition. This is the industry standard for executive and key hire protection.
    `
  },
  {
    id: "leaving-the-company-ptew",
    slug: "what-happens-to-options-if-i-leave",
    title: "What Happens to My Options if I Leave the Company? (PTEW)",
    category: "Legal",
    readTime: "5 min read",
    summary: "Resigning from a startup puts you on a countdown clock. What you need to know about post-termination exercise windows and the golden handcuffs.",
    keyTakeaways: [
      "Standard option agreements grant only 90 days after departure to exercise vested options.",
      "Unexercised options return to the company option pool and are forfeited forever.",
      "Financing the strike price and taxes within 90 days can require significant liquid savings.",
      "Some modern startups have extended PTEWs to 5 or 10 years."
    ],
    content: `
### The 90-Day Post-Termination Exercise Window
When you voluntarily resign or are laid off from a startup, your unvested options are immediately cancelled. For your **vested options**, a countdown clock starts: the **Post-Termination Exercise Window (PTEW)**.

In most standard US option plans, this window is **90 days**. If you do not exercise your options within 90 days of your last day of employment, your options vanish and return to the company stock pool.

### The Financial Crunch
If you have 20,000 vested options at a $5 strike price:
- Cash needed to buy shares: 20,000 × $5 = **$100,000**
- Plus potential AMT or ordinary income tax on the spread!
Many employees cannot afford $100k+ in cash within 90 days, especially for illiquid private shares that cannot yet be sold. This dynamic is often called the startup "golden handcuffs".

### Extended Exercise Windows
Recognizing this unfairness, forward-thinking companies (like Pinterest, Coinbase, and Quora) pioneered **extended exercise windows of 5 to 10 years** for employees who stay for at least 2 years. Check your grant agreement to see whether your company offers an extended PTEW!
    `
  },
  {
    id: "early-exercise-83b",
    slug: "exercising-early-and-83b-elections",
    title: "Exercising Early and IRS Section 83(b) Elections",
    category: "Taxes & Equity Types",
    readTime: "6 min read",
    summary: "How early-stage employees save hundreds of thousands in taxes by buying unvested stock and filing a simple two-page letter with the IRS within 30 days.",
    keyTakeaways: [
      "Early exercise allows you to purchase unvested shares immediately on day one.",
      "Filing an 83(b) election locks in a $0 or near-$0 tax spread before company value grows.",
      "You MUST mail your 83(b) election via USPS Certified Mail within strict 30 calendar days of grant/exercise.",
      "Risk: If you leave early or the company fails, you do not get your exercise money back."
    ],
    content: `
### What Is Early Exercise?
Some early-stage startups allow **early exercise**: you can exercise your entire stock option grant before the shares have vested. You receive actual "restricted stock" that is subject to a repurchase right by the company if you leave before vesting.

### The Power of the Section 83(b) Election
Under standard tax law (Section 83(a)), you are taxed on equity when it vests. If your startup grows from $0.10/share to $50.00/share, you would owe income taxes as each tranche vests at the higher valuation.

By filing a **Section 83(b) Election**, you notify the IRS that you elect to be taxed on the equity today, at the time of purchase:
- Purchase price: $0.10/share
- FMV on purchase date: $0.10/share
- Taxable spread: **$0.00**!

### The Strict 30-Day Deadline
The IRS enforces the 30-day deadline with zero exceptions:
1. You must mail the signed 83(b) letter to the IRS office for your state within **30 calendar days** of your exercise date.
2. You must use **USPS Certified Mail with Return Receipt Requested** as legal proof of postmark.
3. Send a copy to your employer's HR or legal counsel.
    `
  }
];

export const MOCK_COMPANIES = [
  {
    id: "comp_stripe",
    name: "Stripe",
    ticker: "STRIP",
    isPublic: false,
    sector: "Fintech & Payments",
    description: "Financial infrastructure platform for businesses. Millions of companies from startups to Fortune 500s use Stripe software and APIs to accept payments, send payouts, and manage business online.",
    foundedYear: 2010,
    keyLeadership: "Patrick Collison (CEO), John Collison (President)",
    fundingHistory: "Series I ($6.5B raised in 2023 at $50B valuation, previously $95B in 2021)",
    latestValuation: 65000000000,
    latestFmvPerShare: 26.50,
    metrics: {
      marketCapOrValuation: "$65 Billion",
      latestRound: "Series I / Secondary",
      totalRaised: "$8.7 Billion",
      headquarters: "San Francisco, CA & Dublin, Ireland",
      employees: "~8,000",
      isProfitable: "Cash-flow positive",
    },
    historicalPrices: [
      { date: "2021-01", price: 18.00 },
      { date: "2021-07", price: 38.00 },
      { date: "2022-01", price: 40.00 },
      { date: "2022-07", price: 28.00 },
      { date: "2023-01", price: 20.00 },
      { date: "2023-07", price: 23.50 },
      { date: "2024-01", price: 25.00 },
      { date: "2024-06", price: 26.50 },
    ]
  },
  {
    id: "comp_databricks",
    name: "Databricks",
    ticker: "DATA",
    isPublic: false,
    sector: "Data & Artificial Intelligence",
    description: "Cloud-based data storage and analysis platform providing a unified data analytics engine (Lakehouse architecture) built on Apache Spark and generative AI.",
    foundedYear: 2013,
    keyLeadership: "Ali Ghodsi (CEO & Co-founder), Matei Zaharia (CTO)",
    fundingHistory: "Series I ($500M raised at $43B valuation led by T. Rowe Price in late 2023)",
    latestValuation: 43000000000,
    latestFmvPerShare: 73.50,
    metrics: {
      marketCapOrValuation: "$43 Billion",
      latestRound: "Series I",
      totalRaised: "$4.0 Billion",
      headquarters: "San Francisco, CA",
      employees: "~6,500",
      annualRecurringRevenue: "$1.6B+ ARR",
    },
    historicalPrices: [
      { date: "2021-01", price: 42.00 },
      { date: "2021-09", price: 65.00 },
      { date: "2022-06", price: 58.00 },
      { date: "2023-01", price: 62.00 },
      { date: "2023-09", price: 71.00 },
      { date: "2024-06", price: 73.50 },
    ]
  },
  {
    id: "comp_figma",
    name: "Figma",
    ticker: "FIG",
    isPublic: false,
    sector: "Design & Collaboration",
    description: "Collaborative web-based interface design and prototyping tool used worldwide by software development teams.",
    foundedYear: 2012,
    keyLeadership: "Dylan Field (CEO & Co-founder)",
    fundingHistory: "Valued at $12.5B in 2024 employee tender offer following mutual Adobe merger termination",
    latestValuation: 12500000000,
    latestFmvPerShare: 32.00,
    metrics: {
      marketCapOrValuation: "$12.5 Billion",
      latestRound: "Tender Offer",
      totalRaised: "$333 Million",
      headquarters: "San Francisco, CA",
      employees: "~1,800",
      annualRecurringRevenue: "$600M+ ARR",
    },
    historicalPrices: [
      { date: "2021-01", price: 15.00 },
      { date: "2021-06", price: 28.00 },
      { date: "2022-09", price: 45.00 },
      { date: "2023-12", price: 29.00 },
      { date: "2024-05", price: 32.00 },
    ]
  },
  {
    id: "comp_apple",
    name: "Apple Inc.",
    ticker: "AAPL",
    isPublic: true,
    sector: "Consumer Electronics & Technology",
    description: "Global technology leader designing, manufacturing, and marketing smartphones, personal computers, tablets, wearables, and services.",
    foundedYear: 1976,
    keyLeadership: "Tim Cook (CEO), Luca Maestri (CFO)",
    fundingHistory: "Public (NASDAQ: AAPL)",
    latestValuation: 3450000000000,
    latestFmvPerShare: 228.50,
    metrics: {
      marketCapOrValuation: "$3.45 Trillion",
      peRatio: "34.2",
      weekRange52: "$164.08 - $237.23",
      dividendYield: "0.44%",
      headquarters: "Cupertino, CA",
      employees: "161,000",
    },
    historicalPrices: [
      { date: "2023-01", price: 135.00 },
      { date: "2023-06", price: 185.00 },
      { date: "2023-12", price: 192.00 },
      { date: "2024-03", price: 172.00 },
      { date: "2024-06", price: 215.00 },
      { date: "2024-09", price: 228.50 },
    ]
  },
  {
    id: "comp_nvidia",
    name: "NVIDIA Corporation",
    ticker: "NVDA",
    isPublic: true,
    sector: "Semiconductors & AI Hardware",
    description: "Pioneer in accelerated computing and graphics processing units (GPUs), powering enterprise AI, data centers, and supercomputers.",
    foundedYear: 1993,
    keyLeadership: "Jensen Huang (Founder & CEO), Colette Kress (CFO)",
    fundingHistory: "Public (NASDAQ: NVDA)",
    latestValuation: 2950000000000,
    latestFmvPerShare: 120.80,
    metrics: {
      marketCapOrValuation: "$2.95 Trillion",
      peRatio: "48.5",
      weekRange52: "$40.20 - $140.76",
      dividendYield: "0.03%",
      headquarters: "Santa Clara, CA",
      employees: "29,600",
    },
    historicalPrices: [
      { date: "2023-01", price: 18.00 },
      { date: "2023-06", price: 42.00 },
      { date: "2023-12", price: 49.00 },
      { date: "2024-03", price: 90.00 },
      { date: "2024-06", price: 125.00 },
      { date: "2024-09", price: 120.80 },
    ]
  }
];

export const MOCK_MARKET_INDICES = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    price: 5718.57,
    change: +16.22,
    changePercent: +0.28,
    status: "Open",
    high52Week: 5733.57,
    low52Week: 4103.78,
  },
  {
    symbol: "^IXIC",
    name: "Nasdaq Composite",
    price: 17974.27,
    change: +26.04,
    changePercent: +0.15,
    status: "Open",
    high52Week: 18671.07,
    low52Week: 12543.86,
  },
  {
    symbol: "^DJI",
    name: "Dow Jones Industrial",
    price: 42124.65,
    change: +61.29,
    changePercent: +0.15,
    status: "Open",
    high52Week: 42160.91,
    low52Week: 32327.20,
  },
  {
    symbol: "^RUT",
    name: "Russell 2000 (Small Caps)",
    price: 2220.14,
    change: -4.32,
    changePercent: -0.19,
    status: "Open",
    high52Week: 2299.16,
    low52Week: 1633.67,
  }
];

export const MOCK_NEWS_ARTICLES = [
  {
    id: "news_1",
    category: "IPO & Markets",
    headline: "Tech IPO Outlook Strengthens as Venture-Backed Unicorns Prepare S-1 Filings",
    summary: "Investment banks report increased activity among late-stage software and AI companies evaluating public listings in late 2024 and 2025 as equity markets maintain resilience.",
    source: "Financial Times",
    url: "https://www.ft.com",
    datetime: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    relatedTicker: "TECH"
  },
  {
    id: "news_2",
    category: "Fintech",
    headline: "Stripe Surpasses $1 Trillion in Total Payment Volume, Expanding Embedded Finance Footprint",
    summary: "Payments infrastructure giant Stripe achieved over $1T in processed volume in 2023, accelerating its enterprise software footprint with global multinationals.",
    source: "Bloomberg",
    url: "https://www.bloomberg.com",
    datetime: Date.now() - 1000 * 60 * 60 * 8, // 8 hours ago
    relatedTicker: "STRIP"
  },
  {
    id: "news_3",
    category: "Artificial Intelligence",
    headline: "Databricks Expands AI Capabilities with LakehouseIQ and Enterprise Model Serving",
    summary: "Databricks launches new automated governance and retrieval augmented generation tooling for Fortune 500 customers operating complex enterprise data lakes.",
    source: "TechCrunch",
    url: "https://techcrunch.com",
    datetime: Date.now() - 1000 * 60 * 60 * 18, // 18 hours ago
    relatedTicker: "DATA"
  },
  {
    id: "news_4",
    category: "Tax & Regulation",
    headline: "IRS Updates 2024 Alternative Minimum Tax Exemption Thresholds for Equity Compensation Holders",
    summary: "The Internal Revenue Service released inflation-adjusted figures for the Alternative Minimum Tax, increasing exemptions for individual filers holding incentive stock options.",
    source: "Wall Street Journal",
    url: "https://www.wsj.com",
    datetime: Date.now() - 1000 * 60 * 60 * 28, // 1 day ago
    relatedTicker: "TAX"
  }
];

