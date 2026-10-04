'use client';

import React, { useState, useEffect } from 'react';
import { 
  GitFork, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Printer, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';
import { modelScenarios, calculate83bAnalysis } from '@/lib/calculations/scenarios';
import { COMPLIANCE_DISCLAIMER } from '@/lib/calculations/taxes';

export default function ScenariosPage() {
  const [grants, setGrants] = useState<any[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<any>(null);

  // Modeling inputs
  const [units, setUnits] = useState<number>(5000);
  const [strikePrice, setStrikePrice] = useState<number>(5.00);
  const [currentFmv, setCurrentFmv] = useState<number>(25.00);
  const [assumedExitPrice, setAssumedExitPrice] = useState<number>(65.00);
  const [grantType, setGrantType] = useState<any>('ISO');

  // 83(b) Letter Modal State
  const [show83bLetterModal, setShow83bLetterModal] = useState(false);

  useEffect(() => {
    fetch('/api/grants')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.grants && data.grants.length > 0) {
          setGrants(data.grants);
          const first = data.grants[0];
          setSelectedGrant(first);
          setUnits(first.vestedUnits || first.unitsGranted);
          setStrikePrice(first.strikePrice);
          setCurrentFmv(first.company?.latestFmvPerShare || 25.00);
          setAssumedExitPrice(Math.round((first.company?.latestFmvPerShare || 25.00) * 2.6));
          setGrantType(first.grantType);
        }
      })
      .catch(() => {});
  }, []);

  const handleGrantSelect = (g: any) => {
    setSelectedGrant(g);
    setUnits(g.vestedUnits || g.unitsGranted);
    setStrikePrice(g.strikePrice);
    setCurrentFmv(g.company?.latestFmvPerShare || 25.00);
    setAssumedExitPrice(Math.round((g.company?.latestFmvPerShare || 25.00) * 2.6));
    setGrantType(g.grantType);
  };

  const taxSettings = {
    federalTaxRate: 0.32,
    stateTaxRate: 0.093,
    capitalGainsRate: 0.20,
    stateCapitalGainsRate: 0.093,
    ficaRate: 0.0235,
    filingStatus: 'SINGLE' as const,
  };

  const { scenarios } = modelScenarios(
    units,
    strikePrice,
    currentFmv,
    assumedExitPrice,
    grantType,
    taxSettings
  );

  const analysis83b = calculate83bAnalysis(
    selectedGrant?.grantDate || new Date().toISOString(),
    units,
    strikePrice,
    currentFmv,
    assumedExitPrice,
    taxSettings.federalTaxRate,
    taxSettings.capitalGainsRate
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <GitFork className="w-7 h-7 text-emerald-400" />
          Scenario Modeling & IRS Section 83(b)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Compare side-by-side strategic outcomes and evaluate early exercise tax protections
        </p>
      </div>

      {/* Grant Selection Bar */}
      {grants.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Active Grant:</span>
          {grants.map(g => (
            <button
              key={g.id}
              onClick={() => handleGrantSelect(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedGrant?.id === g.id
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>{g.company?.name} ({g.grantIdentifier})</span>
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Assumptions Slider Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-5 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300">Units Modeled</span>
            <span className="font-mono font-bold text-white">{units.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="500"
            max="30000"
            step="500"
            value={units}
            onChange={(e) => setUnits(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300">Current FMV / 409A</span>
            <span className="font-mono font-bold text-white">${currentFmv.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="150"
            step="1"
            value={currentFmv}
            onChange={(e) => setCurrentFmv(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-slate-300">Projected Exit / IPO Price</span>
            <span className="font-mono font-bold text-emerald-400">${assumedExitPrice.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={strikePrice}
            max="250"
            step="5"
            value={assumedExitPrice}
            onChange={(e) => setAssumedExitPrice(parseFloat(e.target.value))}
            className="w-full accent-emerald-500"
          />
        </div>
      </div>

      {/* Side-by-Side Scenarios Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          Side-by-Side Outcome Comparison
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((s, idx) => (
            <div 
              key={s.id} 
              className={`bg-slate-900/90 rounded-2xl border shadow-xl backdrop-blur-sm p-6 flex flex-col justify-between space-y-6 ${
                idx === 0 ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-slate-800'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Scenario {idx + 1}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      s.riskLevel === 'HIGH' ? 'bg-amber-950/80 text-amber-300 border-amber-800/50' : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {s.riskLevel} Risk
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-slate-400 leading-snug mt-1">{s.subtitle}</p>
                </div>

                {/* Net Cash Box */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Net Cash at Exit
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                    ${s.netCashReceived.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-300/80 font-medium">
                    ESTIMATE • After strike costs & taxes
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="space-y-2 text-xs pt-1 border-t border-slate-800">
                  <div className="flex justify-between text-slate-400">
                    <span>Upfront Cash Required Today:</span>
                    <span className="font-mono font-bold text-white">
                      ${s.upfrontCashRequired.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Gross Proceeds at Exit:</span>
                    <span className="font-mono text-slate-200">${s.grossProceedsAtExit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Estimated Total Taxes Paid:</span>
                    <span className="font-mono text-amber-400">-${s.totalTaxesPaid.toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Tax Character: <strong className="text-slate-200">{s.taxCharacter}</strong>
                  </div>
                </div>

                {/* Pros and Cons */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block text-[11px]">Trade-Offs:</span>
                  <ul className="space-y-1 text-slate-400">
                    {s.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-300">{p}</span>
                      </li>
                    ))}
                    {s.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] text-slate-300">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`/calculator?grantId=${selectedGrant?.id || ''}`}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold text-center block bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  Adjust Assumptions
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 83(b) Election Helper Section */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/60 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>IRS Internal Revenue Code Section 83(b)</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Section 83(b) Election Decision Engine
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Filing an 83(b) election allows you to accelerate taxable compensation to the day of unvested purchase when the spread is zero or nominal, shielding future valuation growth from ordinary income taxes.
            </p>
          </div>

          <button
            onClick={() => setShow83bLetterModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-colors shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Generate IRS 83(b) Letter</span>
          </button>
        </div>

        {/* 83(b) Status Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              30-Day Filing Countdown
            </span>
            <div className={`text-2xl font-extrabold ${analysis83b.isDeadlinePassed ? 'text-rose-400' : 'text-white'}`}>
              {analysis83b.isDeadlinePassed ? 'Deadline Passed' : `${analysis83b.daysRemaining} Days Left`}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Deadline: {analysis83b.deadlineDate.toLocaleDateString()}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Taxes Today With 83(b)
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              ${analysis83b.taxWith83bToday.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 block">
              Based on ${currentFmv.toFixed(2)} FMV vs ${strikePrice.toFixed(2)} strike
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Estimated Long-Term Tax Savings
            </span>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              ${analysis83b.estimatedTaxSavings.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-300/80 block">
              Protected from future ordinary income tax
            </span>
          </div>
        </div>

        {/* 83(b) Strict Rules Callout */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-amber-400">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Strict IRS Statutory Filing Requirements:</span>
          </div>
          <ul className="list-disc pl-5 space-y-1 text-amber-200/90 text-[11px] leading-relaxed">
            <li>The 83(b) election letter <strong>MUST be mailed within 30 calendar days</strong> of receiving/exercising unvested stock. The IRS allows zero extensions or late relief.</li>
            <li>Must be mailed via <strong>USPS Certified Mail with Return Receipt Requested</strong> to guarantee legal postmark evidence.</li>
            <li>A copy must be submitted to your employer&apos;s HR or legal team for corporate records.</li>
            <li>If the company fails, any money spent exercising is lost and cannot be deducted as an ordinary loss.</li>
          </ul>
        </div>
      </div>

      {/* Persistent Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-200">Compliance & Regulatory Disclaimer:</span>
        <p className="text-[11px] leading-relaxed text-slate-400">
          {COMPLIANCE_DISCLAIMER}
        </p>
      </div>

      {/* IRS 83(b) Printable Letter Modal */}
      {show83bLetterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden my-8 space-y-6 p-6 sm:p-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">IRS Section 83(b) Election Template</h3>
                <p className="text-xs text-slate-400">Ready-to-print certified election notice</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 border border-slate-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShow83bLetterModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Letter Content */}
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono space-y-4 text-slate-200 leading-relaxed overflow-y-auto max-h-[60vh]">
              <div>
                <strong className="text-white">DEPARTMENT OF THE TREASURY</strong><br />
                INTERNAL REVENUE SERVICE CENTER<br />
                (Mail to IRS Service Center where you file Form 1040)
              </div>

              <div>
                <strong className="text-emerald-400">SUBJECT: ELECTION PURSUANT TO SECTION 83(b) OF THE INTERNAL REVENUE CODE</strong>
              </div>

              <p>
                The undersigned taxpayer hereby elects, pursuant to Section 83(b) of the Internal Revenue Code of 1986, as amended, to include in gross income the excess (if any) of the fair market value of the property described below over the amount paid for such property.
              </p>

              <div>
                <strong className="text-slate-300">1. Taxpayer Information:</strong><br />
                Name: [Taxpayer Full Name]<br />
                Address: [Taxpayer Home Address]<br />
                Social Security Number: [Taxpayer SSN]
              </div>

              <div>
                <strong className="text-slate-300">2. Description of Property:</strong><br />
                {units.toLocaleString()} shares of Common Stock of {selectedGrant?.company?.name || '[Company Name]'}, a Delaware corporation.
              </div>

              <div>
                <strong className="text-slate-300">3. Date Property Transferred:</strong><br />
                {new Date(selectedGrant?.grantDate || Date.now()).toLocaleDateString()}
              </div>

              <div>
                <strong className="text-slate-300">4. Restrictions to Which Property is Subject:</strong><br />
                The shares are subject to vesting and a repurchase option in favor of the Company upon termination of employment or service.
              </div>

              <div>
                <strong className="text-slate-300">5. Fair Market Value at Time of Transfer:</strong><br />
                ${(units * currentFmv).toLocaleString()} (${currentFmv.toFixed(2)} per share).
              </div>

              <div>
                <strong className="text-slate-300">6. Amount Paid for Property:</strong><br />
                ${(units * strikePrice).toLocaleString()} (${strikePrice.toFixed(2)} per share).
              </div>

              <div>
                <strong className="text-slate-300">7. Gross Income Recognized:</strong><br />
                ${Math.max(0, units * (currentFmv - strikePrice)).toLocaleString()}.
              </div>

              <div className="pt-4 text-slate-300">
                Dated: {new Date().toLocaleDateString()}<br /><br />
                ________________________________________<br />
                Taxpayer Signature
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

