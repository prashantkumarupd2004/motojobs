'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface MultiSelectProps {
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  max?: number;
  disabled?: boolean;
  error?: boolean;
  id?: string;
}

export default function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select one or more',
  max,
  disabled,
  error,
  id,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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

  const atLimit = max !== undefined && value.length >= max;

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else if (!atLimit) {
      onChange([...value, option]);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <div
        id={id}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((o) => !o);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className={`w-full min-h-[46px] flex items-center justify-between gap-2 bg-white text-left rounded-[14px] px-3 py-2 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          error
            ? 'border-critical'
            : open
              ? 'border-brand-600 shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
              : 'border-line hover:border-[#D9DEE9]'
        }`}
      >
        {value.length === 0 ? (
          <span className="text-sm text-ink-faint px-1">{placeholder}</span>
        ) : (
          <span className="flex flex-wrap gap-1.5">
            {value.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-lg pl-2.5 pr-1.5 py-1 text-[12.5px] font-medium"
              >
                {v}
                <button
                  type="button"
                  aria-label={`Remove ${v}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((x) => x !== v));
                  }}
                  className="text-brand-600/70 hover:text-critical transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-ink-faint shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-40 mt-2 w-full bg-white border border-line rounded-[16px] shadow-e4 overflow-hidden animate-fade-in">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-line">
            <Search className="w-4 h-4 text-ink-faint shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
              placeholder="Type to search…"
              className="w-full text-sm text-ink placeholder-ink-faint outline-none bg-transparent"
            />
          </div>

          {max !== undefined && (
            <p className="px-4 py-2 text-[12px] text-ink-faint border-b border-line">
              {value.length} of {max} selected
            </p>
          )}

          <ul role="listbox" aria-multiselectable className="max-h-60 overflow-y-auto py-1">
            {filtered.map((option) => {
              const selected = value.includes(option);
              const blocked = atLimit && !selected;
              return (
                <li key={option}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={blocked}
                    onClick={() => toggle(option)}
                    className={`w-full flex items-center gap-3 text-left text-sm px-4 py-2.5 transition-colors ${
                      blocked
                        ? 'opacity-40 cursor-not-allowed text-ink-faint'
                        : selected
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-soft hover:bg-canvas'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
                        selected ? 'bg-brand-600 border-brand-600' : 'border-line'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="truncate">{option}</span>
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink-faint">No matches found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
