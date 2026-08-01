import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public directory feed. Only companies that finished their profile are listed,
 * so the directory never shows a bare name with no context. No auth: the CSRF
 * gate only guards unsafe methods, and this route is GET-only.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const search = searchParams.get("search")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";
    const city = searchParams.get("city")?.trim() || "";

    const where: Record<string, unknown> = { isProfileComplete: true };
    if (search) {
      where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    }
    if (industry) where.industry = { in: industry.split(",").map((i) => i.trim()) };
    if (city) where.city = { contains: city };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isVerified: "desc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          industry: true,
          size: true,
          city: true,
          state: true,
          description: true,
          isVerified: true,
          _count: { select: { jobs: { where: { status: "APPROVED" } } } },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return NextResponse.json({
      companies: companies.map(({ _count, ...c }) => ({ ...c, openJobs: _count.jobs })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Companies list error:", error);
    return NextResponse.json({ error: "Failed to load companies" }, { status: 500 });
  }
}
