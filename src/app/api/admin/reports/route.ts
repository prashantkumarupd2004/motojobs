import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { csvResponse, requireAdmin, serverError, toCsv } from "@/lib/admin";

/**
 * Platform-wide reporting. Every figure is counted in the database — the page
 * this replaces rendered six hardcoded arrays, so its charts were decorative.
 */

/** Month buckets, oldest first, as `YYYY-MM` keys with a display label. */
function monthBuckets(count: number) {
  const buckets: Array<{ key: string; label: string; start: Date; end: Date }> = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
    buckets.push({
      key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
      label: start.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
      start,
      end,
    });
  }
  return buckets;
}

/** Groups timestamps into the supplied month buckets. */
function bucketise(dates: Date[], buckets: ReturnType<typeof monthBuckets>) {
  return buckets.map((b) => ({
    label: b.label,
    value: dates.filter((d) => d >= b.start && d < b.end).length,
  }));
}

function tally(values: Array<string | null | undefined>, take: number) {
  const counts = new Map<string, number>();
  for (const raw of values) {
    const key = raw?.trim() || "Not specified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, take);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const months = Math.min(24, Math.max(3, Number(params.get("months")) || 6));
    const buckets = monthBuckets(months);
    const since = buckets[0].start;

    const [
      users,
      jobs,
      applications,
      interviews,
      totals,
      topCompanies,
      applicantCities,
      jobCategories,
    ] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: since }, role: { in: ["CANDIDATE", "RECRUITER"] } },
        select: { createdAt: true, role: true },
      }),
      prisma.job.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      prisma.application.findMany({
        where: { appliedAt: { gte: since } },
        select: { appliedAt: true, status: true },
      }),
      prisma.interview.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      Promise.all([
        prisma.user.count({ where: { role: "CANDIDATE" } }),
        prisma.user.count({ where: { role: "RECRUITER" } }),
        prisma.job.count(),
        prisma.application.count(),
        prisma.application.count({ where: { status: "HIRED" } }),
        prisma.interview.count(),
      ]),
      // Ranked by hires, which is the outcome that matters, not volume.
      prisma.company.findMany({
        take: 200,
        select: {
          id: true,
          name: true,
          city: true,
          _count: { select: { jobs: true } },
          jobs: {
            select: {
              _count: { select: { applications: true } },
              applications: { where: { status: "HIRED" }, select: { id: true } },
            },
          },
        },
      }),
      prisma.application.findMany({
        select: { candidate: { select: { currentCity: true } } },
        take: 5000,
      }),
      prisma.job.groupBy({ by: ["category"], _count: { _all: true } }),
    ]);

    const [totalCandidates, totalEmployers, totalJobs, totalApplications, totalHires, totalInterviews] =
      totals;

    const companies = topCompanies
      .map((c) => ({
        id: c.id,
        name: c.name,
        city: c.city,
        jobs: c._count.jobs,
        applications: c.jobs.reduce((sum, j) => sum + j._count.applications, 0),
        hires: c.jobs.reduce((sum, j) => sum + j.applications.length, 0),
      }))
      .filter((c) => c.jobs > 0)
      .sort((a, b) => b.hires - a.hires || b.applications - a.applications)
      .slice(0, 10);

    if (params.get("export") === "csv") {
      const csv = toCsv(companies, ["name", "city", "jobs", "applications", "hires"]);
      return csvResponse(csv, "top-hiring-companies.csv");
    }

    return NextResponse.json({
      totals: {
        candidates: totalCandidates,
        employers: totalEmployers,
        jobs: totalJobs,
        applications: totalApplications,
        interviews: totalInterviews,
        hires: totalHires,
        // Share of applications that ended in a hire.
        hiringRate:
          totalApplications > 0 ? Math.round((totalHires / totalApplications) * 1000) / 10 : 0,
      },
      series: {
        candidates: bucketise(
          users.filter((u) => u.role === "CANDIDATE").map((u) => u.createdAt),
          buckets
        ),
        employers: bucketise(
          users.filter((u) => u.role === "RECRUITER").map((u) => u.createdAt),
          buckets
        ),
        jobs: bucketise(jobs.map((j) => j.createdAt), buckets),
        applications: bucketise(applications.map((a) => a.appliedAt), buckets),
        interviews: bucketise(interviews.map((i) => i.createdAt), buckets),
      },
      topCompanies: companies,
      topCities: tally(
        applicantCities.map((a) => a.candidate.currentCity),
        10
      ),
      topCategories: jobCategories
        .map((c) => ({ label: c.category ?? "Uncategorised", value: c._count._all }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
    });
  } catch (error) {
    return serverError("load reports", error);
  }
}
