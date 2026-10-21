'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'info' | 'success' | 'warn' | 'error';

export interface ToastItem {
  id: string;
  title?: string;
  message: React.ReactNode;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  toast: {
    info: (message: React.ReactNode, title?: string) => string;
    success: (message: React.ReactNode, title?: string) => string;
    warn: (message: React.ReactNode, title?: string) => string;
    error: (message: React.ReactNode, title?: string) => string;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const typeLeftBorders: Record<ToastType, string> = {
  info: 'border-l-info',
  success: 'border-l-gain',
  warn: 'border-l-warn',
  error: 'border-l-loss',
};

const typeDotColors: Record<ToastType, string> = {
  info: 'bg-info',
  success: 'bg-gain',
  warn: 'bg-warn',
  error: 'bg-loss',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, title, type = 'info', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: ToastItem = { id, message, title, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
  );

  const toast = React.useMemo(
    () => ({
      info: (message: React.ReactNode, title?: string) =>
        showToast({ message, title, type: 'info' }),
      success: (message: React.ReactNode, title?: string) =>
        showToast({ message, title, type: 'success' }),
      warn: (message: React.ReactNode, title?: string) =>
        showToast({ message, title, type: 'warn' }),
      error: (message: React.ReactNode, title?: string) =>
        showToast({ message, title, type: 'error' }),
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, toast }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto w-full bg-surface text-ink border border-rule border-l-3 rounded-sm shadow-popover p-3.5 flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-2 duration-150 ${
              typeLeftBorders[t.type || 'info']
            }`}
          >
            <div className="space-y-0.5 flex-1">
              {t.title && (
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${typeDotColors[t.type || 'info']}`}
                  />
                  <span>{t.title}</span>
                </div>
              )}
              <div className="text-muted leading-relaxed">{t.message}</div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              aria-label="Dismiss notification"
              className="text-muted hover:text-ink p-0.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
