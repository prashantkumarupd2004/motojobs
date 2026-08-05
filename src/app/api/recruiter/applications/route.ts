import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { notify } from "@/lib/notifications";
import { employerContext, notFound, unauthorized } from "@/lib/employer";

/**
 * Application management for the signed-in employer. Reads and writes are both
 * scoped through `job.recruiterId`: without it any employer could move another
 * company's candidates through their pipeline by posting an application id.
 */

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Under review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  HIRED: "Selected",
  REJECTED: "Not selected",
};

const updateSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(Object.keys(STATUS_LABELS) as [string, ...string[]]).optional(),
  recruiterNotes: z.string().trim().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const jobId = searchParams.get("jobId") || "";

    const where: Record<string, unknown> = { job: { recruiterId: context.recruiterId } };
    if (status) where.status = status;
    if (jobId) where.jobId = jobId;

    const [applications, jobs] = await Promise.all([
      prisma.application.findMany({
        where,
        orderBy: { appliedAt: "desc" },
        take: 200,
        include: {
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true, profileImage: true } },
              skills: { include: { skill: { select: { name: true } } } },
            },
          },
          job: { select: { id: true, title: true } },
          resume: { select: { id: true, title: true, fileUrl: true } },
          interviews: {
            where: { status: "SCHEDULED" },
            orderBy: { scheduledAt: "asc" },
            take: 1,
          },
        },
      }),
      // Powers the "filter by role" control without a second round trip.
      prisma.job.findMany({
        where: { recruiterId: context.recruiterId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true },
      }),
    ]);

    const counts = Object.fromEntries(
      Object.keys(STATUS_LABELS).map((key) => [
        key,
        applications.filter((a) => a.status === key).length,
      ])
    );

    return NextResponse.json({ applications, jobs, counts });
  } catch (error) {
    console.error("Employer applications GET error:", error);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}

/** Moves a candidate through the pipeline and tells them it happened. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }
    const { applicationId, status, recruiterNotes } = parsed.data;

    const existing = await prisma.application.findFirst({
      where: { id: applicationId, job: { recruiterId: context.recruiterId } },
      select: { id: true, status: true },
    });
    if (!existing) return notFound("Application not found");

    const application = await prisma.application.update({
      where: { id: existing.id },
      data: {
        ...(status ? { status, stage: STATUS_LABELS[status] } : {}),
        ...(recruiterNotes !== undefined ? { recruiterNotes } : {}),
      },
      include: {
        candidate: { select: { userId: true } },
        job: { select: { title: true } },
      },
    });

    if (status && status !== existing.status) {
      await notify({
        userId: application.candidate.userId,
        type: "APPLICATION_STATUS",
        title: `Your application moved to ${STATUS_LABELS[status]}`,
        body: `${application.job.title} — ${STATUS_LABELS[status]}`,
        link: "/candidate/applied-jobs",
      });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("Employer applications PATCH error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
