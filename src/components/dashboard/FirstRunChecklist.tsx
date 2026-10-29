'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight, ListChecks } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface FirstRunChecklistProps {
  hasGrants: boolean;
  hasTaxDefaults: boolean;
  hasReminders: boolean;
  hasScenarios: boolean;
  onAddGrantClick: () => void;
}

export function FirstRunChecklist({
  hasGrants,
  hasTaxDefaults,
  hasReminders,
  hasScenarios,
  onAddGrantClick,
}: FirstRunChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default true to avoid flash

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDismissed = localStorage.getItem('vestly_dismiss_checklist') === 'true';
      setDismissed(isDismissed);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('vestly_dismiss_checklist', 'true');
  };

  const tasks = [
    {
      id: 'grant',
      label: 'Record your first equity grant agreement',
      completed: hasGrants,
      action: (
        <button
          type="button"
          onClick={onAddGrantClick}
          className="text-accent hover:underline inline-flex items-center gap-1 font-medium text-xs"
        >
          <span>Add grant</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      ),
    },
    {
      id: 'tax',
      label: 'Configure state and income tax defaults',
      completed: hasTaxDefaults,
      action: (
        <Link
          href="/settings#tax-defaults"
          className="text-accent hover:underline inline-flex items-center gap-1 font-medium text-xs"
        >
          <span>Settings</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'calculator',
      label: 'Model an exit scenario in the calculator',
      completed: hasScenarios,
      action: (
        <Link
          href="/calculator"
          className="text-accent hover:underline inline-flex items-center gap-1 font-medium text-xs"
        >
          <span>Calculator</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
    {
      id: 'reminder',
      label: 'Schedule a statutory deadline or PTEW reminder',
      completed: hasReminders,
      action: (
        <Link
          href="/actions"
          className="text-accent hover:underline inline-flex items-center gap-1 font-medium text-xs"
        >
          <span>Actions</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const isAllComplete = completedCount === tasks.length;

  // Don't render if dismissed or all complete
  if (dismissed || isAllComplete) {
    return null;
  }

  return (
    <div className="border border-rule rounded-xs bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-base font-bold text-ink">
            Getting started with your equity portfolio
          </h2>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-xs text-muted hover:text-ink inline-flex items-center gap-1 font-sans transition-colors"
          title="Dismiss checklist"
        >
          <span>Dismiss</span>
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted font-sans">
          <span>Setup progress: {completedCount} of {tasks.length} tasks completed</span>
          <span className="font-mono text-ink tabular-nums font-semibold">
            {Math.round((completedCount / tasks.length) * 100)}%
          </span>
        </div>
        <ProgressBar value={completedCount} max={tasks.length} />
      </div>

      <div className="divide-y divide-rule/60 text-xs font-sans">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="py-2.5 flex items-center justify-between gap-3 first:pt-1 last:pb-0"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-4 h-4 rounded-xs border flex items-center justify-center shrink-0 ${
                  task.completed
                    ? 'bg-gain text-surface border-gain'
                    : 'border-rule bg-sunk text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span
                className={task.completed ? 'text-muted line-through' : 'text-ink font-medium'}
              >
                {task.label}
              </span>
            </div>

            {!task.completed && <div>{task.action}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FirstRunChecklist;
