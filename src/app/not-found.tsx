import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowRight } from 'lucide-react';

export default function NotFound() {
  const quickLinks = [
    { label: 'Overview statement', href: '/dashboard', desc: 'View your portfolio metrics and upcoming vests' },
    { label: 'Equity grants', href: '/grants', desc: 'Review, filter, and manage your option grants' },
    { label: 'Equity calculator', href: '/calculator', desc: 'Model exercise costs, AMT, and net proceeds' },
    { label: 'Learn hub', href: '/learn', desc: 'Read guides on ISOs, NSOs, RSUs, and tax rules' },
    { label: 'Market research', href: '/research/market', desc: 'Inspect market multiples and tech comparables' },
  ];

  return (
    <div className="max-w-xl mx-auto my-12 sm:my-20 p-6 sm:p-8 bg-surface border border-rule rounded-sm text-ink space-y-6">
      <div className="space-y-2 pb-4 border-b border-rule">
        <div className="flex items-center gap-2 text-muted">
          <FileQuestion className="w-4 h-4 text-accent" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-wider">Status 404</span>
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink">
          Page not found
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          The requested page or resource does not exist at this address. You may have followed an outdated link or typed the URL incorrectly.
        </p>
      </div>

      <div className="space-y-2.5">
        <h2 className="text-xs font-semibold text-ink uppercase tracking-wider font-mono">
          Useful destinations
        </h2>
        <div className="divide-y divide-rule/60 border border-rule rounded-xs overflow-hidden bg-paper/40">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between p-3 text-xs hover:bg-sunk/60 transition-colors group"
            >
              <div className="space-y-0.5">
                <span className="font-medium text-ink group-hover:text-accent transition-colors">
                  {link.label}
                </span>
                <p className="text-[11px] text-muted">{link.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
            </Link>
          ))}
        </div>
      </div>

      <div className="pt-2 text-center text-[11px] font-mono text-muted">
        <span>Vestly Equity Ledger</span>
      </div>
    </div>
  );
}
