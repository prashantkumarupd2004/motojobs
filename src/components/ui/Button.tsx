'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'grad-brand text-white shadow-[0_4px_12px_rgba(15,76,129,0.18),0_12px_28px_rgba(15,76,129,0.16)] ' +
    'hover:shadow-[0_8px_18px_rgba(15,76,129,0.24),0_18px_38px_rgba(15,76,129,0.20)] hover:-translate-y-0.5 sweep',
  secondary:
    'bg-white text-ink border border-line shadow-[0_1px_2px_rgba(16,24,40,0.04),0_1px_3px_rgba(16,24,40,0.03)] ' +
    'hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700 hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(16,24,40,0.06)]',
  ghost:
    'bg-transparent text-ink-soft hover:bg-brand-50 hover:text-brand-700',
  danger:
    'bg-gradient-to-br from-[#E24A4A] to-[#C62E2E] text-white shadow-[0_4px_12px_rgba(217,59,59,0.20)] ' +
    'hover:shadow-[0_8px_18px_rgba(217,59,59,0.26)] hover:-translate-y-0.5 sweep',
  success:
    'bg-gradient-to-br from-[#12B37E] to-[#0A8A5F] text-white shadow-[0_4px_12px_rgba(14,159,110,0.20)] ' +
    'hover:shadow-[0_8px_18px_rgba(14,159,110,0.26)] hover:-translate-y-0.5 sweep',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs rounded-[10px] gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-[12px] gap-2',
  lg: 'px-7 py-3.5 text-base rounded-[16px] gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          'inline-flex items-center justify-center font-semibold tracking-[-0.01em] press',
          'transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? (
          <span
            className="animate-spin border-2 border-current/25 border-t-current rounded-full w-4 h-4 shrink-0"
            aria-hidden="true"
          />
        ) : (
          icon && <span className="shrink-0 flex items-center">{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
