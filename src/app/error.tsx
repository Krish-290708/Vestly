'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vestly application error caught:', error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto my-12 sm:my-20 p-6 sm:p-8 bg-surface border border-loss/40 rounded-sm text-ink space-y-5">
      <div className="flex items-center gap-2 text-loss border-b border-rule pb-3">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
          Application error
        </span>
      </div>

      <div className="space-y-2">
        <h1 className="font-serif text-xl font-bold tracking-tight text-ink">
          Unable to display this view
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          The calculation engine encountered an unexpected error while processing this request.
        </p>
        {error?.message && (
          <div className="p-3 rounded-2xs bg-sunk border border-rule font-mono text-[11px] text-muted break-all">
            {error.message}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-rule">
        <Button variant="primary" size="sm" onClick={() => reset()}>
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          <span>Try again</span>
        </Button>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs border border-rule text-ink hover:bg-sunk transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to overview</span>
        </Link>
      </div>
    </div>
  );
}
