import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Gather platform-wide analytics
    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalJobs,
      activeJobs,
      totalApplications,
      totalPayments,
      recentUsers,
      recentJobs,
      applicationsByStatus,
      jobsByMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.candidate.count(),
      prisma.recruiter.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: "APPROVED" } }),
      prisma.application.count(),
      prisma.payment.aggregate({ _sum: { amount: true } }),
      prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.job.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, title: true, status: true, createdAt: true } }),
      prisma.application.groupBy({ by: ["status"], _count: true }),
      // Jobs per month (last 6 months)
      prisma.$queryRaw`
        SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
        FROM jobs
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month
      `,
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCandidates,
        totalRecruiters,
        totalJobs,
        activeJobs,
        totalApplications,
        totalRevenue: totalPayments._sum.amount || 0,
      },
      recentUsers,
      recentJobs,
      applicationsByStatus,
      jobsByMonth,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
