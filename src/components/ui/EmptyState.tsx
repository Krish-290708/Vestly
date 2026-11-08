import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-4 max-w-md mx-auto space-y-3 ${className}`}
    >
      <h3 className="font-serif text-base sm:text-lg font-medium text-ink">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-muted leading-relaxed">
        {description}
      </p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};
