import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import {
  auditAdmin,
  badRequest,
  csvResponse,
  notFound,
  paging,
  requireAdmin,
  serverError,
  toCsv,
  zodResponse,
} from "@/lib/admin";

/**
 * Application management. The admin can move an application to any stage and
 * delete it outright; the employer-facing route is scoped to their own jobs,
 * this one deliberately is not.
 */

const STATUS_LABELS: Record<string, string> = {
  APPLIED: "Applied",
  SCREENING: "Under review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview scheduled",
  OFFERED: "Selected",
  HIRED: "Joined",
  REJECTED: "Rejected",
};

const patchSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(Object.keys(STATUS_LABELS) as [string, ...string[]]),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status") ?? "";
    const companyId = params.get("companyId") ?? "";
    const from = params.get("from") ?? "";
    const to = params.get("to") ?? "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (companyId) where.job = { companyId };
    if (search) {
      where.OR = [
        { candidate: { user: { name: { contains: search, mode: "insensitive" } } } },
        { job: { title: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (from || to) {
      where.appliedAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }

    const select = {
      id: true,
      status: true,
      stage: true,
      appliedAt: true,
      updatedAt: true,
      candidate: {
        select: {
          id: true,
          currentCity: true,
          totalExperience: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          company: { select: { id: true, name: true } },
        },
      },
      interviews: {
        where: { status: "SCHEDULED" },
        orderBy: { scheduledAt: "asc" as const },
        take: 1,
        select: { id: true, scheduledAt: true },
      },
    };

    if (params.get("export") === "csv") {
      const rows = await prisma.application.findMany({
        where,
        orderBy: { appliedAt: "desc" },
        take: 5000,
        select,
      });
      const csv = toCsv(
        rows.map((a) => ({
          candidate: a.candidate.user.name,
          email: a.candidate.user.email,
          phone: a.candidate.user.phone ?? "",
          city: a.candidate.currentCity ?? "",
          experience: a.candidate.totalExperience ?? "",
          job: a.job.title,
          company: a.job.company?.name ?? "",
          status: STATUS_LABELS[a.status] ?? a.status,
          appliedAt: a.appliedAt.toISOString().slice(0, 10),
        })),
        [
          "candidate", "email", "phone", "city", "experience",
          "job", "company", "status", "appliedAt",
        ]
      );
      return csvResponse(csv, "applications.csv");
    }

    const [applications, total, companies] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: "desc" },
        select,
      }),
      prisma.application.count({ where }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 500,
      }),
    ]);

    return NextResponse.json({
      applications,
      companies,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load applications", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, status } = parsed.data;

    const existing = await prisma.application.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) return notFound("Application not found");

    const application = await prisma.application.update({
      where: { id },
      data: { status, stage: STATUS_LABELS[status] },
      include: {
        candidate: { select: { userId: true } },
        job: { select: { title: true } },
      },
    });

    if (status !== existing.status) {
      await notify({
        userId: application.candidate.userId,
        type: "APPLICATION_STATUS",
        title: `Your application moved to ${STATUS_LABELS[status]}`,
        body: `${application.job.title} — ${STATUS_LABELS[status]}`,
        link: "/candidate/applied-jobs",
      });
    }

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "APPLICATION_STATUS_CHANGED",
      entityType: "applications",
      entityId: id,
      metadata: { from: existing.status, to: status },
    });

    return NextResponse.json({ application: { id, status } });
  } catch (error) {
    return serverError("update this application", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("An application id is required");

    const existing = await prisma.application.findUnique({
      where: { id },
      select: { id: true, candidateId: true, jobId: true },
    });
    if (!existing) return notFound("Application not found");

    await prisma.application.delete({ where: { id } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "APPLICATION_DELETED",
      entityType: "applications",
      entityId: id,
      metadata: { candidateId: existing.candidateId, jobId: existing.jobId },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this application", error);
  }
}
