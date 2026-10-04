import React from 'react';
import { Shield, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center gap-2 text-white font-semibold text-base">
            <div className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Vestly Equity Intelligence</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs max-w-md">
            Engineered to empower employees with institutional-grade equity modeling, 
            vesting schedules, Alternative Minimum Tax (AMT) forecasting, and actionable compliance workflows.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400/90 font-mono">
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span>Encrypted local session • Zero data brokering • Open calculations</span>
          </div>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
            Financial Education
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="/learn#esop-basics-101" className="hover:text-emerald-400 transition-colors">
                Stock Options 101
              </a>
            </li>
            <li>
              <a href="/learn#iso-vs-nso-vs-rsu" className="hover:text-emerald-400 transition-colors">
                ISO vs NSO vs RSU Comparison
              </a>
            </li>
            <li>
              <a href="/learn#amt-explained-simply" className="hover:text-emerald-400 transition-colors">
                Alternative Minimum Tax (AMT)
              </a>
            </li>
            <li>
              <a href="/learn#early-exercise-83b" className="hover:text-emerald-400 transition-colors">
                Section 83(b) Election Filing
              </a>
            </li>
            <li>
              <a href="/learn#glossary" className="hover:text-emerald-400 transition-colors">
                Equity Terminology Glossary
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-3">
            Regulatory & APIs
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-1">
              <span>Market Data: Finnhub API</span>
              <span className="text-[10px] text-slate-500">(60/min free)</span>
            </li>
            <li className="flex items-center gap-1">
              <span>Fundamentals: Alpha Vantage</span>
              <span className="text-[10px] text-slate-500">(25/day free)</span>
            </li>
            <li>
              <a 
                href="https://www.irs.gov/forms-pubs/about-form-8801" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>IRS Form 8801 (AMT Credit)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              <a 
                href="https://www.irs.gov/pub/irs-drop/rr-05-48.pdf" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                <span>IRC Section 83(b) Rules</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          © {new Date().getFullYear()} Vestly. Built for startup & corporate equity compensation holders.
        </p>
        <p className="text-center md:text-right max-w-xl text-[10px] text-slate-400 leading-normal">
          Not licensed investment or tax advice. Market quotes may be delayed. Pre-IPO valuation figures reflect known secondary/409A milestones.
        </p>
      </div>
    </footer>
  );
}

