'use client';

import type { InputHTMLAttributes } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export default function TextInput({ error, className = '', ...props }: TextInputProps) {
  return (
    <input
      {...props}
      className={`w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px] px-4 py-3 border outline-none shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
        error
          ? 'border-critical focus:shadow-[0_0_0_4px_rgba(179,43,43,0.10)]'
          : 'border-line hover:border-[#D9DEE9] focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10)]'
      } ${className}`}
    />
  );
}
