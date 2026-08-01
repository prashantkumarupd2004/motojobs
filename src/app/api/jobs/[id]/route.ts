import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";

/**
 * Editable fields only. `status` is deliberately absent: it is set by admin
 * review, and spreading the raw body would let a recruiter self-approve.
 */
const jobEditSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(20000),
    requirements: z.string().trim().max(10000).nullish(),
    responsibilities: z.string().trim().max(10000).nullish(),
    category: z.string().trim().max(60).nullish(),
    jobType: z.string().trim().max(40),
    workMode: z.string().trim().max(40),
    location: z.string().trim().max(160).nullish(),
    minSalary: z.coerce.number().nonnegative().nullish(),
    maxSalary: z.coerce.number().nonnegative().nullish(),
    currency: z.string().trim().max(8),
    experience: z.string().trim().max(60).nullish(),
    education: z.string().trim().max(160).nullish(),
    openings: z.coerce.number().int().min(1).max(999),
    deadline: z.coerce.date().nullish(),
  })
  .partial();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: true,
        recruiter: { include: { user: { select: { name: true, email: true } } } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({ job: serializeJob(job) });
  } catch {
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job || job.recruiterId !== recruiter.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...jobEditSchema.parse(body),
        skills: body.skills ? JSON.stringify(body.skills) : job.skills,
        // Editing live copy sends the role back through review, so an approved
        // listing cannot be swapped for unreviewed content after the fact.
        status: job.status === "APPROVED" ? "PENDING" : job.status,
      },
    });

    return NextResponse.json({ job: serializeJob(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid job details" },
        { status: 400 }
      );
    }
    console.error("Job update error:", error);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(req);
    if (!user || (user.role !== "RECRUITER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // An admin may close any role; a recruiter only their own. Without this
    // scoping any recruiter could close a competitor's live job by id.
    if (user.role === "RECRUITER") {
      const recruiter = await prisma.recruiter.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      const owned = recruiter
        ? await prisma.job.findFirst({
            where: { id, recruiterId: recruiter.id },
            select: { id: true },
          })
        : null;
      if (!owned) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.job.update({ where: { id }, data: { status: "CLOSED" } });
    return NextResponse.json({ message: "Job closed successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
