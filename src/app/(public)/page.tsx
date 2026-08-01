'use client';
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

/* ================================================================
   COMPANY CARD — 3D hover card component
   ================================================================ */
function CompanyCard({
  href,
  name,
  jobs,
  logo,
  bg,
  border,
  fill = false,
}: {
  href: string;
  name: string;
  jobs: string;
  logo: string;
  bg: string;
  border: string;
  /** true for logos that ship as a full-bleed colored tile rather than art on transparency */
  fill?: boolean;
}) {
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
        style={{ background: bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt={`${name} logo`}
          width={56}
          height={56}
          loading="lazy"
          style={
            fill
              ? { width: '100%', height: '100%', objectFit: 'cover' }
              : { width: '82%', height: '82%', objectFit: 'contain' }
          }
        />
      </div>
      <p className="text-[11.5px] font-semibold text-[#0F172A] leading-tight mb-0.5">{name}</p>
      <p className="text-[10.5px] text-[#94A3B8]">{jobs} Jobs</p>
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
  { value: '5,000+',  label: 'Active Jobs',         icon: Briefcase },
  { value: '1,200+',  label: 'Companies Hiring',    icon: Building2 },
  { value: '25,000+', label: 'Job Seekers',         icon: Users },
  { value: '3,500+',  label: 'Jobs Posted Monthly', icon: FileText },
];

const CATEGORIES = [
  { id: 'sales',       label: 'Sales & Marketing',   count: '1,250', Icon: SalesMarketingIcon },
  { id: 'service',     label: 'Service & Support',   count: '1,150', Icon: ServiceSupportIcon },
  { id: 'technician',  label: 'Technicians',         count: '950',   Icon: TechnicianCatIcon },
  { id: 'engineering', label: 'Engineering',         count: '750',   Icon: EngineeringCatIcon },
  { id: 'body-shop',   label: 'Body Shop',           count: '450',   Icon: BodyShopCatIcon },
  { id: 'parts',       label: 'Parts & Accessories', count: '400',   Icon: PartsCatIcon },
  { id: 'management',  label: 'Management',          count: '300',   Icon: ManagementCatIcon },
  { id: 'others',      label: 'Others',              count: '800',   Icon: OthersCatIcon },
];

const RECENT_JOBS = [
  {
    id: '1',
    title: 'Service Advisor',
    company: 'Tata Motors',
    companyShort: 'TM',
    logoColor: '#1D4ED8',
    logoBg: '#EFF6FF',
    location: 'Mumbai, Maharashtra',
    experience: '2-4 Yrs',
    salary: '₹ 3-5 LPA',
    type: 'Full Time',
    posted: '2h ago',
  },
  {
    id: '2',
    title: 'Automobile Technician',
    company: 'Mahindra & Mahindra',
    companyShort: 'MM',
    logoColor: '#DC2626',
    logoBg: '#FEF2F2',
    location: 'Pune, Maharashtra',
    experience: '1-3 Yrs',
    salary: '₹ 2-4 LPA',
    type: 'Full Time',
    posted: '5h ago',
  },
  {
    id: '3',
    title: 'Sales Executive',
    company: 'Maruti Suzuki',
    companyShort: 'MS',
    logoColor: '#475569',
    logoBg: '#F8FAFC',
    location: 'Delhi, NCR',
    experience: '0-2 Yrs',
    salary: '₹ 2.5-4 LPA',
    type: 'Full Time',
    posted: '1d ago',
  },
];

const JOB_SEEKER_FEATURES = [
  {
    icon: FileText,
    title: 'Create Professional Resume',
    sub: 'Build your resume in minutes',
  },
  {
    icon: Bell,
    title: 'Get Job Alerts',
    sub: 'Receive relevant job notifications',
  },
  {
    icon: Building2,
    title: 'Top Companies Hiring',
    sub: 'Explore leading automotive companies',
  },
];

const COMPANIES = [
  { name: 'Maruti Suzuki', href: '/companies?q=Maruti+Suzuki', jobs: '180+', logo: '/logos/marutisuzuki.png', bg: '#FFFFFF', border: '#BFDBFE' },
  { name: 'Tata Motors',   href: '/companies?q=Tata+Motors',   jobs: '140+', logo: '/logos/tatamotors.png',   bg: '#FFFFFF', border: '#C7D2FE', fill: true },
  { name: 'Mahindra',      href: '/companies?q=Mahindra',      jobs: '120+', logo: '/logos/mahindra.png',     bg: '#FFFFFF', border: '#FECACA', fill: true },
  { name: 'Hyundai India', href: '/companies?q=Hyundai',       jobs: '95+',  logo: '/logos/hyundai.png',      bg: '#FFFFFF', border: '#DDD6FE' },
  { name: 'Ather Energy',  href: '/companies?q=Ather+Energy',  jobs: '75+',  logo: '/logos/atherenergy.png',  bg: '#FFFFFF', border: '#BBF7D0', fill: true },
  { name: 'Hero MotoCorp', href: '/companies?q=Hero+MotoCorp', jobs: '110+', logo: '/logos/heromotocorp.png', bg: '#FFFFFF', border: '#FECACA' },
  { name: 'TVS Motor',     href: '/companies?q=TVS+Motor',     jobs: '88+',  logo: '/logos/tvsmotor.png',     bg: '#FFFFFF', border: '#BFDBFE' },
  { name: 'Bajaj Auto',    href: '/companies?q=Bajaj+Auto',    jobs: '92+',  logo: '/logos/bajajauto.png',    bg: '#FFFFFF', border: '#FED7AA' },
];

const POPULAR_SEARCHES = ['Service Advisor', 'Mechanic', 'Sales Executive', 'BDE', 'Technician'];

// Fades the photo out on every edge so no rectangular boundary shows against the hero gradient.
const HERO_IMAGE_MASK = [
  'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.35) 22%, rgba(0,0,0,0.85) 42%, #000 58%)',
  'linear-gradient(to bottom, transparent 0%, #000 16%, #000 86%, transparent 100%)',
].join(', ');

/* ================================================================
   PAGE
   ================================================================ */

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen">

      {/* ============================================================
          HERO
          ============================================================ */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #EEF4FF 0%, #E8F0FE 55%, #ECF2FF 100%)',
          minHeight: '520px',
        }}
      >
        {/* ── Full-section professionals image — absolutely positioned, right side ── */}
        <div
          className="hidden lg:block absolute pointer-events-none"
          style={{
            top: 0,
            right: 0,
            bottom: 0,
            width: '58%',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-professionals.png"
            alt=""
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              // crops the photo's empty top sky and the blank strip under the feet
              objectPosition: 'center 57%',
              // 'darken' keeps the near-white photo backdrop from washing over the section tint
              mixBlendMode: 'darken',
              WebkitMaskImage: HERO_IMAGE_MASK,
              maskImage: HERO_IMAGE_MASK,
              WebkitMaskComposite: 'source-in',
              maskComposite: 'intersect',
            }}
          />
        </div>

        {/* ── Text content ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 10 }}>
          <div className="max-w-[600px] py-16 lg:py-20">

            {/* Badge */}
            <div className="mb-6">
              <span
                className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-1.5 rounded-full"
                style={{
                  background: '#E0EAFF',
                  color: '#2563EB',
                  border: '1px solid #C7D7F9',
                }}
              >
                ☆ &nbsp;India&apos;s No.1 Automotive Job Portal
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold leading-[1.12] tracking-[-0.03em] mb-5"
              style={{ fontSize: 'clamp(34px, 4vw, 52px)', color: '#0F172A' }}
            >
              Find Your Perfect<br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Automotive Job
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '32px', maxWidth: '440px' }}>
              Explore thousands of jobs from leading automotive companies
              and take the next step in your career.
            </p>

            {/* Search bar */}
            <div
              style={{
                display: 'flex',
                background: 'white',
                borderRadius: '12px',
                border: '1.5px solid #DBEAFE',
                boxShadow: '0 4px 20px rgba(37,99,235,0.12)',
                maxWidth: '560px',
                overflow: 'hidden',
              }}
            >
              {/* Job title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 16px', height: '52px', borderRight: '1px solid #E2E8F0', minWidth: 0 }}>
                <Search style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Job title, keywords..."
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', width: '100%' }}
                />
              </div>
              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, padding: '0 16px', height: '52px', minWidth: 0 }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#94A3B8', flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Location"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '14px', color: '#0F172A', width: '100%' }}
                />
              </div>
              {/* Button */}
              <Link
                href="/jobs"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#2563EB', color: 'white',
                  fontWeight: 600, fontSize: '14.5px',
                  padding: '0 24px', whiteSpace: 'nowrap',
                  flexShrink: 0, textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1D4ED8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#2563EB'; }}
              >
                Find Jobs
              </Link>
            </div>

            {/* Popular Searches */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>Popular Searches:</span>
              {POPULAR_SEARCHES.map((tag) => (
                <Link
                  key={tag}
                  href={`/jobs?q=${encodeURIComponent(tag)}`}
                  style={{
                    fontSize: '12.5px', fontWeight: 500,
                    color: '#2563EB', background: 'white',
                    border: '1px solid #BFDBFE', borderRadius: '999px',
                    padding: '4px 12px', textDecoration: 'none',
                    transition: 'background 0.15s',
                  }}
                >
                  {tag}
                </Link>
              ))}
            </div>

          </div>
        </div>

        {/* Bottom spacer for stats card overlap */}
        <div style={{ height: '60px' }} />
      </section>




      {/* ============================================================
          STATS CARD — white card overlapping hero bottom
          ============================================================ */}
      <section className="relative z-10 -mt-[60px] pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[20px] border border-[#E8EEF8] overflow-hidden"
            style={{ boxShadow: '0 8px 32px rgba(15,23,42,0.10)' }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#F1F5F9]">
              {STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-4 px-6 lg:px-8 py-7">
                  <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#2563EB]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div
                      className="font-extrabold text-[#0F172A] leading-none tracking-[-0.03em]"
                      style={{ fontSize: '28px', fontFamily: 'var(--font-sora), sans-serif' }}
                    >
                      {value}
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
          POPULAR JOB CATEGORIES
          ============================================================ */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-bold text-[#0F172A] tracking-[-0.02em]">
              Popular Job Categories
            </h2>
            <Link
              href="/jobs"
              className="flex items-center gap-1 text-[13.5px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-150"
            >
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map(({ id, label, count, Icon }) => (
              <Link
                key={id}
                href={`/jobs?category=${encodeURIComponent(id)}`}
                className="group flex flex-col items-center text-center bg-white border border-[#E2E8F0] rounded-[16px] px-2 py-5 hover:border-[#BFDBFE] hover:-translate-y-1 transition-all duration-250 cursor-pointer"
                style={{ boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.10)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)';
                }}
              >
                <div className="w-12 h-12 rounded-[12px] bg-[#EFF6FF] flex items-center justify-center mb-3 group-hover:bg-[#2563EB] transition-all duration-250">
                  <div className="text-[#2563EB] group-hover:text-white transition-colors duration-250">
                    <Icon />
                  </div>
                </div>
                <p className="text-[12.5px] font-semibold text-[#0F172A] mb-1 leading-tight group-hover:text-[#2563EB] transition-colors duration-150">
                  {label}
                </p>
                <p className="text-[11.5px] text-[#94A3B8]">{count} Jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TWO-COLUMN: RECENT JOBS + JOB SEEKERS CTA
          ============================================================ */}
      <section className="py-8 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT: Recent Jobs ── */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden"
                style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
                  <h2 className="text-[17px] font-bold text-[#0F172A] tracking-[-0.02em]">Recent Jobs</h2>
                  <Link href="/jobs" className="flex items-center gap-1 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-150">
                    View All Jobs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="divide-y divide-[#F8FAFC]">
                  {RECENT_JOBS.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      className="flex items-center gap-4 px-6 py-5 hover:bg-[#F8FAFC] transition-colors duration-150 group"
                    >
                      <div
                        className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[13px] font-bold shrink-0"
                        style={{ background: job.logoBg, color: job.logoColor }}
                      >
                        {job.companyShort}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-[14.5px] font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors duration-150">
                            {job.title}
                          </h3>
                          <span className="text-[11.5px] text-[#94A3B8] shrink-0 mt-0.5">{job.posted}</span>
                        </div>
                        <p className="text-[12.5px] text-[#64748B] mb-2">{job.company}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="flex items-center gap-1 text-[12px] text-[#64748B]">
                            <MapPin className="w-3 h-3 text-[#94A3B8]" />{job.location}
                          </span>
                          <span className="flex items-center gap-1 text-[12px] text-[#64748B]">
                            <Briefcase className="w-3 h-3 text-[#94A3B8]" />{job.experience}
                          </span>
                          <span className="flex items-center gap-1 text-[12px] text-[#64748B]">
                            <span className="text-[#94A3B8] text-[10px]">₹</span>{job.salary}
                          </span>
                          <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{ background: '#EFF6FF', color: '#2563EB' }}
                          >
                            {job.type}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-[#F1F5F9] text-center">
                  <Link href="/jobs" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors duration-150">
                    View All Jobs <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* ── RIGHT: For Job Seekers ── */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#E2E8F0] rounded-[20px] overflow-hidden h-full flex flex-col"
                style={{ boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}
              >
                <div className="px-6 py-4 border-b border-[#F1F5F9]">
                  <h2 className="text-[17px] font-bold text-[#0F172A] tracking-[-0.02em]">For Job Seekers</h2>
                </div>

                <div className="divide-y divide-[#F8FAFC] flex-1">
                  {JOB_SEEKER_FEATURES.map(({ icon: Icon, title, sub }) => (
                    <div key={title} className="flex items-start gap-3.5 px-6 py-5">
                      <div className="w-9 h-9 rounded-[10px] bg-[#EFF6FF] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-[#2563EB]" strokeWidth={1.8} />
                      </div>
                      <div>
                        <p className="text-[13.5px] font-semibold text-[#0F172A] mb-0.5">{title}</p>
                        <p className="text-[12px] text-[#64748B]">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5">
                  <Link
                    href="/register?role=candidate"
                    className="w-full flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[14px] py-3.5 rounded-[12px] transition-all duration-200"
                    style={{ boxShadow: '0 2px 8px rgba(37,99,235,0.25)' }}
                  >
                    <Users className="w-4 h-4" />
                    Register Now
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          TOP COMPANIES HIRING — Real SVG logos + 3D cards
          ============================================================ */}
      <section className="py-14 bg-[#F8FAFC] border-t border-[#F1F5F9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-[22px] font-bold text-[#0F172A] tracking-[-0.02em] mb-1">
              Top Companies Hiring
            </h2>
            <p className="text-[13.5px] text-[#64748B]">Trusted by India&apos;s leading automobile employers</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {COMPANIES.map((c) => (
              <CompanyCard key={c.name} {...c} />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
