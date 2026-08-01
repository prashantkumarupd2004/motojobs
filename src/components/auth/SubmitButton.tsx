'use client';
import { Loader2, ArrowRight } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  disabled?: boolean;
  loadingLabel: string;
  children: React.ReactNode;
  tone?: 'brand' | 'ignite';
}

export default function SubmitButton({
  loading,
  disabled,
  loadingLabel,
  children,
  tone = 'brand',
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`group relative w-full overflow-hidden text-white font-semibold text-[15px] rounded-[14px] py-4
        ${tone === 'ignite' ? 'grad-ignite shadow-ignite' : 'grad-brand shadow-brand'}
        transition-all duration-400 [transition-timing-function:var(--ease-premium)]
        hover:-translate-y-0.5 hover:shadow-e4 active:translate-y-0 active:scale-[0.99]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
        flex items-center justify-center gap-2`}
    >
      {/* Sheen sweeps across on hover — the one flourish on the primary action. */}
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 [transition-timing-function:var(--ease-premium)] group-hover:translate-x-full group-disabled:hidden" />
      {loading ? (
        <>
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="w-[18px] h-[18px] transition-transform duration-300 [transition-timing-function:var(--ease-premium)] group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
