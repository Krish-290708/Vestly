'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function ContentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Vestly content segment error:', error);
  }, [error]);

  return (
    <section className="max-w-lg mx-auto my-12 p-6 border border-rule rounded-sm bg-surface space-y-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-loss">Unable to load this page</p>
      <div className="space-y-1">
        <h1 className="font-serif text-2xl text-ink">Please try again</h1>
        <p className="text-sm text-muted">The guides and research data are available from the links below.</p>
      </div>
      <div className="flex gap-3">
        <Button type="button" size="sm" onClick={reset}>Try again</Button>
        <Link href="/learn" className="text-xs font-medium text-accent self-center">Open Learn</Link>
      </div>
    </section>
  );
}
