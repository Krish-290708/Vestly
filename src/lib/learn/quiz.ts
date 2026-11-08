/**
 * 10-Question Equity Knowledge Quiz
 * "The Ledger" Design System — Interactive assessment of equity comprehension
 */

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: string;
  relatedArticleSlug: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What is the primary difference between a stock option and an actual share of stock?',
    options: [
      'A stock option carries immediate voting rights on corporate matters.',
      'A stock option grants the right to buy a share at a fixed strike price, but is not yet stock.',
      'A stock option cannot expire under federal law.',
      'A stock option has no strike price and delivers shares for free.',
    ],
    correctIndex: 1,
    explanation: 'A stock option is a financial contract granting the right—without obligation—to purchase common shares at a predetermined strike price. You do not own shares until you exercise the option.',
    category: 'Foundations',
    relatedArticleSlug: 'esop-basics',
  },
  {
    id: 2,
    question: 'Under a standard 4-year vesting schedule with a 1-year cliff, what percentage vests if an employee resigns at month 11?',
    options: [
      '22.9% (11/48ths pro-rata)',
      '25.0% (standard first-year allocation)',
      '0% (zero equity vests prior to the 12-month cliff)',
      '10% (statutory minimum severance)',
    ],
    correctIndex: 2,
    explanation: 'A cliff requires continuous service until the milestone date. Leaving at 11 months results in 0% vested equity; reaching month 12 immediately vests 25% of the total grant.',
    category: 'Foundations',
    relatedArticleSlug: 'understanding-vesting-and-cliffs',
  },
  {
    id: 3,
    question: 'What is the strict deadline for mailing an IRS Section 83(b) election following an early exercise?',
    options: [
      'By April 15 of the following tax year',
      'Within 30 calendar days of the grant or exercise date',
      'Within 90 days of employment commencement',
      'By the end of the calendar month of exercise',
    ],
    correctIndex: 1,
    explanation: 'Under IRC Section 83(b), the signed election must be postmarked and mailed to the designated IRS office within strict 30 calendar days. The IRS grants zero late-filing extensions.',
    category: 'Taxation',
    relatedArticleSlug: 'early-exercise-and-83b-election',
  },
  {
    id: 4,
    question: 'Which tax system applies to the paper spread between FMV and strike price upon exercising Incentive Stock Options (ISOs)?',
    options: [
      'FICA payroll taxes (Social Security and Medicare)',
      'Alternative Minimum Tax (AMT)',
      'State unemployment withholding',
      'Corporate excise tax',
    ],
    correctIndex: 1,
    explanation: 'For ISOs, the exercise spread is an adjustment item for the Alternative Minimum Tax (AMT) under IRC Section 56(b)(3). No ordinary income tax is withheld at exercise.',
    category: 'Taxation',
    relatedArticleSlug: 'amt-deep-dive-for-iso',
  },
  {
    id: 5,
    question: 'To achieve a qualifying disposition on ISO shares for long-term capital gains, what holding periods are required?',
    options: [
      '1 year from grant and 6 months from exercise',
      '2 years from grant date AND 1 year from exercise date',
      '3 years from grant date regardless of exercise date',
      '5 years under Qualified Small Business Stock (QSBS) rules only',
    ],
    correctIndex: 1,
    explanation: 'Under IRC Section 422(a)(1), a qualifying disposition requires holding the shares for at least 2 years from the date of grant AND at least 1 year from the date of exercise.',
    category: 'Taxation',
    relatedArticleSlug: 'qualifying-vs-disqualifying-dispositions',
  },
  {
    id: 6,
    question: 'What happens to unexercised ISOs after 90 days following employment departure if the company offers an extended 10-year window?',
    options: [
      'They are cancelled permanently under corporate law.',
      'They convert automatically by tax law into Non-Qualified Stock Options (NSOs).',
      'They become restricted stock units with zero strike price.',
      'They immediately trigger ordinary income tax without exercise.',
    ],
    correctIndex: 1,
    explanation: 'Under federal tax law, incentive stock option status expires 90 days post-termination. Under extended exercise plans, the options remain exercisable but convert into NSOs, subject to ordinary income tax upon exercise.',
    category: 'Legal',
    relatedArticleSlug: 'what-happens-to-options-if-i-leave',
  },
  {
    id: 7,
    question: 'Why is an independent Section 409A valuation required for private company option grants?',
    options: [
      'To set the minimum strike price at or above common stock fair market value to avoid IRS tax penalties.',
      'To register the company shares for public trading on NASDAQ.',
      'To determine the annual dividend payout for common shareholders.',
      'To calculate founder equity percentages for incorporation filings.',
    ],
    correctIndex: 0,
    explanation: 'Section 409A of the Internal Revenue Code requires private companies to obtain an independent appraisal at least once every 12 months so options are not granted at a discount, which triggers immediate taxation plus a 20% federal penalty.',
    category: 'Valuation',
    relatedArticleSlug: 'strike-price-vs-fmv',
  },
  {
    id: 8,
    question: 'What is the standard underwriter lockup period preventing employees from selling shares after an IPO?',
    options: [
      '30 calendar days',
      '90 calendar days',
      '180 calendar days',
      '1 full calendar year',
    ],
    correctIndex: 2,
    explanation: 'Investment banks require insiders and employees to execute lockup agreements prohibiting public market share sales for 180 days following an IPO to ensure price stability.',
    category: 'Liquidity',
    relatedArticleSlug: 'ipo-mechanics-and-lockups',
  },
  {
    id: 9,
    question: 'How is an employee’s percentage ownership calculated on a fully diluted cap table?',
    options: [
      'Granted shares divided by issued common shares only',
      'Granted shares divided by total fully diluted shares (common + preferred + options + pool)',
      'Granted shares divided by founder shares only',
      'Vested shares multiplied by strike price',
    ],
    correctIndex: 1,
    explanation: 'True ownership percentage must be measured against the fully diluted share count, which accounts for all common shares, preferred shares on an as-converted basis, granted options, and the unallocated option pool reserve.',
    category: 'Evaluation',
    relatedArticleSlug: 'how-to-evaluate-a-startup-job-offer',
  },
  {
    id: 10,
    question: 'What does a 1x non-participating liquidation preference mean for preferred investors in an acquisition?',
    options: [
      'Investors receive 100% of all acquisition proceeds, leaving $0 for common shares.',
      'Investors receive their original investment back first, OR convert to common stock to share pro-rata, whichever is greater.',
      'Investors receive their investment back twice before common shares receive anything.',
      'Investors must forgive their investment if the acquisition price is under $50 million.',
    ],
    correctIndex: 1,
    explanation: 'In a 1x non-participating preference, investors choose either their liquidation preference (getting their money back) OR converting to common stock to participate in pro-rata upside, preventing double-dipping.',
    category: 'Foundations',
    relatedArticleSlug: 'common-vs-preferred-shares',
  },
];
