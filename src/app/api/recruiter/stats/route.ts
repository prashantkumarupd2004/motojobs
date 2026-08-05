import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";
import { employerContext, notFound, unauthorized } from "@/lib/employer";

/**
 * Everything the employer dashboard renders, in one round trip: the six
 * headline counters plus the recent jobs and applications beneath them.
 *
 * Counted in the database rather than by fetching rows and filtering in the
 * client — the previous dashboard summed only the first page of jobs, so the
 * numbers were wrong as soon as an employer had more than ten roles.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const { recruiterId, companyId } = context;
    const ownJobs = { job: { recruiterId } };

    const [
      activeJobs,
      totalApplications,
      shortlisted,
      interviewsScheduled,
      savedCandidates,
      totalHires,
      company,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.job.count({ where: { recruiterId, status: "APPROVED" } }),
      prisma.application.count({ where: ownJobs }),
      prisma.application.count({ where: { ...ownJobs, status: "SHORTLISTED" } }),
      companyId
        ? prisma.interview.count({
            where: { companyId, status: "SCHEDULED", scheduledAt: { gte: new Date() } },
          })
        : 0,
      companyId ? prisma.savedCandidate.count({ where: { companyId } }) : 0,
      prisma.application.count({ where: { ...ownJobs, status: "HIRED" } }),
      companyId
        ? prisma.company.findUnique({
            where: { id: companyId },
            select: {
              id: true,
              name: true,
              logo: true,
              isProfileComplete: true,
              profileCompletion: true,
              isVerified: true,
            },
          })
        : null,
      prisma.job.findMany({
        where: { recruiterId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { applications: true } } },
      }),
      prisma.application.findMany({
        where: ownJobs,
        orderBy: { appliedAt: "desc" },
        take: 6,
        include: {
          candidate: {
            select: {
              id: true,
              headline: true,
              currentCity: true,
              user: { select: { name: true, profileImage: true } },
            },
          },
          job: { select: { id: true, title: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        activeJobs,
        totalApplications,
        shortlisted,
        interviewsScheduled,
        savedCandidates,
        totalHires,
      },
      company,
      recentJobs: recentJobs.map(serializeJob),
      recentApplications,
    });
  } catch (error) {
    console.error("Recruiter stats error:", error);
    return NextResponse.json({ error: "Failed to load your dashboard" }, { status: 500 });
  }
}
