'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Calculator, 
  Clock, 
  Building,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

export default function LandingPage() {
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
      console.error(err);
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Purpose-Built for Startup & Corporate Equity Holders</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
          Make confident decisions on your <span className="text-emerald-400">stock options</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Vestly helps employees track multi-grant vesting schedules, forecast Alternative Minimum Tax (AMT) liabilities, model exit scenarios, and stay ahead of critical deadlines.
        </p>

        {/* Call to Actions */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleLaunchDemo}
            disabled={loadingDemo}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loadingDemo ? (
              <span>Preparing Demo Portfolio...</span>
            ) : (
              <>
                <span>Explore with Demo Portfolio</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <a
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-850 text-white border border-slate-700 shadow-xs transition-colors"
          >
            <span>Sign In to Your Grants</span>
          </a>
        </div>

        {/* Trust Badges */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> ISO, NSO, RSU & ESPP Logic
          </span>
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-400" /> Private & Secure Local Storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Section 83(b) Deadline Alerts
          </span>
        </div>
      </section>

      {/* Interactive Value Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card hover:border-slate-700 transition-all space-y-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Multi-Grant Vesting Engine</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Manage multiple grants across past and present employers. Real-time tracking of 1-year cliffs, monthly tranches, and cumulative vested value at latest 409A valuations.
          </p>
          <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
            <span>Visual timeline curves & schedules</span>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card hover:border-slate-700 transition-all space-y-4">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">AMT & Tax Liability Modeling</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Simulate exercise costs and tax liability before spending a dollar. Includes dedicated Alternative Minimum Tax (AMT) preference calculation for ISOs and ordinary income for NSOs.
          </p>
          <div className="pt-2 text-xs font-semibold text-blue-400 flex items-center gap-1">
            <span>Custom state & federal bracket toggles</span>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-card hover:border-slate-700 transition-all space-y-4">
          <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Action Center & Expiration Watch</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Never miss an equity deadline. Automated alerts for 30-day Section 83(b) election filings, 90-day post-termination exercise windows (PTEW), and grant expirations.
          </p>
          <div className="pt-2 text-xs font-semibold text-purple-400 flex items-center gap-1">
            <span>Audit trail & printable advisor reports</span>
          </div>
        </div>
      </section>

      {/* Research & Context Section Banner */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-emerald-400 text-xs font-medium border border-slate-700">
            <Building className="w-3.5 h-3.5" />
            <span>Research & Learn Hub Included</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Company Analysis, Market Data & Plain-Language Education
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Understand the financial context behind your employer's valuation. Explore private company 409As, funding rounds, live market indices via Finnhub, and short, skimmable explainer articles covering everything from AMT to secondary tender offers.
          </p>
          <div className="pt-3 flex flex-wrap gap-3">
            <a
              href="/research/market"
              className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Explore Market Overview
            </a>
            <a
              href="/learn"
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
            >
              Browse Equity Guides & Glossary
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
