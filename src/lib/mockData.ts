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
