import React from 'react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', id, label, description, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className={`flex items-start gap-2.5 ${className}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className="w-4 h-4 bg-surface text-accent border border-rule rounded-sm focus:ring-1 focus:ring-accent focus:ring-offset-0 disabled:opacity-50 cursor-pointer accent-accent"
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-xs leading-5">
            {label && (
              <label
                htmlFor={checkboxId}
                className="font-medium text-ink cursor-pointer select-none"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-muted">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
