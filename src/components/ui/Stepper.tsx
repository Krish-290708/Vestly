import React from 'react';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number; // 0-indexed
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between border-b border-rule pb-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isClickable = Boolean(onStepClick && idx <= currentStep);

          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 text-xs select-none ${
                idx < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(idx)}
                className={`flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-sm flex items-center justify-center font-mono text-[11px] font-semibold border ${
                    isCompleted
                      ? 'bg-accent text-accent-contrast border-accent'
                      : isCurrent
                      ? 'bg-surface text-ink border-accent ring-1 ring-accent'
                      : 'bg-sunk text-muted border-rule'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span
                  className={`font-medium ${
                    isCurrent
                      ? 'text-ink font-semibold'
                      : isCompleted
                      ? 'text-ink'
                      : 'text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[1px] mx-3 ${
                    idx < currentStep ? 'bg-accent' : 'bg-rule'
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
