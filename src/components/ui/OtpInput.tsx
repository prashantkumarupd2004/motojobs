'use client';
import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length && !next.includes(' ')) onComplete?.(next);
  };

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, ' ').split('');
    chars[index] = digit;
    commit(chars.join('').trimEnd());
  };

  const handleInput = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    setDigit(index, digit);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index] !== ' ') {
        setDigit(index, ' ');
      } else if (index > 0) {
        setDigit(index - 1, ' ');
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    commit(pasted);
    inputs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex items-center justify-center gap-2.5 sm:gap-3" role="group" aria-label="Verification code">
      {Array.from({ length }).map((_, i) => {
        const char = digits[i] === ' ' ? '' : digits[i];
        const isActive = focused === i;
        return (
          <input
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={char}
            disabled={disabled}
            aria-label={`Digit ${i + 1} of ${length}`}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => {
              setFocused(i);
              e.target.select();
            }}
            onBlur={() => setFocused(null)}
            className={[
              'w-12 h-14 sm:w-14 sm:h-16 text-center text-[22px] sm:text-[26px] font-bold text-ink',
              'bg-white rounded-[14px] border outline-none caret-brand-600',
              'shadow-[inset_0_1px_2px_rgba(16,24,40,0.04)]',
              'transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-canvas',
              error
                ? 'border-[#E4A5A5] shadow-[0_0_0_4px_rgba(217,59,59,0.10)]'
                : isActive
                  ? 'border-brand-600 shadow-[0_0_0_4px_rgba(15,76,129,0.10)] scale-[1.04]'
                  : char
                    ? 'border-brand-200'
                    : 'border-line hover:border-[#D9DEE9]',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
