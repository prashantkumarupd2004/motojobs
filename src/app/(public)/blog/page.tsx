import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, PenLine } from 'lucide-react';
import { BLOG_POSTS, formatPostDate } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Automobile Career Advice & Hiring Insights',
  description:
    'Interview prep, resume tips, EV skills and hiring guides for the Indian automobile industry — written for technicians, service advisors, sales consultants and the people who hire them.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Automobile Career Advice & Hiring Insights',
    description:
      'Interview prep, resume tips, EV skills and hiring guides for the Indian automobile industry.',
    url: '/blog',
  },
};

export default function BlogPage() {
  const [lead, ...rest] = BLOG_POSTS;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-20">
      <div className="max-w-2xl">
        <h1 className="text-[34px] sm:text-[42px] font-extrabold text-ink tracking-[-0.04em] leading-[1.1]">
          Career advice for the auto trade
        </h1>
        <p className="text-ink-muted text-[16px] leading-[1.75] mt-4">
          Interview prep, resume tips and hiring guides — written for people who work in
          dealerships, workshops, OEMs and EV companies.
        </p>
      </div>

      <Link
        href={`/blog/${lead.slug}`}
        className="surface sheen p-8 sm:p-10 mt-12 block hover:-translate-y-1 hover:shadow-e4 transition-all duration-400 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
      >
        <span className="inline-block bg-ignite-50 border border-ignite-500/20 text-ignite-600 text-[11.5px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
          {lead.category}
        </span>
        <h2 className="text-[26px] sm:text-[32px] font-extrabold text-ink tracking-[-0.035em] leading-[1.2] mt-5 max-w-3xl">
          {lead.title}
        </h2>
        <p className="text-ink-muted text-[15.5px] leading-[1.75] mt-4 max-w-2xl">
          {lead.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7 text-[13px] font-medium text-ink-faint">
          <span className="inline-flex items-center gap-1.5">
            <PenLine className="w-3.5 h-3.5" />
            {lead.author}
          </span>
          <span>{formatPostDate(lead.publishedAt)}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {lead.readMinutes} min read
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="surface sheen p-7 flex flex-col hover:-translate-y-1 hover:shadow-e4 transition-all duration-400 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
          >
            <span className="inline-block self-start bg-brand-50 border border-brand-200 text-brand-700 text-[11.5px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full">
              {post.category}
            </span>
            <h2 className="text-[18px] font-bold text-ink tracking-[-0.025em] leading-[1.35] mt-5">
              {post.title}
            </h2>
            <p className="text-ink-muted text-[14px] leading-[1.7] mt-3 flex-1">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-4 mt-6 pt-5 border-t border-line text-[12.5px] font-medium text-ink-faint">
              <span>{formatPostDate(post.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readMinutes} min
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
