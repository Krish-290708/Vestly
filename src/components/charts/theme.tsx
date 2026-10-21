import React from 'react';

/**
 * "The Ledger" flat chart theme configuration.
 * All fills are flat (no gradients, no neon, no glow).
 * Colors read theme CSS variables.
 */

export const chartTokens = {
  accent: 'var(--accent, #1F5A44)',
  accentContrast: 'var(--accent-contrast, #FFFFFF)',
  gain: 'var(--gain, #1B6B47)',
  loss: 'var(--loss, #A63D2F)',
  warn: 'var(--warn, #9A4A12)',
  info: 'var(--info, #2D4A6B)',
  muted: 'var(--muted, #5B564C)',
  rule: 'var(--rule, #DDD7CB)',
  paper: 'var(--paper, #F7F4EE)',
  surface: 'var(--surface, #FFFFFF)',
  ink: 'var(--ink, #1A1814)',
  sunk: 'var(--sunk, #EFEBE2)',
};

/**
 * Series palette for multi-grant stacked / grouped charts
 */
export const seriesColors = [
  'var(--accent, #1F5A44)',
  'var(--info, #2D4A6B)',
  'var(--gain, #1B6B47)',
  'var(--warn, #9A4A12)',
  '#4A3B32',
  '#6B5B95',
];

export const chartAxisStyle = {
  tick: {
    fill: 'var(--muted, #5B564C)',
    fontSize: 11,
    fontFamily: 'var(--font-ibm-plex-mono), monospace',
  },
  axisLine: {
    stroke: 'var(--rule, #DDD7CB)',
    strokeWidth: 1,
  },
  tickLine: {
    stroke: 'var(--rule, #DDD7CB)',
    strokeWidth: 1,
  },
};

export const chartGridStyle = {
  stroke: 'var(--rule, #DDD7CB)',
  strokeDasharray: '2 2',
  strokeOpacity: 0.6,
};

export const chartTooltipStyle = {
  backgroundColor: 'var(--surface, #FFFFFF)',
  borderColor: 'var(--rule, #DDD7CB)',
  borderRadius: '2px',
  color: 'var(--ink, #1A1814)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  fontSize: '12px',
  fontFamily: 'var(--font-ibm-plex-sans), sans-serif',
  padding: '8px 12px',
};

/**
 * Configuration for "Today" and "Cliff" vertical markers
 */
export const todayMarkerConfig = {
  stroke: 'var(--ink, #1A1814)',
  strokeWidth: 1,
  strokeDasharray: 'none',
  label: {
    value: 'Today',
    position: 'insideTopLeft' as const,
    fill: 'var(--ink, #1A1814)',
    fontSize: 10,
    fontFamily: 'var(--font-ibm-plex-mono), monospace',
  },
};

export const cliffMarkerConfig = {
  stroke: 'var(--warn, #9A4A12)',
  strokeWidth: 1,
  strokeDasharray: '3 3',
  label: {
    value: 'Cliff',
    position: 'insideTopLeft' as const,
    fill: 'var(--warn, #9A4A12)',
    fontSize: 10,
    fontFamily: 'var(--font-ibm-plex-mono), monospace',
  },
};

/**
 * Accessible text summary component rendered below every chart
 */
export interface ChartSummaryProps {
  summary: string;
  tableData?: { label: string; value: string | number }[];
  className?: string;
}

export const ChartSummary: React.FC<ChartSummaryProps> = ({
  summary,
  tableData,
  className = '',
}) => {
  return (
    <div
      aria-label="Chart data summary"
      className={`border-t border-rule/60 pt-2.5 mt-2 space-y-1.5 text-xs text-muted font-sans ${className}`}
    >
      <p className="leading-relaxed">
        <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted/80 mr-1.5 select-none">
          Summary:
        </span>
        {summary}
      </p>

      {tableData && tableData.length > 0 && (
        <details className="text-[11px] font-mono cursor-pointer">
          <summary className="text-muted hover:text-ink select-none">
            View raw chart figures
          </summary>
          <div className="overflow-x-auto mt-1.5 border border-rule rounded-sm bg-surface">
            <table className="w-full text-left text-[11px]">
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-rule/50 last:border-0">
                    <td className="px-2 py-1 text-muted">{row.label}</td>
                    <td className="px-2 py-1 text-right text-ink font-medium tabular-nums">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </div>
  );
};
