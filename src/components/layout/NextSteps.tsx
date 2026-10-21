'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import { useGrant } from '@/contexts/GrantContext';

export interface NextStepItem {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export type JourneyKey = 'J1' | 'J2' | 'J3' | 'J4' | 'J5';

const PRESET_JOURNEYS: Record<JourneyKey, NextStepItem[]> = {
  J1: [
    {
      title: 'Learn how to evaluate an equity offer',
      description: 'Understand strike price, FMV, dilution, and standard 4-year vesting schedules.',
      href: '/learn#evaluating-an-offer',
      badge: 'Step 1: Learn',
    },
    {
      title: 'Model compensation scenarios',
      description: 'Compare potential exit values and calculate net proceeds at different company multiples.',
      href: '/calculator',
      badge: 'Step 2: Calculator',
    },
    {
      title: 'Record your official grant',
      description: 'Enter your vesting schedule, cliff, and upload your grant agreement letter.',
      href: '/grants',
      badge: 'Step 3: Record',
    },
  ],
  J2: [
    {
      title: 'Calculate your exercise cost & tax',
      description: 'See the exact cash needed to exercise and estimated AMT liability for this tax year.',
      href: '/calculator',
      badge: 'Step 1: Cost & Tax',
    },
    {
      title: 'Compare early vs late exercise strategies',
      description: 'Evaluate tax holding periods for Long-Term Capital Gains treatment.',
      href: '/scenarios',
      badge: 'Step 2: Scenarios',
    },
    {
      title: 'Schedule critical deadlines in Actions',
      description: 'Set reminders for Section 83(b) elections, post-termination exercise windows, and tax dates.',
      href: '/actions',
      badge: 'Step 3: Action reminder',
    },
  ],
  J3: [
    {
      title: 'Review post-termination exercise windows',
      description: 'Most ISO grants expire within 90 days after leaving employment.',
      href: '/scenarios',
      badge: 'Step 1: Deadlines',
    },
    {
      title: 'Add expiration deadline to Actions',
      description: 'Ensure you receive advance reminders before unexercised options lapse.',
      href: '/actions',
      badge: 'Step 2: Action center',
    },
    {
      title: 'Generate equity report for your CPA',
      description: 'Download a complete statement of vested units, cost basis, and FMV spread for tax planning.',
      href: '/reports',
      badge: 'Step 3: CPA report',
    },
  ],
  J4: [
    {
      title: 'Explore public comps & valuation multiples',
      description: 'Inspect industry price-to-sales and revenue multiples for your sector.',
      href: '/research/companies',
      badge: 'Step 1: Multiples',
    },
    {
      title: 'Add target companies to your watchlist',
      description: 'Track employer milestones, public competitors, and funding rounds in one place.',
      href: '/research/watchlist',
      badge: 'Step 2: Watchlist',
    },
    {
      title: 'Read valuation guides in Learn',
      description: 'Learn how 409A valuations are calculated and how preferred share preferences affect common stock.',
      href: '/learn',
      badge: 'Step 3: Valuation guide',
    },
  ],
  J5: [
    {
      title: 'Generate annual tax summary report',
      description: 'Filter exercise events for the current tax year to report ISO spread for AMT or NSO income on W-2.',
      href: '/reports',
      badge: 'Step 1: Tax report',
    },
    {
      title: 'Export all grant data as CSV',
      description: 'Download structured records with grant dates, strike prices, and exercise histories.',
      href: '/settings#data',
      badge: 'Step 2: CSV export',
    },
    {
      title: 'Review IRS Form 3921 guide',
      description: 'Understand the information returns your employer provides after an ISO exercise.',
      href: '/learn#form-3921',
      badge: 'Step 3: Tax reference',
    },
  ],
};

export interface NextStepsProps {
  steps?: NextStepItem[];
  journey?: JourneyKey;
  title?: string;
  className?: string;
}

export function NextSteps({
  steps,
  journey = 'J2',
  title = 'What most people do next',
  className = '',
}: NextStepsProps) {
  let grantCtx: ReturnType<typeof useGrant> | null = null;
  try {
    grantCtx = useGrant();
  } catch {
    // In public shell without GrantContext
  }

  const items = steps || PRESET_JOURNEYS[journey] || PRESET_JOURNEYS.J2;

  return (
    <section
      aria-label="Suggested next steps"
      className={`border border-rule rounded-sm bg-surface p-5 sm:p-6 my-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-rule">
        <Compass className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
        <h3 className="font-serif text-base text-ink font-semibold tracking-tight">
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((item, index) => {
          const finalHref = grantCtx?.selectedGrantId
            ? grantCtx.buildGrantUrl(item.href)
            : item.href;

          return (
            <Link
              key={index}
              href={finalHref}
              className="group flex flex-col justify-between p-3.5 rounded-sm border border-rule/70 bg-paper/60 hover:bg-paper hover:border-rule transition-colors"
            >
              <div className="space-y-1.5">
                {item.badge && (
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-muted font-medium">
                    {item.badge}
                  </span>
                )}
                <h4 className="font-sans text-xs font-semibold text-ink group-hover:text-accent transition-colors flex items-center gap-1.5">
                  {item.title}
                </h4>
                <p className="text-[11px] text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-rule/40 flex items-center justify-between text-[11px] font-medium text-accent">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default NextSteps;

