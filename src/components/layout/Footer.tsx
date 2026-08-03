import Image from 'next/image';
import Link from 'next/link';

/* ── Social icons ─────────────────────────────────────────────── */
function TwitterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ── Footer link groups ──────────────────────────────────────── */
const JOB_SEEKER_LINKS: [string, string][] = [
  ['Browse Jobs', '/jobs'],
  ['Create Profile', '/register?role=candidate'],
  ['Companies', '/companies'],
  ['Career Advice', '/blog'],
];

const EMPLOYER_LINKS: [string, string][] = [
  ['Post a Job', '/recruiter/post-job'],
  ['Search Candidates', '/recruiter/candidate-search'],
  ['Pricing Plans', '/pricing'],
  ['Bulk Hiring', '/recruiter/bulk-hiring'],
  ['Recruiter Login', '/login?role=recruiter'],
];

const COMPANY_LINKS: [string, string][] = [
  ['About Us', '/about'],
  ['Browse Companies', '/companies'],
  ['Contact Us', '/contact'],
  ['Blog', '/blog'],
];

const LEGAL_LINKS: [string, string][] = [
  ['Privacy Policy', '/privacy'],
  ['Terms of Service', '/terms'],
  ['Cookie Policy', '/privacy#cookies'],
];

/* ── Logo mark ──────────────────────────────────────────────── */
function FooterLogo() {
  return (
    <Link href="/" className="inline-flex items-center mb-5">
      <Image
        src="/logo-motojobs.png"
        alt="MotoJobs.in"
        width={1341}
        height={268}
        className="h-10 w-auto"
      />
    </Link>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const socials = [
    { Icon: TwitterIcon, label: 'Twitter / X', href: '#' },
    { Icon: LinkedInIcon, label: 'LinkedIn', href: '#' },
    { Icon: InstagramIcon, label: 'Instagram', href: '#' },
    { Icon: YouTubeIcon, label: 'YouTube', href: '#' },
  ];

  const columns = [
    { title: 'Job Seekers', links: JOB_SEEKER_LINKS },
    { title: 'Employers', links: EMPLOYER_LINKS },
    { title: 'Company', links: COMPANY_LINKS },
    { title: 'Legal', links: LEGAL_LINKS },
  ];

  return (
    <footer className="bg-white border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-14">

          {/* Brand column — spans 2 cols on lg */}
          <div className="sm:col-span-2">
            <FooterLogo />
            <p className="text-[#64748B] text-[14px] leading-[1.8] max-w-xs mb-6">
              India&apos;s dedicated job portal for the automobile sector. Connecting talent
              with dealerships, workshops, OEMs, and EV companies across India.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 border border-[#E2E8F0] bg-white rounded-[10px] flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:border-[#BFDBFE] hover:bg-[#EFF6FF] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[#0F172A] font-semibold text-[13px] mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[#64748B] hover:text-[#2563EB] text-[14px] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-[#F1F5F9] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#94A3B8] text-[13px]">
            © {year} MotoJobs.in. All rights reserved.
          </p>
          <p className="text-[#94A3B8] text-[13px] text-center">
            Developed &amp; managed under{' '}
            <a
              href="https://infotronicsmedia.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium hover:underline transition-colors duration-200"
            >
              Infotronics Media Pvt Ltd
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
