import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { notify } from "@/lib/notifications";

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  OFFERED: "Offered",
  HIRED: "Hired",
  REJECTED: "Not selected",
};

const atsUpdateSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(Object.keys(STATUS_LABELS) as [string, ...string[]]).optional(),
  stage: z.string().trim().max(60).optional(),
  recruiterNotes: z.string().trim().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    const where: Record<string, unknown> = {
      job: { recruiterId: recruiter.id },
    };
    if (jobId) where.jobId = jobId;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
            skills: { include: { skill: true } },
          },
        },
        job: { select: { id: true, title: true } },
        resume: { select: { id: true, title: true, fileUrl: true } },
      },
    });

    // Grouped for the ATS board columns, keyed by the same statuses the PATCH accepts.
    const board = Object.fromEntries(
      Object.keys(STATUS_LABELS).map((status) => [
        status,
        applications.filter((a) => a.status === status),
      ])
    );

    return NextResponse.json({ applications, board });
  } catch {
    return NextResponse.json({ error: "Failed to fetch ATS data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = atsUpdateSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid update" },
        { status: 400 }
      );
    }
    const { applicationId, status, stage, recruiterNotes } = parsed.data;

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!recruiter) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Scoped by the recruiter's own jobs: without this, any recruiter could
    // move another employer's candidates through their pipeline.
    const existing = await prisma.application.findFirst({
      where: { id: applicationId, job: { recruiterId: recruiter.id } },
      select: { id: true, status: true, candidateId: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id: existing.id },
      data: { status, stage, recruiterNotes },
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
    console.error("ATS update error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
