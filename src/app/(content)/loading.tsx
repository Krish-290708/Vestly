import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ContentLoading() {
  return (
    <div className="space-y-6 animate-pulse max-w-4xl mx-auto" aria-label="Loading content">
      <div className="space-y-2 pb-4 border-b border-rule">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-4 border border-rule rounded-sm bg-surface space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

