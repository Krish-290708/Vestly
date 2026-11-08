import React from 'react';
import { units } from '@/lib/format';

export interface UnitsProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  suffix?: string;
}

export const Units: React.FC<UnitsProps> = ({
  count,
  suffix,
  className = '',
  ...props
}) => {
  return (
    <span className={`tabular-nums font-mono ${className}`} {...props}>
      {units(count)}
      {suffix ? ` ${suffix}` : ''}
    </span>
  );
};
