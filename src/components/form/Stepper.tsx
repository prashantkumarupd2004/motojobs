'use client';

import { Check } from 'lucide-react';

interface StepperProps {
  steps: readonly string[];
  current: number;
}

export default function Stepper({ steps, current }: StepperProps) {
  return (
    <nav aria-label="Progress" className="mb-9">
      <ol className="flex items-center gap-2">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex-1 flex items-center gap-2 min-w-0">
              <span className="flex items-center gap-2.5 min-w-0">
                <span
                  aria-current={active ? 'step' : undefined}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12.5px] font-bold shrink-0 transition-all duration-300 ${
                    done
                      ? 'bg-positive text-white'
                      : active
                        ? 'grad-brand text-white shadow-[0_3px_10px_rgba(15,76,129,0.24)]'
                        : 'bg-canvas text-ink-faint border border-line'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={`hidden md:block text-[12.5px] font-semibold truncate tracking-[-0.01em] ${
                    active ? 'text-ink' : 'text-ink-faint'
                  }`}
                >
                  {label}
                </span>
              </span>
              {i < steps.length - 1 && (
                <span
                  className={`flex-1 h-[2px] rounded-full transition-colors duration-500 ${
                    done ? 'bg-positive' : 'bg-line'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
