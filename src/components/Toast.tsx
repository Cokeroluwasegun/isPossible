'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
let listeners: ((toasts: Toast[]) => void) | null = null;
let currentToasts: Toast[] = [];

function notify() {
  if (listeners) {
    listeners(currentToasts);
  }
}

export const toast = {
  success(message: string) {
    currentToasts.push({ id: ++toastId, message, type: 'success' });
    notify();
  },
  error(message: string) {
    currentToasts.push({ id: ++toastId, message, type: 'error' });
    notify();
  },
  info(message: string) {
    currentToasts.push({ id: ++toastId, message, type: 'info' });
    notify();
  },
  dismiss(id: number) {
    currentToasts = currentToasts.filter(t => t.id !== id);
    notify();
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners = setToasts;
    return () => {
      listeners = null;
    };
  }, []);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      toast.dismiss(toasts[0].id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(t => {
        const Icon = t.type === 'success' ? CheckCircle : t.type === 'error' ? XCircle : AlertCircle;
        const colors = t.type === 'success' 
          ? 'bg-green-50 border-green-200 text-green-800'
          : t.type === 'error'
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-blue-50 border-blue-200 text-blue-800';
        const iconColors = t.type === 'success' 
          ? 'text-green-600'
          : t.type === 'error'
          ? 'text-red-600'
          : 'text-blue-600';
        
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-md ${colors}`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${iconColors}`} />
            <span className="flex-1 font-medium text-sm">{t.message}</span>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
