import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paging, requireAdmin, serverError, unpackBlocks } from "@/lib/admin";

/**
 * Security surfaces: sign-in history, the admin audit trail and unhandled
 * server errors. All read-only — an audit log an admin can edit is not one.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req, 50);
    const view = params.get("view") ?? "logins";
    const search = params.get("search")?.trim() ?? "";

    if (view === "activity") {
      const where: Record<string, unknown> = {};
      if (search) where.action = { contains: search, mode: "insensitive" };

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, email: true } } },
        }),
        prisma.activityLog.count({ where }),
      ]);

      return NextResponse.json({
        logs: logs.map((l) => ({ ...l, metadata: unpackBlocks(l.metadata) })),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    if (view === "errors") {
      const [errors, total] = await Promise.all([
        prisma.errorLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.errorLog.count(),
      ]);
      return NextResponse.json({
        errors,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    const where: Record<string, unknown> = {};
    if (search) where.email = { contains: search, mode: "insensitive" };
    const outcome = params.get("outcome");
    if (outcome === "success") where.success = true;
    if (outcome === "failed") where.success = false;

    const [logins, total, failedToday] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, role: true } } },
      }),
      prisma.loginHistory.count({ where }),
      prisma.loginHistory.count({
        where: {
          success: false,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return NextResponse.json({
      logins,
      failedToday,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load security logs", error);
  }
}
