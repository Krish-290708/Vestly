'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader, Tabs, Badge, Button, EmptyState, Callout, Dialog } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { date, relativeDays } from '@/lib/format';
import { downloadIcs } from '@/lib/ics';
import CreateTaskModal from '@/components/actions/CreateTaskModal';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ActionReminder {
  id: string;
  type: string;
  title: string;
  description?: string;
  dueDate: string;
  status: string;
  snoozedUntil?: string;
  urgency: string;
  createdAt: string;
  updatedAt: string;
  grantId?: string;
  grant?: {
    grantIdentifier: string;
    company: { name: string };
  };
}

interface AuditLog {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
  grant?: {
    grantIdentifier: string;
    company: { name: string };
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const URGENCY_TONE: Record<string, 'loss' | 'warn' | 'neutral' | 'info'> = {
  CRITICAL: 'loss',
  HIGH: 'warn',
  MEDIUM: 'neutral',
  LOW: 'info',
};

const STATUS_TONE: Record<string, 'gain' | 'info' | 'neutral' | 'warn' | 'loss'> = {
  PENDING: 'neutral',
  SNOOZED: 'info',
  COMPLETED: 'gain',
  EXERCISED: 'gain',
  SOLD: 'gain',
  DECLINED: 'loss',
};

const SNOOZE_PRESETS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
];

const TYPE_LABELS: Record<string, string> = {
  VESTING_EVENT: 'Vesting',
  EXPIRATION_WARNING: 'Expiration',
  PTEW_EXPIRATION: 'PTEW',
  ELECTION_83B: '83(b)',
  ANNUAL_REVIEW: 'Annual review',
  CUSTOM: 'Custom',
  ISO_EXERCISE: 'ISO exercise',
  DEPARTURE: 'Departure',
};

function isPastDue(dueDate: string): boolean {
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function isPending(status: string): boolean {
  return status === 'PENDING' || status === 'SNOOZED';
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

/* ------------------------------------------------------------------ */
/*  Calendar helpers                                                   */
/* ------------------------------------------------------------------ */
function getCalendarGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const cells: { day: number; inMonth: boolean; dateStr: string }[] = [];

  // Pad start
  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: 0, inMonth: false, dateStr: '' });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, inMonth: true, dateStr });
  }

  return cells;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function ActionCentrePage() {
  const { showToast } = useToast();

  // Data
  const [reminders, setReminders] = useState<ActionReminder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [view, setView] = useState('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailAction, setDetailAction] = useState<ActionReminder | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  /* ---- Fetch ---- */
  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  /* ---- Mutations ---- */
  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        fetchActions();
        showToast({ title: 'Updated', message: `Action marked as ${status.toLowerCase()}.`, type: 'success' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not update action.', type: 'error' });
    }
  };

  const snoozeAction = async (id: string, days: number) => {
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + days);

    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SNOOZED',
          snoozedUntil: snoozeDate.toISOString(),
          notes: `Snoozed for ${days} days`,
        }),
      });
      if (res.ok) {
        fetchActions();
        setSnoozeTarget(null);
        showToast({ title: 'Snoozed', message: `Reminder snoozed for ${days} days.`, type: 'info' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not snooze action.', type: 'error' });
    }
  };

  const bulkUpdate = async (status: string) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    for (const id of ids) {
      await fetch(`/api/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }

    setSelectedIds(new Set());
    fetchActions();
    showToast({ title: 'Bulk update', message: `${ids.length} actions marked as ${status.toLowerCase()}.`, type: 'success' });
  };

  const deleteAction = async (id: string) => {
    try {
      const res = await fetch(`/api/actions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchActions();
        setDetailAction(null);
        showToast({ title: 'Deleted', message: 'Action removed.', type: 'info' });
      }
    } catch {
      showToast({ title: 'Error', message: 'Could not delete action.', type: 'error' });
    }
  };

  /* ---- Filtering ---- */
  const filtered = useMemo(() => {
    let list = [...reminders];

    if (statusFilter === 'pending') {
      list = list.filter((r) => isPending(r.status));
    } else if (statusFilter === 'completed') {
      list = list.filter((r) => !isPending(r.status));
    }

    if (urgencyFilter !== 'ALL') {
      list = list.filter((r) => r.urgency === urgencyFilter);
    }

    if (typeFilter !== 'ALL') {
      list = list.filter((r) => r.type === typeFilter);
    }

    return list;
  }, [reminders, statusFilter, urgencyFilter, typeFilter]);

  const pendingCount = reminders.filter((r) => isPending(r.status)).length;
  const completedCount = reminders.filter((r) => !isPending(r.status)).length;
  const overdueCount = reminders.filter((r) => isPending(r.status) && r.dueDate && isPastDue(r.dueDate)).length;

  /* ---- Toggle selection ---- */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((r) => r.id)));
    }
  };

  /* ---- Export ---- */
  const exportCsv = () => {
    const header = ['Title', 'Type', 'Urgency', 'Status', 'Due date', 'Company', 'Grant', 'Description'];
    const rows = filtered.map((r) => [
      csvEscape(r.title),
      csvEscape(TYPE_LABELS[r.type] || r.type),
      csvEscape(r.urgency),
      csvEscape(r.status),
      r.dueDate ? date(r.dueDate) : '',
      csvEscape(r.grant?.company?.name || ''),
      csvEscape(r.grant?.grantIdentifier || ''),
      csvEscape(r.description || ''),
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vestly-actions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportIcs = () => {
    const events = filtered
      .filter((r) => r.dueDate)
      .map((r) => ({
        uid: r.id,
        title: r.title,
        description: r.description,
        dueDate: r.dueDate,
        urgency: r.urgency,
      }));
    downloadIcs(events);
    showToast({ title: 'Exported', message: `${events.length} events saved to .ics file.`, type: 'success' });
  };

  /* ---- Calendar data ---- */
  const calendarActionMap = useMemo(() => {
    const map: Record<string, ActionReminder[]> = {};
    for (const r of reminders) {
      if (!r.dueDate) continue;
      const d = new Date(r.dueDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(r);
    }
    return map;
  }, [reminders]);

  /* ---- Timeline groups ---- */
  const timelineGroups = useMemo(() => {
    const groups: { label: string; items: ActionReminder[] }[] = [];
    const overdue: ActionReminder[] = [];
    const thisWeek: ActionReminder[] = [];
    const thisMonth: ActionReminder[] = [];
    const later: ActionReminder[] = [];
    const completed: ActionReminder[] = [];

    const today = new Date(new Date().toDateString());
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    for (const r of reminders) {
      if (!isPending(r.status)) {
        completed.push(r);
        continue;
      }
      if (!r.dueDate) {
        later.push(r);
        continue;
      }
      const due = new Date(r.dueDate);
      if (due < today) overdue.push(r);
      else if (due <= weekEnd) thisWeek.push(r);
      else if (due <= monthEnd) thisMonth.push(r);
      else later.push(r);
    }

    if (overdue.length) groups.push({ label: 'Overdue', items: overdue });
    if (thisWeek.length) groups.push({ label: 'This week', items: thisWeek });
    if (thisMonth.length) groups.push({ label: 'This month', items: thisMonth });
    if (later.length) groups.push({ label: 'Later', items: later });
    if (completed.length) groups.push({ label: 'Completed', items: completed });

    return groups;
  }, [reminders]);

  /* ---- Context sentence ---- */
  const contextSentence = pendingCount === 0
    ? 'No pending actions. You are up to date.'
    : `${pendingCount} pending action${pendingCount !== 1 ? 's' : ''}${overdueCount > 0 ? `, ${overdueCount} overdue` : ''}.`;

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        eyebrow="Manage"
        title="Actions"
        contextSentence={contextSentence}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={exportIcs}>
              Export .ics
            </Button>
            <Button variant="ghost" size="sm" onClick={exportCsv}>
              Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              + New action
            </Button>
          </div>
        }
      />

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <Callout variant="warn">
          {overdueCount} action{overdueCount !== 1 ? 's are' : ' is'} past due. Review and resolve overdue items to keep your equity plan on track.
        </Callout>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <select
          aria-label="Filter by action status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending ({pendingCount})</option>
          <option value="completed">Completed ({completedCount})</option>
        </select>

        <select
          aria-label="Filter by urgency"
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="ALL">All urgencies</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select
          aria-label="Filter by action type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-rule rounded-sm bg-surface text-ink text-xs focus:ring-1 focus:ring-accent focus:outline-none"
        >
          <option value="ALL">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-muted">{selectedIds.size} selected</span>
            <Button variant="primary" size="sm" onClick={() => bulkUpdate('COMPLETED')}>
              Complete selected
            </Button>
            <Button variant="ghost" size="sm" onClick={() => bulkUpdate('SNOOZED')}>
              Snooze selected
            </Button>
          </div>
        )}
      </div>

      {/* View tabs */}
      <Tabs
        tabs={[
          { id: 'list', label: 'List', badge: filtered.length },
          { id: 'calendar', label: 'Calendar' },
          { id: 'timeline', label: 'Timeline' },
          { id: 'history', label: 'Audit log', badge: auditLogs.length },
        ]}
        activeTab={view}
        onChange={setView}
        size="sm"
      />

      {/* ---- List view ---- */}
      {view === 'list' && (
        <div className="border border-rule rounded-sm overflow-hidden">
          {filtered.length === 0 ? (
            <EmptyState
              title="No actions found"
              description={statusFilter === 'pending' ? 'All milestones are up to date.' : 'No completed actions recorded yet.'}
            />
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-sunk border-b border-rule">
                <tr>
                  <th className="p-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded-sm"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="p-2.5 font-semibold text-muted">Action</th>
                  <th className="p-2.5 font-semibold text-muted">Type</th>
                  <th className="p-2.5 font-semibold text-muted">Urgency</th>
                  <th className="p-2.5 font-semibold text-muted">Status</th>
                  <th className="p-2.5 font-semibold text-muted">Due date</th>
                  <th className="p-2.5 font-semibold text-muted">Grant</th>
                  <th className="p-2.5 font-semibold text-muted w-36"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule">
                {filtered.map((r) => {
                  const overdue = r.dueDate && isPending(r.status) && isPastDue(r.dueDate);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-sunk/50 transition-colors ${overdue ? 'bg-loss/5' : ''}`}
                    >
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="rounded-sm"
                          aria-label={`Select ${r.title}`}
                        />
                      </td>
                      <td className="p-2.5">
                        <button
                          onClick={() => setDetailAction(r)}
                          className="font-medium text-ink hover:text-accent transition-colors text-left"
                        >
                          {r.title}
                        </button>
                        {r.description && (
                          <div className="text-muted truncate max-w-xs mt-0.5">{r.description}</div>
                        )}
                      </td>
                      <td className="p-2.5">
                        <span className="text-muted">{TYPE_LABELS[r.type] || r.type}</span>
                      </td>
                      <td className="p-2.5">
                        <Badge tone={URGENCY_TONE[r.urgency] || 'neutral'} dot>
                          {r.urgency.charAt(0) + r.urgency.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-2.5">
                        <Badge tone={STATUS_TONE[r.status] || 'neutral'}>
                          {r.status === 'SNOOZED' ? 'Snoozed' : r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-mono tabular-nums whitespace-nowrap">
                        {r.dueDate ? (
                          <span className={overdue ? 'text-loss font-semibold' : 'text-ink'}>
                            {date(r.dueDate)}
                            <span className="text-muted ml-1">({relativeDays(r.dueDate)})</span>
                          </span>
                        ) : (
                          <span className="text-muted">No date</span>
                        )}
                      </td>
                      <td className="p-2.5 text-muted">
                        {r.grant ? `${r.grant.company.name} (${r.grant.grantIdentifier})` : '—'}
                      </td>
                      <td className="p-2.5">
                        {isPending(r.status) && (
                          <div className="flex items-center gap-1">
                            <Button variant="primary" size="sm" onClick={() => updateStatus(r.id, 'COMPLETED')}>
                              Complete
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setSnoozeTarget(r.id)}>
                              Snooze
                            </Button>
                          </div>
                        )}
                        {!isPending(r.status) && (
                          <Button variant="ghost" size="sm" onClick={() => updateStatus(r.id, 'PENDING')}>
                            Reopen
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ---- Calendar view ---- */}
      {view === 'calendar' && (
        <div className="border border-rule rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
                else setCalMonth(calMonth - 1);
              }}
            >
              Previous
            </Button>
            <h3 className="font-serif text-sm font-medium text-ink">
              {MONTH_NAMES[calMonth]} {calYear}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
                else setCalMonth(calMonth + 1);
              }}
            >
              Next
            </Button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-muted border-b border-rule pb-1 mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {getCalendarGrid(calYear, calMonth).map((cell, i) => {
              const actions = cell.dateStr ? calendarActionMap[cell.dateStr] || [] : [];
              const isToday =
                cell.inMonth &&
                cell.day === now.getDate() &&
                calMonth === now.getMonth() &&
                calYear === now.getFullYear();

              return (
                <div
                  key={i}
                  className={`min-h-[72px] p-1 border border-rule/40 text-xs ${
                    cell.inMonth ? 'bg-surface' : 'bg-sunk/30'
                  } ${isToday ? 'ring-1 ring-accent' : ''}`}
                >
                  {cell.inMonth && (
                    <>
                      <div className={`text-[10px] font-mono mb-0.5 ${isToday ? 'font-bold text-accent' : 'text-muted'}`}>
                        {cell.day}
                      </div>
                      {actions.slice(0, 3).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setDetailAction(a)}
                          className={`block w-full text-left truncate text-[10px] px-1 py-0.5 rounded-sm mb-0.5 transition-colors ${
                            isPending(a.status) && isPastDue(a.dueDate)
                              ? 'bg-loss/10 text-loss hover:bg-loss/20'
                              : isPending(a.status)
                                ? 'bg-accent/10 text-accent hover:bg-accent/20'
                                : 'bg-gain/10 text-gain line-through'
                          }`}
                        >
                          {a.title}
                        </button>
                      ))}
                      {actions.length > 3 && (
                        <span className="text-[9px] text-muted">+{actions.length - 3} more</span>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---- Timeline view ---- */}
      {view === 'timeline' && (
        <div className="space-y-6">
          {timelineGroups.length === 0 ? (
            <EmptyState title="No actions" description="Create an action to get started." />
          ) : (
            timelineGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 flex items-center gap-2">
                  {group.label}
                  {group.label === 'Overdue' && (
                    <Badge tone="loss" dot>{group.items.length}</Badge>
                  )}
                </h3>
                <div className="border-l-2 border-rule ml-2 pl-4 space-y-3">
                  {group.items.map((r) => (
                    <div key={r.id} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-rule border-2 border-surface" />
                      <div className="border border-rule rounded-sm p-3 hover:bg-sunk/30 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <button
                              onClick={() => setDetailAction(r)}
                              className="font-medium text-ink hover:text-accent text-xs text-left"
                            >
                              {r.title}
                            </button>
                            {r.description && (
                              <p className="text-muted text-[11px] mt-0.5">{r.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge tone={URGENCY_TONE[r.urgency] || 'neutral'} dot>
                                {r.urgency.charAt(0) + r.urgency.slice(1).toLowerCase()}
                              </Badge>
                              {r.dueDate && (
                                <span className="text-[11px] text-muted font-mono tabular-nums">
                                  {date(r.dueDate)} ({relativeDays(r.dueDate)})
                                </span>
                              )}
                              {r.grant && (
                                <span className="text-[11px] text-muted">
                                  {r.grant.company.name}
                                </span>
                              )}
                            </div>
                          </div>
                          {isPending(r.status) && (
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="primary" size="sm" onClick={() => updateStatus(r.id, 'COMPLETED')}>
                                Complete
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setSnoozeTarget(r.id)}>
                                Snooze
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- Audit log view ---- */}
      {view === 'history' && (
        <div className="border border-rule rounded-sm overflow-hidden">
          {auditLogs.length === 0 ? (
            <EmptyState title="No activity" description="Activity will appear here as you manage your actions." />
          ) : (
            <div className="divide-y divide-rule text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 flex items-start justify-between gap-4 hover:bg-sunk/30">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[11px] font-semibold text-ink block">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <p className="text-muted">{log.details}</p>
                    {log.grant && (
                      <span className="text-[11px] text-muted">
                        {log.grant.company.name} ({log.grant.grantIdentifier})
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted shrink-0 font-mono tabular-nums">
                    {date(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Detail side panel (Dialog) ---- */}
      <Dialog
        open={Boolean(detailAction)}
        onClose={() => setDetailAction(null)}
        title={detailAction?.title || ''}
        maxWidth="lg"
      >
        {detailAction && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge tone={URGENCY_TONE[detailAction.urgency] || 'neutral'} dot>
                {detailAction.urgency}
              </Badge>
              <Badge tone={STATUS_TONE[detailAction.status] || 'neutral'}>
                {detailAction.status}
              </Badge>
              <span className="text-muted">{TYPE_LABELS[detailAction.type] || detailAction.type}</span>
            </div>

            {detailAction.description && (
              <p className="text-muted leading-relaxed">{detailAction.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs border border-rule rounded-sm p-3">
              <div>
                <span className="text-muted block">Due date</span>
                <span className="font-mono tabular-nums text-ink">
                  {detailAction.dueDate ? `${date(detailAction.dueDate)} (${relativeDays(detailAction.dueDate)})` : 'No date'}
                </span>
              </div>
              <div>
                <span className="text-muted block">Grant</span>
                <span className="text-ink">
                  {detailAction.grant ? `${detailAction.grant.company.name} (${detailAction.grant.grantIdentifier})` : 'None'}
                </span>
              </div>
              <div>
                <span className="text-muted block">Created</span>
                <span className="font-mono tabular-nums text-ink">{date(detailAction.createdAt)}</span>
              </div>
              {detailAction.snoozedUntil && (
                <div>
                  <span className="text-muted block">Snoozed until</span>
                  <span className="font-mono tabular-nums text-ink">{date(detailAction.snoozedUntil)}</span>
                </div>
              )}
            </div>

            {/* Action checklist */}
            {detailAction.type === 'ELECTION_83B' && (
              <div className="border border-rule rounded-sm p-3 space-y-2">
                <h4 className="font-semibold text-ink">83(b) election checklist</h4>
                <ul className="space-y-1 text-muted">
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Complete IRS 83(b) election form</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Send to IRS within 30 days of exercise</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> File copy with tax return</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Retain proof of mailing</li>
                </ul>
              </div>
            )}

            {detailAction.type === 'PTEW_EXPIRATION' && (
              <Callout variant="warn">
                Post-termination exercise window deadlines are firm. Unexercised vested options expire permanently after this date.
              </Callout>
            )}

            {detailAction.type === 'VESTING_EVENT' && (
              <div className="border border-rule rounded-sm p-3 space-y-2">
                <h4 className="font-semibold text-ink">Vesting event checklist</h4>
                <ul className="space-y-1 text-muted">
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Review vested shares and current FMV</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Decide whether to exercise now or wait</li>
                  <li className="flex items-center gap-2"><span className="w-3 h-3 border border-rule rounded-sm inline-block" /> Consider tax implications (AMT for ISO)</li>
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-rule">
              {isPending(detailAction.status) && (
                <>
                  <Button variant="primary" size="sm" onClick={() => { updateStatus(detailAction.id, 'COMPLETED'); setDetailAction(null); }}>
                    Complete
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => { setSnoozeTarget(detailAction.id); }}>
                    Snooze
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { updateStatus(detailAction.id, 'DECLINED'); setDetailAction(null); }}>
                    Dismiss
                  </Button>
                </>
              )}
              {!isPending(detailAction.status) && (
                <Button variant="secondary" size="sm" onClick={() => { updateStatus(detailAction.id, 'PENDING'); setDetailAction(null); }}>
                  Reopen
                </Button>
              )}
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={() => deleteAction(detailAction.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ---- Snooze preset picker ---- */}
      <Dialog
        open={Boolean(snoozeTarget)}
        onClose={() => setSnoozeTarget(null)}
        title="Snooze action"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted">Choose how long to snooze this action.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SNOOZE_PRESETS.map((preset) => (
              <Button
                key={preset.days}
                variant="secondary"
                size="sm"
                onClick={() => snoozeTarget && snoozeAction(snoozeTarget, preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </Dialog>

      {/* ---- Create task modal ---- */}
      <CreateTaskModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchActions}
      />
    </div>
  );
}
