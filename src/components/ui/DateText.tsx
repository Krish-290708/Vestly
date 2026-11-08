import React from 'react';
import { date, relativeDays } from '@/lib/format';

export interface DateTextProps extends React.HTMLAttributes<HTMLTimeElement> {
  value: Date | string | number;
  relative?: boolean;
  asOf?: Date;
}

export const DateText: React.FC<DateTextProps> = ({
  value,
  relative = false,
  asOf,
  className = '',
  ...props
}) => {
  const dateObj = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  const isoString = dateObj && !isNaN(dateObj.getTime()) ? dateObj.toISOString() : undefined;

  const display = relative ? relativeDays(value, asOf) : date(value);

  return (
    <time
      dateTime={isoString}
      className={`font-mono text-xs tabular-nums ${className}`}
      {...props}
    >
      {display}
    </time>
  );
};
