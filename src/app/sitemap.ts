import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// DATABASE_URL is injected by App Runner at runtime, not at docker build, so
// this route must never be prerendered during the image build.
export const dynamic = "force-dynamic";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/jobs", changeFrequency: "hourly", priority: 0.9 },
  { path: "/companies", changeFrequency: "daily", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.6 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.4 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // A sitemap that 500s tells a crawler to back off entirely, so a database
  // blip degrades to the static routes above rather than failing the response.
  try {
    const [jobs, companies, posts] = await Promise.all([
      prisma.job.findMany({
        where: { status: "APPROVED" },
        select: { id: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 10000,
      }),
      prisma.company.findMany({
        where: { isProfileComplete: true, slug: { not: null } },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 5000,
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 2000,
      }),
    ]);

    for (const post of posts) {
      entries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }

    for (const job of jobs) {
      entries.push({
        url: `${SITE_URL}/jobs/${job.id}`,
        lastModified: job.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    for (const company of companies) {
      entries.push({
        url: `${SITE_URL}/company/${company.slug}`,
        lastModified: company.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("sitemap: database query failed", error);
  }

  return entries;
}
