import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AppLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading dashboard view">
      {/* Header skeleton */}
      <div className="space-y-2 pb-4 border-b border-rule">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Metrics strip skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 border border-rule rounded-sm bg-surface space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Main chart / table container skeleton */}
      <div className="p-6 border border-rule rounded-sm bg-surface space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rule/60">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>

      {/* List skeleton */}
      <div className="p-6 border border-rule rounded-sm bg-surface space-y-3">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

