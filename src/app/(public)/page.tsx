'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  FileText,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { salaryRangeLabel } from '@/lib/automotive';

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

function postedAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ================================================================
   COMPANY CARD — 3D hover card component
   ================================================================ */
function CompanyCard({
  href,
  name,
  jobs,
  logo,
}: {
  href: string;
  name: string;
  jobs: number;
  /** Null for companies that have not uploaded one — initials stand in. */
  logo: string | null;
}) {
  const border = '#BFDBFE';
  return (
    <Link
      href={href}
      className="group flex flex-col items-center text-center rounded-[18px] px-2 py-5 transition-all duration-300 cursor-pointer"
      style={{
        background: 'white',
        border: `1.5px solid ${border}`,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        transformStyle: 'preserve-3d',
        perspective: '600px',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-6px) rotateX(4deg) scale(1.03)';
        el.style.boxShadow = '0 16px 32px rgba(37,99,235,0.14), 0 4px 8px rgba(15,23,42,0.08)';
        el.style.borderColor = '#93C5FD';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)';
        el.style.borderColor = border;
      }}
    >
      {/* Logo container with subtle bg tint */}
      <div
        className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden"
        style={{ background: logo ? '#FFFFFF' : '#EFF6FF' }}
      >
        {logo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logo}
            alt={`${name} logo`}
            width={56}
            height={56}
            loading="lazy"
            style={{ width: '82%', height: '82%', objectFit: 'contain' }}
          />
        ) : (
          <span className="text-[15px] font-bold text-[#1D4ED8]">{initials(name)}</span>
        )}
      </div>
      <p className="text-[11.5px] font-semibold text-[#0F172A] leading-tight mb-0.5">{name}</p>
      <p className="text-[10.5px] text-[#94A3B8]">{jobs} {jobs === 1 ? 'Job' : 'Jobs'}</p>
    </Link>
  );
}

/* ================================================================
   CATEGORY ICONS — original SVG
   ================================================================ */
function SalesMarketingIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
function ServiceSupportIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0118 0v6" />
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
    </svg>
  );
}
function TechnicianCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function EngineeringCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M2 12h2m16 0h2M5.34 5.34L3.93 3.93M18.66 18.66l1.41 1.41M12 2v2m0 16v2" />
    </svg>
  );
}
function BodyShopCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function PartsCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}
function ManagementCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function OthersCatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

/* ================================================================
   DATA
   ================================================================ */

const STATS = [
  { key: 'activeJobs',      label: 'Active Jobs',         icon: Briefcase },
  { key: 'companiesHiring', label: 'Companies Hiring',    icon: Building2 },
  { key: 'jobSeekers',      label: 'Job Seekers',         icon: Users },
  { key: 'postedThisMonth', label: 'Jobs Posted (30d)',   icon: FileText },
] as const;

/**
 * Presentation only — the categories themselves come from the API, which reads
 * the admin-managed list. A category the admin adds gets the neutral icon
 * rather than being dropped from the grid.
 */
const CATEGORY_STYLE: Record<string, { Icon: () => React.JSX.Element; accent: string }> = {
  sales:          { Icon: SalesMarketingIcon, accent: '#3B82F6' },
  service:        { Icon: ServiceSupportIcon, accent: '#10B981' },
  'spare-parts':  { Icon: PartsCatIcon,       accent: '#0EA5E9' },
  'body-shop':    { Icon: BodyShopCatIcon,    accent: '#EF4444' },
  ev:             { Icon: EngineeringCatIcon, accent: '#8B5CF6' },
  finance:        { Icon: ManagementCatIcon,  accent: '#EC4899' },
  'pre-owned':    { Icon: TechnicianCatIcon,  accent: '#F59E0B' },
  crm:            { Icon: ServiceSupportIcon, accent: '#14B8A6' },
  management:     { Icon: ManagementCatIcon,  accent: '#EC4899' },
  manufacturing:  { Icon: EngineeringCatIcon, accent: '#8B5CF6' },
  logistics:      { Icon: TechnicianCatIcon,  accent: '#F59E0B' },
  support:        { Icon: OthersCatIcon,      accent: '#64748B' },
};

const DEFAULT_CATEGORY_STYLE = { Icon: OthersCatIcon, accent: '#64748B' };


const JOB_SEEKER_FEATURES = [
  {
    icon: FileText,
    title: 'Build your Automotive Resume',
    sub: 'Tailored templates for dealerships, workshops & OEMs',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: Bell,
    title: 'Smart Job Alerts',
    sub: 'Get notified instantly for matching openings near you',
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: Building2,
    title: 'Company Profiles',
    sub: 'Explore ratings, culture & salary data for top employers',
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  {
    icon: Users,
    title: 'Industry Network',
    sub: 'Connect with automotive professionals across India',
    color: '#8B5CF6',
    bg: '#F5F3FF',
  },
];

const POPULAR_SEARCHES = ['Service Advisor', 'Mechanic', 'Sales Executive', 'BDE', 'Technician'];

const TRUST_ITEMS = [
  { icon: '🔒', title: 'Verified Employers', desc: 'Every company is manually verified before posting' },
  { icon: '⚡', title: 'Fast Hiring',        desc: 'Average time-to-hire of just 7 days on MotoJobs' },
  { icon: '🎯', title: 'Niche Focused',      desc: '100% automotive — zero noise from unrelated sectors' },
  { icon: '📱', title: 'Mobile Ready',       desc: 'Apply on-the-go from any device, anytime' },
];

const HERO_IMAGE_MASK = [
  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, rgba(0,0,0,0.85) 42%, #000 58%)',
  'linear-gradient(to bottom, transparent 0%, #000 16%, #000 86%, transparent 100%)',
].join(', ');

/* ================================================================
   PAGE
   ================================================================ */

interface HomeJob {
  id: string;
  title: string;
  location: string | null;
  experience: string | null;
  jobType: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  createdAt: string;
  company: { name: string; logo: string | null; isVerified: boolean } | null;
}

interface HomeData {
  stats: { activeJobs: number; companiesHiring: number; jobSeekers: number; postedThisMonth: number };
  categories: Array<{ id: string; label: string; blurb: string | null; count: number }>;
  recentJobs: HomeJob[];
  evJobs: HomeJob[];
  companies: Array<{ id: string; name: string; slug: string | null; logo: string | null; isVerified: boolean; openJobs: number }>;
}


export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    fetch('/api/home')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((json) => { if (live) setData(json); })
      // A failed load leaves every section on its own empty state rather than
      // showing numbers the database has not confirmed.
      .catch(() => {})
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const categories = data?.categories ?? [];
  const recentJobs = data?.recentJobs ?? [];
  const evJobs = data?.evJobs ?? [];
  const companies = data?.companies ?? [];

  return (
    <div className="bg-white min-h-screen">

      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #E8F0FE 55%, #ECF2FF 100%)',
          minHeight: '520px',
        }}
      >
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{ top: 0, right: 0, bottom: 0, width: '58%', zIndex: 1, overflow: 'hidden' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-professionals.png" alt="" aria-hidden
            style={{
              position: 'absolute', inset: 0, height: '100%', width: '100%',
              objectFit: 'cover', objectPosition: 'center 57%',
              mixBlendMode: 'darken',
              WebkitMaskImage: HERO_IMAGE_MASK, maskImage: HERO_IMAGE_MASK,
              WebkitMaskComposite: 'source-in', maskComposite: 'intersect',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
          <div className="max-w-[600px] py-16 lg:py-20">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-1.5 rounded-full" style={{ background: '#E0EAFF', color: '#2563EB', border: '1px solid #C7D7F9' }}>
                ☆ &nbsp;India&apos;s No.1 Automotive Job Portal
              </span>
            </div>
            <h1 className="font-extrabold leading-[1.12] tracking-[-0.03em] mb-5" style={{ fontSize: 'clamp(34px, 4vw, 52px)', color: '#0F172A' }}>
              Find Your Perfect<br />
              <span style={{ background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Automotive Job
              </span>
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '440px' }}>
              Explore thousands of jobs from leading automotive companies and take the next step in your career.
            </p>

            {/* Search bar */}
            <div style={{ display: 'flex', background: 'white', borderRadius: '12px', border: '1.5px solid #DBEAFE', boxShadow: '0 4px 20px rgba(37,99,235,0.12)', maxWidth: '560px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 16px', height: '52px', borderRight: '1px solid #E2E8F0', minWidth: 0 }}>
                <Search style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
                <input type="text" placeholder="Job title, keywords..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', width: '100%' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 16px', height: '52px', minWidth: 0 }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
                <input type="text" placeholder="Location" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', width: '100%' }} />
              </div>
              <Link href="/jobs" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563EB', color: 'white', fontWeight: 600, fontSize: '14.5px', padding: '0 24px', whiteSpace: 'nowrap', flexShrink: 0, textDecoration: 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1D4ED8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
              >Find Jobs</Link>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Popular Searches:</span>
              {POPULAR_SEARCHES.map((tag) => (
                <Link key={tag} href={`/jobs?q=${encodeURIComponent(tag)}`} style={{ fontSize: '12.5px', fontWeight: 500, color: '#2563EB', background: 'white', border: '1px solid #BFDBFE', borderRadius: '999px', padding: '4px 12px', textDecoration: 'none' }}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ height: '60px' }} />
      </section>

      {/* ============================================================
          STATS CARD
          ============================================================ */}
      <section className="relative z-10 -mt-[60px] pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[20px] border border-[#E8EEF8] overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.10)' }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F1F5F9]">
              {STATS.map(({ key, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 px-6 lg:px-8 py-7">
                  <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#2563EB]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="font-extrabold text-[#0F172A] leading-none tracking-[-0.03em]" style={{ fontSize: '28px' }}>
                      {data ? data.stats[key].toLocaleString('en-IN') : loading ? '—' : '0'}
                    </div>
                    <div className="text-[13px] text-[#64748B] mt-1 font-medium">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPULAR JOB CATEGORIES — PREMIUM REDESIGN
          ============================================================ */}
      <section className="py-14" style={{ background: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-1">Browse by Role</p>
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight leading-tight">Popular Job Categories</h2>
              <p className="text-[14px] text-[#64748B] mt-1.5 max-w-md">Find jobs across every specialisation in India&apos;s automobile industry</p>
            </div>
            <Link href="/jobs" className="hidden sm:flex items-center gap-1.5 text-[13.5px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-4 py-2 rounded-[10px] transition-all duration-200 shrink-0">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map(({ id, label, count }) => {
              const { Icon, accent } = CATEGORY_STYLE[id] ?? DEFAULT_CATEGORY_STYLE;
              return (
              <Link
                key={id}
                href={`/jobs?category=${encodeURIComponent(id)}`}
                className="group bg-white border border-[#E8EDF5] rounded-[18px] p-5 flex items-center gap-4 hover:-translate-y-[3px] hover:border-[#BFDBFE] transition-all duration-250 cursor-pointer"
                style={{ boxShadow: '0 2px 10px rgba(15,23,42,0.05)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(15,23,42,0.10)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,23,42,0.05)'; }}
              >
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-250 group-hover:scale-110" style={{ background: `${accent}18`, color: accent }}>
                  <Icon />
                </div>
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold text-[#0F172A] leading-tight group-hover:text-[#2563EB] transition-colors truncate">{label}</p>
                  <p className="text-[12px] text-[#94A3B8] mt-0.5 font-medium">
                    {count === 0 ? 'No openings yet' : `${count.toLocaleString('en-IN')} ${count === 1 ? 'Job' : 'Jobs'}`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all duration-200 shrink-0 ml-auto" />
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          RECENT JOBS + FOR JOB SEEKERS — PREMIUM REDESIGN
          ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Recent Jobs ── */}
            <div className="lg:col-span-2">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-1">Latest Openings</p>
                  <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight">Recent Jobs</h2>
                </div>
                <Link href="/jobs" className="flex items-center gap-1 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-white border border-[#E8EDF5] rounded-[20px] overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}>
                <div className="divide-y divide-[#F8FAFC]">
                  {loading ? (
                    <div className="px-5 py-10 text-center text-[13px] text-[#94A3B8]">Loading…</div>
                  ) : recentJobs.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className="text-[14px] font-semibold text-[#0F172A]">No openings live right now</p>
                      <p className="text-[12.5px] text-[#64748B] mt-1">
                        New roles appear here the moment an employer posts one.
                      </p>
                    </div>
                  ) : recentJobs.map((job) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F8FAFD] transition-colors duration-150 group">
                      <div className="w-11 h-11 rounded-[12px] flex items-center justify-center text-[13px] font-bold shrink-0 group-hover:scale-105 transition-transform duration-200" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                        {initials(job.company?.name ?? 'Company')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-[14px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">{job.title}</h3>
                          {job.company?.isVerified && <span className="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669]">Verified</span>}
                        </div>
                        <p className="text-[12.5px] text-[#64748B] mb-1.5">{job.company?.name ?? 'Company'}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1 text-[11.5px] text-[#94A3B8]"><MapPin className="w-3 h-3" />{job.location || 'India'}</span>
                          {job.experience && <span className="flex items-center gap-1 text-[11.5px] text-[#94A3B8]"><Briefcase className="w-3 h-3" />{job.experience}</span>}
                          <span className="text-[11.5px] font-semibold text-[#059669]">{salaryRangeLabel(job.minSalary, job.maxSalary)}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {job.jobType && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] block mb-1.5">{job.jobType}</span>}
                        <span className="text-[11px] text-[#94A3B8]">{postedAgo(job.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-[#F1F5F9] bg-[#FAFBFF]">
                  <Link href="/jobs" className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                    Browse All Jobs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── RIGHT: For Job Seekers ── */}
            <div>
              <div className="mb-5">
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-1">Career Tools</p>
                <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight">For Job Seekers</h2>
              </div>
              <div className="space-y-3">
                {JOB_SEEKER_FEATURES.map(({ icon: Icon, title, sub, color, bg }) => (
                  <div
                    key={title}
                    className="group bg-white border border-[#E8EDF5] rounded-[16px] p-4 flex items-start gap-3.5 hover:-translate-y-[2px] hover:border-[#BFDBFE] cursor-pointer transition-all duration-200"
                    style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(15,23,42,0.09)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(15,23,42,0.04)'; }}
                  >
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-200" style={{ background: bg, color }}>
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-0.5">{title}</p>
                      <p className="text-[12px] text-[#64748B] leading-snug">{sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#CBD5E1] group-hover:text-[#2563EB] shrink-0 ml-auto mt-1 group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                ))}
                <Link href="/register?role=candidate" className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] py-3.5 rounded-[14px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-1" style={{ boxShadow: '0 4px 14px rgba(37,99,235,0.30)' }}>
                  <Users className="w-4 h-4" />
                  Create Free Profile
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          TOP COMPANIES HIRING
          ============================================================ */}
      <section className="py-14" style={{ background: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-1">Trusted Employers</p>
              <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight">Top Companies Hiring</h2>
              <p className="text-[14px] text-[#64748B] mt-1.5">India&apos;s leading automobile employers actively recruiting</p>
            </div>
            <Link href="/companies" className="hidden sm:flex items-center gap-1.5 text-[13.5px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] bg-[#EFF6FF] hover:bg-[#DBEAFE] px-4 py-2 rounded-[10px] transition-all duration-200 shrink-0">
              All Companies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {companies.length === 0 ? (
            <div className="bg-white border border-[#E8EDF5] rounded-[18px] py-12 text-center">
              <p className="text-[14px] font-semibold text-[#0F172A]">
                {loading ? 'Loading…' : 'No employers hiring yet'}
              </p>
              {!loading && (
                <p className="text-[12.5px] text-[#64748B] mt-1">
                  Companies appear here once they have a live opening.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {companies.map((c) => (
                <CompanyCard
                  key={c.id}
                  href={c.slug ? `/companies/${c.slug}` : `/companies?search=${encodeURIComponent(c.name)}`}
                  name={c.name}
                  jobs={c.openJobs}
                  logo={c.logo}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          EV SECTOR SPOTLIGHT
          ============================================================ */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] overflow-hidden" style={{ background: 'linear-gradient(135deg,#0F2D58 0%,#1E3A8A 60%,#1D4ED8 100%)' }}>
            <div className="px-8 py-10 md:flex items-start gap-10">
              <div className="flex-1 min-w-0 mb-8 md:mb-0">
                <span className="inline-block bg-[#22D3EE]/20 border border-[#22D3EE]/30 text-[#67E8F9] text-[11px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mb-4">⚡ EV Revolution</span>
                <h2 className="text-[26px] sm:text-[32px] font-bold text-white leading-tight mb-3">
                  India&apos;s EV Sector is<br />Hiring at Record Pace
                </h2>
                <p className="text-[14px] text-[#93C5FD] leading-[1.7] mb-6 max-w-md">
                  Over 2,000 EV-specific roles added in 2026. From battery engineers to charging-infra technicians — the future is electric.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/jobs?category=ev" className="flex items-center gap-2 bg-white text-[#1D4ED8] font-bold text-[13.5px] px-5 py-2.5 rounded-[12px] hover:bg-[#EFF6FF] transition-all duration-200 hover:scale-[1.02]">⚡ Browse EV Jobs</Link>
                  <Link href="/blog/ev-technician-skills-2026" className="flex items-center gap-2 border border-white/30 text-white font-semibold text-[13.5px] px-5 py-2.5 rounded-[12px] hover:bg-white/10 transition-all duration-200">EV Career Guide →</Link>
                </div>
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evJobs.length === 0 ? (
                  <div className="sm:col-span-2 bg-white/10 border border-white/20 rounded-[16px] p-6 text-center">
                    <p className="text-[13.5px] font-semibold text-white">No EV roles live right now</p>
                    <p className="text-[12px] text-[#93C5FD] mt-1">
                      Check back soon — EV openings are added as employers post them.
                    </p>
                  </div>
                ) : evJobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-[16px] p-4 transition-all duration-200 hover:-translate-y-[2px] group block">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-[13.5px] font-bold text-white leading-tight group-hover:text-[#67E8F9] transition-colors">{job.title}</p>
                      {job.jobType && <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#67E8F9] ml-2">{job.jobType}</span>}
                    </div>
                    <p className="text-[12px] text-[#93C5FD] mb-1">{job.company?.name ?? 'Company'}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-[#94A3B8]"><MapPin className="w-3 h-3" />{job.location || 'India'}</span>
                      <span className="text-[11.5px] font-semibold text-[#34D399]">{salaryRangeLabel(job.minSalary, job.maxSalary)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          INDUSTRY INSIGHTS
          ============================================================ */}
      <section className="py-14" style={{ background: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#2563EB] mb-2">Market Pulse</p>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#0F172A] tracking-tight mb-2">Automobile Industry Insights</h2>
            <p className="text-[14px] text-[#64748B] max-w-lg mx-auto">Real data from India&apos;s automotive job market — updated monthly</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { emoji: '📈', stat: '38%',   label: 'Growth in EV jobs',        sub: 'Year-over-year 2025→2026',    color: '#10B981' },
              { emoji: '💰', stat: '₹4.2L', label: 'Avg. Technician Salary',   sub: 'Median across tier-1 cities', color: '#F59E0B' },
              { emoji: '⏱️', stat: '7 Days', label: 'Avg. Hiring Timeline',    sub: 'From apply to offer',         color: '#3B82F6' },
              { emoji: '🏙️', stat: '120+',  label: 'Cities with Openings',     sub: 'Metro & tier-2 markets',      color: '#8B5CF6' },
            ].map(({ emoji, stat, label, sub, color }) => (
              <div key={label} className="bg-white border border-[#E8EDF5] rounded-[20px] p-6 hover:-translate-y-[3px] transition-all duration-250"
                style={{ boxShadow: '0 2px 10px rgba(15,23,42,0.05)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(15,23,42,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(15,23,42,0.05)'; }}
              >
                <div className="text-3xl mb-3">{emoji}</div>
                <div className="text-[32px] font-extrabold leading-none tracking-tight mb-1" style={{ color }}>{stat}</div>
                <p className="text-[14px] font-bold text-[#0F172A] mb-0.5">{label}</p>
                <p className="text-[12px] text-[#94A3B8]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          WHY MOTOJOBS — TRUST STRIP
          ============================================================ */}
      <section className="py-12 bg-white border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-[22px] font-bold text-[#0F172A] tracking-tight">Why professionals choose MotoJobs</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_ITEMS.map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-6 bg-[#F7F9FC] rounded-[18px] hover:bg-[#EFF6FF] transition-colors duration-200">
                <div className="text-[36px] mb-3">{icon}</div>
                <p className="text-[14px] font-bold text-[#0F172A] mb-1">{title}</p>
                <p className="text-[12.5px] text-[#64748B] leading-snug">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
