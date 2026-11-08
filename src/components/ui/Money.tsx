import React from 'react';
import { money, compactMoney, signedMoney } from '@/lib/format';

export interface MoneyProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  compact?: boolean;
  signed?: boolean;
  showCents?: boolean;
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  compact = false,
  signed = false,
  showCents,
  className = '',
  ...props
}) => {
  let formatted: string;
  if (compact) {
    formatted = compactMoney(amount);
  } else if (signed) {
    formatted = signedMoney(amount, { showCents });
  } else {
    formatted = money(amount, { showCents });
  }

  const isPositive = amount > 0;
  const isNegative = amount < 0;

  return (
    <span
      className={`tabular-nums font-mono ${
        signed
          ? isPositive
            ? 'text-gain'
            : isNegative
            ? 'text-loss'
            : 'text-muted'
          : ''
      } ${className}`}
      {...props}
    >
      {formatted}
    </span>
  );
};
