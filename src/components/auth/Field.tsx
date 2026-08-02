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
  'w-full bg-white text-[#0F172A] placeholder-[#94A3B8] text-[14px] rounded-[9px] pl-11 py-3.5 border outline-none ' +
  'transition-colors duration-200';

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
      <label
        htmlFor={id}
        className="block mb-2 text-[13px] font-semibold text-[#0F172A] tracking-[-0.01em]"
      >
        {label}
      </label>

      <div className="relative flex items-center group">
        <Icon
          className="absolute left-3.5 w-[17px] h-[17px] text-[#94A3B8] pointer-events-none transition-colors duration-200 group-focus-within:text-[#2563EB]"
          strokeWidth={1.8}
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
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((s) => !s)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 p-1 rounded-lg text-[#94A3B8] hover:text-[#2563EB] transition-colors duration-200"
          >
            {reveal ? <EyeOff className="w-[17px] h-[17px]" /> : <Eye className="w-[17px] h-[17px]" />}
          </button>
        )}
      </div>

      {action && <div className="mt-2 flex justify-end">{action}</div>}

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] font-medium text-[#EF4444]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-[#94A3B8]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
