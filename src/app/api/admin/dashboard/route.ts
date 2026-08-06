import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, serverError, startOfToday } from "@/lib/admin";

/**
 * Everything the admin dashboard renders, in one round trip.
 *
 * Counted in the database rather than by pulling rows and filtering in the
 * client — the previous dashboard fell back to invented figures ("5,234 users")
 * whenever the API returned nothing, which made the panel actively misleading.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const today = startOfToday();

    const [
      totalJobSeekers,
      totalEmployers,
      activeJobs,
      totalApplications,
      totalInterviews,
      totalCompanies,
      todayRegistrations,
      todayJobs,
      latestEmployers,
      latestCandidates,
      latestJobs,
      recentApplications,
      recentNotifications,
      pendingJobs,
      openTickets,
      suspendedUsers,
      unverifiedUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CANDIDATE" } }),
      prisma.user.count({ where: { role: "RECRUITER" } }),
      prisma.job.count({ where: { status: "APPROVED" } }),
      prisma.application.count(),
      prisma.interview.count(),
      prisma.company.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.job.count({ where: { createdAt: { gte: today } } }),

      prisma.recruiter.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          company: { select: { id: true, name: true, logo: true, city: true } },
        },
      }),
      prisma.candidate.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          headline: true,
          currentCity: true,
          createdAt: true,
          user: { select: { name: true, email: true, profileImage: true } },
        },
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          location: true,
          createdAt: true,
          company: { select: { name: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.application.findMany({
        take: 6,
        orderBy: { appliedAt: "desc" },
        select: {
          id: true,
          status: true,
          appliedAt: true,
          candidate: { select: { user: { select: { name: true } } } },
          job: { select: { id: true, title: true } },
        },
      }),
      prisma.notification.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, type: true, title: true, body: true, createdAt: true },
      }),

      // Website overview — the queues that need someone to act.
      prisma.job.count({ where: { status: "PENDING" } }),
      prisma.supportTicket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.count({ where: { isEmailVerified: false } }),
    ]);

    return NextResponse.json({
      stats: {
        totalJobSeekers,
        totalEmployers,
        activeJobs,
        totalApplications,
        totalInterviews,
        totalCompanies,
        todayRegistrations,
        todayJobs,
      },
      overview: { pendingJobs, openTickets, suspendedUsers, unverifiedUsers },
      latestEmployers,
      latestCandidates,
      latestJobs,
      recentApplications,
      recentNotifications,
    });
  } catch (error) {
    return serverError("load the dashboard", error);
  }
}
