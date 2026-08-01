import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";
import { logActivity, notify } from "@/lib/notifications";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: true,
          recruiter: { include: { user: { select: { name: true, email: true } } } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs: jobs.map(serializeJob), total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, status } = await req.json();

    const job = await prisma.job.update({
      where: { id: jobId },
      data: { status },
      include: { recruiter: { select: { userId: true } } },
    });

    if (status === "APPROVED" || status === "REJECTED") {
      await notify({
        userId: job.recruiter.userId,
        type: status === "APPROVED" ? "JOB_APPROVED" : "JOB_REJECTED",
        title:
          status === "APPROVED"
            ? `"${job.title}" is now live`
            : `"${job.title}" was not approved`,
        body:
          status === "APPROVED"
            ? "Candidates can find and apply to this role now."
            : "Review the job details and submit it again.",
        link: "/recruiter/manage-jobs",
      });
    }

    await logActivity({
      req,
      actorId: user.userId,
      action: `JOB_${status}`,
      entityType: "jobs",
      entityId: jobId,
      metadata: { title: job.title },
    });

    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}
