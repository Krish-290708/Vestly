/**
 * Researched, dated company profiles used on the company detail page.
 *
 * Every figure here comes from a linked public source and carries a date. Nothing is estimated.
 * Private-company numbers change quickly, so each profile shows its own "as of" date and the page
 * tells the reader to check for newer rounds. Listed companies get live numbers from Finnhub instead.
 */

export interface InsightSource {
  title: string;
  url: string;
}

export type InsightEventKind = 'funding' | 'tender' | 'secondary' | 'ipo' | 'other';

export interface InsightEvent {
  /** YYYY-MM or YYYY-MM-DD */
  date: string;
  kind: InsightEventKind;
  headline: string;
  valuationUsd?: number;
  /** Index into the profile's sources array. */
  source: number;
}

export interface InsightFact {
  label: string;
  value: string;
  source: number;
}

export type IpoStatus = 'listed' | 'reported-preparing' | 'none-reported';

export interface CompanyInsight {
  /** Matches the company page slug (lowercased name, hyphenated). */
  key: string;
  /** YYYY-MM the facts were last checked. */
  asOf: string;
  summary: string;
  ipoStatus: IpoStatus;
  events: InsightEvent[];
  facts: InsightFact[];
  /** What this history means for someone holding options, in plain language. */
  esopNotes: string[];
  /** Editorial list, not a market-share ranking. */
  competitors: string[];
  sources: InsightSource[];
}

const AS_OF = '2026-11';

export const COMPANY_INSIGHTS: CompanyInsight[] = [
  {
    key: 'stripe',
    asOf: AS_OF,
    summary:
      'Stripe builds payment and billing software that businesses use to take money online and in person. It has stayed private, and regularly lets current and former employees sell shares through tender offers.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2026-02-24',
        kind: 'tender',
        headline:
          'Tender offer sets a $159B valuation. Thrive Capital, Coatue and a16z provide most of the funds; Stripe also uses its own capital to repurchase shares. Open to current and former employees.',
        valuationUsd: 159_000_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'Total volume 2025', value: '$1.9 trillion, up 34% from 2024', source: 0 },
      { label: 'Profitability', value: 'Reported profitable in 2024 (JPMorgan analysts, Oct 2025)', source: 0 },
    ],
    esopNotes: [
      'Tender offers are how Stripe employees turn options into cash without an IPO. The company chooses the timing, the price and how much each person may sell.',
      'The tender price is set by the company and its buyers. It is not the same as the 409A value that sets your strike price.',
    ],
    competitors: ['Adyen', 'PayPal (Braintree)', 'Block', 'Checkout.com'],
    sources: [
      {
        title: 'The Block: Stripe valuation jumps to $159 billion on back of tender offer (Feb 24, 2026)',
        url: 'https://www.theblock.co/news/business/2026-02-24-stripe-valuation-jumps-to-159-billion-on-back-of-tender-offer-391075',
      },
    ],
  },
  {
    key: 'databricks',
    asOf: AS_OF,
    summary:
      'Databricks sells a data and AI platform that companies use to store, analyse and build models on their data. It is private and has been raising large rounds at rising valuations.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2026-07-16',
        kind: 'funding',
        headline:
          'Signed a term sheet for a funding round at a $188B valuation, led by existing investor Coatue. Expected to close later in the summer of 2026. Round size not stated.',
        valuationUsd: 188_000_000_000,
        source: 0,
      },
    ],
    facts: [{ label: 'Employee liquidity', value: 'Not mentioned in the company announcement', source: 0 }],
    esopNotes: [
      'The announcement does not mention an employee tender, so a high valuation does not by itself mean you can sell. Ask HR whether and when a tender is planned.',
      'A much higher valuation can raise future 409A values and your tax cost to exercise, even before you can sell.',
    ],
    competitors: ['Snowflake', 'Google BigQuery', 'Microsoft Fabric'],
    sources: [
      {
        title: 'Databricks press release: raising strategic round at $188 billion valuation (Jul 16, 2026)',
        url: 'https://www.databricks.com/company/newsroom/press-releases/databricks-raising-strategic-round-funding-188-billion-valuation',
      },
    ],
  },
  {
    key: 'notion',
    asOf: AS_OF,
    summary:
      'Notion makes a workspace app for notes, documents, wikis and project tracking, with a growing set of AI features. It is private and has run several employee share sales.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2022-07-29',
        kind: 'tender',
        headline: 'Sequoia and Index Ventures bought shares from employees at a $10B valuation, the same as the last financing round.',
        valuationUsd: 10_000_000_000,
        source: 0,
      },
      {
        date: '2025-12-16',
        kind: 'secondary',
        headline:
          'Employee share sale offered at an $11B valuation, with Sequoia, Index Ventures and GIC named as participants. Reported at about $300M in total.',
        valuationUsd: 11_000_000_000,
        source: 1,
      },
    ],
    facts: [
      { label: 'Annual recurring revenue', value: 'Over $600M, with about half from AI products (Dec 2025 report)', source: 1 },
      { label: 'Cash flow', value: 'Reported cash-flow positive by unnamed sources', source: 1 },
    ],
    esopNotes: [
      'Notion has offered employees repeat chances to sell, three and a half years apart in the sales above. That is a good sign for liquidity, but it is not a promise of another one.',
      'The 2022 sale was priced at the same level as the last financing round, which is a common pattern: tenders often follow the latest round.',
    ],
    competitors: ['Atlassian (Confluence)', 'Microsoft', 'Google Workspace', 'Coda'],
    sources: [
      { title: 'Notion blog: Sequoia and Index purchase shares from Notion employees (Jul 29, 2022)', url: 'https://notion.com/blog/sequoia-index-purchase-shares-from-notion-employees' },
      { title: 'Report on Notion\'s $11B employee share sale (Dec 16, 2025)', url: 'https://www.itiger.com/news/1136424118' },
    ],
  },
  {
    key: 'rippling',
    asOf: AS_OF,
    summary:
      'Rippling sells software for payroll, benefits, IT and device management in one system. It is private and has paired its last two funding rounds with employee tender offers.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2024-04',
        kind: 'funding',
        headline: '$200M Series F led by Coatue at a $13.4B valuation, alongside a $590M tender offer (of which $200M was for employees).',
        valuationUsd: 13_400_000_000,
        source: 0,
      },
      {
        date: '2025-05-09',
        kind: 'funding',
        headline: '$450M Series G at a $16.8B valuation, with a $200M tender offer for current and former employees alongside it.',
        valuationUsd: 16_800_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'Annualised revenue', value: 'About $570M (The Information, as reported by TechCrunch, May 2025)', source: 0 },
      { label: 'Total raised', value: '$1.85B', source: 0 },
    ],
    esopNotes: [
      'Two rounds in a row came with employee tenders. That is a useful pattern for option holders, but check whether the company limits how much each person can sell.',
      'Valuation rose about 25% between the two rounds, so options granted at an earlier 409A could have a larger spread than a newer grant.',
    ],
    competitors: ['Gusto', 'ADP', 'Workday', 'Deel'],
    sources: [
      { title: 'TechCrunch: Rippling raises $450M at a $16.8B valuation (May 9, 2025)', url: 'https://techcrunch.com/2025/05/09/rippling-raises-450m-at-a-16-8b-valuation-reveals-yc-is-a-customer' },
    ],
  },
  {
    key: 'openai',
    asOf: AS_OF,
    summary:
      'OpenAI develops general-purpose AI models and the products built on them. It is private, has repeatedly let employees sell shares, and has reportedly filed confidentially to go public.',
    ipoStatus: 'reported-preparing',
    events: [
      {
        date: '2025-10',
        kind: 'tender',
        headline: '$6.6B tender offer at a $500B valuation.',
        valuationUsd: 500_000_000_000,
        source: 0,
      },
      {
        date: '2026-08-10',
        kind: 'secondary',
        headline: 'About $7B secondary share sale for current and former employees at an $852B valuation. Who funded the purchase was not stated in the source.',
        valuationUsd: 852_000_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'IPO', value: 'Reported to have confidentially filed with the SEC in June 2026; no timeline set', source: 0 },
      { label: 'Earlier tender', value: '$1.5B offer in 2024 (valuation not stated)', source: 0 },
    ],
    esopNotes: [
      'Secondary sales are a regular part of OpenAI\'s pre-IPO pattern. For an employee, the next liquidity event may be the IPO itself.',
      'IPOs usually come with a lock-up, a period when insiders cannot sell. Ask what your lock-up terms would be.',
    ],
    competitors: ['Anthropic', 'Google DeepMind', 'Meta', 'xAI'],
    sources: [
      { title: 'Dealroom: OpenAI closes $7B share sale at $852B valuation ahead of IPO (Aug 2026)', url: 'https://dealroom.co/news/144253-openai-closes-7b-share-sale-at-852b-valuation-ahead-of-ipo/' },
    ],
  },
  {
    key: 'anthropic',
    asOf: AS_OF,
    summary:
      'Anthropic is an AI safety company that builds the Claude family of models. It is private, is reported to be preparing for a possible IPO, and ran an employee tender offer in early 2026.',
    ipoStatus: 'reported-preparing',
    events: [
      {
        date: '2026-02',
        kind: 'funding',
        headline: 'Series G raised $30B at a $380B post-money valuation.',
        valuationUsd: 380_000_000_000,
        source: 0,
      },
      {
        date: '2026-04',
        kind: 'tender',
        headline:
          'Employee tender offer closed at a $350B pre-money valuation. It opened in late February, was open to current and former employees with at least one year of tenure, and investors hoped to buy $5B to $6B. Fewer shares sold than that because most employees kept their stock.',
        valuationUsd: 350_000_000_000,
        source: 0,
      },
    ],
    facts: [{ label: 'IPO', value: 'Reported to be preparing for a potential IPO in 2026', source: 0 }],
    esopNotes: [
      'The tender needed at least one year of tenure to take part, so eligibility rules can shut out newer employees. Check yours.',
      'Many employees chose not to sell, which shows that holding for a possible IPO is a real trade-off against taking cash now.',
    ],
    competitors: ['OpenAI', 'Google DeepMind', 'Meta', 'xAI'],
    sources: [
      { title: 'TipRanks: Anthropic wraps up tender offer as employees resist selling shares ahead of IPO (Apr 9, 2026)', url: 'https://www.tipranks.com/news/anthropic-wraps-up-tender-offer-as-employees-resist-selling-shares-ahead-of-ipo' },
    ],
  },
  {
    key: 'canva',
    asOf: AS_OF,
    summary:
      'Canva runs an online design and publishing platform used for presentations, social posts and documents. It is private and has run several employee share sales while preparing for a possible US listing.',
    ipoStatus: 'reported-preparing',
    events: [
      {
        date: '2024-10',
        kind: 'secondary',
        headline: 'Valuation rose 23% to $32B following a share trade. About $1.6B of shares changed hands in secondary sales over the prior 18 months.',
        valuationUsd: 32_000_000_000,
        source: 1,
      },
      {
        date: '2025-08-20',
        kind: 'secondary',
        headline: 'Launched an employee stock sale at a $42B valuation. Employees can sell to new and existing investors, including Fidelity and JPMorgan Asset Management.',
        valuationUsd: 42_000_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'US parent company', value: 'Set up in 2025. Under Australian tax rules the restructure counted as vesting for former staff, creating a tax bill', source: 1 },
      { label: 'Sale limits (2025 plan)', value: 'Up to 20% of vested equity, capped at $1M, plus shares to cover tax', source: 1 },
    ],
    esopNotes: [
      'A corporate restructure can create a tax bill before you have sold anything. Canva\'s secondary sale was designed to cover that bill, and it also offered loans.',
      'Sale limits (a percentage of vested equity and a dollar cap) mean a tender may let you sell only part of what you hold.',
    ],
    competitors: ['Adobe', 'Figma', 'Microsoft (Designer)'],
    sources: [
      { title: 'Bloomberg Law: Canva begins share sale at $42 billion valuation (Aug 20, 2025)', url: 'https://news.bloomberglaw.com/antitrust/canva-begins-share-sale-at-42-billion-valuation-in-road-to-ipo' },
      { title: 'Startup Daily: Canva\'s planned secondary sale and why former employees may need to sell (Jun 2025)', url: 'https://www.startupdaily.net/topic/business/canvas-plotting-another-773m-share-sale-at-a-higher-56-billion-valuation-and-becoming-a-us-company-is-one-reason-why-former-employees-may-need-to-sell/' },
    ],
  },
  {
    key: 'plaid',
    asOf: AS_OF,
    summary:
      'Plaid provides the connections that let apps read bank account data, and has expanded into payments and identity. It is private and has used tender offers to give employees liquidity.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2021',
        kind: 'funding',
        headline: 'Peak valuation of $13.4B.',
        valuationUsd: 13_400_000_000,
        source: 0,
      },
      {
        date: '2025-04',
        kind: 'tender',
        headline: 'Tender offer at a $6.1B valuation.',
        valuationUsd: 6_100_000_000,
        source: 0,
      },
      {
        date: '2026-02-26',
        kind: 'tender',
        headline: 'New raise to provide employee liquidity at an $8B valuation, up 31% from April 2025. Size and participants not stated.',
        valuationUsd: 8_000_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'Total raised', value: 'About $1.3B', source: 0 },
      { label: 'Visa deal', value: 'Planned acquisition fell apart over regulatory concerns', source: 0 },
    ],
    esopNotes: [
      'The 2026 valuation is still about 40% below the 2021 peak. If your options were granted near the peak, your strike price may be above today\'s value.',
      'Two tender offers within a year is a good liquidity signal, but check each one\'s eligibility and sale limits.',
    ],
    competitors: ['MX', 'Finicity (Mastercard)', 'Yodlee', 'Tink (Visa)'],
    sources: [
      { title: 'Crunchbase News: Plaid completes tender offer at $8B valuation (Feb 26, 2026)', url: 'https://news.crunchbase.com/fintech/plaid-completes-tender-offer-8b-valuation' },
    ],
  },
  {
    key: 'ramp',
    asOf: AS_OF,
    summary:
      'Ramp sells corporate cards and spend-management software that automates expense tracking and bill pay. It is private and has raised several rounds in a short time at fast-rising valuations.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2025-11',
        kind: 'funding',
        headline: '$300M primary round at a $32B valuation, reported alongside a tender offer.',
        valuationUsd: 32_000_000_000,
        source: 1,
      },
      {
        date: '2026-06-04',
        kind: 'funding',
        headline: '$750M Series F at a $44B valuation, led by ICONIQ, GIC and Ontario Teachers\' Pension Plan. No employee tender mentioned in the announcement.',
        valuationUsd: 44_000_000_000,
        source: 0,
      },
    ],
    facts: [
      { label: 'Annualised revenue', value: 'Over $1B, with positive free cash flow (company figures, Jun 2026)', source: 0 },
      { label: 'Customers', value: '70,000+', source: 0 },
      { label: 'Total equity raised', value: 'Over $3B', source: 0 },
    ],
    esopNotes: [
      'Valuation rose about 38% in roughly seven months. Fast increases make later 409A values and strike prices harder to predict.',
      'The Series F announcement mentions no employee tender, so ask whether one is planned before counting on liquidity.',
    ],
    competitors: ['Brex', 'American Express', 'Expensify', 'BILL'],
    sources: [
      { title: 'Ontario Teachers\': Ramp raises Series F at $44 billion valuation (Jun 4, 2026)', url: 'https://otpp.com/en-ca/about-us/news-and-insights/2026/ramp-raises-series-f-at-44-billion-valuation/' },
      { title: 'Pulse 2.0: Ramp, $32 billion valuation after $300 million raise and tender offer', url: 'https://pulse2.com/ramp-32-billion-valuation-achieved-after-300-million-raise-and-tender-offer' },
    ],
  },
  {
    key: 'revolut',
    asOf: AS_OF,
    summary:
      'Revolut is a digital bank and money app offering accounts, cards, transfers, trading and loans in many countries. It is private and values itself through regular secondary share sales that employees can join.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2024',
        kind: 'secondary',
        headline: 'Valued at $45B.',
        valuationUsd: 45_000_000_000,
        source: 0,
      },
      {
        date: '2025',
        kind: 'secondary',
        headline: 'Valued at $75B through secondary transactions.',
        valuationUsd: 75_000_000_000,
        source: 0,
      },
      {
        date: '2026-11-04',
        kind: 'secondary',
        headline:
          'Valuation confirmed at $115B after a secondary sale at about $2,017 per share. Existing employees and investors could cash in shares. No fresh capital was raised; size not disclosed.',
        valuationUsd: 115_000_000_000,
        source: 0,
      },
    ],
    facts: [{ label: 'Retail customers', value: 'Over 80 million', source: 0 }],
    esopNotes: [
      'Revolut\'s secondary sales let employees sell without a new funding round. The price is set by buyers in that sale, not by an independent valuation.',
      'The source does not say how much each employee could sell. Ask about the cap and eligibility before the next one.',
    ],
    competitors: ['Wise', 'Monzo', 'N26', 'Nubank'],
    sources: [
      { title: 'Tech.eu: Revolut confirms $115bn valuation after completing secondary sale (Nov 4, 2026)', url: 'https://tech.eu/2026/11/04/revolut-confirms-115bn-valuation-after-completing-secondary-sale/' },
    ],
  },
  {
    key: 'epic-games',
    asOf: AS_OF,
    summary:
      'Epic Games makes Fortnite and the Unreal Engine, which other studios use to build games and visual effects. It is privately held.',
    ipoStatus: 'none-reported',
    events: [
      {
        date: '2024-02',
        kind: 'funding',
        headline: 'Disney committed $1.5B for an equity stake in Epic. A valuation was not stated in the source.',
        source: 0,
      },
      {
        date: '2026-03-24',
        kind: 'other',
        headline: 'CEO Tim Sweeney confirmed layoffs of more than 1,000 people in a memo.',
        source: 0,
      },
    ],
    facts: [],
    esopNotes: [
      'No recent tender offer or priced round was found in public sources, so there is no market price to compare to. A tender is the main way option holders at a company like this can sell.',
      'Large layoffs are a reason to check your post-termination exercise window, in case your employment ends.',
    ],
    competitors: ['Roblox', 'Unity', 'Valve (Steam)'],
    sources: [
      { title: 'WDW Magic: Disney\'s $1.5 billion Epic Games deal meets a complicated reality after mass layoffs (Mar 24, 2026)', url: 'https://www.wdwmagic.com/other/walt-disney-company/news/24mar2026-disneys-1.5-billion-epic-games-deal-meets-a-complicated-reality-after-mass-layoffs.htm' },
    ],
  },
  {
    key: 'spacex',
    asOf: AS_OF,
    summary:
      'SpaceX builds rockets and spacecraft and runs the Starlink satellite internet service. It listed on Nasdaq in summer 2026, so its shares now trade publicly.',
    ipoStatus: 'listed',
    events: [
      {
        date: '2026-07',
        kind: 'ipo',
        headline: 'Listed on Nasdaq (SPCX) in summer 2026, raising $85.7B. About 5% of shares were sold to the public at the IPO.',
        source: 0,
      },
      {
        date: '2026-10-22',
        kind: 'other',
        headline: 'A staged lock-up release on this date freed about 1.3 billion shares, and the stock fell 9% that day.',
        source: 0,
      },
    ],
    facts: [
      { label: 'Lock-up schedule', value: 'Staged: about 20% after Q2 results, about 28% after Q3, about 17% in December. A large block held by the CEO is released next summer', source: 0 },
    ],
    esopNotes: [
      'Lock-ups are why employees often cannot sell on listing day. SpaceX released shares in stages rather than all at once.',
      'Large share releases can push the price down, as this one did. If you hold a similar stock, plan sales around release dates and your company\'s trading windows.',
    ],
    competitors: [],
    sources: [
      { title: 'Yahoo Finance: SpaceX\'s December lock-up expiry (Nov 7, 2026)', url: 'https://finance.yahoo.com/markets/stocks/articles/spacexs-december-lockup-nearly-biggest-210500586.html' },
    ],
  },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Finds a researched profile by company name or ticker. */
export function getCompanyInsight(name: string, ticker?: string | null): CompanyInsight | null {
  const slug = slugify(name);
  return (
    COMPANY_INSIGHTS.find((i) => i.key === slug) ||
    (ticker ? COMPANY_INSIGHTS.find((i) => i.key === ticker.toLowerCase()) : undefined) ||
    null
  );
}

// ---------------------------------------------------------------------------
// Scorecard: facts to weigh, never a rating or a recommendation.
// ---------------------------------------------------------------------------

export interface ScorecardRow {
  indicator: string;
  value: string;
  meaning: string;
}

export interface ListedMetrics {
  peTtm: number | null;
  revenueGrowthTtmYoy: number | null;
  netMarginTtm: number | null;
  weekHigh52: number | null;
  weekLow52: number | null;
  beta: number | null;
  marketCapUsd: number | null;
}

export interface AnalystConsensus {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2).replace(/\.?0+$/, '')}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1).replace(/\.0$/, '')}B`;
  return `$${(n / 1e6).toFixed(0)}M`;
}

function monthsBetween(a: string, b: string): number {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return (by - ay) * 12 + ((bm || 1) - (am || 1));
}

export function pricedEvents(insight: CompanyInsight): InsightEvent[] {
  return insight.events
    .filter((e) => typeof e.valuationUsd === 'number')
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Rows for a private company, built only from its researched profile. */
export function buildPrivateScorecard(insight: CompanyInsight, now: Date = new Date()): ScorecardRow[] {
  const rows: ScorecardRow[] = [];
  const priced = pricedEvents(insight);
  const latest = priced[priced.length - 1];

  if (latest) {
    rows.push({
      indicator: 'Latest priced event',
      value: `${fmtUsd(latest.valuationUsd as number)} (${latest.date}, ${latest.kind})`,
      meaning: 'The most recent price set by a funding round, tender or secondary sale. It is not your 409A or strike price.',
    });
    const prev = priced[priced.length - 2];
    if (prev) {
      const pct = ((latest.valuationUsd as number) / (prev.valuationUsd as number) - 1) * 100;
      const gap = Math.abs(monthsBetween(prev.date.slice(0, 7), latest.date.slice(0, 7)));
      rows.push({
        indicator: 'Change from the previous priced event',
        value: `${pct >= 0 ? '+' : ''}${pct.toFixed(0)}% over about ${gap} month${gap === 1 ? '' : 's'}`,
        meaning: 'A rising valuation raises what your shares may sell for, and can raise future 409A values and tax on exercise.',
      });
    }
  }

  const liquidity = insight.events.filter((e) => e.kind === 'tender' || e.kind === 'secondary');
  const nowYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const recent = liquidity.filter((e) => monthsBetween(e.date.slice(0, 7), nowYm) <= 36);
  rows.push({
    indicator: 'Employee sale events found (last 3 years)',
    value: recent.length === 0 ? 'None found in public sources' : String(recent.length),
    meaning:
      'Tender offers and secondary sales are how option holders at a private company can sell. Past events do not promise future ones, and each has its own eligibility rules and caps.',
  });

  rows.push({
    indicator: 'IPO status',
    value:
      insight.ipoStatus === 'listed'
        ? 'Listed'
        : insight.ipoStatus === 'reported-preparing'
          ? 'Reported to be preparing (not confirmed by a listing date)'
          : 'No IPO reported',
    meaning: 'An IPO is the other main route to liquidity. It usually comes with a lock-up period before insiders can sell.',
  });

  for (const f of insight.facts) {
    if (/profit|cash/i.test(f.label + ' ' + f.value)) {
      rows.push({ indicator: f.label, value: f.value, meaning: 'A company that funds itself is less likely to need a dilutive round.' });
      break;
    }
  }

  const age = monthsBetween(insight.asOf, nowYm);
  rows.push({
    indicator: 'How fresh this data is',
    value: `Checked ${insight.asOf}${age > 0 ? ` (${age} month${age === 1 ? '' : 's'} ago)` : ''}`,
    meaning:
      age > 6
        ? 'This is more than six months old. Private companies change fast, so look for newer rounds before relying on it.'
        : 'Private-company figures change quickly. Check for newer rounds before a decision.',
  });
  return rows;
}

/** Rows for a listed company, from live metrics when available. */
export function buildListedScorecard(
  m: ListedMetrics | null,
  price: number | null,
  consensus: AnalystConsensus | null
): ScorecardRow[] {
  const rows: ScorecardRow[] = [
    {
      indicator: 'Liquidity',
      value: 'Shares trade on a public market',
      meaning: 'You can sell vested shares, subject to any lock-up and your employer\'s trading windows and insider rules.',
    },
  ];
  if (!m) return rows;

  if (m.peTtm !== null)
    rows.push({ indicator: 'Price to earnings (trailing 12 months)', value: m.peTtm.toFixed(1), meaning: 'How many dollars investors pay for each dollar of profit. Compare it with the peers below, not in isolation.' });
  if (m.revenueGrowthTtmYoy !== null)
    rows.push({ indicator: 'Revenue growth (year on year)', value: `${m.revenueGrowthTtmYoy.toFixed(1)}%`, meaning: 'Faster growth can support a higher price, but it can also fade.' });
  if (m.netMarginTtm !== null)
    rows.push({ indicator: 'Net profit margin', value: `${m.netMarginTtm.toFixed(1)}%`, meaning: 'Share of revenue left as profit. Negative means the company currently loses money.' });
  if (m.weekHigh52 !== null && m.weekLow52 !== null && price !== null && m.weekHigh52 > m.weekLow52) {
    const pos = ((price - m.weekLow52) / (m.weekHigh52 - m.weekLow52)) * 100;
    const clamped = Math.max(0, Math.min(100, pos));
    rows.push({
      indicator: 'Position in 52-week range',
      value: `${clamped.toFixed(0)}% (low $${m.weekLow52.toFixed(2)}, high $${m.weekHigh52.toFixed(2)})`,
      meaning: '0% is the lowest price of the past year and 100% the highest. It shows where the price sits, not where it is going.',
    });
  }
  if (m.beta !== null)
    rows.push({ indicator: 'Beta (volatility vs the market)', value: m.beta.toFixed(2), meaning: 'Above 1 means the stock has moved more than the market. A volatile price makes the value of your equity swing more.' });
  if (consensus) {
    const total = consensus.strongBuy + consensus.buy + consensus.hold + consensus.sell + consensus.strongSell;
    if (total > 0) {
      const positive = consensus.strongBuy + consensus.buy;
      const negative = consensus.sell + consensus.strongSell;
      rows.push({
        indicator: 'Analyst ratings (third-party opinion)',
        value: `${positive} buy, ${consensus.hold} hold, ${negative} sell of ${total} (${consensus.period})`,
        meaning: 'Opinions from Wall Street analysts, shown as reported. They are not Vestly\'s view, and analysts are often wrong.',
      });
    }
  }
  return rows;
}
