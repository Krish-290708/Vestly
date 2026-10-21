'use client';

import React from 'react';
import { Popover } from './Popover';

export interface CalculationBreakdown {
  title?: string;
  inputs?: { name: string; value: React.ReactNode }[];
  steps?: React.ReactNode[];
  asOfDate?: string;
  note?: string;
}

export interface FigureProps {
  value: React.ReactNode;
  marker?: string | number;
  calculation?: CalculationBreakdown;
  className?: string;
  valueClassName?: string;
}

export const Figure: React.FC<FigureProps> = ({
  value,
  marker,
  calculation,
  className = '',
  valueClassName = '',
}) => {
  const content = (
    <span
      className={`inline-flex items-baseline gap-0.5 tabular-nums ${className} ${
        calculation ? 'cursor-pointer border-b border-dotted border-rule hover:border-muted' : ''
      }`}
    >
      <span className={valueClassName}>{value}</span>
      {marker && (
        <sup className="text-[10px] font-mono text-muted select-none">
          {marker}
        </sup>
      )}
    </span>
  );

  if (!calculation) {
    return content;
  }

  return (
    <Popover trigger={content} width="w-80">
      <div className="space-y-3 text-xs text-ink font-sans">
        <div className="border-b border-rule pb-2">
          <p className="font-semibold text-ink">
            {calculation.title || 'How is this calculated?'}
          </p>
          {calculation.asOfDate && (
            <p className="text-[11px] text-muted font-mono mt-0.5">
              As of {calculation.asOfDate}
            </p>
          )}
        </div>

        {calculation.inputs && calculation.inputs.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-mono tracking-wider text-muted font-semibold">
              Inputs & assumptions
            </p>
            <dl className="space-y-1">
              {calculation.inputs.map((inp, idx) => (
                <div key={idx} className="flex justify-between items-baseline gap-2 text-xs">
                  <dt className="text-muted">{inp.name}</dt>
                  <dd className="font-mono tabular-nums text-ink">{inp.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {calculation.steps && calculation.steps.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-rule/60">
            <p className="text-[10px] uppercase font-mono tracking-wider text-muted font-semibold">
              Calculation steps
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-xs text-muted">
              {calculation.steps.map((st, idx) => (
                <li key={idx} className="leading-snug">
                  {st}
                </li>
              ))}
            </ol>
          </div>
        )}

        {calculation.note && (
          <p className="text-[11px] text-muted border-t border-rule/60 pt-2 italic leading-normal">
            {calculation.note}
          </p>
        )}
      </div>
    </Popover>
  );
};
