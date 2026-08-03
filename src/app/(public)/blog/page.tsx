'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search, PenLine, Calendar, Clock, Mail, RefreshCw,
} from 'lucide-react';
import { BLOG_POSTS, formatPostDate } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog';

/* ─── Additional posts to fill the grid ─────────────────────── */
const EXTRA_POSTS: BlogPost[] = [
  {
    slug: 'sales-consultant-target-tips',
    title: 'How top-performing sales consultants consistently hit monthly targets',
    excerpt: 'Sustainable target achievement comes from pipeline discipline, not heroic closing. These habits separate consistent performers from streaky ones.',
    category: 'Sales',
    author: 'MotoJobs Editorial',
    publishedAt: '2026-07-18',
    readMinutes: 5,
    body: [],
  },
  {
    slug: 'workshop-manager-career-path',
    title: 'From technician to workshop manager: the career path explained',
    excerpt: 'Most workshop managers began as technicians. The transition requires a deliberate skill shift — here is what that looks like in practice.',
    category: 'Career Growth',
    author: 'MotoJobs Editorial',
    publishedAt: '2026-07-10',
    readMinutes: 6,
    body: [],
  },
  {
    slug: 'oem-vs-dealership-career',
    title: 'OEM vs dealership careers: which path is right for you?',
    excerpt: 'Working for a manufacturer and working for a dealer feel very different day to day. Understanding the trade-offs helps you pick the right starting point.',
    category: 'Career Growth',
    author: 'MotoJobs Editorial',
    publishedAt: '2026-07-02',
    readMinutes: 7,
    body: [],
  },
];

const ALL_POSTS = [...BLOG_POSTS, ...EXTRA_POSTS];

/* ─── Category pill data ────────────────────────────────────── */
const CATEGORIES = [
  'All', 'Interview Prep', 'Resume Tips', 'Career Growth',
  'Technician', 'Sales', 'Service Advisor', 'Workshop', 'OEM', 'EV',
];

/* ─── Image map: slug → hero image ──────────────────────────── */
const IMG_MAP: Record<string, string> = {
  'service-advisor-interview-questions': '/hero-professionals.png',
  'ev-technician-skills-2026':            '/hero-car.png',
  'automobile-resume-mistakes':           '/hero-job.png',
  'dealership-hiring-guide-employers':    '/hero-professionals.png',
  'sales-consultant-target-tips':         '/hero-job.png',
  'workshop-manager-career-path':         '/hero-car.png',
  'oem-vs-dealership-career':             '/hero-professionals.png',
};

/* ─── Category badge colour map ─────────────────────────────── */
const BADGE: Record<string, string> = {
  'Interview Prep': 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
  'Resume Tips':    'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
  'Career Growth':  'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
  'For Employers':  'bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE]',
  'Sales':          'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]',
  'Technician':     'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
  'OEM':            'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]',
  'EV':             'bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]',
};
const badgeCls = (cat: string) =>
  BADGE[cat] ?? 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]';

/* ─── Meta row ───────────────────────────────────────────────── */
function MetaRow({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#94A3B8]">
      <span className="flex items-center gap-1.5">
        <PenLine className="w-3 h-3 shrink-0" />
        {post.author}
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] shrink-0" />
      <span className="flex items-center gap-1.5">
        <Calendar className="w-3 h-3 shrink-0" />
        {formatPostDate(post.publishedAt)}
      </span>
      <span className="w-[3px] h-[3px] rounded-full bg-[#CBD5E1] shrink-0" />
      <span className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 shrink-0" />
        {post.readMinutes} min read
      </span>
    </div>
  );
}

/* ─── Blog card (grid) ───────────────────────────────────────── */
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="bg-white border border-[#E8EDF5] rounded-[20px] overflow-hidden hover:shadow-[0_8px_32px_rgba(15,23,42,0.12)] hover:-translate-y-[3px] transition-all duration-250 flex flex-col group"
    >
      {/* Thumbnail */}
      <div className="relative h-[160px] rounded-t-[20px] overflow-hidden bg-[#F1F5F9] shrink-0">
        <Image
          src={IMG_MAP[post.slug] || '/hero-car.png'}
          alt={post.title}
          fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category badge */}
        <span className={`self-start text-[10.5px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full mb-3 ${badgeCls(post.category)}`}>
          {post.category}
        </span>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-[#0F172A] leading-[1.4] line-clamp-3 group-hover:text-[#2563EB] transition-colors mb-2 flex-1">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-[13px] text-[#64748B] leading-[1.65] line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="border-t border-[#F1F5F9] pt-3">
          <MetaRow post={post} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function BlogPage() {
  const [search,      setSearch]      = useState('');
  const [activeTag,   setActiveTag]   = useState('All');
  const [newsEmail,   setNewsEmail]   = useState('');
  const [subscribed,  setSubscribed]  = useState(false);
  const [visibleCount, setVisible]    = useState(6);

  /* Filter */
  const filtered = ALL_POSTS.filter(p => {
    const matchTag = activeTag === 'All' || p.category === activeTag;
    const matchQ   = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchTag && matchQ;
  });

  const [featured, ...gridPosts] = filtered;
  const visibleGrid = gridPosts.slice(0, visibleCount - 1);
  const hasMore     = gridPosts.length > visibleGrid.length;

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>

      {/* ══════════════════════════════════════
          HERO SECTION — white bg
      ══════════════════════════════════════ */}
      <section className="bg-white border-b border-[#F1F5F9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-14 pb-8">
          <h1 className="text-[42px] sm:text-[52px] lg:text-[56px] font-bold text-[#0F172A] leading-[1.1] tracking-tight max-w-3xl mb-4">
            Career advice for the auto trade
          </h1>
          <p className="text-[15.5px] text-[#64748B] leading-[1.75] max-w-[700px]">
            Interview prep, resume tips and hiring guides — written for people who work in
            dealerships, workshops, OEMs and EV companies.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SEARCH + CATEGORY PILLS
      ══════════════════════════════════════ */}
      <div className="bg-white border-b border-[#F1F5F9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4">
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Search box */}
            <div className="relative shrink-0 w-full sm:w-[420px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Career Advice..."
                className="w-full h-[48px] pl-10 pr-4 border border-[#E5E7EB] rounded-[12px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] bg-white outline-none shadow-[0_1px_4px_rgba(15,23,42,0.06)] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] transition-all duration-200"
              />
            </div>

            {/* Scrollable pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 flex-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTag(cat)}
                  className={`shrink-0 px-4 py-[7px] rounded-full text-[13px] font-semibold border transition-all duration-200 whitespace-nowrap ${
                    activeTag === cat
                      ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-[0_2px_8px_rgba(37,99,235,0.25)]'
                      : 'bg-white text-[#475569] border-[#E5E7EB] hover:border-[#2563EB] hover:text-[#2563EB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8">

        {/* No results */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[16px] font-semibold text-[#475569] mb-2">No articles found</p>
            <p className="text-[14px] text-[#94A3B8]">Try a different keyword or category.</p>
          </div>
        )}

        {/* ── FEATURED ARTICLE ── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="block bg-white border border-[#E8EDF5] rounded-[24px] overflow-hidden hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)] hover:-translate-y-[3px] transition-all duration-250 mb-7 group"
          >
            <div className="flex flex-col md:flex-row h-auto md:h-[290px]">
              {/* Image */}
              <div className="relative w-full md:w-[360px] h-[220px] md:h-full shrink-0 overflow-hidden bg-[#F1F5F9]">
                <Image
                  src={IMG_MAP[featured.slug] || '/hero-professionals.png'}
                  alt={featured.title}
                  fill className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 p-7 md:p-9 flex flex-col justify-center">
                <span className={`self-start text-[11px] font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full mb-4 ${badgeCls(featured.category)}`}>
                  {featured.category}
                </span>
                <h2 className="text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#0F172A] leading-[1.2] tracking-tight mb-3 group-hover:text-[#2563EB] transition-colors line-clamp-3">
                  {featured.title}
                </h2>
                <p className="text-[14.5px] text-[#64748B] leading-[1.7] line-clamp-2 mb-5">
                  {featured.excerpt}
                </p>
                <MetaRow post={featured} />
              </div>
            </div>
          </Link>
        )}

        {/* ── GRID ── */}
        {visibleGrid.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] mb-8">
            {visibleGrid.map(post => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* ── LOAD MORE ── */}
        {hasMore && (
          <div className="flex justify-center mt-2 mb-10">
            <button
              onClick={() => setVisible(v => v + 3)}
              className="flex items-center gap-2 px-7 py-[11px] border-2 border-[#2563EB] text-[#2563EB] text-[14px] font-semibold rounded-full hover:bg-[#2563EB] hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_1px_6px_rgba(37,99,235,0.10)]"
            >
              <RefreshCw className="w-4 h-4" />
              Load More Articles
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════
            NEWSLETTER SECTION
        ══════════════════════════════════════ */}
        <div className="bg-white border border-[#E8EDF5] rounded-[24px] px-8 py-8 shadow-[0_2px_12px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mt-4">
          {/* Left: icon + text */}
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-[#0F172A] leading-tight mb-1">
                Stay Updated with Career Advice
              </p>
              <p className="text-[13.5px] text-[#64748B] leading-snug">
                Get weekly automotive career insights, interview tips and industry updates.
              </p>
            </div>
          </div>

          {/* Right: email input + button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {subscribed ? (
              <div className="flex items-center gap-2 text-[#10B981] font-semibold text-[14px]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                You&apos;re subscribed!
              </div>
            ) : (
              <>
                <input
                  type="email" value={newsEmail}
                  onChange={e => setNewsEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="h-[44px] w-full sm:w-[260px] border border-[#E5E7EB] rounded-[10px] px-4 text-[13.5px] text-[#0F172A] placeholder-[#94A3B8] bg-white outline-none focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] transition-all duration-200"
                />
                <button
                  onClick={() => { if (newsEmail) { setSubscribed(true); setTimeout(() => setSubscribed(false), 4000); setNewsEmail(''); } }}
                  className="h-[44px] px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13.5px] font-semibold rounded-[10px] shrink-0 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
                >
                  Subscribe
                </button>
              </>
            )}
          </div>

          {/* Decorative illustration (right on large screens) */}
          <div className="hidden xl:block shrink-0 relative w-[100px] h-[80px] opacity-70">
            <Image src="/hero-professionals.png" alt="" fill className="object-cover rounded-[12px]" />
          </div>
        </div>
      </div>

      {/* scrollbar hide utility */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
