/** Shared blog shape and formatting, safe to import from client components. */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readMinutes: number;
  /** Paragraphs and `## ` headings, rendered by the post page. */
  body: string[];
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
