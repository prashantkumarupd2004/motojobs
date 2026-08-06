'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

/**
 * Right-hand detail panel. The admin lists open records here rather than
 * navigating away, so a filtered list is not lost on every inspection.
 */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0B1220]/35 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[520px] h-full bg-white border-l border-line flex flex-col shadow-e4"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 px-5 sm:px-6 py-4 border-b border-line-soft shrink-0">
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold text-ink tracking-[-0.02em] truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12.5px] text-ink-muted truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-faint hover:text-ink hover:bg-canvas rounded-[10px] p-2 -mr-2 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scroll-slim px-5 sm:px-6 py-5">{children}</div>

        {footer && (
          <footer className="px-5 sm:px-6 py-4 border-t border-line-soft bg-canvas/60 shrink-0">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Label/value row for the detail panels. */
export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-line-soft last:border-0">
      <span className="text-[12.5px] font-semibold text-ink-faint shrink-0">{label}</span>
      <span className="text-[13.5px] text-ink-soft text-right min-w-0 break-words">
        {children || <span className="text-ink-faint">—</span>}
      </span>
    </div>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="text-[11.5px] font-bold uppercase tracking-[0.09em] text-ink-faint mb-2">
        {title}
      </h3>
      {children}
    </section>
  );
}
