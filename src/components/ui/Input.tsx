import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixNode?: React.ReactNode;
  suffixNode?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', prefixNode, suffixNode, ...props }, ref) => {
    if (prefixNode || suffixNode) {
      return (
        <div className="relative flex items-center w-full">
          {prefixNode && (
            <span className="absolute left-2.5 text-xs text-muted pointer-events-none select-none">
              {prefixNode}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-surface text-ink border border-rule rounded-sm text-sm px-3 py-1.5 min-h-[34px] placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-sunk font-sans ${
              prefixNode ? 'pl-7' : ''
            } ${suffixNode ? 'pr-7' : ''} ${className}`}
            {...props}
          />
          {suffixNode && (
            <span className="absolute right-2.5 text-xs text-muted pointer-events-none select-none">
              {suffixNode}
            </span>
          )}
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`w-full bg-surface text-ink border border-rule rounded-sm text-sm px-3 py-1.5 min-h-[34px] placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-sunk font-sans ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
