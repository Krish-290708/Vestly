import React from 'react';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  description,
  className = '',
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) {
        onChange(!checked);
      }
    }
  };

  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      {(label || description) && (
        <div className="text-xs leading-5">
          {label && (
            <label
              htmlFor={switchId}
              onClick={() => !disabled && onChange(!checked)}
              className="font-medium text-ink cursor-pointer select-none"
            >
              {label}
            </label>
          )}
          {description && <p className="text-muted">{description}</p>}
        </div>
      )}
      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-rule transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-accent border-accent' : 'bg-sunk'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-surface shadow-sm transition-transform duration-150 ease-in-out my-auto ml-0.5 ${
            checked ? 'translate-x-4 bg-accent-contrast' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
