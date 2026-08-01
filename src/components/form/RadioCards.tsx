'use client';

interface Option {
  value: string;
  label: string;
  blurb?: string;
}

interface RadioCardsProps {
  options: readonly Option[];
  value: string;
  onChange: (value: string) => void;
  name: string;
  columns?: 1 | 2 | 3;
}

export default function RadioCards({
  options,
  value,
  onChange,
  name,
  columns = 1,
}: RadioCardsProps) {
  const grid =
    columns === 3
      ? 'sm:grid-cols-3'
      : columns === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-1';

  return (
    <div role="radiogroup" className={`grid grid-cols-1 ${grid} gap-3`}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(opt.value)}
            className={`text-left rounded-[16px] border px-4 py-3.5 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
              selected
                ? 'border-brand-600 bg-brand-50 shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
                : 'border-line bg-white hover:border-[#D9DEE9] hover:-translate-y-0.5'
            }`}
          >
            <span className="flex items-start gap-3">
              <span
                className={`mt-0.5 w-4 h-4 rounded-full border-[5px] shrink-0 transition-colors ${
                  selected ? 'border-brand-600' : 'border-line bg-white'
                }`}
              />
              <span className="min-w-0">
                <span
                  className={`block text-[14px] font-semibold tracking-[-0.01em] ${
                    selected ? 'text-brand-700' : 'text-ink'
                  }`}
                >
                  {opt.label}
                </span>
                {opt.blurb && (
                  <span className="block text-[12.5px] text-ink-muted mt-0.5 leading-[1.5]">
                    {opt.blurb}
                  </span>
                )}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
