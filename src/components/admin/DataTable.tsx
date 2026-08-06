'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  /** Cell renderer. Defaults to the raw value at `key`. */
  render?: (row: T) => ReactNode;
  /** Hidden below `sm` — use for secondary detail on narrow screens. */
  hideOnMobile?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  empty?: ReactNode;
  /** Omit to render without pagination. */
  page?: number;
  totalPages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Table for the admin lists. Renders as a real table on desktop and as stacked
 * cards below `sm`, because a horizontally scrolling table is unusable on a
 * phone and the panel is required to be mobile responsive.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  empty,
  page,
  totalPages,
  total,
  onPageChange,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white border border-line rounded-[16px] flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-line rounded-[16px] py-16 px-6 text-center">
        {empty ?? <p className="text-[14px] text-ink-muted">Nothing to show yet.</p>}
      </div>
    );
  }

  const cell = (row: T, column: Column<T>): ReactNode =>
    column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '');

  return (
    <div className="bg-white border border-line rounded-[16px] overflow-hidden">
      {/* Desktop */}
      <div className="hidden sm:block overflow-x-auto scroll-slim">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-3 text-[11.5px] font-bold uppercase tracking-[0.08em] text-ink-faint whitespace-nowrap ${c.className ?? ''}`}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-canvas transition-colors">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`px-4 py-3.5 text-[13.5px] text-ink-soft align-middle ${c.className ?? ''}`}
                  >
                    {cell(row, c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="sm:hidden divide-y divide-line-soft">
        {rows.map((row) => (
          <li key={rowKey(row)} className="px-4 py-4 space-y-2">
            {columns
              .filter((c) => !c.hideOnMobile)
              .map((c) => (
                <div key={c.key} className="flex items-start justify-between gap-3">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint shrink-0 pt-0.5">
                    {c.header}
                  </span>
                  <span className="text-[13.5px] text-ink-soft text-right min-w-0">
                    {cell(row, c)}
                  </span>
                </div>
              ))}
          </li>
        ))}
      </ul>

      {page !== undefined && totalPages !== undefined && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-line-soft bg-canvas">
          <p className="text-[12.5px] text-ink-muted">
            Page {page} of {totalPages}
            {total !== undefined && ` · ${total} total`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-[10px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="p-2 rounded-[10px] border border-line bg-white text-ink-muted hover:text-brand-700 hover:border-brand-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
