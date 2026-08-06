import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import {
  auditAdmin,
  notFound,
  paging,
  requireAdmin,
  serverError,
  zodResponse,
} from "@/lib/admin";

/**
 * Interview oversight. The admin can cancel, reschedule or close out any
 * interview on the platform; scheduling stays with the employer, who owns the
 * relationship with the candidate.
 */

const patchSchema = z
  .object({
    id: z.string().trim().min(1),
    action: z.enum(["reschedule", "cancel", "complete"]),
    scheduledAt: z.coerce.date().optional(),
    outcome: z.string().trim().max(2000).optional(),
  })
  .refine((d) => d.action !== "reschedule" || d.scheduledAt !== undefined, {
    message: "Pick a new date and time",
    path: ["scheduledAt"],
  })
  .refine(
    (d) => d.action !== "reschedule" || (d.scheduledAt?.getTime() ?? 0) > Date.now(),
    { message: "Pick a date and time in the future", path: ["scheduledAt"] }
  );

function formatWhen(date: Date) {
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status") ?? "";
    const companyId = params.get("companyId") ?? "";
    const when = params.get("when") ?? "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (when === "upcoming") {
      where.scheduledAt = { gte: new Date() };
      where.status = "SCHEDULED";
    }
    if (when === "past") where.scheduledAt = { lt: new Date() };
    if (search) {
      where.OR = [
        { job: { title: { contains: search, mode: "insensitive" } } },
        {
          application: {
            candidate: { user: { name: { contains: search, mode: "insensitive" } } },
          },
        },
      ];
    }

    const [interviews, total, companies] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: "desc" },
        select: {
          id: true,
          scheduledAt: true,
          durationMins: true,
          mode: true,
          venue: true,
          notes: true,
          status: true,
          outcome: true,
          job: { select: { id: true, title: true } },
          company: { select: { id: true, name: true } },
          application: {
            select: {
              id: true,
              candidate: {
                select: {
                  id: true,
                  user: { select: { name: true, email: true, phone: true } },
                },
              },
            },
          },
        },
      }),
      prisma.interview.count({ where }),
      prisma.company.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 500,
      }),
    ]);

    return NextResponse.json({
      interviews,
      companies,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load interviews", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, action, scheduledAt, outcome } = parsed.data;

    const existing = await prisma.interview.findUnique({
      where: { id },
      select: {
        id: true,
        job: { select: { title: true } },
        application: { select: { candidate: { select: { userId: true } } } },
      },
    });
    if (!existing) return notFound("Interview not found");

    const data =
      action === "reschedule"
        ? { scheduledAt: scheduledAt!, status: "SCHEDULED", cancelledAt: null }
        : action === "cancel"
          ? { status: "CANCELLED", cancelledAt: new Date() }
          : { status: "COMPLETED", outcome: outcome ?? null };

    const interview = await prisma.interview.update({ where: { id }, data });

    if (action !== "complete") {
      await notify({
        userId: existing.application.candidate.userId,
        type: "INTERVIEW",
        title:
          action === "cancel"
            ? "An interview was cancelled"
            : "Your interview was rescheduled",
        body:
          action === "cancel"
            ? existing.job.title
            : `${existing.job.title} — ${formatWhen(scheduledAt!)}`,
        link: "/candidate/interviews",
      });
    }

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: `INTERVIEW_${action.toUpperCase()}`,
      entityType: "interviews",
      entityId: id,
    });

    return NextResponse.json({ interview });
  } catch (error) {
    return serverError("update this interview", error);
  }
}
