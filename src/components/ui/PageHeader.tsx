import React from 'react';

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  contextSentence?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  contextSentence,
  actions,
  className = '',
}) => {
  return (
    <header className={`border-b border-rule pb-5 mb-6 space-y-2 ${className}`}>
      {eyebrow && (
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-ink font-normal tracking-tight">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
      {contextSentence && (
        <p className="text-xs sm:text-sm text-muted font-sans max-w-3xl leading-relaxed">
          {contextSentence}
        </p>
      )}
    </header>
  );
};
