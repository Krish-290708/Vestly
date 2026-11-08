import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full bg-surface text-ink border border-rule rounded-sm text-sm p-3 placeholder:text-muted/60 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:bg-sunk font-sans ${className}`}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
