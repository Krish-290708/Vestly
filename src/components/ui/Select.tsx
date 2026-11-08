import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={`w-full appearance-none bg-surface text-ink border border-rule rounded-sm text-sm px-3 py-1.5 pr-8 min-h-[34px] focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-sunk font-sans ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted"
          aria-hidden="true"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M7 8l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    );
  }
);
Select.displayName = 'Select';
