import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse py-6">
      <div className="space-y-2 pb-4 border-b border-rule">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="p-4 border border-rule rounded-sm bg-surface space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      <div className="p-5 border border-rule rounded-sm bg-surface space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}
