import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  notFound,
  paging,
  requireAdmin,
  serverError,
  zodResponse,
} from "@/lib/admin";

/** Contact messages, feedback and bug reports, all stored as support tickets. */

const updateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  adminNotes: z.string().trim().max(4000).optional(),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const params = new URL(req.url).searchParams;
    const { page, limit, skip } = paging(req);

    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status") ?? "";
    const category = params.get("category") ?? "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [tickets, total, counts] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
      prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    return NextResponse.json({
      tickets,
      counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load support tickets", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);
    const { id, status, adminNotes } = parsed.data;

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) return notFound("Ticket not found");

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminNotes !== undefined ? { adminNotes } : {}),
        ...(status === "RESOLVED" || status === "CLOSED" ? { resolvedAt: new Date() } : {}),
      },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "TICKET_UPDATED",
      entityType: "support_tickets",
      entityId: id,
      metadata: { from: existing.status, to: status },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    return serverError("update this ticket", error);
  }
}
