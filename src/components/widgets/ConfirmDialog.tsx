'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, variant = 'default' }: ConfirmDialogProps) {
  if (!open) return null;
  const btnStyle = variant === 'danger'
    ? { background: 'rgba(248,113,113,0.2)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }
    : {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="glass-panel p-6 max-w-md w-full mx-4 widget-enter" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg" style={{ color: 'var(--gold)' }}>{title}</h3>
          <button onClick={onCancel} className="opacity-50 hover:opacity-100"><X size={16} /></button>
        </div>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="glass-button-outline px-4 py-2 text-sm">Cancel</button>
          <button onClick={onConfirm} className="glass-button px-4 py-2 text-sm" style={btnStyle}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="glass-panel p-6 max-w-lg w-full mx-4 widget-enter max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg" style={{ color: 'var(--gold)' }}>{title}</h3>
          <button onClick={onClose} className="opacity-50 hover:opacity-100"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
