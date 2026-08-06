'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

/* ------------------------------------------------------------------ *
 * Small building blocks shared by every admin screen. Kept in one file
 * because each is a handful of lines and they are always imported together.
 * ------------------------------------------------------------------ */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[24px] sm:text-[26px] font-extrabold text-ink tracking-[-0.035em]">
          {title}
        </h1>
        {subtitle && <p className="text-ink-muted text-[14px] mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone = 'brand',
}: {
  label: string;
  value: number | string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  tone?: 'brand' | 'positive' | 'caution' | 'critical' | 'neutral';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 border-brand-100 text-brand-600',
    positive: 'bg-positive-soft border-[#BEE7D8] text-[#0A7A54]',
    caution: 'bg-caution-soft border-[#F3DBB4] text-[#9A5D00]',
    critical: 'bg-critical-soft border-[#F3C9C9] text-[#B32B2B]',
    neutral: 'bg-canvas border-line text-ink-soft',
  };

  const body = (
    <>
      {Icon && (
        <div
          className={`w-10 h-10 border rounded-[12px] flex items-center justify-center mb-3.5 ${tones[tone]}`}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={2.1} />
        </div>
      )}
      <div className="text-[26px] font-extrabold text-ink tracking-[-0.035em] leading-none">
        {value}
      </div>
      <div className="text-[11.5px] font-semibold text-ink-faint uppercase tracking-[0.09em] mt-2.5">
        {label}
      </div>
    </>
  );

  const className = 'bg-white border border-line rounded-[16px] p-5';

  return href ? (
    <Link href={href} className={`${className} block hover:border-brand-200 transition-colors`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-faint pointer-events-none" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onSubmit) onSubmit();
        }}
        placeholder={placeholder}
        className="w-full h-[42px] bg-white border border-line rounded-[12px] pl-10 pr-9 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  'aria-label': ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  'aria-label'?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="h-[42px] bg-white border border-line rounded-[12px] px-3.5 text-[13.5px] text-ink outline-none focus:border-brand-600 transition-colors min-w-0"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col sm:flex-row flex-wrap gap-3">{children}</div>;
}

const PILL_TONES: Record<string, string> = {
  brand: 'bg-brand-50 text-brand-700 border-brand-100',
  positive: 'bg-positive-soft text-[#0A7A54] border-[#BEE7D8]',
  caution: 'bg-caution-soft text-[#9A5D00] border-[#F3DBB4]',
  critical: 'bg-critical-soft text-[#B32B2B] border-[#F3C9C9]',
  neutral: 'bg-canvas text-ink-muted border-line',
};

export type PillTone = keyof typeof PILL_TONES;

export function StatusPill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center text-[10px] font-bold uppercase tracking-[0.08em] border rounded-full px-2.5 py-1 ${PILL_TONES[tone]}`}
    >
      {label}
    </span>
  );
}

export function ActionButton({
  onClick,
  children,
  tone = 'neutral',
  disabled,
  type = 'button',
}: {
  onClick?: () => void;
  children: ReactNode;
  tone?: 'neutral' | 'primary' | 'critical';
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  const tones = {
    neutral:
      'bg-white border-line text-ink-soft hover:text-brand-700 hover:border-brand-200',
    primary: 'grad-brand border-transparent text-white shadow-brand hover:-translate-y-0.5',
    critical:
      'bg-white border-line text-ink-soft hover:text-[#B32B2B] hover:border-[#F3C9C9] hover:bg-critical-soft',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`press inline-flex items-center justify-center gap-1.5 border rounded-[11px] px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 disabled:opacity-50 disabled:translate-y-0 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body?: string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-[18px] bg-canvas border border-line-soft flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-ink-faint" />
      </div>
      <h3 className="text-[15.5px] font-bold text-ink tracking-[-0.02em] mb-1.5">{title}</h3>
      {body && <p className="text-ink-muted text-[13.5px]">{body}</p>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-line rounded-[16px] ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line-soft">
          <h2 className="text-[15px] font-bold text-ink tracking-[-0.02em]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Labelled({
  label,
  hint,
  error,
  children,
  className = '',
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[13px] font-semibold text-ink-soft mb-1.5">{label}</span>
      {children}
      {hint && !error && <span className="block text-[12px] text-ink-faint mt-1.5">{hint}</span>}
      {error && (
        <span className="block text-[12px] font-medium text-critical mt-1.5" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

export const ADMIN_INPUT =
  'w-full h-[42px] bg-white border border-line rounded-[12px] px-3.5 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all';

export const ADMIN_TEXTAREA =
  'w-full bg-white border border-line rounded-[12px] px-3.5 py-2.5 text-[13.5px] text-ink placeholder-ink-faint outline-none focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)] transition-all leading-[1.65] resize-y scroll-slim';
