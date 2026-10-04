'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  History, 
  Bell, 
  XCircle, 
  ChevronRight,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function ActionCenterPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any>({
    emailAlerts: true,
    inAppAlerts: true,
    advanceReminderDays: 14,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'history'>('pending');

  // Manual Task Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'MEDIUM',
  });

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
        setAuditLogs(data.auditLogs || []);
        if (data.preferences) setPreferences(data.preferences);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) fetchActions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnooze = async (id: string) => {
    const days = 14;
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
      if (res.ok) fetchActions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setTaskForm({
          title: '',
          description: '',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          urgency: 'MEDIUM',
        });
        fetchActions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      if (res.ok) {
        setShowSettingsModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  const pendingList = reminders.filter(r => r.status === 'PENDING' || r.status === 'SNOOZED');
  const completedList = reminders.filter(r => r.status !== 'PENDING' && r.status !== 'SNOOZED');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-emerald-400" />
            Equity Action Center & Deadlines
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated milestone alerts, post-termination exercise windows (PTEW), and IRS 83(b) filing timers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors shrink-0"
          >
            <Bell className="w-4 h-4 text-emerald-400" />
            <span>Alert Preferences</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Custom Task</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>Pending Actions</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-950/60 border border-slate-700/50">
            {pendingList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <span>Resolved / Completed</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300">
            {completedList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Log History</span>
        </button>
      </div>

      {/* Tab Content 1: Pending Actions */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingList.length > 0 ? (
            pendingList.map(task => {
              const isUrgent = task.urgency === 'CRITICAL' || task.urgency === 'HIGH';
              const dueDate = new Date(task.dueDate);
              const isPastDue = dueDate < new Date();

              return (
                <div 
                  key={task.id}
                  className={`bg-slate-900/90 rounded-2xl border p-5 sm:p-6 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isUrgent ? 'border-amber-500/50 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                        task.urgency === 'CRITICAL' 
                          ? 'bg-rose-950/80 text-rose-300 border-rose-800/50' 
                          : task.urgency === 'HIGH' 
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800/50' 
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {task.urgency} Priority
                      </span>

                      {task.grant?.company && (
                        <span className="text-xs font-semibold text-slate-300">
                          {task.grant.company.name} ({task.grant.grantIdentifier})
                        </span>
                      )}

                      {task.status === 'SNOOZED' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                          Snoozed
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white">{task.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{task.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className={`flex items-center gap-1 font-semibold ${isPastDue ? 'text-rose-400' : 'text-slate-400'}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'EXERCISED', 'Exercised vested shares')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs transition-colors"
                    >
                      Mark Exercised
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'COMPLETED', 'Milestone completed')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleSnooze(task.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      Snooze 14d
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'DECLINED', 'User declined milestone')}
                      className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 transition-colors"
                      title="Decline / Dismiss"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-10 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">All milestones up to date</h3>
              <p className="text-xs text-slate-400">You have no pending deadlines or vesting tasks.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Completed / Resolved Actions */}
      {activeTab === 'completed' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="divide-y divide-slate-800">
            {completedList.map(task => (
              <div key={task.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{task.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Status: <span className="font-semibold text-emerald-400">{task.status}</span> • Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateStatus(task.id, 'PENDING', 'Re-opened task')}
                  className="text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Reopen
                </button>
              </div>
            ))}
            {completedList.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No completed actions recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: Audit Log History */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider">
            Audit Trail History
          </div>
          <div className="divide-y divide-slate-800 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-mono text-[11px] font-bold text-white block">
                    {log.action}
                  </span>
                  <p className="text-slate-400">{log.details}</p>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
            {auditLogs.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No activity recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl p-6 space-y-4 text-white">
            <h3 className="text-base font-bold text-white">Create Action Item</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Discuss 83(b) with tax advisor"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Urgency</label>
                <select
                  value={taskForm.urgency}
                  onChange={(e) => setTaskForm({ ...taskForm, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg text-xs bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical (Immediate action)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 text-white border border-slate-700 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alert Preferences Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Alert Preferences</h3>
                  <p className="text-xs text-slate-400">Configure reminder triggers and delivery channels</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-semibold text-white block">Email Milestone Alerts</span>
                    <span className="text-[11px] text-slate-400 block">
                      Receive email digests when vesting events, PTEW windows, or 83(b) deadlines are within your lead time window.
                    </span>
                  </div>
                </label>

                <div className="border-t border-slate-800/80 pt-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.inAppAlerts}
                      onChange={(e) => setPreferences({ ...preferences, inAppAlerts: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="font-semibold text-white block">In-App Dashboard Alerts</span>
                      <span className="text-[11px] text-slate-400 block">
                        Display persistent urgency badges and banner notifications in your portfolio dashboard.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Advance Reminder Window
                </label>
                <select
                  value={preferences.advanceReminderDays}
                  onChange={(e) => setPreferences({ ...preferences, advanceReminderDays: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 border border-slate-700 rounded-lg text-xs bg-slate-950 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={7}>7 Days Before Deadline</option>
                  <option value={14}>14 Days Before Deadline (Recommended)</option>
                  <option value={30}>30 Days Before Deadline</option>
                  <option value={60}>60 Days Before Deadline</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Lead time used to surface tasks in your pending actions list.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

