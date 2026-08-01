'use client';
import { InputHTMLAttributes, forwardRef, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-semibold text-ink-soft mb-2 tracking-[-0.01em]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center group">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none flex items-center transition-colors duration-300 group-focus-within:text-brand-600">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full bg-white text-ink placeholder-ink-faint text-sm rounded-[14px]',
              'px-4 py-3 border outline-none',
              'shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)]',
              'transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              'hover:border-[#D9DEE9]',
              'focus:border-brand-600 focus:shadow-[0_0_0_4px_rgba(15,76,129,0.10),inset_0_1px_2px_rgba(16,24,40,0.03)]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas',
              error
                ? 'border-[#E4A5A5] focus:border-critical focus:shadow-[0_0_0_4px_rgba(217,59,59,0.10)]'
                : 'border-line',
              leftIcon ? 'pl-11' : '',
              rightIcon ? 'pr-11' : '',
              className,
            ].join(' ')}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none flex items-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-xs font-medium text-critical flex items-center gap-1.5 animate-fade-in"
            role="alert"
          >
            <svg
              className="w-3.5 h-3.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
