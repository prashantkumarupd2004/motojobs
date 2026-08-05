import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";
import { employerContext, notFound, unauthorized } from "@/lib/employer";

/**
 * The signed-in employer's own jobs. Every mutation is scoped by the recruiter
 * resolved from the session, so one employer can never touch another's
 * listings by guessing an id.
 */

/** Statuses an employer may set directly. Approval stays with admin review. */
const SETTABLE_STATUS = ["DRAFT", "PENDING", "CLOSED"] as const;

const patchSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(["status", "duplicate"]).default("status"),
  status: z.enum(SETTABLE_STATUS).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = { recruiterId: context.recruiterId };
    if (status) where.status = status;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: { select: { id: true, name: true, logo: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({ jobs: jobs.map(serializeJob), total, page, limit });
  } catch (error) {
    console.error("Recruiter jobs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

/** Changes a job's status, or duplicates it into a fresh draft. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }
    const { id, action, status } = parsed.data;

    const job = await prisma.job.findFirst({
      where: { id, recruiterId: context.recruiterId },
    });
    if (!job) return notFound("Job not found");

    if (action === "duplicate") {
      const { id: _id, createdAt: _c, updatedAt: _u, views: _v, ...rest } = job;
      const copy = await prisma.job.create({
        data: {
          ...rest,
          title: `${job.title} (copy)`,
          // A duplicate starts as an unpublished draft so the employer can edit
          // it before it goes anywhere near review.
          status: "DRAFT",
        },
        include: { _count: { select: { applications: true } } },
      });
      return NextResponse.json({ job: serializeJob(copy) }, { status: 201 });
    }

    if (!status) {
      return NextResponse.json({ error: "A status is required" }, { status: 400 });
    }

    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { status },
      include: { _count: { select: { applications: true } } },
    });

    return NextResponse.json({ job: serializeJob(updated) });
  } catch (error) {
    console.error("Recruiter jobs PATCH error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

/**
 * Deletes a job. Applications cascade with it, so a role that has already
 * received candidates is closed instead — their history must survive.
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "A job id is required" }, { status: 400 });

    const job = await prisma.job.findFirst({
      where: { id, recruiterId: context.recruiterId },
      select: { id: true, _count: { select: { applications: true } } },
    });
    if (!job) return notFound("Job not found");

    if (job._count.applications > 0) {
      await prisma.job.update({ where: { id: job.id }, data: { status: "CLOSED" } });
      return NextResponse.json({
        message: "This job has applicants, so it was closed rather than deleted.",
        closed: true,
      });
    }

    await prisma.job.delete({ where: { id: job.id } });
    return NextResponse.json({ message: "Job deleted", closed: false });
  } catch (error) {
    console.error("Recruiter jobs DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
