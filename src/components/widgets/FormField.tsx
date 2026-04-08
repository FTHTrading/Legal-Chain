'use client';

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium tracking-wide" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      {children}
      {error && <p className="text-xs" style={{ color: '#f87171' }}>{error}</p>}
    </div>
  );
}

export const GlassInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input ref={ref} {...props} className={`glass-input w-full px-3 py-2.5 text-sm ${props.className || ''}`} />
  )
);
GlassInput.displayName = 'GlassInput';

export const GlassSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  (props, ref) => (
    <select ref={ref} {...props} className={`glass-input w-full px-3 py-2.5 text-sm ${props.className || ''}`} />
  )
);
GlassSelect.displayName = 'GlassSelect';

export const GlassTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  (props, ref) => (
    <textarea ref={ref} {...props} className={`glass-input w-full px-3 py-2.5 text-sm resize-none ${props.className || ''}`} />
  )
);
GlassTextarea.displayName = 'GlassTextarea';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  loading?: boolean;
}

export function GlassButton({ variant = 'primary', loading, children, disabled, ...props }: GlassButtonProps) {
  const cls = variant === 'primary' ? 'glass-button' : 'glass-button-outline';
  return (
    <button {...props} disabled={disabled || loading} className={`${cls} px-5 py-2.5 text-sm font-medium ${props.className || ''}`}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : children}
    </button>
  );
}
