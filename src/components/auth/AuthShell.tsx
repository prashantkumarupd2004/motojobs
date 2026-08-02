import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Building2, Users, type LucideIcon } from 'lucide-react';

interface Stat {
  Icon: LucideIcon;
  value: string;
  label: string;
}

interface Feature {
  Icon: LucideIcon;
  title: string;
  detail: string;
}

interface AuthShellProps {
  /** Panel headline — pass JSX so the emphasised words can be styled inline. */
  headline: React.ReactNode;
  subtitle: string;
  features?: Feature[];
  testimonial?: { quote: string; name: string; role: string };
  /** Cross-link shown in the top-right of the form column. */
  altPrompt: string;
  altLabel: string;
  altHref: string;
  children: React.ReactNode;
}

const STATS: Stat[] = [
  { Icon: Briefcase, value: '10K+', label: 'Job Opportunities' },
  { Icon: Building2, value: '5K+', label: 'Top Companies' },
  { Icon: Users, value: '50K+', label: 'Job Seekers' },
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
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* ── Brand panel ── */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#050B18] px-12 xl:px-16 py-14">
        {/* The photo is wide and the panel is tall, so it is anchored to the
            bottom at natural aspect rather than cover-cropped into a close-up. */}
        <div className="absolute inset-x-0 bottom-0 aspect-[1100/520] [mask-image:linear-gradient(to_bottom,transparent,black_28%)]">
          <Image src="/auth-car.webp" alt="" fill sizes="50vw" preload className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B18]/92 via-[#050B18]/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B18]/80 via-transparent to-[#050B18]" />
        {/* Diagonal light seam, as in the reference artwork. */}
        <div className="absolute inset-y-0 right-0 w-3/5 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent [clip-path:polygon(42%_0,100%_0,100%_100%,0_100%)]" />

        <div className="relative">
          <Link href="/" aria-label="MotoJobs.in home" className="inline-block">
            <Image
              src="/logo-motojobs-light.png"
              alt="MotoJobs.in"
              width={1341}
              height={268}
              preload
              className="h-[38px] w-auto"
            />
          </Link>
          <p className="mt-3 text-[13.5px] text-white/60">
            India&apos;s Premier Automobile Job Portal
          </p>
        </div>

        <div className="relative max-w-[26rem] py-10">
          <h2 className="text-[38px] xl:text-[44px] font-bold text-white leading-[1.14] tracking-[-0.035em]">
            {headline}
          </h2>
          <p className="mt-5 text-white/65 text-[15.5px] leading-[1.7]">{subtitle}</p>

          {features && (
            <>
              <div className="mt-7 w-14 h-[3px] rounded-full bg-[#2563EB]" />
              <ul className="mt-7 space-y-4">
                {features.map(({ Icon, title: heading, detail }) => (
                  <li key={heading} className="flex items-center gap-4">
                    <span className="w-[46px] h-[46px] shrink-0 rounded-[12px] bg-white/[0.06] border border-white/15 flex items-center justify-center">
                      <Icon className="w-[19px] h-[19px] text-white" strokeWidth={1.8} />
                    </span>
                    <span>
                      <span className="block text-[14.5px] font-semibold text-white tracking-[-0.015em]">
                        {heading}
                      </span>
                      <span className="block text-[12.5px] text-white/55 mt-0.5">{detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {testimonial && (
            <figure className="mt-8 rounded-[16px] border border-[#2563EB]/60 bg-[#0B1B33]/70 backdrop-blur-sm p-6">
              <span aria-hidden className="block text-[26px] leading-none text-[#3B82F6] font-serif">
                &ldquo;
              </span>
              <blockquote className="mt-2 text-[14px] text-white/85 leading-[1.65]">
                {testimonial.quote}
              </blockquote>
              <figcaption className="mt-4 text-[13px]">
                <span className="block font-semibold text-white">— {testimonial.name}</span>
                <span className="block text-white/55">{testimonial.role}</span>
              </figcaption>
            </figure>
          )}
        </div>

        {!features && (
          <div className="relative grid grid-cols-3 gap-6 max-w-[26rem]">
            {STATS.map(({ Icon, value, label }) => (
              <div key={label}>
                <Icon className="w-[26px] h-[26px] text-[#3B82F6]" strokeWidth={1.7} />
                <div className="mt-3 text-[26px] font-bold text-white tracking-[-0.03em]">
                  {value}
                </div>
                <div className="mt-0.5 text-[13px] text-white/60 leading-snug">{label}</div>
              </div>
            ))}
          </div>
        )}
        {/* Keeps the headline block vertically centred when the stats row is absent. */}
        {features && <div className="relative" />}
      </aside>

      {/* ── Form panel ── */}
      <main className="flex flex-col bg-white px-5 sm:px-10 lg:px-14 xl:px-20 py-6 lg:py-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="MotoJobs.in home" className="lg:hidden">
            <Image
              src="/logo-motojobs.png"
              alt="MotoJobs.in"
              width={1341}
              height={268}
              preload
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:inline text-[13.5px] text-[#475569]">{altPrompt}</span>
            <Link
              href={altHref}
              className="text-[13.5px] font-semibold text-[#2563EB] border border-[#2563EB]/45 rounded-[8px] px-4 py-2.5 hover:bg-[#2563EB] hover:text-white transition-colors duration-200"
            >
              {altLabel}
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-8">
          <div className="w-full max-w-[500px] animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
}
