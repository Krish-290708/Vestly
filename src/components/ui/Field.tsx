import React from 'react';

export interface FieldProps {
  id?: string;
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  children,
}) => {
  const generatedId = React.useId();
  const fieldId = id || generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  // If the child is a plain wrapper element (e.g. <div> holding an input and a hint), do not put the
  // id on the wrapper: the label would then point at a div. The page passes the same `id` to the input.
  const isPlainWrapper =
    React.isValidElement(children) &&
    typeof children.type === 'string' &&
    !['input', 'select', 'textarea'].includes(children.type);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="block text-xs font-medium text-ink tracking-wide"
        >
          {label}
          {required && (
            <span className="text-loss ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div>
        {React.isValidElement(children) && !isPlainWrapper
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: fieldId,
              'aria-describedby': describedBy,
              'aria-invalid': error ? 'true' : undefined,
              required,
            })
          : children}
      </div>

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs text-loss font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
