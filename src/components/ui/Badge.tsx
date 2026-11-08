import React from 'react';

export type BadgeTone = 'neutral' | 'gain' | 'loss' | 'warn' | 'info' | 'accent';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

const toneDotColors: Record<BadgeTone, string> = {
  neutral: 'bg-muted',
  gain: 'bg-gain',
  loss: 'bg-loss',
  warn: 'bg-warn',
  info: 'bg-info',
  accent: 'bg-accent',
};

const toneTextColors: Record<BadgeTone, string> = {
  neutral: 'text-muted',
  gain: 'text-gain font-medium',
  loss: 'text-loss font-medium',
  warn: 'text-warn font-medium',
  info: 'text-info font-medium',
  accent: 'text-accent font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  tone = 'neutral',
  dot = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-mono tracking-tight ${toneTextColors[tone]} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${toneDotColors[tone]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
