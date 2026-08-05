import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { employerContext, notFound, unauthorized } from "@/lib/employer";

/**
 * Reporting for the employer's own hiring. Aggregated in the database where
 * possible; the by-city and by-experience breakdowns group in memory because
 * they read a column on the related candidate, which `groupBy` cannot reach.
 */

const STATUS_KEYS = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "OFFERED",
  "HIRED",
  "REJECTED",
] as const;

/** Sorted, capped tally — the shape every chart on the page expects. */
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
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const { recruiterId } = context;
    const ownJobs = { job: { recruiterId } };

    const [jobsByStatus, applicationsByStatus, totalJobs, applicants, mostViewed] =
      await Promise.all([
        prisma.job.groupBy({
          by: ["status"],
          where: { recruiterId },
          _count: { _all: true },
        }),
        prisma.application.groupBy({
          by: ["status"],
          where: ownJobs,
          _count: { _all: true },
        }),
        prisma.job.count({ where: { recruiterId } }),
        prisma.application.findMany({
          where: ownJobs,
          select: {
            appliedAt: true,
            candidate: {
              select: { currentCity: true, totalExperience: true },
            },
          },
        }),
        prisma.job.findMany({
          where: { recruiterId },
          orderBy: { views: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            views: true,
            status: true,
            _count: { select: { applications: true } },
          },
        }),
      ]);

    const jobStatus = Object.fromEntries(
      jobsByStatus.map((row) => [row.status, row._count._all])
    );
    const appStatus = Object.fromEntries(
      applicationsByStatus.map((row) => [row.status, row._count._all])
    );

    return NextResponse.json({
      jobs: {
        total: totalJobs,
        active: jobStatus.APPROVED ?? 0,
        pending: jobStatus.PENDING ?? 0,
        draft: jobStatus.DRAFT ?? 0,
        closed: jobStatus.CLOSED ?? 0,
      },
      applications: {
        total: applicants.length,
        ...Object.fromEntries(STATUS_KEYS.map((k) => [k, appStatus[k] ?? 0])),
      },
      byCity: tally(
        applicants.map((a) => a.candidate.currentCity),
        8
      ),
      byExperience: tally(
        applicants.map((a) => a.candidate.totalExperience),
        8
      ),
      mostViewed,
    });
  } catch (error) {
    console.error("Employer reports error:", error);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
