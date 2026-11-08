'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vestly app segment error:', error);
  }, [error]);

  return (
    <section className="max-w-lg mx-auto my-12 p-6 border border-rule rounded-sm bg-surface space-y-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-loss">Unable to load this view</p>
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">Your data is still safe</h1>
        <p className="text-sm text-muted">Try the view again, or return to your overview.</p>
      </div>
      <div className="flex gap-3">
        <Button type="button" size="sm" onClick={reset}>Try again</Button>
        <Link href="/dashboard" className="text-xs font-medium text-accent self-center">Return to overview</Link>
      </div>
    </section>
  );
}
