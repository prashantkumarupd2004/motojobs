import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    const revenue = await prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalRevenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

// POST removed: it let any signed-in user write status:"COMPLETED" rows with a
// body-supplied amount, forging the revenue figures this route aggregates. Real
// payments must be recorded from a gateway webhook that verifies the signature.
