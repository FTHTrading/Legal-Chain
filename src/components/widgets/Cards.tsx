import { ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
  className?: string;
}

export function SectionCard({ children, className = '' }: SectionCardProps) {
  return (
    <div className={`glass-panel p-6 ${className}`}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="glass-panel p-4 text-center">
      <div className="text-2xl font-serif" style={{ color: 'var(--gold)' }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      {sub && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>{sub}</div>}
    </div>
  );
}

interface StatusPillProps {
  status: string;
  variant?: 'gold' | 'green' | 'red' | 'blue' | 'amber';
}

const pillColors = {
  gold: { bg: 'rgba(201,168,76,0.15)', text: 'var(--gold)' },
  green: { bg: 'rgba(52,211,153,0.15)', text: '#34d399' },
  red: { bg: 'rgba(248,113,113,0.15)', text: '#f87171' },
  blue: { bg: 'rgba(96,165,250,0.15)', text: '#60a5fa' },
  amber: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
};

export function StatusPill({ status, variant = 'gold' }: StatusPillProps) {
  const colors = pillColors[variant];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
      style={{ background: colors.bg, color: colors.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.text }} />
      {status}
    </span>
  );
}

interface ActionPanelProps {
  children: ReactNode;
  className?: string;
}

export function ActionPanel({ children, className = '' }: ActionPanelProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-panel p-12 text-center">
      {icon && <div className="mb-4 flex justify-center opacity-40">{icon}</div>}
      <h3 className="text-lg font-serif" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      {description && <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass-panel p-8 text-center" style={{ borderColor: 'rgba(248,113,113,0.3)' }}>
      <div className="text-3xl mb-3">⚠</div>
      <h3 className="text-lg font-serif" style={{ color: '#f87171' }}>{title}</h3>
      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="glass-button-outline mt-4 px-4 py-2 text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}

interface ResultPanelProps {
  title: string;
  children: ReactNode;
  variant?: 'success' | 'info';
}

export function ResultPanel({ title, children, variant = 'success' }: ResultPanelProps) {
  const borderColor = variant === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(96,165,250,0.3)';
  const titleColor = variant === 'success' ? '#34d399' : '#60a5fa';
  return (
    <div className="glass-panel p-6" style={{ borderColor }}>
      <h3 className="text-sm font-medium tracking-wide mb-4" style={{ color: titleColor }}>{title}</h3>
      {children}
    </div>
  );
}
