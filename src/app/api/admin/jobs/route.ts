import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { serializeJob } from "@/lib/jobs";
import { notify } from "@/lib/notifications";
import {
  auditAdmin,
  badRequest,
  csvResponse,
  notFound,
  packList,
  paging,
  requireAdmin,
  serverError,
  toCsv,
  unpackList,
  zodResponse,
} from "@/lib/admin";

/**
 * Job management. The admin sees every job on the platform, including the
 * drafts and pending listings the public API filters out, and can approve,
 * reject, close, reopen, duplicate, edit or delete any of them.
 */

const SETTABLE_STATUS = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CLOSED",
] as const;

const patchSchema = z.object({
  id: z.string().trim().min(1),
  action: z.enum(["status", "duplicate", "edit"]).default("status"),
  status: z.enum(SETTABLE_STATUS).optional(),
  /// Sent to the recruiter when a job is rejected.
  reason: z.string().trim().max(500).optional(),
  data: z
    .object({
      title: z.string().trim().min(2).max(160),
      description: z.string().trim().min(1).max(20000),
      requirements: z.string().trim().max(10000).nullish(),
      responsibilities: z.string().trim().max(10000).nullish(),
      category: z.string().trim().max(60).nullish(),
      jobType: z.string().trim().max(40),
      workMode: z.string().trim().max(40),
      state: z.string().trim().max(80).nullish(),
      city: z.string().trim().max(80).nullish(),
      minSalary: z.coerce.number().nonnegative().nullish(),
      maxSalary: z.coerce.number().nonnegative().nullish(),
      experience: z.string().trim().max(60).nullish(),
      education: z.string().trim().max(160).nullish(),
      openings: z.coerce.number().int().min(1).max(999),
      deadline: z.coerce.date().nullish(),
      skills: z.array(z.string().trim()).max(60).optional(),
      benefits: z.array(z.string().trim()).max(40).optional(),
      joiningTimeline: z.string().trim().max(60).nullish(),
    })
    .partial()
    .optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const companyId = params.get("companyId") ?? "";
    const category = params.get("category") ?? "";
    const state = params.get("state") ?? "";
    const city = params.get("city") ?? "";
    const experience = params.get("experience") ?? "";
    const status = params.get("status") ?? "";
    const minSalary = params.get("minSalary") ?? "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (companyId) where.companyId = companyId;
    if (category) where.category = category;
    if (state) where.state = state;
    if (city) where.city = city;
    if (experience) where.experience = experience;
    if (status) where.status = status;
    if (minSalary) where.minSalary = { gte: Number(minSalary) };

    const select = {
      id: true,
      title: true,
      status: true,
      category: true,
      jobType: true,
      workMode: true,
      location: true,
      state: true,
      city: true,
      experience: true,
      minSalary: true,
      maxSalary: true,
      openings: true,
      views: true,
      deadline: true,
      createdAt: true,
      company: { select: { id: true, name: true, logo: true } },
      recruiter: { select: { user: { select: { name: true, email: true } } } },
      _count: { select: { applications: true } },
    } as const;

    if (params.get("export") === "csv") {
      const rows = await prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5000,
        select,
      });
      const csv = toCsv(
        rows.map((j) => ({
          title: j.title,
          company: j.company?.name ?? "",
          status: j.status,
          category: j.category ?? "",
          location: j.location ?? "",
          jobType: j.jobType,
          workMode: j.workMode,
          experience: j.experience ?? "",
          minSalary: j.minSalary ?? "",
          maxSalary: j.maxSalary ?? "",
          openings: j.openings,
          applications: j._count.applications,
          views: j.views,
          postedAt: j.createdAt.toISOString().slice(0, 10),
        })),
        [
          "title", "company", "status", "category", "location", "jobType",
          "workMode", "experience", "minSalary", "maxSalary", "openings",
          "applications", "views", "postedAt",
        ]
      );
      return csvResponse(csv, "jobs.csv");
    }

    const [jobs, total, companies] = await Promise.all([
      prisma.job.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select }),
      prisma.job.count({ where }),
      // Powers the company filter without a second round trip.
      prisma.company.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 500,
      }),
    ]);

    return NextResponse.json({
      jobs,
      companies,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load jobs", error);
  }
}

/** Full job record for the detail drawer. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) return badRequest("A job id is required");

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, logo: true, city: true, state: true } },
        recruiter: { select: { user: { select: { name: true, email: true } } } },
        applications: {
          orderBy: { appliedAt: "desc" },
          take: 50,
          select: {
            id: true,
            status: true,
            appliedAt: true,
            candidate: { select: { id: true, user: { select: { name: true } } } },
          },
        },
        _count: { select: { applications: true } },
      },
    });
    if (!job) return notFound("Job not found");

    return NextResponse.json({
      job: {
        ...serializeJob(job),
        benefits: unpackList(job.benefits),
      },
    });
  } catch (error) {
    return serverError("load this job", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, action, status, reason, data } = parsed.data;

    const job = await prisma.job.findUnique({
      where: { id },
      include: { recruiter: { select: { userId: true } } },
    });
    if (!job) return notFound("Job not found");

    if (action === "duplicate") {
      const { id: _id, createdAt: _c, updatedAt: _u, views: _v, recruiter: _r, ...rest } = job;
      const copy = await prisma.job.create({
        data: { ...rest, title: `${job.title} (copy)`, status: "DRAFT" },
        include: { _count: { select: { applications: true } } },
      });
      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "JOB_DUPLICATED",
        entityType: "jobs",
        entityId: id,
        metadata: { copyId: copy.id },
      });
      return NextResponse.json({ job: serializeJob(copy) }, { status: 201 });
    }

    if (action === "edit") {
      if (!data) return badRequest("Nothing to update");
      const { skills, benefits, ...fields } = data;
      const updated = await prisma.job.update({
        where: { id },
        data: {
          ...fields,
          ...(skills ? { skills: packList(skills) } : {}),
          ...(benefits ? { benefits: packList(benefits) } : {}),
          ...(fields.city !== undefined || fields.state !== undefined
            ? {
                location:
                  [fields.city ?? job.city, fields.state ?? job.state]
                    .filter(Boolean)
                    .join(", ") || null,
              }
            : {}),
        },
        include: { _count: { select: { applications: true } } },
      });
      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "JOB_EDITED",
        entityType: "jobs",
        entityId: id,
      });
      return NextResponse.json({ job: serializeJob(updated) });
    }

    if (!status) return badRequest("A status is required");

    const updated = await prisma.job.update({
      where: { id },
      data: { status },
      include: { _count: { select: { applications: true } } },
    });

    // The employer needs to know an approval or rejection happened; a close or
    // reopen is usually their own doing and does not warrant a notification.
    if (status !== job.status && (status === "APPROVED" || status === "REJECTED")) {
      await notify({
        userId: job.recruiter.userId,
        type: status === "APPROVED" ? "JOB_APPROVED" : "JOB_REJECTED",
        title:
          status === "APPROVED"
            ? `"${job.title}" is now live`
            : `"${job.title}" was not approved`,
        body: reason ?? undefined,
        link: "/recruiter/manage-jobs",
      });
    }

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: `JOB_${status}`,
      entityType: "jobs",
      entityId: id,
      metadata: { from: job.status, reason },
    });

    return NextResponse.json({ job: serializeJob(updated) });
  } catch (error) {
    return serverError("update this job", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("A job id is required");

    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, title: true, _count: { select: { applications: true } } },
    });
    if (!job) return notFound("Job not found");

    // Applications cascade with the job, so a role that has already received
    // candidates is closed instead — their history must survive.
    if (job._count.applications > 0) {
      await prisma.job.update({ where: { id }, data: { status: "CLOSED" } });
      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "JOB_CLOSED",
        entityType: "jobs",
        entityId: id,
        metadata: { reason: "delete requested, had applicants" },
      });
      return NextResponse.json({
        closed: true,
        message: "This job has applicants, so it was closed rather than deleted.",
      });
    }

    await prisma.job.delete({ where: { id } });
    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "JOB_DELETED",
      entityType: "jobs",
      entityId: id,
      metadata: { title: job.title },
    });

    return NextResponse.json({ closed: false });
  } catch (error) {
    return serverError("delete this job", error);
  }
}
