'use client';

import React, { useState } from 'react';
import { Dialog, Field, Button } from '@/components/ui';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTaskModal({
  open,
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
    <Dialog open={open} onClose={onClose} title="Create action item">
      {error && (
        <div className="p-2.5 bg-loss/10 border border-loss/30 text-loss text-xs rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
        <Field label="Title">
          <input
            type="text"
            required
            placeholder="e.g. Discuss 83(b) with tax advisor"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            className="w-full px-3 py-2 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </Field>

        <Field label="Due date">
          <input
            type="date"
            required
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            className="w-full px-3 py-2 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </Field>

        <Field label="Urgency">
          <select
            value={taskForm.urgency}
            onChange={(e) => setTaskForm({ ...taskForm, urgency: e.target.value })}
            className="w-full px-3 py-2 border border-rule rounded-sm text-xs bg-surface text-ink focus:ring-1 focus:ring-accent focus:outline-none"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            rows={2}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
            className="w-full px-3 py-2 bg-surface text-ink border border-rule rounded-sm text-xs focus:ring-1 focus:ring-accent focus:outline-none"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-3 border-t border-rule">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading ? 'Saving...' : 'Save action'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
