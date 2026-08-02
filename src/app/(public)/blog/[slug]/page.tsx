import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, PenLine } from 'lucide-react';
import { BLOG_POSTS, formatPostDate, getPost } from '@/lib/blog';

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-10 py-12 lg:py-16">
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-ink-muted hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All articles
      </Link>

      <span className="inline-block bg-ignite-50 border border-ignite-500/20 text-ignite-600 text-[11.5px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full mt-8">
        {post.category}
      </span>

      <h1 className="text-[32px] sm:text-[40px] font-extrabold text-ink tracking-[-0.04em] leading-[1.15] mt-5">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 pb-8 border-b border-line text-[13px] font-medium text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <PenLine className="w-3.5 h-3.5" />
          {post.author}
        </span>
        <span>{formatPostDate(post.publishedAt)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {post.readMinutes} min read
        </span>
      </div>

      <div className="mt-9">
        {post.body.map((block) =>
          block.startsWith('## ') ? (
            <h2
              key={block}
              className="text-[21px] font-bold text-ink tracking-[-0.03em] mt-10 mb-1"
            >
              {block.slice(3)}
            </h2>
          ) : (
            <p key={block} className="text-ink-soft text-[16px] leading-[1.85] mt-5">
              {block}
            </p>
          )
        )}
      </div>

      <div className="surface sheen p-8 mt-14 text-center">
        <h2 className="text-[20px] font-extrabold text-ink tracking-[-0.03em]">
          Ready to find your next role?
        </h2>
        <p className="text-ink-muted text-[14.5px] leading-[1.7] mt-2.5">
          Browse verified automobile jobs across India — free for job seekers, always.
        </p>
        <Link
          href="/jobs"
          className="inline-block mt-6 grad-brand text-white font-semibold text-[15px] rounded-[14px] px-7 py-3.5 shadow-brand hover:-translate-y-0.5 hover:shadow-e4 transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        >
          Browse auto jobs
        </Link>
      </div>

      <section className="mt-14">
        <h2 className="text-[17px] font-bold text-ink tracking-[-0.025em] mb-5">
          Keep reading
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {related.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="surface p-6 hover:-translate-y-0.5 hover:shadow-e3 transition-all duration-300"
            >
              <h3 className="text-[15.5px] font-bold text-ink tracking-[-0.02em] leading-[1.4]">
                {p.title}
              </h3>
              <p className="text-ink-muted text-[13.5px] leading-[1.65] mt-2.5 line-clamp-2">
                {p.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
