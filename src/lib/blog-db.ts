import { prisma } from '@/lib/prisma';
import { BLOG_POSTS } from '@/lib/blog';
import type { BlogPost } from '@/lib/blog-types';

/**
 * Server-side blog reads. The `blogs` table is the source of truth; the array in
 * `src/lib/blog.ts` is only the initial content, seeded once so a fresh database
 * does not render an empty blog.
 */

/** Seeded at most once per process — this sits on a public read path. */
let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  try {
    await prisma.blogPost.createMany({
      // `slug` is unique, so skipDuplicates makes this safe to run concurrently
      // and safe to re-run after an admin edits a seeded post.
      skipDuplicates: true,
      data: BLOG_POSTS.map((post) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body.join('\n\n'),
        category: post.category,
        authorName: post.author,
        status: 'PUBLISHED',
        readMinutes: post.readMinutes,
        publishedAt: new Date(post.publishedAt),
      })),
    });
  } catch (error) {
    seeded = false;
    console.error('Blog seed failed:', error);
  }
}

interface Row {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  category: string | null;
  authorName: string | null;
  readMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
}

function toPost(row: Row): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? '',
    category: row.category ?? 'Career Advice',
    author: row.authorName ?? 'Motojobs Editorial',
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString().slice(0, 10),
    readMinutes: row.readMinutes,
    // Blank-line separated in the column, one block per paragraph or heading.
    body: row.body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean),
  };
}

const select = {
  slug: true,
  title: true,
  excerpt: true,
  body: true,
  category: true,
  authorName: true,
  readMinutes: true,
  publishedAt: true,
  createdAt: true,
} as const;

export async function listPosts(): Promise<BlogPost[]> {
  try {
    await ensureSeeded();
    const rows = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 200,
      select,
    });
    return rows.map(toPost);
  } catch (error) {
    console.error('Blog list failed:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    await ensureSeeded();
    const row = await prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select,
    });
    return row ? toPost(row) : null;
  } catch (error) {
    console.error('Blog read failed:', error);
    return null;
  }
}
