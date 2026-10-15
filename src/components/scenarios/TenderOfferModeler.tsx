'use client';

import React, { useState } from 'react';
import { Coins, ShieldCheck } from 'lucide-react';
import { calculateTenderOffer } from '@/lib/calculations/scenarios';
import { GrantType, TaxBracketSettings } from '@/types';

interface TenderOfferModelerProps {
  units: number;
  strikePrice: number;
  currentFmv: number;
  grantType: GrantType;
  taxSettings: TaxBracketSettings;
}

export default function TenderOfferModeler({
  units,
  strikePrice,
  currentFmv,
  grantType,
  taxSettings,
}: TenderOfferModelerProps) {
  const [tenderParticipationPct, setTenderParticipationPct] = useState<number>(25);
  const [tenderPricePerShare, setTenderPricePerShare] = useState<number>(Math.max(strikePrice * 1.5, currentFmv * 1.5));
  const [transactionFeePct, setTransactionFeePct] = useState<number>(1.0);
  const [alreadyExercised, setAlreadyExercised] = useState<boolean>(false);
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState<number>(18);
  const [projectedIpoPrice, setProjectedIpoPrice] = useState<number>(Math.max(strikePrice * 3, currentFmv * 2.5));

  const tenderResult = calculateTenderOffer({
    vestedUnits: units,
    tenderParticipationPct,
    tenderPricePerShare,
    strikePrice,
    grantType,
    alreadyExercised,
    holdingPeriodMonths,
    transactionFeePct,
    taxSettings,
    projectedIpoPrice,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Controls Bar */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              Secondary Market & Tender Offer Parameters
            </h2>
            <p className="text-xs text-slate-400">
              Model company-sponsored buybacks (e.g. Stripe/SpaceX tenders) or private secondary transactions (Carta, Forge, EquityZen)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Eligible Vested Units:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
              {units.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Participation % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Tender Participation %</span>
              <span className="font-mono font-bold text-emerald-400">{tenderParticipationPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={tenderParticipationPct}
              onChange={(e) => setTenderParticipationPct(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[11px] text-slate-500 block">
              Offering {tenderResult.unitsOffered.toLocaleString()} of {units.toLocaleString()} units
            </span>
          </div>

          {/* Tender Price per Share */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Tender Price per Share</span>
              <span className="font-mono font-bold text-white">${tenderPricePerShare.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={strikePrice}
              max="200"
              step="1"
              value={tenderPricePerShare}
              onChange={(e) => setTenderPricePerShare(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[11px] text-slate-500 block">
              Latest 409A: ${currentFmv.toFixed(2)} / Strike: ${strikePrice.toFixed(2)}
            </span>
          </div>

          {/* Broker / Platform Fee % */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Platform / Broker Fee %</span>
              <span className="font-mono font-bold text-white">{transactionFeePct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={transactionFeePct}
              onChange={(e) => setTransactionFeePct(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[11px] text-slate-500 block">
              0% for company tender, 1-3% for private broker
            </span>
          </div>

          {/* Projected Future IPO Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-300">Projected Exit / IPO Price</span>
              <span className="font-mono font-bold text-emerald-400">${projectedIpoPrice.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={tenderPricePerShare}
              max="300"
              step="5"
              value={projectedIpoPrice}
              onChange={(e) => setProjectedIpoPrice(parseFloat(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <span className="text-[11px] text-slate-500 block">
              For comparing retained shares value
            </span>
          </div>
        </div>

        {/* Execution Mechanism Toggle */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Execution Mode:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAlreadyExercised(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  !alreadyExercised
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Cashless Tender Exercise
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">Strike deducted from proceeds</span>
              </button>
              <button
                type="button"
                onClick={() => setAlreadyExercised(true)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  alreadyExercised
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Sell Owned Shares
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">Previously exercised stock</span>
              </button>
            </div>
          </div>

          {alreadyExercised ? (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Holding Period Since Exercise:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setHoldingPeriodMonths(18)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    holdingPeriodMonths >= 12
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Long-Term (&gt; 12 Months)
                  <span className="block text-[10px] font-normal opacity-85 mt-0.5">20% Fed LTCG + State</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHoldingPeriodMonths(6)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                    holdingPeriodMonths < 12
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Short-Term (&lt; 12 Months)
                  <span className="block text-[10px] font-normal opacity-85 mt-0.5">Ordinary Income Tax rates</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-200 block">Cashless Execution Benefit</span>
                <p className="text-[11px] text-slate-400">
                  Zero out-of-pocket cash required. Strike price (${strikePrice.toFixed(2)}/share) is funded automatically from gross tender proceeds.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hero Net Payout Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-emerald-500/50 ring-1 ring-emerald-500/20 shadow-xl backdrop-blur-sm p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Estimated Bank Deposit
            </span>
            <h3 className="text-lg font-bold text-white">Net Cash Payout</h3>
            <p className="text-xs text-slate-400">Funds received in bank account after strike cost, fees & taxes</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">
              ${tenderResult.netCashPayout.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-300/80 font-medium">
              ESTIMATE • From {tenderResult.unitsOffered.toLocaleString()} units tendered @ ${tenderPricePerShare.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1 border-t border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Gross Tender Proceeds:</span>
              <span className="font-mono font-bold text-white">
                ${tenderResult.grossTenderProceeds.toLocaleString()}
              </span>
            </div>
            {tenderResult.exerciseStrikeOffset > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Less: Exercise Strike Cost:</span>
                <span className="font-mono text-rose-400">
                  -${tenderResult.exerciseStrikeOffset.toLocaleString()}
                </span>
              </div>
            )}
            {tenderResult.transactionFeeAmount > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Less: Transaction Fee ({transactionFeePct}%):</span>
                <span className="font-mono text-amber-400">
                  -${tenderResult.transactionFeeAmount.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Less: Estimated Taxes Paid:</span>
              <span className="font-mono text-amber-400">
                -${tenderResult.estimatedTaxes.totalTax.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-slate-300 font-semibold block mb-0.5">Tax Classification:</span>
            <span className="text-emerald-400 font-medium">{tenderResult.taxCharacter}</span>
          </div>
        </div>

        {/* Tax & Withholding Breakdown Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Estimated Tax Withholding
            </span>
            <h3 className="text-lg font-bold text-white">Tax Breakdown</h3>
            <p className="text-xs text-slate-400">Projected liability and statutory obligations</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              ${tenderResult.estimatedTaxes.totalTax.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Effective Tax Rate: {tenderResult.grossTenderProceeds > 0 ? ((tenderResult.estimatedTaxes.totalTax / tenderResult.netTaxableGain) * 100).toFixed(1) : 0}% of net gain
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1 border-t border-slate-800">
            {tenderResult.estimatedTaxes.ordinaryIncomeTax > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Federal Income Tax ({Math.round(taxSettings.federalTaxRate * 100)}%):</span>
                <span className="font-mono text-white">${tenderResult.estimatedTaxes.ordinaryIncomeTax.toLocaleString()}</span>
              </div>
            )}
            {tenderResult.estimatedTaxes.stateTax > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>State Income Tax ({Math.round(taxSettings.stateTaxRate * 100)}%):</span>
                <span className="font-mono text-white">${tenderResult.estimatedTaxes.stateTax.toLocaleString()}</span>
              </div>
            )}
            {tenderResult.estimatedTaxes.ficaTax > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>FICA / Medicare Surcharge:</span>
                <span className="font-mono text-white">${tenderResult.estimatedTaxes.ficaTax.toLocaleString()}</span>
              </div>
            )}
            {tenderResult.estimatedTaxes.capitalGainsTax > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Federal Capital Gains Tax (20%):</span>
                <span className="font-mono text-white">${tenderResult.estimatedTaxes.capitalGainsTax.toLocaleString()}</span>
              </div>
            )}
            {tenderResult.estimatedTaxes.stateCapitalGainsTax > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>State Capital Gains Tax:</span>
                <span className="font-mono text-white">${tenderResult.estimatedTaxes.stateCapitalGainsTax.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-300 space-y-1">
            <span className="font-bold flex items-center gap-1 text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              ISO Tender Tax Protection
            </span>
            <p className="leading-relaxed text-[11px]">
              When ISOs are exercised and immediately sold in a tender offer, the disposition occurs in the <strong>same calendar year</strong>. This eliminates Alternative Minimum Tax (AMT) exposure under IRC Section 422(c)(2).
            </p>
          </div>
        </div>

        {/* Retained Equity & Upside Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm p-6 space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Portfolio Retained Upside
            </span>
            <h3 className="text-lg font-bold text-white">Retained Equity</h3>
            <p className="text-xs text-slate-400">Value of unsold units kept for future exit / IPO</p>
          </div>

          <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
            <div className="text-3xl font-extrabold text-white font-mono">
              {tenderResult.retainedUnits.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              Shares retained ({100 - tenderParticipationPct}% of position)
            </div>
          </div>

          <div className="space-y-2.5 text-xs pt-1 border-t border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Value at Current Tender (${tenderPricePerShare.toFixed(2)}):</span>
              <span className="font-mono font-bold text-white">
                ${tenderResult.retainedValueAtCurrentFmv.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Potential Value at IPO (${projectedIpoPrice.toFixed(2)}):</span>
              <span className="font-mono font-bold text-emerald-400">
                ${tenderResult.retainedValueAtProjectedIpo.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Unrealized Post-Tender Growth:</span>
              <span className="font-mono text-emerald-400">
                +${Math.max(0, tenderResult.retainedValueAtProjectedIpo - tenderResult.retainedValueAtCurrentFmv).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="text-slate-200 font-semibold block">Strategic Takeaway:</span>
            <p className="leading-relaxed">
              Tendering {tenderParticipationPct}% secures <strong>${tenderResult.netCashPayout.toLocaleString()}</strong> in liquid bank cash today, while keeping {tenderResult.retainedUnits.toLocaleString()} units to capture further valuation upside at IPO.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

