'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

let addToastFn: ((message: string, variant?: Toast['variant']) => void) | null = null;

export function toast(message: string, variant: Toast['variant'] = 'success') {
  addToastFn?.(message, variant);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: Toast['variant'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none" style={{ maxWidth: 360 }}>
        {toasts.map(t => (
          <div key={t.id} className="glass-panel px-4 py-3 flex items-center gap-3 toast-enter pointer-events-auto"
            style={{ borderColor: t.variant === 'error' ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)' }}>
            {t.variant === 'success' && <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />}
            {t.variant === 'error' && <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />}
            <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{t.message}</span>
            <button onClick={() => setToasts(prev => prev.filter(p => p.id !== t.id))}
              className="flex-shrink-0 opacity-50 hover:opacity-100">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
