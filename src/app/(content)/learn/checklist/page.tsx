'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, 
  Square, 
  ArrowLeft, 
  AlertTriangle, 
  HelpCircle, 
  Printer, 
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Term } from '@/components/learn/Term';

interface ChecklistItem {
  id: string;
  category: 'Structure' | 'Economics' | 'Taxes' | 'Governance';
  title: string;
  importance: 'Critical' | 'High' | 'Standard';
  question: string;
  explanation: string;
  redFlags: string[];
  termRef?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'instrument-type',
    category: 'Structure',
    title: 'Equity instrument and share class identified',
    importance: 'Critical',
    question: 'Are these Incentive Stock Options (ISOs), Non-Qualified Options (NSOs), or Restricted Stock Units (RSUs)?',
    explanation: 'The instrument type determines your tax liability timing and holding period requirements. ISOs defer ordinary income tax at exercise, while NSOs trigger immediate compensation tax on the spread. RSUs have $0 cost but are taxed immediately upon each vesting date.',
    redFlags: [
      'Offer letter states only "shares" without specifying options, RSUs, or phantom units',
      'Being granted NSOs when eligible for ISO treatment as a full-time employee',
    ],
    termRef: 'Incentive Stock Option (ISO)',
  },
  {
    id: 'fully-diluted-percentage',
    category: 'Economics',
    title: 'Fully diluted ownership percentage confirmed',
    importance: 'Critical',
    question: 'What percentage of the fully diluted capitalization do these shares represent today, and what is the denominator?',
    explanation: 'A grant of 20,000 shares is meaningless without knowing whether the total share count is 10 million (0.20%) or 100 million (0.02%). Always calculate ownership on a fully diluted basis including the existing option pool and convertible notes.',
    redFlags: [
      'Company quotes raw share count but refuses to disclose total fully diluted shares',
      'Quotes issued shares instead of fully diluted shares, concealing unissued pool overhang',
    ],
    termRef: 'Fully diluted shares',
  },
  {
    id: 'strike-vs-409a',
    category: 'Economics',
    title: 'Strike price confirmed against latest 409A fair market value',
    importance: 'Critical',
    question: 'What is the strike price per share, and does it equal or exceed the latest board-approved 409A valuation?',
    explanation: 'Under IRS Section 409A, options must be granted with a strike price at or above common stock fair market value. If options are granted below fair market value, you face severe Section 409A penalties (20% federal penalty tax plus statutory interest).',
    redFlags: [
      'Strike price is not yet set or promised to be determined later',
      'The company has not performed an updated 409A appraisal in over 12 months despite recent fundraising',
    ],
    termRef: '409A valuation',
  },
  {
    id: 'vesting-cliff',
    category: 'Structure',
    title: 'Vesting schedule and cliff duration verified',
    importance: 'High',
    question: 'Is the vesting schedule standard 4-year with a 1-year cliff, or is it backloaded or milestone-based?',
    explanation: 'Standard venture-backed equity vests over 48 months with 25% cliff at month 12 and 1/48th monthly thereafter. Backloaded vesting (e.g. 10%/20%/30%/40%) severely penalizes early-stage employees if departure occurs in years one or two.',
    redFlags: [
      'Cliff duration longer than 12 months',
      'Backloaded annual tranches without monthly vesting after the cliff',
      'Vesting commencement date does not match your official start date',
    ],
    termRef: 'Vesting cliff',
  },
  {
    id: 'early-exercise-83b',
    category: 'Taxes',
    title: 'Early exercise permitted and Section 83(b) election eligible',
    importance: 'High',
    question: 'Does the stock plan permit immediate early exercise of unvested options, and are 83(b) forms supported?',
    explanation: 'Early exercise allows you to purchase unvested shares on day one when the fair market value equals your strike price, creating zero taxable spread. Filing an 83(b) election within 30 days starts your long-term capital gains clock immediately.',
    redFlags: [
      'No early exercise permitted at a seed or Series A stage company where strike prices are pennies',
      'HR or legal unable to confirm if company accepts 83(b) filings',
    ],
    termRef: 'Section 83(b) election',
  },
  {
    id: 'ptew-window',
    category: 'Governance',
    title: 'Post-termination exercise window documented',
    importance: 'Critical',
    question: 'How many days or years do I have to exercise vested options after departing the company?',
    explanation: 'A traditional 90-day PTEW creates "golden handcuffs" by forcing departing employees to raise tens or hundreds of thousands of dollars in cash to purchase shares and pay tax liabilities within 3 months of leaving.',
    redFlags: [
      'Strict 90-day post-termination window with zero extension provisions',
      'Vested options automatically forfeited upon voluntary resignation without reasonable cure period',
    ],
    termRef: 'Post-Termination Exercise Window (PTEW)',
  },
  {
    id: 'liquidation-preference',
    category: 'Economics',
    title: 'Liquidation preference stack and seniority understood',
    importance: 'Standard',
    question: 'What is the total preferred capital liquidation preference senior to common stock, and are any preferred shares participating?',
    explanation: 'Preferred investors get paid before common shareholders in any liquidity event. If a company raised $80M in preferred capital with a 1x non-participating preference, an exit at $75M leaves $0 for common option holders.',
    redFlags: [
      'Multiple liquidation preferences (e.g. 2x or 3x) or participating preferred rights',
      'Total preferred preferences exceed the current realistic acquisition value of the enterprise',
    ],
    termRef: 'Liquidation preference',
  },
  {
    id: 'secondary-restrictions',
    category: 'Governance',
    title: 'Secondary sale and transfer restrictions reviewed',
    importance: 'Standard',
    question: 'What restrictions exist on secondary sales, right of first refusal (ROFR), or pledge of common shares?',
    explanation: 'Most private companies maintain a strict Right of First Refusal (ROFR) giving them or existing investors the option to match third-party secondary offers. Some companies prohibit secondary transactions entirely without unanimous board approval.',
    redFlags: [
      'Total ban on secondary liquidity even during company-sponsored tender offers',
      'Company retains clawback or forced repurchase rights at original cost upon termination',
    ],
    termRef: 'Right of First Refusal (ROFR)',
  },
  {
    id: 'acceleration-clauses',
    category: 'Governance',
    title: 'Acceleration terms in acquisition or control changes',
    importance: 'Standard',
    question: 'Does the agreement include single-trigger or double-trigger acceleration upon an acquisition or change of control?',
    explanation: 'Double-trigger acceleration protects you if the company is acquired and your position is eliminated or relocated within 12 months. Single-trigger automatically vests all shares immediately upon deal close.',
    redFlags: [
      'No change-of-control provisions whatsoever, allowing acquirer to cancel unvested options without payout',
      'Unreasonable "for cause" definitions that could circumvent double-trigger protections',
    ],
    termRef: 'Acceleration clause',
  },
  {
    id: 'option-pool-dilution',
    category: 'Economics',
    title: 'Option pool sizing and expected venture dilution modelled',
    importance: 'Standard',
    question: 'What is the current unallocated option pool size, and was it expanded prior to or as part of the latest round?',
    explanation: 'Unallocated option pools typically sit between 10% and 15% of total shares. Option pool expansions in venture rounds dilute existing common holders rather than incoming investors, reducing your effective ownership stake.',
    redFlags: [
      'Option pool depleted under 5%, signaling an imminent dilutive pool refresh in the next round',
      'No visibility into planned financing rounds over the next 12 to 18 months',
    ],
    termRef: 'Option pool overhang',
  },
];

export default function ChecklistPage() {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleCheck = (id: string) => {
    const next = new Set(checkedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setCheckedIds(next);
  };

  const resetAll = () => {
    setCheckedIds(new Set());
  };

  const checkAll = () => {
    setCheckedIds(new Set(CHECKLIST_ITEMS.map((item) => item.id)));
  };

  const completedCount = checkedIds.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Status assessment
  const statusAssessment = useMemo(() => {
    if (completedCount <= 3) {
      return {
        label: 'Preliminary review',
        description: 'Significant diligence blindspots remain. Verify critical equity percentage, strike price, and post-termination windows before signing.',
      };
    }
    if (completedCount <= 7) {
      return {
        label: 'Substantial diligence',
        description: 'Core terms reviewed. Confirm secondary transfer restrictions, 83(b) election feasibility, and unallocated pool overhang.',
      };
    }
    return {
      label: 'Complete diligence',
      description: 'Rigorous assessment completed across economics, legal protections, and tax exposure. Well prepared for offer negotiation.',
    };
  }, [completedCount]);

  return (
    <div className="space-y-8 pb-20">
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learn</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        eyebrow="Decision framework"
        title="Offer evaluation checklist"
        contextSentence="A 10-point diligence framework to evaluate startup equity offers, understand dilution risk, and identify contract clauses before signing."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-rule rounded-sm bg-surface text-ink hover:border-ink/40 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-muted" />
              <span>Print checklist</span>
            </button>
          </div>
        }
      />

      {/* Readiness Assessment Strip */}
      <div className="p-5 bg-surface border border-rule rounded-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                Diligence status
              </span>
              <span className="text-xs font-semibold text-ink px-2 py-0.5 border border-rule rounded-sm bg-canvas">
                {statusAssessment.label}
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed max-w-2xl">
              {statusAssessment.description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-2xl font-mono font-medium text-ink tabular-nums block">
                {completedCount} / {totalCount}
              </span>
              <span className="text-[10px] font-mono text-muted uppercase block">
                Items verified
              </span>
            </div>
          </div>
        </div>

        {/* Quiet Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-rule/40 h-1.5 rounded-sm overflow-hidden">
            <div
              className="bg-ink h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted">
            <span>Progress: {progressPercent}%</span>
            <div className="space-x-3">
              <button onClick={checkAll} className="hover:text-ink transition-colors">
                Check all
              </button>
              <button onClick={resetAll} className="hover:text-ink transition-colors">
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Items List */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isChecked = checkedIds.has(item.id);
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`p-4 bg-surface border transition-colors rounded-sm space-y-3 ${
                isChecked ? 'border-rule/60 opacity-90' : 'border-rule hover:border-ink/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className="flex items-start gap-3 text-left flex-1 group"
                >
                  <span className="mt-0.5 text-ink shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-accent" />
                    ) : (
                      <Square className="w-4 h-4 text-muted group-hover:text-ink transition-colors" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted">
                        {String(index + 1).padStart(2, '0')}.
                      </span>
                      <h2
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          isChecked ? 'line-through text-muted' : 'text-ink'
                        }`}
                      >
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-xs text-muted mt-1 leading-relaxed">
                      <span className="font-medium text-ink">Ask:</span> &quot;{item.question}&quot;
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border rounded-sm ${
                      item.importance === 'Critical'
                        ? 'border-accent/30 text-accent bg-accent/5'
                        : 'border-rule text-muted bg-canvas'
                    }`}
                  >
                    {item.importance}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-1 text-muted hover:text-ink transition-colors"
                    aria-label={isExpanded ? 'Collapse item details' : 'Expand item details'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {isExpanded && (
                <div className="pt-3 border-t border-rule/50 space-y-3 text-xs text-muted pl-7">
                  <p className="leading-relaxed">
                    {item.explanation}
                  </p>

                  <div className="p-3 bg-canvas border border-rule/60 rounded-sm space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Red flags to watch for
                    </span>
                    <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
                      {item.redFlags.map((flag, flagIdx) => (
                        <li key={flagIdx}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  {item.termRef && (
                    <div className="text-[11px] pt-1">
                      <span className="text-muted">Defined concept: </span>
                      <Term term={item.termRef}>{item.termRef}</Term>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-surface border border-rule rounded-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-semibold text-ink">
            Ready to model your potential returns?
          </h3>
          <p className="text-xs text-muted">
            Test exit multiples, strike prices, and tax liabilities using the interactive scenario calculator.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/calculator"
            className="px-3.5 py-2 text-xs font-medium bg-ink text-canvas rounded-sm hover:bg-ink/90 transition-colors"
          >
            Launch calculator
          </Link>
          <Link
            href="/scenarios/dilution"
            className="px-3.5 py-2 text-xs font-medium border border-rule rounded-sm bg-surface text-ink hover:border-ink/40 transition-colors"
          >
            Model dilution
          </Link>
        </div>
      </div>
    </div>
  );
}
