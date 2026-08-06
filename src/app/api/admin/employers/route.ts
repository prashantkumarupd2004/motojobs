import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  badRequest,
  csvResponse,
  notFound,
  paging,
  requireAdmin,
  serverError,
  toCsv,
  unpackList,
  zodResponse,
} from "@/lib/admin";

/**
 * Employer management. An employer is a User with role RECRUITER; the company
 * they belong to is edited from /admin/companies, so this route deals with the
 * person and surfaces the company read-only.
 */

const updateSchema = z.object({
  userId: z.string().trim().min(1),
  action: z.enum(["suspend", "activate"]),
  reason: z.string().trim().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const companyType = params.get("companyType") ?? "";
    const state = params.get("state") ?? "";
    const city = params.get("city") ?? "";
    const status = params.get("status") ?? "";
    const from = params.get("from") ?? "";
    const to = params.get("to") ?? "";

    const companyWhere: Record<string, unknown> = {};
    if (companyType) companyWhere.industry = companyType;
    if (state) companyWhere.state = state;
    if (city) companyWhere.city = city;

    const where: Record<string, unknown> = { role: "RECRUITER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { recruiter: { company: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }
    if (status === "active") where.isActive = true;
    if (status === "suspended") where.isActive = false;
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }
    if (Object.keys(companyWhere).length) {
      where.recruiter = { company: companyWhere };
    }

    const select = {
      id: true,
      name: true,
      email: true,
      phone: true,
      isActive: true,
      isEmailVerified: true,
      profileImage: true,
      suspendedAt: true,
      suspendedReason: true,
      lastLoginAt: true,
      createdAt: true,
      recruiter: {
        select: {
          id: true,
          designation: true,
          isVerified: true,
          _count: { select: { jobs: true } },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
              city: true,
              state: true,
              isVerified: true,
              isProfileComplete: true,
              profileCompletion: true,
            },
          },
        },
      },
    } as const;

    if (params.get("export") === "csv") {
      const rows = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5000,
        select,
      });
      const csv = toCsv(
        rows.map((u) => ({
          contact: u.name,
          email: u.email,
          phone: u.phone ?? "",
          company: u.recruiter?.company?.name ?? "",
          companyType: u.recruiter?.company?.industry ?? "",
          city: u.recruiter?.company?.city ?? "",
          state: u.recruiter?.company?.state ?? "",
          jobsPosted: u.recruiter?._count.jobs ?? 0,
          status: u.isActive ? "Active" : "Suspended",
          registeredAt: u.createdAt.toISOString().slice(0, 10),
        })),
        [
          "contact", "email", "phone", "company", "companyType",
          "city", "state", "jobsPosted", "status", "registeredAt",
        ]
      );
      return csvResponse(csv, "employers.csv");
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, select }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load employers", error);
  }
}

/** Full employer record for the drawer: company, jobs and hiring history. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { userId } = await req.json();
    if (typeof userId !== "string" || !userId) return badRequest("A user id is required");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isEmailVerified: true,
        suspendedAt: true,
        suspendedReason: true,
        lastLoginAt: true,
        createdAt: true,
        recruiter: {
          select: {
            id: true,
            designation: true,
            isVerified: true,
            company: true,
            jobs: {
              orderBy: { createdAt: "desc" },
              take: 50,
              select: {
                id: true,
                title: true,
                status: true,
                location: true,
                views: true,
                createdAt: true,
                _count: { select: { applications: true } },
              },
            },
          },
        },
      },
    });
    if (!user) return notFound("Employer not found");

    const recruiterId = user.recruiter?.id;
    const companyId = user.recruiter?.company?.id;

    const [applicationsReceived, hires, interviews, loginHistory] = await Promise.all([
      recruiterId
        ? prisma.application.count({ where: { job: { recruiterId } } })
        : 0,
      recruiterId
        ? prisma.application.findMany({
            where: { job: { recruiterId }, status: "HIRED" },
            orderBy: { updatedAt: "desc" },
            take: 25,
            select: {
              id: true,
              updatedAt: true,
              candidate: { select: { user: { select: { name: true } } } },
              job: { select: { title: true } },
            },
          })
        : [],
      companyId ? prisma.interview.count({ where: { companyId } }) : 0,
      prisma.loginHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, success: true, failReason: true, ipAddress: true, createdAt: true },
      }),
    ]);

    const company = user.recruiter?.company;
    return NextResponse.json({
      user: {
        ...user,
        recruiter: user.recruiter
          ? {
              ...user.recruiter,
              company: company
                ? { ...company, hiringCategories: unpackList(company.hiringCategories) }
                : null,
            }
          : null,
      },
      applicationsReceived,
      interviews,
      hires,
      loginHistory,
    });
  } catch (error) {
    return serverError("load this employer", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { userId, action, reason } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { id: userId, role: "RECRUITER" },
      select: { id: true, recruiter: { select: { companyId: true } } },
    });
    if (!existing) return notFound("Employer not found");

    const suspending = action === "suspend";
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !suspending,
        suspendedAt: suspending ? new Date() : null,
        suspendedReason: suspending ? (reason ?? null) : null,
      },
      select: { id: true, name: true, isActive: true },
    });

    // Suspending an employer must also pull their live listings, or candidates
    // keep applying to a company that can no longer respond.
    if (suspending && existing.recruiter?.companyId) {
      await prisma.job.updateMany({
        where: { companyId: existing.recruiter.companyId, status: "APPROVED" },
        data: { status: "CLOSED" },
      });
    }

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: suspending ? "EMPLOYER_SUSPENDED" : "EMPLOYER_ACTIVATED",
      entityType: "users",
      entityId: userId,
      metadata: { reason },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serverError("update this employer", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return badRequest("A user id is required");

    const user = await prisma.user.findFirst({
      where: { id: userId, role: "RECRUITER" },
      select: { id: true, name: true, email: true },
    });
    if (!user) return notFound("Employer not found");

    // The company is left in place: colleagues may share it, and its jobs carry
    // application history. Deleting the company is a separate, explicit action.
    await prisma.user.delete({ where: { id: userId } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "EMPLOYER_DELETED",
      entityType: "users",
      entityId: userId,
      metadata: { name: user.name, email: user.email },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this employer", error);
  }
}
