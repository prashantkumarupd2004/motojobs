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
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && reveal ? 'text' : type;

  return (
    <div>
      {/* Label row */}
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-[13px] font-semibold text-[#0F172A] tracking-tight">
          {label}
          {!required && (
            <span className="ml-1.5 text-[11.5px] font-normal text-[#94A3B8]">(optional)</span>
          )}
        </label>
        {action && <div>{action}</div>}
      </div>

      {/* Input wrapper */}
      <div className="relative group">
        {/* Left icon */}
        <Icon
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-[16px] h-[16px] pointer-events-none transition-colors duration-200
            ${error ? 'text-[#EF4444]' : 'text-[#94A3B8] group-focus-within:text-[#2563EB]'}`}
          strokeWidth={1.9}
        />

        <input
          id={id}
          name={id}
          type={inputType}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={`w-full bg-[#F8FAFC] text-[#0F172A] placeholder-[#CBD5E1] text-[14px] rounded-[11px]
            pl-11 ${isPassword ? 'pr-11' : 'pr-4'} py-3.5 border outline-none
            transition-all duration-200
            ${error
              ? 'border-[#EF4444] bg-[#FEF2F2] focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.10)]'
              : 'border-[#E8EDF5] hover:border-[#CBD5E1] hover:bg-white focus:bg-white focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]'
            }`}
        />

        {/* Password reveal toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal(s => !s)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#94A3B8] hover:text-[#2563EB] transition-colors duration-200"
          >
            {reveal
              ? <EyeOff className="w-[16px] h-[16px]" />
              : <Eye     className="w-[16px] h-[16px]" />}
          </button>
        )}
      </div>

      {/* Error / hint */}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-[#EF4444]">
          <span className="w-3.5 h-3.5 rounded-full bg-[#EF4444] text-white flex items-center justify-center text-[9px] font-bold shrink-0">!</span>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[12px] text-[#94A3B8] leading-snug">{hint}</p>
      ) : null}
    </div>
  );
}
