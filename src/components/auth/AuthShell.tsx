import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react';

interface AuthShellProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  bullets?: string[];
  children: React.ReactNode;
}

const TRUST = [
  { value: '12,400+', label: 'Live openings' },
  { value: '2,800+', label: 'Verified employers' },
  { value: '48 hrs', label: 'Avg. first response' },
];

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
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* ---------- Brand panel ---------- */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden grad-brand px-12 xl:px-16 py-14">
        <div className="absolute inset-0 opacity-[0.13] bg-[linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] bg-[length:52px_52px]" />
        <div className="absolute -top-40 -left-28 w-[560px] h-[560px] rounded-full bg-white/[0.09] blur-[150px]" />
        <div className="absolute -bottom-44 -right-32 w-[520px] h-[520px] rounded-full bg-ignite-500/25 blur-[150px]" />
        {/* Thin light seam along the inner edge reads as machined metal. */}
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent" />

        <div className="relative flex items-center justify-between">
          <Link href="/" aria-label={`${eyebrow} home`} className="group">
            {/* The logo artwork is a JPEG on white, so it needs its own light
                card to sit on the dark panel without a grey box around it. */}
            <span className="block rounded-[14px] bg-white px-5 py-3 shadow-[0_8px_22px_rgba(6,31,54,0.35)] transition-transform duration-500 [transition-timing-function:var(--ease-premium)] group-hover:scale-[1.03]">
              <Image
                src="/logo-wordmark.png"
                alt={eyebrow}
                width={1346}
                height={233}
                preload
                className="h-7 w-auto"
              />
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-white/65 hover:text-white transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to site
          </Link>
        </div>

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.09] border border-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ignite-200 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            India&apos;s automobile job network
          </span>
          <h2 className="mt-7 text-[38px] xl:text-[46px] font-extrabold text-white leading-[1.05] tracking-[-0.04em]">
            {title}
          </h2>
          <p className="mt-4 text-white/70 text-[16px] leading-[1.65]">{subtitle}</p>

          <div className="mt-8 relative aspect-[16/10] rounded-[20px] overflow-hidden ring-1 ring-white/20 shadow-[0_24px_60px_rgba(6,31,54,0.45)]">
            <Image
              src="/hero-professionals.png"
              alt="Service advisors, technicians and sales staff hired through MotoJobs.in"
              fill
              sizes="(min-width: 1024px) 28rem, 100vw"
              className="object-cover object-top"
            />
            {/* Bottom fade ties the photo into the panel instead of ending flat. */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" />
          </div>

          <ul className="mt-8 space-y-3">
            {bullets.map((f) => (
              <li key={f} className="flex items-start gap-3 text-white/85 text-[14.5px] font-medium">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-ignite-500/25 border border-ignite-400/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-ignite-200" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative grid grid-cols-3 gap-4 pt-9 border-t border-white/12 max-w-md">
          {TRUST.map((s) => (
            <div key={s.label}>
              <div className="text-[21px] font-extrabold text-white tracking-[-0.03em]">
                {s.value}
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium text-white/55 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ---------- Form panel ---------- */}
      <main className="relative flex items-center justify-center px-5 sm:px-8 py-10 sm:py-14 min-h-screen">
        <div className="absolute inset-0 grid-precision opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

        <div className="relative w-full max-w-[440px] animate-fade-in">
          <Link
            href="/"
            className="lg:hidden inline-block mb-8"
            aria-label="MotoJobs.in home"
          >
            <Image
              src="/logo-wordmark.png"
              alt="MotoJobs.in"
              width={1346}
              height={233}
              preload
              className="h-8 w-auto"
            />
          </Link>

          <div className="sm:bg-surface sm:border sm:border-line sm:rounded-[24px] sm:shadow-e3 sm:p-8 lg:p-9">
            {children}
          </div>

          <p className="mt-7 text-center text-[12px] text-ink-faint leading-relaxed">
            Protected by encrypted OTP verification.{' '}
            <Link href="/privacy" className="font-semibold text-ink-muted hover:text-brand-600 transition-colors">
              Privacy
            </Link>
            {' · '}
            <Link href="/terms" className="font-semibold text-ink-muted hover:text-brand-600 transition-colors">
              Terms
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
