'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { date as formatDate, relativeDays } from '@/lib/format';

export interface ActionReminderItem {
  id: string;
  title: string;
  dueDate: string;
  urgency: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  status: 'PENDING' | 'COMPLETED' | 'DISMISSED';
  grant?: {
    id: string;
    grantIdentifier: string;
    company?: {
      name: string;
    };
  } | null;
}

interface NeedsAttentionProps {
  reminders: ActionReminderItem[];
}

export function NeedsAttention({ reminders }: NeedsAttentionProps) {
  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Filter for pending reminders with high/critical urgency or due within 30 days
  const urgentReminders = reminders.filter((r) => {
    if (r.status !== 'PENDING') return false;
    const due = new Date(r.dueDate);
    const isUrgentLevel = r.urgency === 'CRITICAL' || r.urgency === 'HIGH';
    const isDueSoon = due <= thirtyDaysOut;
    return isUrgentLevel || isDueSoon;
  });

  return (
    <div className="border border-rule rounded-xs bg-surface p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
          <h2 className="font-serif text-base font-bold text-ink">
            Needs attention
          </h2>
        </div>
        <Link
          href="/actions"
          className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
        >
          <span>View all reminders</span>
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
      </div>

      {urgentReminders.length > 0 ? (
        <div className="divide-y divide-rule/60 text-xs font-sans">
          {urgentReminders.map((rem) => {
            const dueDate = new Date(rem.dueDate);
            const isCritical = rem.urgency === 'CRITICAL';

            return (
              <div
                key={rem.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold border ${
                        isCritical
                          ? 'bg-loss/10 text-loss border-loss/30'
                          : 'bg-warn/10 text-warn border-warn/30'
                      }`}
                    >
                      {rem.urgency}
                    </span>
                    <span className="font-semibold text-ink">
                      {rem.title}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted flex items-center gap-3 font-mono">
                    <span>Due: {formatDate(dueDate)} ({relativeDays(dueDate)})</span>
                    {rem.grant && (
                      <span>· {rem.grant.company?.name || 'Company'} ({rem.grant.grantIdentifier})</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={`/actions?action=${rem.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xs border border-rule bg-surface hover:bg-sunk text-ink font-medium text-xs transition-colors"
                  >
                    <span>Take action</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-2 flex items-center gap-2 text-xs text-muted font-sans">
          <CheckCircle2 className="w-4 h-4 text-gain shrink-0" aria-hidden="true" />
          <span>Nothing due in the next 30 days. All statutory deadlines and exercise windows are current.</span>
        </div>
      )}
    </div>
  );
}

export default NeedsAttention;

