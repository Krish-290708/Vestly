import { LEARN_ARTICLES, type LearnArticle } from './learn/articles';
import { GLOSSARY_TERMS, type GlossaryItem } from './learn/glossary';

export type EducationalArticle = LearnArticle;
export type GlossaryTerm = GlossaryItem;

export { LEARN_ARTICLES as EDUCATIONAL_ARTICLES, GLOSSARY_TERMS };

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
    isPublic: true,
    sector: "Design & Collaboration",
    description: "Collaborative web-based interface design and prototyping tool used worldwide by software development teams.",
    foundedYear: 2012,
    keyLeadership: "Dylan Field (CEO & Co-founder)",
    fundingHistory: "Public (NYSE: FIG) since July 2025. Earlier private tender offer valued the company at $12.5B in 2024.",
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

const PRIVATE_SAMPLE_NOTE = ' Status and figures are a sample snapshot and may be out of date; check current sources.';
const PUBLIC_SAMPLE_NOTE = ' Live quotes appear when a market-data key is set.';

function sampleCompany(
  name: string,
  ticker: string | null,
  sector: string,
  description: string,
  foundedYear: number,
  keyLeadership: string | null = null
) {
  return {
    id: 'comp_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, ''),
    name,
    ticker,
    isPublic: ticker !== null,
    sector,
    description: description + (ticker ? PUBLIC_SAMPLE_NOTE : PRIVATE_SAMPLE_NOTE),
    foundedYear,
    keyLeadership,
    fundingHistory: ticker ? `Public (${ticker})` : 'Private; round details not included in sample data.',
    latestValuation: null as number | null,
    latestFmvPerShare: 0,
    metrics: null as Record<string, string> | null,
    historicalPrices: [] as Array<{ date: string; price: number }>,
  };
}

/** Extra browsing catalog. No prices or valuations are invented: they show as unavailable until a live source fills them in. */
export const EXTRA_COMPANIES = [
  sampleCompany('Alphabet Inc.', 'GOOGL', 'Internet & Cloud', 'Parent of Google. Search, advertising, cloud computing and AI research.', 1998, 'Sundar Pichai (CEO)'),
  sampleCompany('Amazon.com, Inc.', 'AMZN', 'E-commerce & Cloud', 'Online retail, logistics and cloud infrastructure through AWS.', 1994, 'Andy Jassy (CEO)'),
  sampleCompany('Meta Platforms, Inc.', 'META', 'Social Media & AI', 'Operator of Facebook, Instagram and WhatsApp.', 2004, 'Mark Zuckerberg (CEO & Founder)'),
  sampleCompany('Tesla, Inc.', 'TSLA', 'Automotive & Energy', 'Electric vehicles, energy storage and autonomy software.', 2003, 'Elon Musk (CEO)'),
  sampleCompany('Netflix, Inc.', 'NFLX', 'Streaming & Media', 'Subscription streaming of films and series.', 1997, 'Ted Sarandos and Greg Peters (Co-CEOs)'),
  sampleCompany('Salesforce, Inc.', 'CRM', 'Enterprise Software', 'Cloud customer-relationship management and enterprise applications.', 1999, 'Marc Benioff (Chair & CEO)'),
  sampleCompany('Oracle Corporation', 'ORCL', 'Enterprise Software & Cloud', 'Databases, enterprise applications and cloud infrastructure.', 1977),
  sampleCompany('Adobe Inc.', 'ADBE', 'Creative & Document Software', 'Creative, document and marketing software.', 1982),
  sampleCompany('Uber Technologies, Inc.', 'UBER', 'Mobility & Delivery', 'Ride-hailing, food delivery and freight marketplaces.', 2009, 'Dara Khosrowshahi (CEO)'),
  sampleCompany('Shopify Inc.', 'SHOP', 'E-commerce Software', 'Commerce platform for online and in-person merchants.', 2006, 'Tobi Lütke (CEO & Founder)'),
  sampleCompany('Datadog, Inc.', 'DDOG', 'Observability & Cloud', 'Monitoring and security platform for cloud applications.', 2010, 'Olivier Pomel (CEO & Co-founder)'),
  sampleCompany('Palantir Technologies Inc.', 'PLTR', 'Data & AI Software', 'Data analytics and AI platforms for governments and enterprises.', 2003, 'Alex Karp (CEO & Co-founder)'),
  sampleCompany('Coinbase Global, Inc.', 'COIN', 'Crypto & Fintech', 'Cryptocurrency exchange and custody platform.', 2012, 'Brian Armstrong (CEO & Co-founder)'),
  sampleCompany('DoorDash, Inc.', 'DASH', 'Mobility & Delivery', 'Local delivery marketplace for restaurants and retail.', 2013, 'Tony Xu (CEO & Co-founder)'),
  sampleCompany('CrowdStrike Holdings, Inc.', 'CRWD', 'Cybersecurity', 'Cloud-native endpoint and threat-detection security platform.', 2011, 'George Kurtz (CEO & Co-founder)'),
  sampleCompany('Cloudflare, Inc.', 'NET', 'Cybersecurity & Networking', 'Content delivery, DDoS protection and edge network services.', 2009, 'Matthew Prince (CEO & Co-founder)'),
  sampleCompany('MongoDB, Inc.', 'MDB', 'Databases', 'Document database and cloud data platform.', 2007),
  sampleCompany('Pinterest, Inc.', 'PINS', 'Social Media', 'Visual discovery and shopping platform.', 2010),
  sampleCompany('Roblox Corporation', 'RBLX', 'Gaming & Platforms', 'User-generated online games and virtual-experience platform.', 2004, 'David Baszucki (CEO & Founder)'),
  sampleCompany('Zoom Communications Inc.', 'ZM', 'Communications Software', 'Video meetings, phone and workplace collaboration.', 2011, 'Eric Yuan (CEO & Founder)'),
  sampleCompany('OpenAI', null, 'Artificial Intelligence', 'Developer of general-purpose AI models and products.', 2015, 'Sam Altman (CEO)'),
  sampleCompany('Anthropic', null, 'Artificial Intelligence', 'AI safety company and developer of the Claude models.', 2021, 'Dario Amodei (CEO & Co-founder)'),
  sampleCompany('SpaceX', null, 'Aerospace', 'Launch services, satellite internet and spacecraft.', 2002, 'Elon Musk (CEO)'),
  sampleCompany('Canva', null, 'Design Software', 'Online design and publishing platform.', 2013, 'Melanie Perkins (CEO & Co-founder)'),
  sampleCompany('Plaid', null, 'Fintech Infrastructure', 'Connects apps to bank accounts through financial data APIs.', 2013, 'Zach Perret (CEO & Co-founder)'),
  sampleCompany('Ramp', null, 'Fintech & Spend Management', 'Corporate cards and spend-management software.', 2019, 'Eric Glyman (CEO & Co-founder)'),
  sampleCompany('Revolut', null, 'Fintech & Banking', 'Digital banking and money-transfer app.', 2015, 'Nik Storonsky (CEO & Founder)'),
  sampleCompany('Epic Games', null, 'Gaming', 'Maker of Fortnite and the Unreal Engine.', 1991, 'Tim Sweeney (CEO & Founder)'),
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

/**
 * Illustrative sample items shown only when no live news feed is available.
 * They are written for Vestly, are not real reporting, and name no outlet or link.
 */
export const MOCK_NEWS_ARTICLES = [
  {
    id: "news_1",
    category: "IPO & Markets",
    headline: "Why IPO windows matter to employees holding private-company equity",
    summary: "When public markets are open, late-stage companies are more likely to file to list, which can turn illiquid shares into sellable ones after a lock-up. Sample item for illustration.",
    source: "Vestly sample",
    url: "",
    datetime: Date.now() - 1000 * 60 * 60 * 3,
    relatedTicker: "TECH"
  },
  {
    id: "news_2",
    category: "Fintech",
    headline: "What a tender offer means for your vested shares",
    summary: "A company-run tender lets employees sell some vested equity before an IPO. Tax depends on grant type, cost basis and holding period. Sample item for illustration.",
    source: "Vestly sample",
    url: "",
    datetime: Date.now() - 1000 * 60 * 60 * 8,
    relatedTicker: "TENDER"
  },
  {
    id: "news_3",
    category: "Artificial Intelligence",
    headline: "How dilution from new funding rounds changes what your options are worth",
    summary: "Each priced round issues new shares, shrinking your percentage ownership even when the company value rises. Sample item for illustration.",
    source: "Vestly sample",
    url: "",
    datetime: Date.now() - 1000 * 60 * 60 * 18,
    relatedTicker: "DILUTE"
  },
  {
    id: "news_4",
    category: "Tax & Regulation",
    headline: "AMT thresholds change every year: check the current figures before exercising ISOs",
    summary: "The exemption and phase-out amounts are adjusted for inflation annually. Look up the current IRS figures before planning an exercise. Sample item for illustration.",
    source: "Vestly sample",
    url: "",
    datetime: Date.now() - 1000 * 60 * 60 * 28,
    relatedTicker: "TAX"
  }
];
