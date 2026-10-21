import React from 'react';

export type CalloutVariant = 'info' | 'warn' | 'note';

export interface CalloutProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: CalloutVariant;
  title?: React.ReactNode;
}

const variantStyles: Record<
  CalloutVariant,
  { border: string; text: string; label: string }
> = {
  info: {
    border: 'border-l-info',
    text: 'text-ink',
    label: 'text-info',
  },
  warn: {
    border: 'border-l-warn',
    text: 'text-ink',
    label: 'text-warn',
  },
  note: {
    border: 'border-l-rule',
    text: 'text-ink',
    label: 'text-muted',
  },
};

export const Callout: React.FC<CalloutProps> = ({
  variant = 'note',
  title,
  className = '',
  children,
  ...props
}) => {
  const current = variantStyles[variant];

  return (
    <div
      role={variant === 'warn' ? 'alert' : 'note'}
      className={`border-l-2 bg-sunk/50 p-3.5 text-xs sm:text-sm leading-relaxed rounded-r-sm ${current.border} ${current.text} ${className}`}
      {...props}
    >
      {title && (
        <p className={`font-semibold text-xs uppercase tracking-wide mb-1 ${current.label}`}>
          {title}
        </p>
      )}
      <div>{children}</div>
    </div>
  );
};
