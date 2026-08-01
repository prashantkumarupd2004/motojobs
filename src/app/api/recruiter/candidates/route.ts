import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getEntitlements } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { companyId: true },
    });
    const entitlements = await getEntitlements(recruiter?.companyId ?? null);
    if (!entitlements.canSearchResumes) {
      return NextResponse.json(
        {
          error: `The resume database is not included in your ${entitlements.planName} plan.`,
          code: "PLAN_REQUIRED",
          entitlements,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const skills = searchParams.get("skills") || "";
    const location = searchParams.get("location") || "";
    const experience = searchParams.get("experience") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Record<string, unknown> = { isOpenToWork: true };

    if (search) {
      where.user = { name: { contains: search, mode: "insensitive" } };
    }
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (experience) where.experience = { gte: parseInt(experience) };

    let skillFilter: Record<string, unknown> | undefined;
    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim());
      skillFilter = {
        skills: {
          some: {
            skill: { name: { in: skillList } },
          },
        },
      };
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where: { ...where, ...skillFilter },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, profileImage: true } },
          skills: { include: { skill: true } },
          resumes: { where: { isPrimary: true }, select: { id: true, title: true, fileUrl: true } },
          verification: { select: { status: true } },
        },
      }),
      prisma.candidate.count({ where: { ...where, ...skillFilter } }),
    ]);

    return NextResponse.json({ candidates, total, page, limit });
  } catch {
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 });
  }
}
