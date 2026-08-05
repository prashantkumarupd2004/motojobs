'use client';

import { ArrowRight, Building2, Clock3, Users, Zap } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Clock3, text: 'Takes about two minutes' },
  { icon: Users, text: 'Reach technicians, advisors and sales staff across India' },
  { icon: Zap, text: 'Post your first job the moment you finish' },
];

export default function StepWelcome({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  return (
    <section className="text-center animate-fade-in">
      <div className="w-16 h-16 rounded-[20px] grad-brand flex items-center justify-center mx-auto mb-6 shadow-[0_8px_20px_rgba(15,76,129,0.22)]">
        <Building2 className="w-8 h-8 text-white" strokeWidth={2.1} />
      </div>

      <h2 className="text-[26px] sm:text-[30px] font-extrabold text-ink tracking-[-0.038em] leading-[1.15]">
        Welcome to MotoJobs Employer
      </h2>
      <p className="text-ink-muted text-[15px] leading-[1.7] mt-3 max-w-md mx-auto">
        Hire the best automobile talent across India. Let&apos;s set up your company
        profile so candidates know who they are applying to.
      </p>

      <ul className="mt-8 space-y-3 text-left max-w-sm mx-auto">
        {HIGHLIGHTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-[10px] bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-brand-600" strokeWidth={2.1} />
            </span>
            <span className="text-[14px] text-ink-soft leading-[1.6] pt-1.5">{text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 grad-brand text-white font-semibold text-[14.5px] rounded-[14px] px-7 py-3.5 shadow-brand transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-e4"
        >
          Complete company profile
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full sm:w-auto text-[14px] font-semibold text-ink-muted hover:text-brand-600 px-5 py-3.5 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </section>
  );
}
