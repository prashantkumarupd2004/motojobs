'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface SearchableSelectProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  allowCustom?: boolean;
  id?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled,
  error,
  allowCustom = false,
  id,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const commit = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const picked = filtered[highlight];
      if (picked) commit(picked);
      else if (allowCustom && query.trim()) commit(query.trim());
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          setOpen((o) => !o);
          setHighlight(0);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 bg-white text-left text-sm rounded-[14px] px-4 py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-critical'
            : open
              ? 'border-brand-600 shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
              : 'border-line hover:border-[#D9DEE9]'
        }`}
      >
        <span className={value ? 'text-ink truncate' : 'text-ink-faint truncate'}>
          {value || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Clear selection"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-ink-faint hover:text-critical transition-colors"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-ink-faint transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-line rounded-[16px] shadow-e4 overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line">
            <Search className="w-4 h-4 text-ink-faint shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setHighlight(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type to search…"
              className="w-full text-sm text-ink placeholder-ink-faint outline-none bg-transparent"
            />
          </div>

          <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
            {filtered.map((option, i) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === value}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => commit(option)}
                  className={`w-full flex items-center justify-between gap-2 text-left text-sm px-4 py-2.5 transition-colors ${
                    i === highlight ? 'bg-brand-50 text-brand-700' : 'text-ink-soft'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {option === value && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                </button>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-faint">
                {allowCustom && query.trim() ? (
                  <button
                    type="button"
                    onClick={() => commit(query.trim())}
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    Use “{query.trim()}”
                  </button>
                ) : (
                  'No matches found'
                )}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
