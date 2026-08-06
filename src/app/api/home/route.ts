import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeJob } from "@/lib/jobs";
import { getTaxonomy } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

/**
 * Everything the homepage needs in one round trip: headline counts, category
 * counts, the latest live jobs and the companies hiring most.
 *
 * All of it is derived from what is actually in the database — the page used to
 * render invented figures ("5,000+ Active Jobs") next to invented listings,
 * which is a promise the site cannot keep the moment a visitor clicks through.
 */
export async function GET() {
  try {
    const jobWhere = { status: "APPROVED" as const };

    const [
      activeJobs,
      companiesHiring,
      jobSeekers,
      postedThisMonth,
      categories,
      byCategory,
      recentJobs,
      evJobs,
      topCompanies,
    ] = await Promise.all([
      prisma.job.count({ where: jobWhere }),
      prisma.company.count({ where: { jobs: { some: jobWhere } } }),
      prisma.user.count({ where: { role: "CANDIDATE", isActive: true } }),
      prisma.job.count({
        where: {
          ...jobWhere,
          // Rolling 30 days rather than calendar month, so the number does not
          // collapse to near-zero every 1st.
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      getTaxonomy("JOB_CATEGORY"),
      prisma.job.groupBy({
        by: ["category"],
        where: jobWhere,
        _count: { _all: true },
      }),
      prisma.job.findMany({
        where: jobWhere,
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { company: { select: { name: true, logo: true, isVerified: true } } },
      }),
      prisma.job.findMany({
        where: { ...jobWhere, category: "ev" },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { company: { select: { name: true } } },
      }),
      prisma.company.findMany({
        where: { jobs: { some: jobWhere } },
        orderBy: { name: "asc" },
        take: 12,
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          isVerified: true,
          _count: { select: { jobs: { where: jobWhere } } },
        },
      }),
    ]);

    const counts = new Map(byCategory.map((row) => [row.category, row._count._all]));

    return NextResponse.json({
      stats: { activeJobs, companiesHiring, jobSeekers, postedThisMonth },
      // Every category is listed even at zero, so the section keeps its shape
      // on a quiet week instead of reflowing to two tiles.
      categories: categories.map((c) => ({
        id: c.value,
        label: c.label,
        blurb: c.blurb,
        count: counts.get(c.value) ?? 0,
      })),
      recentJobs: recentJobs.map(serializeJob),
      evJobs: evJobs.map(serializeJob),
      companies: topCompanies
        .map(({ _count, ...c }) => ({ ...c, openJobs: _count.jobs }))
        .sort((a, b) => b.openJobs - a.openJobs),
    });
  } catch (error) {
    console.error("Home stats error:", error);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}
