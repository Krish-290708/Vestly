'use client';

import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTaskModalProps) {
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    urgency: 'MEDIUM',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create task');
      }

      setTaskForm({
        title: '',
        description: '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgency: 'MEDIUM',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full border border-slate-800 shadow-2xl p-6 space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Create Action Item</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-lg">
            {error}
          </div>
        )}

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
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

