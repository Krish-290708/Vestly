import React from 'react';
import Link from 'next/link';
import { compactMoney } from '@/lib/format';

export interface InsightsPayload {
  summary: string | null;
  asOf: string | null;
  ipoStatus: 'listed' | 'reported-preparing' | 'none-reported' | null;
  events: Array<{ date: string; kind: string; headline: string; valuationUsd?: number; source: number }>;
  facts: Array<{ label: string; value: string; source: number }>;
  esopNotes: string[];
  competitors: string[];
  sources: Array<{ title: string; url: string }>;
  scorecard: Array<{ indicator: string; value: string; meaning: string }>;
  peers: Array<{
    ticker: string;
    name: string;
    marketCapUsd: number | null;
    peTtm: number | null;
    revenueGrowthTtmYoy: number | null;
    netMarginTtm: number | null;
  }>;
  analyst: { period: string; strongBuy: number; buy: number; hold: number; sell: number; strongSell: number } | null;
  listedMetrics: {
    peTtm: number | null;
    revenueGrowthTtmYoy: number | null;
    netMarginTtm: number | null;
    marketCapUsd: number | null;
  } | null;
  hasResearch: boolean;
  hasLiveInsights: boolean;
}

const KIND_LABEL: Record<string, string> = {
  funding: 'Funding round',
  tender: 'Tender offer',
  secondary: 'Secondary sale',
  ipo: 'IPO',
  other: 'Other',
};

const pct = (n: number | null) => (n === null ? '—' : `${n.toFixed(1)}%`);
const fixed = (n: number | null) => (n === null ? '—' : n.toFixed(1));

function Sources({ sources, indexes }: { sources: InsightsPayload['sources']; indexes: number[] }) {
  const uniq = Array.from(new Set(indexes)).filter((i) => sources[i]);
  if (uniq.length === 0) return null;
  return (
    <span className="text-muted">
      {' '}
      (
      {uniq.map((i, n) => (
        <React.Fragment key={i}>
          {n > 0 && ', '}
          <a
            href={sources[i].url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            source {i + 1}
          </a>
        </React.Fragment>
      ))}
      )
    </span>
  );
}

export default function CompanyInsights({
  insights,
  companyName,
  isPublic,
}: {
  insights: InsightsPayload;
  companyName: string;
  isPublic: boolean;
}) {
  const { analyst } = insights;
  const analystTotal = analyst
    ? analyst.strongBuy + analyst.buy + analyst.hold + analyst.sell + analyst.strongSell
    : 0;

  const hasAnything =
    insights.hasResearch || insights.hasLiveInsights || insights.scorecard.length > 0;
  if (!hasAnything) return null;

  return (
    <div className="space-y-8">
      {/* About */}
      {insights.summary && (
        <section className="space-y-3" aria-labelledby="about-heading">
          <h2 id="about-heading" className="font-serif text-sm font-semibold text-ink">
            About {companyName}
          </h2>
          <div className="p-4 border border-rule rounded-sm bg-surface text-xs space-y-3">
            <p className="text-ink leading-relaxed">{insights.summary}</p>
            {insights.facts.length > 0 && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {insights.facts.map((f) => (
                  <div key={f.label}>
                    <dt className="text-muted text-[11px]">{f.label}</dt>
                    <dd className="text-ink">
                      {f.value}
                      <Sources sources={insights.sources} indexes={[f.source]} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            {insights.asOf && (
              <p className="text-muted text-[11px]">
                Researched from public sources, checked {insights.asOf}. Companies can raise, list or be acquired at any time, so confirm the current status.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ESOP history */}
      {insights.events.length > 0 && (
        <section className="space-y-3" aria-labelledby="history-heading">
          <h2 id="history-heading" className="font-serif text-sm font-semibold text-ink">
            Equity and employee-sale history
          </h2>
          <div className="border border-rule rounded-sm bg-surface overflow-hidden">
            <ul className="divide-y divide-rule text-xs">
              {insights.events.map((e, i) => (
                <li key={`${e.date}-${i}`} className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-[110px_130px_1fr] gap-1 sm:gap-4">
                  <span className="font-mono tabular-nums text-muted">{e.date}</span>
                  <span className="text-ink font-medium">
                    {KIND_LABEL[e.kind] || 'Event'}
                    {e.valuationUsd ? (
                      <span className="block font-mono tabular-nums text-ink">{compactMoney(e.valuationUsd)}</span>
                    ) : null}
                  </span>
                  <span className="text-ink leading-relaxed">
                    {e.headline}
                    <Sources sources={insights.sources} indexes={[e.source]} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {insights.esopNotes.length > 0 && (
            <div className="p-4 border border-rule rounded-sm bg-surface text-xs space-y-2">
              <h3 className="font-semibold text-ink">What this means if you hold options</h3>
              <ul className="list-disc pl-4 space-y-1.5 text-ink leading-relaxed">
                {insights.esopNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Peers and competitors */}
      {(insights.peers.length > 0 || insights.competitors.length > 0) && (
        <section className="space-y-3" aria-labelledby="peers-heading">
          <h2 id="peers-heading" className="font-serif text-sm font-semibold text-ink">
            {isPublic ? 'How it compares with peers' : 'Competitors'}
          </h2>
          {insights.peers.length > 0 && (
            <div className="border border-rule rounded-sm overflow-x-auto bg-surface">
              <table className="w-full text-xs">
                <caption className="sr-only">Key figures for {companyName} and its listed peers</caption>
                <thead>
                  <tr className="bg-sunk text-left text-muted">
                    <th scope="col" className="p-3 font-medium">Company</th>
                    <th scope="col" className="p-3 font-medium text-right">Market cap</th>
                    <th scope="col" className="p-3 font-medium text-right">P/E (TTM)</th>
                    <th scope="col" className="p-3 font-medium text-right">Revenue growth</th>
                    <th scope="col" className="p-3 font-medium text-right">Net margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rule">
                  {insights.listedMetrics && (
                    <tr className="bg-sunk/40 font-medium">
                      <th scope="row" className="p-3 text-left text-ink">{companyName}</th>
                      <td className="p-3 text-right font-mono tabular-nums">
                        {insights.listedMetrics.marketCapUsd ? compactMoney(insights.listedMetrics.marketCapUsd) : '—'}
                      </td>
                      <td className="p-3 text-right font-mono tabular-nums">{fixed(insights.listedMetrics.peTtm)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{pct(insights.listedMetrics.revenueGrowthTtmYoy)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{pct(insights.listedMetrics.netMarginTtm)}</td>
                    </tr>
                  )}
                  {insights.peers.map((p) => (
                    <tr key={p.ticker}>
                      <th scope="row" className="p-3 text-left font-normal text-ink">
                        <Link href={`/research/companies/${p.ticker.toLowerCase()}`} className="hover:text-accent">
                          {p.name}
                        </Link>
                        <span className="ml-2 font-mono text-[10px] text-muted">{p.ticker}</span>
                      </th>
                      <td className="p-3 text-right font-mono tabular-nums">{p.marketCapUsd ? compactMoney(p.marketCapUsd) : '—'}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{fixed(p.peTtm)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{pct(p.revenueGrowthTtmYoy)}</td>
                      <td className="p-3 text-right font-mono tabular-nums">{pct(p.netMarginTtm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {insights.peers.length === 0 && insights.competitors.length > 0 && (
            <div className="p-4 border border-rule rounded-sm bg-surface text-xs">
              <p className="text-ink">{insights.competitors.join(', ')}</p>
              <p className="text-muted text-[11px] mt-2">
                A hand-picked list of well-known rivals, not a market-share ranking.
                {!isPublic && ' Private companies do not publish the figures needed for a side-by-side comparison.'}
              </p>
            </div>
          )}
          {insights.peers.length > 0 && (
            <p className="text-muted text-[11px]">
              Peers are chosen by the data provider (Finnhub) and may include companies that compete only in part. Figures are trailing twelve months where available.
            </p>
          )}
        </section>
      )}

      {/* Scorecard */}
      {insights.scorecard.length > 0 && (
        <section className="space-y-3" aria-labelledby="scorecard-heading">
          <h2 id="scorecard-heading" className="font-serif text-sm font-semibold text-ink">
            Facts to weigh
          </h2>
          <p className="text-xs text-muted">
            These are indicators, not a rating. Vestly does not say whether a company is a good investment.
          </p>
          <div className="border border-rule rounded-sm overflow-x-auto bg-surface">
            <table className="w-full text-xs">
              <caption className="sr-only">Indicators for {companyName} and what each means for equity holders</caption>
              <thead>
                <tr className="bg-sunk text-left text-muted">
                  <th scope="col" className="p-3 font-medium w-[30%]">Indicator</th>
                  <th scope="col" className="p-3 font-medium w-[28%]">Value</th>
                  <th scope="col" className="p-3 font-medium">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule align-top">
                {insights.scorecard.map((r) => (
                  <tr key={r.indicator}>
                    <th scope="row" className="p-3 text-left font-medium text-ink">{r.indicator}</th>
                    <td className="p-3 font-mono tabular-nums text-ink">{r.value}</td>
                    <td className="p-3 text-muted leading-relaxed">{r.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {analyst && analystTotal > 0 && (
            <div className="p-4 border border-rule rounded-sm bg-surface text-xs space-y-2">
              <h3 className="font-semibold text-ink">Analyst ratings, {analyst.period} (third-party opinion)</h3>
              <div
                className="flex h-2 w-full overflow-hidden rounded-sm border border-rule"
                role="img"
                aria-label={`${analyst.strongBuy + analyst.buy} buy, ${analyst.hold} hold, ${analyst.sell + analyst.strongSell} sell`}
              >
                <div style={{ width: `${((analyst.strongBuy + analyst.buy) / analystTotal) * 100}%`, background: 'var(--gain, #2f6b4f)' }} />
                <div style={{ width: `${(analyst.hold / analystTotal) * 100}%`, background: 'var(--rule, #d9d2c5)' }} />
                <div style={{ width: `${((analyst.sell + analyst.strongSell) / analystTotal) * 100}%`, background: 'var(--loss, #9b3a2e)' }} />
              </div>
              <p className="text-ink">
                {analyst.strongBuy + analyst.buy} buy · {analyst.hold} hold · {analyst.sell + analyst.strongSell} sell
                <span className="text-muted"> of {analystTotal} analysts</span>
              </p>
              <p className="text-muted text-[11px]">
                Reported by Finnhub from Wall Street analysts. These are their views, not Vestly's, and past ratings do not predict returns.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Sources and notice */}
      <section className="space-y-2 text-[11px] text-muted" aria-labelledby="sources-heading">
        {insights.sources.length > 0 && (
          <>
            <h2 id="sources-heading" className="font-serif text-sm font-semibold text-ink">
              Sources
            </h2>
            <ol className="list-decimal pl-5 space-y-1">
              {insights.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-accent">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </>
        )}
        <p>
          For information and education only. Not investment, tax or legal advice. Check figures against the company&apos;s own filings and announcements before relying on them.
        </p>
      </section>
    </div>
  );
}
