'use client';

import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

export default function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  className = '',
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="block text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
      >
        {label}
        {required && <span className="text-ignite-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-ink-faint">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-[12.5px] font-medium text-critical" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
