import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

/** Every dashboard card in one round trip, so the page renders in one paint. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true, profileImage: true },
  });

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { id: true, profileScore: true, isProfileComplete: true, profileStep: true },
  });

  if (!candidate) {
    return NextResponse.json({
      data: {
        account,
        profileScore: 0,
        isProfileComplete: false,
        applications: 0,
        savedJobs: 0,
        interviews: 0,
        profileViews: 0,
        recentApplications: [],
        notifications: [],
        unreadNotifications: 0,
      },
    });
  }

  const [
    applications,
    savedJobs,
    interviews,
    profileViews,
    recentApplications,
    notifications,
    unreadNotifications,
  ] = await Promise.all([
    prisma.application.count({ where: { candidateId: candidate.id } }),
    prisma.savedJob.count({ where: { candidateId: candidate.id } }),
    prisma.application.count({
      where: { candidateId: candidate.id, status: { in: ["INTERVIEW", "SHORTLISTED"] } },
    }),
    prisma.profileView.count({ where: { candidateId: candidate.id } }),
    prisma.application.findMany({
      where: { candidateId: candidate.id },
      orderBy: { appliedAt: "desc" },
      take: 5,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            company: { select: { name: true, logo: true } },
          },
        },
      },
    }),
    prisma.notification.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { userId: user.userId, readAt: null } }),
  ]);

  return NextResponse.json({
    data: {
      account,
      profileScore: candidate.profileScore,
      isProfileComplete: candidate.isProfileComplete,
      profileStep: candidate.profileStep,
      applications,
      savedJobs,
      interviews,
      profileViews,
      recentApplications,
      notifications,
      unreadNotifications,
    },
  });
}
