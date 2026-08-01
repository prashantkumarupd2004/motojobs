import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    // Non-admins can only see their own tickets
    if (user.role !== "ADMIN") where.userId = user.userId;
    if (status) where.status = status;

    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return NextResponse.json({ tickets, total, page, limit });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subject, description, category, priority } = await req.json();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.userId,
        subject,
        description,
        category,
        priority: priority || "MEDIUM",
        status: "OPEN",
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId, status, adminNotes } = await req.json();

    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        adminNotes,
        resolvedAt: status === "RESOLVED" || status === "CLOSED" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
