'use client';

interface YesNoProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  name: string;
}

export default function YesNo({ value, onChange, name }: YesNoProps) {
  return (
    <div role="radiogroup" className="flex gap-3">
      {[
        { label: 'Yes', v: true },
        { label: 'No', v: false },
      ].map(({ label, v }) => {
        const selected = value === v;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={selected}
            name={name}
            onClick={() => onChange(v)}
            className={`flex-1 rounded-[14px] border px-4 py-2.5 text-[14px] font-semibold transition-all duration-300 ${
              selected
                ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
                : 'border-line bg-white text-ink-muted hover:border-[#D9DEE9]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
