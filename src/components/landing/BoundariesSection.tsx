'use client';

import React from 'react';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

interface BoundaryItem {
  title: string;
  truth: string;
  clarification: string;
}

const BOUNDARIES: BoundaryItem[] = [
  {
    title: 'US federal tax rules only',
    truth: 'We model federal income tax, capital gains rates, and statutory Alternative Minimum Tax (AMT).',
    clarification:
      'We do not model international tax treaties, non-US expat tax codes, or state-specific local credits. For multi-state residency, consult a CPA.',
  },
  {
    title: 'You enter fair market value yourself',
    truth: 'You supply the 409A valuation, strike price, and share count from your official grant notice.',
    clarification:
      'Vestly does not automatically scrape private company cap tables or internal corporate records. Your inputs determine the outputs.',
  },
  {
    title: 'Educational modeling, not tax advice',
    truth: 'Every figure on screen is an estimate designed to help you ask better questions.',
    clarification:
      'Tax law involves phaseouts, itemized deductions, and individual circumstances that no automated calculator can guarantee. Always verify with a tax advisor before exercising.',
  },
  {
    title: 'No brokerage or cap-table connection',
    truth: 'Vestly operates completely independently from Carta, Shareworks, E*TRADE, and Fidelity.',
    clarification:
      'We do not ask for your brokerage login credentials, and we never sync your financial records to third-party data brokers or cloud aggregators.',
  },
  {
    title: 'Where your data is stored',
    truth: 'Your grant terms, personal tax settings, and notes live in your local database.',
    clarification:
      'Everything is stored in your private local SQLite database on your own environment. We never sell your equity data or use it to train AI models.',
  },
];

export function BoundariesSection() {
  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Transparency & boundaries
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          What Vestly does not do
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Financial software should be explicit about where its calculations end
          and what assumptions it makes. Here are our exact operating boundaries.
        </p>
      </div>

      <div className="border border-rule rounded-xs bg-surface divide-y divide-rule/60">
        {BOUNDARIES.map((item, idx) => (
          <div key={item.title} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-sunk/20 transition-colors">
            <span className="text-[11px] font-mono text-muted shrink-0 pt-0.5">
              0{idx + 1}
            </span>
            <div className="space-y-1 text-xs">
              <h3 className="font-serif text-sm font-bold text-ink">
                {item.title}
              </h3>
              <p className="font-medium text-ink leading-relaxed">
                {item.truth}
              </p>
              <p className="text-muted leading-relaxed">
                {item.clarification}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BoundariesSection;

