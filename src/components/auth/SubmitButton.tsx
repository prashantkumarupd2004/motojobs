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
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={`w-full text-white font-semibold text-[15px] rounded-[9px] py-3.5
        ${
          tone === 'ignite'
            ? 'bg-[#EA580C] hover:bg-[#C2410C] shadow-[0_2px_10px_rgba(234,88,12,0.25)]'
            : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[0_2px_10px_rgba(37,99,235,0.25)]'
        }
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        flex items-center justify-center gap-2`}
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
