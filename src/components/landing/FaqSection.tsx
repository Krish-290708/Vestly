'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'What is the fundamental difference between an ISO and an NSO?',
    answer:
      'Incentive Stock Options (ISOs) are reserved exclusively for US employees and can qualify for favorable long-term capital gains tax rates if held for at least one year from exercise and two years from grant approval. However, exercising ISOs can trigger Alternative Minimum Tax (AMT) on the unrealized spread. Non-Qualified Stock Options (NSOs) can be awarded to employees, advisors, or contractors, but the spread at exercise is taxed immediately as ordinary wage income subject to payroll taxes (FICA).',
  },
  {
    question: 'What is an option strike price?',
    answer:
      'The strike price (or exercise price) is the fixed price per share you must pay to purchase the stock when exercising your options. For private companies, this price is established by the board of directors based on an independent Section 409A valuation at the time of your grant approval.',
  },
  {
    question: 'What is a 1-year cliff in vesting?',
    answer:
      'A standard four-year vesting agreement includes a one-year cliff. If you leave your company before completing 12 full months of service, zero options vest and you leave with nothing. At the exact 12-month mark, 25% of your total option allocation vests at once. After the cliff, options typically vest in equal monthly increments (1/48th per month) for the remaining 36 months.',
  },
  {
    question: 'What happens to my options if I leave my employer?',
    answer:
      'Under standard statutory ISO rules, you typically have 90 days after your termination date (the post-termination exercise window or PTEW) to exercise your vested options before they expire. Any unvested options are forfeited immediately upon your departure. If you do not exercise within 90 days, your options usually lapse or convert into NSOs if your company plan permits an extended window.',
  },
  {
    question: 'What is Alternative Minimum Tax (AMT) on ISOs?',
    answer:
      'When you exercise an ISO and hold the shares, you do not pay ordinary income tax on that transaction. However, the IRS treats the difference between the fair market value (FMV) and your strike price as an Alternative Minimum Tax preference item. If this spread exceeds your statutory AMT exemption amount for that tax year, you may owe significant cash tax on illiquid shares you have not yet sold.',
  },
  {
    question: 'What is a Section 83(b) election and when must I file it?',
    answer:
      'If your company permits early exercise (purchasing unvested shares before they vest), filing an IRS Section 83(b) election notifies the IRS that you choose to recognize income as of the purchase date rather than at each vesting milestone. This election must be physically mailed to the IRS within 30 calendar days of your share purchase date; this statutory deadline cannot be extended or excused for any reason.',
  },
  {
    question: 'How does Vestly estimate tax liabilities?',
    answer:
      'Vestly uses statutory US federal tax brackets, standard capital gains rates (15% or 20%), estimated federal AMT rates (26% and 28%), and simplified state tax rates based on your selected state of residence. You can adjust your annual income, state, and filing status in Settings to refine the model.',
  },
  {
    question: 'Does Vestly store my sensitive grant agreements securely?',
    answer:
      'Yes. Uploaded agreement files and notes are stored locally in your private project directory (`storage/uploads/`). Access requires session authentication, and files are never served from a public directory or sent to external servers.',
  },
  {
    question: 'Can I export my equity calculations for my accountant?',
    answer:
      'Yes. You can generate a complete equity statement on the Reports page, or export all your grants, vesting milestones, and exercise records as structured JSON or CSV files from the Settings page.',
  },
  {
    question: 'Is Vestly free to use?',
    answer:
      'Yes. Vestly is a free, self-contained educational modeling tool created to help employees understand and navigate their equity compensation agreements without paywalls or hidden fees.',
  },
];

export function FaqSection() {
  const router = useRouter();
  const [loadingDemo, setLoadingDemo] = useState(false);

  const handleLaunchDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST' });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to launch demo account:', err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <section className="py-12">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Frequently asked questions
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Common equity questions
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Clear, direct explanations of vesting schedules, tax rules, and exercise decisions.
        </p>
      </div>

      <div className="border border-rule rounded-xs bg-surface divide-y divide-rule/60">
        {FAQS.map((faq, idx) => (
          <details
            key={idx}
            className="group p-4 sm:p-5 text-xs font-sans transition-colors open:bg-sunk/20"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none font-serif text-sm font-bold text-ink focus:outline-hidden">
              <span className="pr-4">{faq.question}</span>
              <ChevronDown className="w-4 h-4 text-muted shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-muted leading-relaxed font-sans text-xs pt-1 border-t border-rule/40">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>

      {/* Closing Call to Action */}
      <div className="mt-12 border border-rule rounded-xs bg-surface p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">
            Ready to calculate what your stock options are worth?
          </h3>
          <p className="text-xs text-muted">
            Start with sample data in one click or create your personal account.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleLaunchDemo}
            disabled={loadingDemo}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xs font-sans text-xs font-medium bg-accent text-accent-contrast hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <span>{loadingDemo ? 'Opening…' : 'Try it with sample data'}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <Link
            href="/register"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xs font-sans text-xs font-medium border border-rule bg-surface hover:bg-sunk text-ink transition-colors"
          >
            Create free account
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
