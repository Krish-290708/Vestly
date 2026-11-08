import React from 'react';

export interface StatProps {
  label: React.ReactNode;
  value: React.ReactNode;
  footnoteMarker?: string | number;
  note?: React.ReactNode;
  change?: {
    value: string;
    type: 'gain' | 'loss' | 'neutral';
  };
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  footnoteMarker,
  note,
  change,
  className = '',
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="text-xs font-mono uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight tabular-nums">
          {value}
        </span>
        {footnoteMarker && (
          <sup className="text-xs text-muted font-mono font-normal">
            {footnoteMarker}
          </sup>
        )}
      </div>
      {(change || note) && (
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span
              className={`font-mono font-medium ${
                change.type === 'gain'
                  ? 'text-gain'
                  : change.type === 'loss'
                  ? 'text-loss'
                  : 'text-muted'
              }`}
            >
              {change.value}
            </span>
          )}
          {note && <span className="text-muted">{note}</span>}
        </div>
      )}
    </div>
  );
};
