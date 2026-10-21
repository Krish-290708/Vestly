import React from 'react';

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  hairline?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  title,
  eyebrow,
  description,
  actions,
  hairline = true,
  className = '',
  children,
  ...props
}) => {
  return (
    <section className={`space-y-4 ${className}`} {...props}>
      {(title || eyebrow || actions) && (
        <div className={`space-y-1.5 ${hairline ? 'border-b border-rule pb-3' : ''}`}>
          <div className="flex items-end justify-between gap-4">
            <div>
              {eyebrow && (
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted block mb-1">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h3 className="font-serif text-lg font-medium text-ink">
                  {title}
                </h3>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
          {description && (
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};
