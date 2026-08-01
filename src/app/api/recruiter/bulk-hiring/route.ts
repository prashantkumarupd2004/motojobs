import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Get all jobs with detailed application stats
    const jobs = await prisma.job.findMany({
      where: { recruiterId: recruiter.id },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { status: true, aiScore: true },
        },
        company: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter((j: any) => j.status === "APPROVED").length,
      totalApplications: jobs.reduce((s: number, j: any) => s + j._count.applications, 0),
      totalHired: jobs.reduce((s: number, j: any) => s + j.applications.filter((a: any) => a.status === "HIRED").length, 0),
      jobsWithApplications: jobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        company: j.company?.name,
        status: j.status,
        openings: j.openings,
        totalApplications: j._count.applications,
        byStatus: {
          applied: j.applications.filter((a: any) => a.status === "APPLIED").length,
          screening: j.applications.filter((a: any) => a.status === "SCREENING").length,
          shortlisted: j.applications.filter((a: any) => a.status === "SHORTLISTED").length,
          interview: j.applications.filter((a: any) => a.status === "INTERVIEW").length,
          offered: j.applications.filter((a: any) => a.status === "OFFERED").length,
          hired: j.applications.filter((a: any) => a.status === "HIRED").length,
          rejected: j.applications.filter((a: any) => a.status === "REJECTED").length,
        },
        avgAiScore: j.applications.filter((a: any) => a.aiScore).length > 0
          ? Math.round(j.applications.reduce((s: number, a: any) => s + (a.aiScore || 0), 0) / j.applications.filter((a: any) => a.aiScore).length)
          : null,
      })),
    };

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bulk hiring data" }, { status: 500 });
  }
}
