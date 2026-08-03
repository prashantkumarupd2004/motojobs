'use client';

import { Check } from 'lucide-react';

interface ChipOption {
  value: string;
  label: string;
  blurb?: string;
}

interface ChipSelectProps {
  options: readonly ChipOption[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  columns?: 1 | 2 | 3;
}

/**
 * Rounded multi-select chips. Unlike `MultiSelect` this renders every option
 * inline rather than behind a dropdown — right when the option set is small
 * enough to scan and the choice deserves prominence.
 */
export default function ChipSelect({
  options,
  value,
  onChange,
  max,
  columns = 2,
}: ChipSelectProps) {
  const atLimit = max !== undefined && value.length >= max;
  const grid = columns === 3 ? 'sm:grid-cols-3' : columns === 2 ? 'sm:grid-cols-2' : '';

  const toggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else if (!atLimit) {
      onChange([...value, option]);
    }
  };

  return (
    <div>
      <div className={`grid grid-cols-1 ${grid} gap-2.5`}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          const blocked = atLimit && !selected;
          return (
            <button
              key={opt.value}
              type="button"
              role="checkbox"
              aria-checked={selected}
              disabled={blocked}
              onClick={() => toggle(opt.value)}
              className={`flex items-start gap-2.5 text-left rounded-[14px] border px-3.5 py-3 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                blocked
                  ? 'border-line bg-canvas opacity-45 cursor-not-allowed'
                  : selected
                    ? 'border-brand-600 bg-brand-50 shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
                    : 'border-line bg-white hover:border-[#D9DEE9] hover:-translate-y-0.5'
              }`}
            >
              <span
                className={`mt-px w-[18px] h-[18px] rounded-[6px] border flex items-center justify-center shrink-0 transition-colors ${
                  selected ? 'bg-brand-600 border-brand-600' : 'border-line bg-white'
                }`}
              >
                {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-[13.5px] font-semibold tracking-[-0.01em] ${
                    selected ? 'text-brand-700' : 'text-ink'
                  }`}
                >
                  {opt.label}
                </span>
                {opt.blurb && (
                  <span className="block text-[12px] text-ink-muted mt-0.5 leading-[1.5]">
                    {opt.blurb}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {max !== undefined && (
        <p className="mt-2.5 text-[12px] text-ink-faint">
          {value.length} of {max} selected
        </p>
      )}
    </div>
  );
}
