'use client';
import { useState } from 'react';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  action?: React.ReactNode;
}

const BASE =
  'w-full bg-white text-ink placeholder-ink-faint text-[14.5px] rounded-[14px] pl-11 py-3.5 border outline-none ' +
  'shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 [transition-timing-function:var(--ease-premium)]';

export default function Field({
  id,
  label,
  type = 'text',
  icon: Icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
  error,
  hint,
  action,
}: FieldProps) {
  // Each password field owns its reveal state so toggling one does not unmask
  // the other on forms that ask for a password twice.
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={id}
          className="text-[12.5px] font-semibold text-ink-soft tracking-[-0.01em]"
        >
          {label}
        </label>
        {action}
      </div>

      <div className="relative flex items-center group">
        <Icon
          className="absolute left-4 w-[17px] h-[17px] text-ink-faint pointer-events-none transition-colors duration-300 group-focus-within:text-brand-600"
          strokeWidth={2}
        />
        <input
          id={id}
          name={id}
          type={isPassword && reveal ? 'text' : type}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`${BASE} ${isPassword ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-critical focus:border-critical focus:shadow-[0_0_0_4px_rgba(239,68,68,0.10)]'
              : 'border-line hover:border-brand-200 focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((s) => !s)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 p-1 rounded-lg text-ink-faint hover:text-brand-600 hover:bg-brand-50 transition-colors duration-200"
          >
            {reveal ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] font-medium text-critical">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-ink-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
