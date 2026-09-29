import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const { addToast } = useToastStore();
  return {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
  };
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-error" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-info" />,
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm p-4 bg-surface border border-border rounded-lg shadow-elevated animate-slide-up',
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{icons[toast.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-text-primary">{toast.title}</p>
        {toast.message && <p className="text-caption text-text-secondary mt-0.5">{toast.message}</p>}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export { ToastContainer };
export default ToastContainer;
