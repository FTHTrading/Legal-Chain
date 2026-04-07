"use client";

import React, { forwardRef } from "react";

// ─── Button ────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const btnBase = "inline-flex items-center justify-center font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50";

const btnVariants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--gold)] text-[var(--midnight)] hover:bg-[var(--gold-light)] shadow-lg shadow-[var(--gold)]/20",
  secondary: "bg-[var(--navy-card)] text-[var(--text)] border border-[var(--gold)]/20 hover:border-[var(--gold)]/50 hover:bg-[var(--gold)]/10",
  danger: "bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30",
  ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/5",
  outline: "border border-[var(--gold)]/30 text-[var(--gold)] hover:bg-[var(--gold)]/10",
};

const btnSizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 rounded",
  md: "text-xs px-5 py-2.5 rounded-lg",
  lg: "text-sm px-8 py-3.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ─── Card ──────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const cardPadding = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, glow = false, padding = "md", className = "", children, ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-[var(--navy-card)] border border-[var(--gold)]/10 rounded-xl ${cardPadding[padding]} ${hover ? "hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-[var(--gold)]/5 transition-all duration-300 cursor-pointer" : ""} ${glow ? "shadow-lg shadow-[var(--gold)]/10" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

// ─── Badge ─────────────────────────────────────────────────────────────────

type BadgeColor = "gold" | "green" | "red" | "blue" | "yellow" | "purple" | "gray" | "cyan" | "orange";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

const badgeColors: Record<BadgeColor, string> = {
  gold: "bg-[var(--gold)]/20 text-[var(--gold)] border-[var(--gold)]/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const dotColors: Record<BadgeColor, string> = {
  gold: "bg-[var(--gold)]",
  green: "bg-emerald-400",
  red: "bg-red-400",
  blue: "bg-blue-400",
  yellow: "bg-yellow-400",
  purple: "bg-purple-400",
  gray: "bg-gray-400",
  cyan: "bg-cyan-400",
  orange: "bg-orange-400",
};

export function Badge({ children, color = "gold", dot, pulse, className = "" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-full ${badgeColors[color]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]} ${pulse ? "animate-pulse" : ""}`} />}
      {children}
    </span>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────

const statusColorMap: Record<string, BadgeColor> = {
  // Intake
  new: "blue", under_review: "yellow", accepted: "green", rejected: "red",
  pending_conflict_check: "orange", conflict_cleared: "green", needs_information: "yellow",
  scheduled: "cyan", archived: "gray",
  // Approval
  draft: "gray", in_review: "yellow", requires_source_check: "orange",
  requires_attorney_review: "purple", approved: "green", sent: "cyan", filed: "blue",
  // Task
  pending: "gray", in_progress: "blue", waiting_approval: "yellow",
  completed: "green", blocked: "red", cancelled: "gray", failed: "red", skipped: "gray",
  // Communication
  pending_review: "yellow", delivered: "cyan", read: "green",
  recalled: "orange", bounced: "red",
  // Risk
  critical: "red", high: "orange", medium: "yellow", low: "green",
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const color = statusColorMap[status] || "gray";
  const label = status.replace(/_/g, " ");
  return <Badge color={color} dot pulse={status === "critical" || status === "new" || status === "in_progress"} className={className}>{label}</Badge>;
}

// ─── Input ─────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-[var(--midnight)] border ${error ? "border-red-500/50" : "border-[var(--gold)]/20"} rounded-lg px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/20 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Textarea ──────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full bg-[var(--midnight)] border ${error ? "border-red-500/50" : "border-[var(--gold)]/20"} rounded-lg px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/20 transition-colors resize-y min-h-[100px] ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

// ─── Select ────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</label>}
      <select
        ref={ref}
        className={`w-full bg-[var(--midnight)] border ${error ? "border-red-500/50" : "border-[var(--gold)]/20"} rounded-lg px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)]/50 focus:ring-1 focus:ring-[var(--gold)]/20 transition-colors appearance-none cursor-pointer ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

// ─── Modal ─────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const modalSizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, children, actions, size = "md" }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[var(--navy)] border border-[var(--gold)]/20 rounded-2xl shadow-2xl shadow-black/50 w-full ${modalSizes[size]} max-h-[85vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-[var(--gold)]/10">
          <h2 className="text-lg font-bold text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {actions && <div className="flex justify-end gap-3 p-6 border-t border-[var(--gold)]/10">{actions}</div>}
      </div>
    </div>
  );
}

// ─── Toast Container ──────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: string;
  title: string;
  message: string;
}

const toastColors: Record<string, string> = {
  success: "border-emerald-500/50 bg-emerald-500/10",
  error: "border-red-500/50 bg-red-500/10",
  warning: "border-yellow-500/50 bg-yellow-500/10",
  info: "border-blue-500/50 bg-blue-500/10",
};

const toastIcons: Record<string, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

export function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={`border rounded-xl p-4 shadow-xl backdrop-blur-md animate-[fade-up_0.3s_ease-out] ${toastColors[t.type] || toastColors.info}`}>
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">{toastIcons[t.type] || "ℹ"}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{t.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────

export function StatCard({ label, value, icon, trend, color = "gold" }: { label: string; value: string | number; icon: string; trend?: string; color?: BadgeColor }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${badgeColors[color]}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
      </div>
      {trend && <span className="text-xs text-emerald-400 font-medium">{trend}</span>}
    </Card>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--gold)]" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
        {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────

interface FilterTabsProps {
  tabs: Array<{ label: string; value: string; count?: number }>;
  active: string;
  onChange: (value: string) => void;
}

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
            active === tab.value
              ? "bg-[var(--gold)] text-[var(--midnight)]"
              : "bg-[var(--navy-card)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--gold)]/10 hover:border-[var(--gold)]/30"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${active === tab.value ? "bg-[var(--midnight)]/20 text-[var(--midnight)]" : "bg-[var(--gold)]/10 text-[var(--gold)]"}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────

interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "primary" }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" actions={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant={variant === "danger" ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
      </>
    }>
      <p className="text-sm text-[var(--text-muted)]">{message}</p>
    </Modal>
  );
}

// ─── Priority Badge ──────────────────────────────────────────────────────

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, BadgeColor> = { critical: "red", high: "orange", medium: "yellow", low: "green", routine: "gray" };
  return <Badge color={colors[priority] || "gray"} dot>{priority}</Badge>;
}

// ─── Search Input ──────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[var(--midnight)] border border-[var(--gold)]/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:border-[var(--gold)]/50 transition-colors"
      />
    </div>
  );
}
