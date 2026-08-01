import Link from 'next/link';
import { Briefcase } from 'lucide-react';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  bullets?: string[];
  children: React.ReactNode;
}

/**
 * Two-panel shell shared by every auth screen (login, signup, verify, reset)
 * so the flow reads as one continuous experience.
 */
export default function AuthShell({
  eyebrow = 'MotoJobs.in',
  title,
  subtitle,
  bullets = [
    'Auto-sector jobs only — no noise',
    'Dealerships, workshops, OEMs & EV',
    'Verified employers across India',
  ],
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-canvas flex">
      <div className="hidden lg:flex flex-1 grad-brand items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] bg-[length:56px_56px]" />
        <div className="absolute -top-32 -left-24 w-[520px] h-[520px] rounded-full bg-white/10 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-28 w-[480px] h-[480px] rounded-full bg-ignite-500/25 blur-[140px] pointer-events-none" />

        <div className="relative text-center px-12 xl:px-16 max-w-xl">
          <Link
            href="/"
            className="relative w-20 h-20 rounded-[24px] bg-white/12 border border-white/25 backdrop-blur-sm flex items-center justify-center mx-auto mb-9 shadow-[0_12px_32px_rgba(6,31,54,0.35)] animate-float"
          >
            <Briefcase className="w-9 h-9 text-white" strokeWidth={2.1} />
            <span className="absolute inset-x-4 top-px h-px bg-white/50 rounded-full" />
          </Link>
          <span className="inline-block text-[11.5px] font-bold text-ignite-200 uppercase tracking-[0.2em] mb-5">
            {eyebrow}
          </span>
          <h2 className="text-[40px] xl:text-[46px] font-extrabold text-white mb-5 leading-[1.08] tracking-[-0.038em]">
            {title}
          </h2>
          <p className="text-white/70 text-[16.5px] leading-[1.7] max-w-sm mx-auto">
            {subtitle}
          </p>
          <div className="mt-12 space-y-3.5 max-w-sm mx-auto text-left">
            {bullets.map((f) => (
              <div
                key={f}
                className="flex items-center gap-3.5 text-white/85 text-[14.5px] font-medium bg-white/[0.07] border border-white/12 rounded-[14px] px-4 py-3.5 backdrop-blur-sm"
              >
                <div className="w-6 h-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-ignite-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-12 relative">
        <div className="absolute inset-0 grid-precision opacity-40 pointer-events-none lg:hidden" />
        <div className="relative w-full max-w-[420px] animate-fade-in">{children}</div>
      </div>
    </div>
  );
}
