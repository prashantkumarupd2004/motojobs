import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Building2, Users, type LucideIcon } from 'lucide-react';

interface Feature {
  Icon: LucideIcon;
  title: string;
  detail: string;
}

interface AuthShellProps {
  headline: React.ReactNode;
  subtitle: string;
  features?: Feature[];
  testimonial?: { quote: string; name: string; role: string };
  altPrompt: string;
  altLabel: string;
  altHref: string;
  children: React.ReactNode;
}

const STATS = [
  { Icon: Briefcase, value: '10K+', label: 'Job Listings' },
  { Icon: Building2, value: '1.2K+', label: 'Companies' },
  { Icon: Users,    value: '50K+', label: 'Job Seekers' },
];

export default function AuthShell({
  headline,
  subtitle,
  features,
  testimonial,
  altPrompt,
  altLabel,
  altHref,
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">

      {/* ══════════════════════════════════════════
          BRAND PANEL (left, desktop only)
      ══════════════════════════════════════════ */}
      <aside
        className="relative hidden lg:flex flex-col justify-between overflow-hidden px-12 xl:px-16 py-14"
        style={{ background: 'linear-gradient(145deg,#0A1D3C 0%,#0F2D58 55%,#1E3A8A 100%)' }}
      >
        {/* ── Background car image ── */}
        <div className="absolute inset-x-0 bottom-0 aspect-[1100/520]"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 28%)' }}>
          <Image src="/auth-car.webp" alt="" fill sizes="50vw" className="object-cover opacity-30" />
        </div>

        {/* ── Gradient overlays ── */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(10,29,60,0.96) 0%,rgba(15,45,88,0.72) 100%)' }} />

        {/* ── Decorative glow orbs ── */}
        <div className="absolute top-[-80px] right-[-80px] w-[340px] h-[340px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#3B82F6 0%,transparent 70%)' }} />
        <div className="absolute bottom-[120px] left-[-60px] w-[260px] h-[260px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle,#7C3AED 0%,transparent 70%)' }} />
        <div className="absolute top-[40%] right-[10%] w-[180px] h-[180px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle,#22D3EE 0%,transparent 70%)' }} />

        {/* ── Diagonal light seam ── */}
        <div className="absolute inset-y-0 right-0 w-3/5 opacity-50"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))',
            clipPath: 'polygon(42% 0,100% 0,100% 100%,0 100%)',
          }} />

        {/* ── Logo ── */}
        <div className="relative">
          <Link href="/" aria-label="MotoJobs.in home" className="inline-block">
            <Image
              src="/logo-motojobs-light.png" alt="MotoJobs.in"
              width={1341} height={268} className="h-[38px] w-auto"
            />
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
            <p className="text-[12.5px] text-white/55 font-medium">India&apos;s Premier Automobile Job Portal</p>
          </div>
        </div>

        {/* ── Headline + features ── */}
        <div className="relative max-w-[26rem] py-6">
          <h2 className="text-[36px] xl:text-[42px] font-bold text-white leading-[1.15] tracking-[-0.03em]">
            {headline}
          </h2>
          <p className="mt-4 text-white/60 text-[15px] leading-[1.75]">{subtitle}</p>

          {features && (
            <>
              <div className="mt-7 flex items-center gap-3">
                <div className="h-[2px] w-10 rounded-full bg-[#2563EB]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#93C5FD]">Why MotoJobs</span>
              </div>
              <ul className="mt-6 space-y-4">
                {features.map(({ Icon, title, detail }) => (
                  <li key={title} className="flex items-center gap-4 group">
                    <span className="w-[44px] h-[44px] shrink-0 rounded-[13px] flex items-center justify-center border border-white/10 transition-all duration-300 group-hover:border-[#3B82F6]/50 group-hover:bg-[#3B82F6]/10"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <Icon className="w-[18px] h-[18px] text-white/80 group-hover:text-[#93C5FD] transition-colors duration-200" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-white tracking-tight">{title}</span>
                      <span className="block text-[12px] text-white/50 mt-0.5">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {testimonial && (
            <figure className="mt-8 rounded-[18px] p-5 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}>
              <span className="block text-[28px] leading-none text-[#3B82F6] font-serif">&ldquo;</span>
              <blockquote className="mt-1.5 text-[13.5px] text-white/80 leading-[1.7]">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2563EB]/30 border border-[#3B82F6]/40 flex items-center justify-center text-[12px] font-bold text-[#93C5FD]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <span className="block text-[13px] font-semibold text-white">{testimonial.name}</span>
                  <span className="block text-[11.5px] text-white/50">{testimonial.role}</span>
                </div>
              </figcaption>
            </figure>
          )}
        </div>

        {/* ── Stats row ── */}
        {!features && (
          <div className="relative grid grid-cols-3 gap-4 max-w-[26rem]">
            {STATS.map(({ Icon, value, label }) => (
              <div key={label}
                className="rounded-[14px] p-4 border border-white/10 hover:border-[#3B82F6]/40 transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <Icon className="w-[22px] h-[22px] text-[#3B82F6]" strokeWidth={1.7} />
                <div className="mt-2.5 text-[24px] font-bold text-white tracking-tight">{value}</div>
                <div className="mt-0.5 text-[11.5px] text-white/55 leading-snug">{label}</div>
              </div>
            ))}
          </div>
        )}
        {features && <div className="relative" />}
      </aside>

      {/* ══════════════════════════════════════════
          FORM PANEL (right / full on mobile)
      ══════════════════════════════════════════ */}
      <main className="flex flex-col min-h-screen bg-white px-5 sm:px-10 lg:px-14 xl:px-20">

        {/* Top-bar */}
        <div className="flex items-center justify-between py-5 border-b border-[#F1F5F9]">
          <Link href="/" aria-label="MotoJobs.in home" className="lg:hidden">
            <Image src="/logo-motojobs.png" alt="MotoJobs.in" width={1341} height={268} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline text-[13px] text-[#94A3B8] font-medium">{altPrompt}</span>
            <Link
              href={altHref}
              className="text-[13.5px] font-semibold text-[#2563EB] border border-[#BFDBFE] rounded-[10px] px-4 py-2 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all duration-200"
            >
              {altLabel}
            </Link>
          </div>
        </div>

        {/* Centred form area */}
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[500px]" style={{ animation: 'fadeInUp 0.35s ease both' }}>
            {children}
          </div>
        </div>

        {/* Footer strip */}
        <div className="py-4 border-t border-[#F8FAFC] text-center">
          <p className="text-[11.5px] text-[#CBD5E1]">
            © {new Date().getFullYear()} MotoJobs.in · Developed &amp; managed under{' '}
            <a href="https://infotronicsmedia.org/" target="_blank" rel="noopener noreferrer" className="hover:text-[#2563EB] transition-colors">
              Infotronics Media Pvt Ltd
            </a>
          </p>
        </div>
      </main>

      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
