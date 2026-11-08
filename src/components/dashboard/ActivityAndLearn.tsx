'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { History, BookOpen, ArrowRight } from 'lucide-react';
import { relativeDays, date as formatDate } from '@/lib/format';

export interface AuditLogItem {
  id: string;
  action: string;
  details?: string | null;
  timestamp: string;
  grant?: {
    grantIdentifier: string;
    grantType: string;
    company?: {
      name: string;
    };
  } | null;
}

interface ActivityAndLearnProps {
  auditLogs: AuditLogItem[];
  grantTypes: string[];
}

export function ActivityAndLearn({
  auditLogs,
  grantTypes,
}: ActivityAndLearnProps) {
  // Format action into human-readable sentence
  const formatActivitySentence = (log: AuditLogItem): string => {
    const compName = log.grant?.company?.name;
    const identifier = log.grant?.grantIdentifier;
    const gType = log.grant?.grantType;

    switch (log.action) {
      case 'GRANT_CREATED':
        return compName
          ? `Added new ${gType || ''} grant at ${compName} (${identifier || ''}).`
          : 'Added new equity grant to portfolio.';
      case 'DOCUMENT_UPLOADED':
        return compName
          ? `Uploaded grant agreement document for ${compName}.`
          : 'Uploaded grant document.';
      case 'STATUS_UPDATED':
        return `Updated status for ${compName || 'grant'}.`;
      case 'SIMULATION_RUN':
        return 'Calculated exit scenario in equity modeler.';
      case 'ACTION_COMPLETED':
        return log.details ? `Completed action: ${log.details}.` : 'Completed action item.';
      case 'WATCHLIST_TOGGLED':
        return log.details ? `Updated watchlist: ${log.details}.` : 'Updated company watchlist.';
      default:
        return log.details || `Recorded ${log.action.toLowerCase().replace(/_/g, ' ')}.`;
    }
  };

  // Select 3 personalized learning articles based on held grant types
  const personalizedArticles = useMemo(() => {
    const hasIso = grantTypes.includes('ISO');
    const hasNso = grantTypes.includes('NSO');
    const hasRsu = grantTypes.includes('RSU');

    const candidates = [
      {
        slug: 'iso-vs-nso',
        title: 'ISO vs. NSO: Complete tax mechanics',
        reason: hasIso
          ? 'Relevant to your Incentive Stock Options (ISOs)'
          : 'Recommended tax planning guide',
        readTime: '8 min read',
      },
      {
        slug: '83b-guide',
        title: 'The 30-day Section 83(b) election guide',
        reason: 'Statutory deadline tracking for early exercise',
        readTime: '5 min read',
      },
      {
        slug: hasRsu ? 'rsu-vesting' : 'evaluating-an-offer',
        title: hasRsu
          ? 'RSU vesting & supplemental wage withholding'
          : 'Evaluating an equity offer before you sign',
        reason: hasRsu
          ? 'Relevant to your Restricted Stock Units (RSUs)'
          : 'Core equity compensation concepts',
        readTime: '6 min read',
      },
    ];

    return candidates.slice(0, 3);
  }, [grantTypes]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Recent Activity (7 cols) */}
      <div className="lg:col-span-7 border border-rule rounded-xs bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-accent" aria-hidden="true" />
            <h2 className="font-serif text-base font-bold text-ink">
              Recent portfolio activity
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted">
            Audit log
          </span>
        </div>

        {auditLogs.length > 0 ? (
          <div className="divide-y divide-rule/60 text-xs font-sans">
            {auditLogs.slice(0, 8).map((log) => {
              const d = new Date(log.timestamp);
              return (
                <div key={log.id} className="py-2.5 flex items-baseline justify-between gap-4 first:pt-0 last:pb-0">
                  <p className="text-ink font-medium leading-relaxed">
                    {formatActivitySentence(log)}
                  </p>
                  <span className="text-[11px] font-mono text-muted shrink-0">
                    {relativeDays(d)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-4 text-xs text-muted">
            No recent account activity logged yet.
          </div>
        )}
      </div>

      {/* Learn Next (5 cols) */}
      <div className="lg:col-span-5 border border-rule rounded-xs bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" aria-hidden="true" />
            <h2 className="font-serif text-base font-bold text-ink">
              Learn next
            </h2>
          </div>
          <Link
            href="/learn"
            className="text-xs text-accent hover:underline inline-flex items-center gap-1 font-medium"
          >
            <span>All guides</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-3">
          {personalizedArticles.map((art) => (
            <Link
              key={art.slug}
              href={`/learn#${art.slug}`}
              className="p-3 border border-rule/70 rounded-xs bg-sunk/20 hover:bg-sunk/40 transition-colors block space-y-1 group"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                <span className="text-accent font-medium">{art.reason}</span>
                <span>{art.readTime}</span>
              </div>
              <h3 className="font-serif text-sm font-bold text-ink group-hover:text-accent transition-colors">
                {art.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivityAndLearn;

