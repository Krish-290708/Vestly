'use client';

import React, { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export function FirstVisitNotice() {
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('vestly_notice_dismissed');
      if (!dismissed) {
        setIsDismissed(false);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vestly_notice_dismissed', 'true');
    }
  };

  if (isDismissed) return null;

  return (
    <div
      role="region"
      aria-label="First-visit informational notice"
      className="bg-sunk border-b border-rule px-4 py-2 text-xs font-sans text-ink flex items-center justify-between gap-3 animate-in fade-in duration-150"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Info className="w-3.5 h-3.5 text-accent shrink-0" aria-hidden="true" />
        <p className="leading-normal truncate text-[11px] sm:text-xs">
          <strong className="font-semibold text-ink">Welcome to Vestly.</strong> Vestly provides
          mathematical models for understanding equity compensation. It is not financial, legal, or
          tax advice.
        </p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notice"
        className="shrink-0 text-muted hover:text-ink text-[11px] font-mono px-1.5 py-0.5 rounded-2xs border border-rule/60 hover:bg-surface transition-colors"
      >
        Dismiss
      </button>
    </div>
  );
}

export default FirstVisitNotice;

