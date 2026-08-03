'use client';
import { Loader2 } from 'lucide-react';

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
  const isDisabled = loading || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        w-full text-white font-bold text-[15px] rounded-[12px] py-3.5
        flex items-center justify-center gap-2
        transition-all duration-200
        hover:scale-[1.015] active:scale-[0.985]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
        ${tone === 'ignite'
          ? 'bg-gradient-to-r from-[#EA580C] to-[#DC2626] hover:from-[#C2410C] hover:to-[#B91C1C] shadow-[0_4px_14px_rgba(234,88,12,0.30)]'
          : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] shadow-[0_4px_14px_rgba(37,99,235,0.30)]'
        }
        ${isDisabled ? '' : 'hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]'}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
