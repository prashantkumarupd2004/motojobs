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
 * Job-seeker management. Read, suspend, reactivate and delete.
 *
 * Aadhaar is deliberately absent: this platform does not collect it (see the
 * comment on `Candidate.panNumber`), so there is nothing to surface here.
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
    const state = params.get("state") ?? "";
    const city = params.get("city") ?? "";
    const qualification = params.get("qualification") ?? "";
    const experience = params.get("experience") ?? "";
    const skill = params.get("skill") ?? "";
    const status = params.get("status") ?? "";
    const verified = params.get("verified") ?? "";
    const from = params.get("from") ?? "";
    const to = params.get("to") ?? "";

    const candidateWhere: Record<string, unknown> = {};
    if (state) candidateWhere.currentState = state;
    if (city) candidateWhere.currentCity = city;
    if (qualification) candidateWhere.qualification = qualification;
    if (experience) candidateWhere.totalExperience = experience;
    if (skill) candidateWhere.skills = { some: { skill: { name: skill } } };

    const where: Record<string, unknown> = { role: "CANDIDATE" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (status === "active") where.isActive = true;
    if (status === "suspended") where.isActive = false;
    if (verified === "yes") where.isEmailVerified = true;
    if (verified === "no") where.isEmailVerified = false;
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        // `to` names a day, and the caller means the whole of it.
        ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
      };
    }
    if (Object.keys(candidateWhere).length) where.candidate = candidateWhere;

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
      candidate: {
        select: {
          id: true,
          headline: true,
          currentCity: true,
          currentState: true,
          qualification: true,
          totalExperience: true,
          expectedSalary: true,
          isProfileComplete: true,
          profileScore: true,
          _count: { select: { applications: true } },
        },
      },
    } as const;

    // CSV export ignores pagination: the admin asked for the filtered set.
    if (params.get("export") === "csv") {
      const rows = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5000,
        select,
      });
      const csv = toCsv(
        rows.map((u) => ({
          name: u.name,
          email: u.email,
          phone: u.phone ?? "",
          city: u.candidate?.currentCity ?? "",
          state: u.candidate?.currentState ?? "",
          qualification: u.candidate?.qualification ?? "",
          experience: u.candidate?.totalExperience ?? "",
          applications: u.candidate?._count.applications ?? 0,
          status: u.isActive ? "Active" : "Suspended",
          emailVerified: u.isEmailVerified ? "Yes" : "No",
          registeredAt: u.createdAt.toISOString().slice(0, 10),
        })),
        [
          "name", "email", "phone", "city", "state", "qualification",
          "experience", "applications", "status", "emailVerified", "registeredAt",
        ]
      );
      return csvResponse(csv, "job-seekers.csv");
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
    return serverError("load job seekers", error);
  }
}

/** Full profile for the detail drawer, including documents and history. */
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
        profileImage: true,
        suspendedAt: true,
        suspendedReason: true,
        lastLoginAt: true,
        createdAt: true,
        candidate: {
          include: {
            skills: { include: { skill: { select: { name: true } } } },
            resumes: { select: { id: true, title: true, fileUrl: true, isPrimary: true } },
            education: true,
            workExperience: { orderBy: { startDate: "desc" } },
            applications: {
              orderBy: { appliedAt: "desc" },
              take: 50,
              select: {
                id: true,
                status: true,
                appliedAt: true,
                job: {
                  select: { id: true, title: true, company: { select: { name: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!user) return notFound("Candidate not found");

    const loginHistory = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        success: true,
        failReason: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    const candidate = user.candidate;
    return NextResponse.json({
      user: {
        ...user,
        candidate: candidate
          ? {
              ...candidate,
              skills: candidate.skills.map((s) => s.skill.name),
              jobTitles: unpackList(candidate.jobTitles),
              languages: unpackList(candidate.languages),
              brandExperience: unpackList(candidate.brandExperience),
              preferredLocations: unpackList(candidate.preferredLocations),
            }
          : null,
      },
      loginHistory,
    });
  } catch (error) {
    return serverError("load this candidate", error);
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
      where: { id: userId, role: "CANDIDATE" },
      select: { id: true },
    });
    if (!existing) return notFound("Candidate not found");

    const suspending = action === "suspend";
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !suspending,
        suspendedAt: suspending ? new Date() : null,
        suspendedReason: suspending ? (reason ?? null) : null,
      },
      select: { id: true, name: true, isActive: true, suspendedAt: true, suspendedReason: true },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: suspending ? "CANDIDATE_SUSPENDED" : "CANDIDATE_ACTIVATED",
      entityType: "users",
      entityId: userId,
      metadata: { reason },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serverError("update this candidate", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) return badRequest("A user id is required");

    const user = await prisma.user.findFirst({
      where: { id: userId, role: "CANDIDATE" },
      select: { id: true, name: true, email: true },
    });
    if (!user) return notFound("Candidate not found");

    // Candidate, applications, resumes and saved jobs all cascade from the user
    // row, so this removes the person's data in full — which is what an erasure
    // request means.
    await prisma.user.delete({ where: { id: userId } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "CANDIDATE_DELETED",
      entityType: "users",
      entityId: userId,
      metadata: { name: user.name, email: user.email },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this candidate", error);
  }
}
