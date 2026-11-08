'use client';

import React, { useMemo } from 'react';
import { modelScenarios } from '@/lib/calculations/scenarios';
import { TaxBracketSettings } from '@/types';
import { money, percent } from '@/lib/format';

export function WorkedExampleSection() {
  const defaultTaxSettings: TaxBracketSettings = useMemo(
    () => ({
      federalTaxRate: 0.24,
      stateTaxRate: 0.093,
      capitalGainsRate: 0.15,
      stateCapitalGainsRate: 0.093,
      ficaRate: 0.0235,
      filingStatus: 'SINGLE',
      annualOrdinaryIncome: 150000,
    }),
    []
  );

  // Alex's parameters: 10,000 ISOs, $2.00 strike, $10.00 FMV at exercise, $30.00 exit price
  const { scenarios, disclaimer } = useMemo(() => {
    return modelScenarios(
      10000,
      2.0,
      10.0,
      30.0,
      'ISO',
      defaultTaxSettings
    );
  }, [defaultTaxSettings]);

  return (
    <section className="py-12 border-b border-rule">
      <div className="space-y-3 mb-8">
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted block">
          Real-world simulation
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          A worked example
        </h2>
        <p className="text-sm text-muted max-w-2xl leading-relaxed">
          Alex joined a Series B startup with 10,000 ISOs at a $2.00 strike price.
          Two years later, the 409A reaches $10.00. The company eventually exits at
          $30.00 per share. Here is how three standard decisions compare in take-home cash.
        </p>
      </div>

      <div className="border border-rule rounded-xs bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-rule bg-sunk/40 text-[11px] font-mono text-muted">
                <th className="py-3 px-4 font-semibold text-ink">Strategy / Decision</th>
                <th className="py-3 px-4 font-medium text-right">Upfront cash required [1]</th>
                <th className="py-3 px-4 font-medium text-right">Gross exit proceeds</th>
                <th className="py-3 px-4 font-medium text-right">Total taxes paid</th>
                <th className="py-3 px-4 font-medium text-right">Net cash in pocket</th>
                <th className="py-3 px-4 font-medium text-right">Effective tax rate</th>
                <th className="py-3 px-4 font-medium">Risk profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule/60 text-ink">
              {scenarios.map((scenario) => {
                const effectiveTaxRate =
                  scenario.grossProceedsAtExit > 0
                    ? scenario.totalTaxesPaid / (scenario.grossProceedsAtExit - scenario.upfrontCashRequired)
                    : 0;

                return (
                  <tr key={scenario.id} className="hover:bg-sunk/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-ink block font-serif">
                          {scenario.name}
                        </span>
                        <span className="text-[11px] text-muted block">
                          {scenario.strategyDescription}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {money(scenario.upfrontCashRequired)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {money(scenario.grossProceedsAtExit)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums text-loss font-medium">
                      {money(scenario.totalTaxesPaid)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums font-bold text-accent">
                      {money(scenario.netCashReceived)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-right tabular-nums">
                      {percent(effectiveTaxRate)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-medium border ${
                          scenario.riskLevel === 'HIGH'
                            ? 'bg-warn/10 text-warn border-warn/30'
                            : scenario.riskLevel === 'LOW'
                            ? 'bg-gain/10 text-gain border-gain/30'
                            : 'bg-sunk text-muted border-rule'
                        }`}
                      >
                        {scenario.riskLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footnotes */}
        <div className="p-4 border-t border-rule bg-sunk/20 space-y-1.5 text-[11px] font-mono text-muted">
          <p>
            [1] Upfront cash includes the $20,000 exercise payment plus potential
            Alternative Minimum Tax (AMT) on the $80,000 spread ($10.00 FMV - $2.00 strike).
          </p>
          <p>
            [2] Exercise and hold qualifies for Long-Term Capital Gains rates (15–20% federal + state)
            once held &gt;1 year from exercise and &gt;2 years from grant approval.
          </p>
          <p>
            [3] Cashless exercise avoids upfront capital risk, but the entire $280,000 gain is taxed
            as ordinary wage income plus applicable payroll withholdings.
          </p>
          <p className="pt-1 text-[10px] text-muted">
            {disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}

export default WorkedExampleSection;

