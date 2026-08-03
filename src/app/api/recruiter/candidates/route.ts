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

/**
 * Records that this recruiter opened a candidate's profile, which is what the
 * candidate's "Profile Views" card counts. Appearing in a search listing is
 * deliberately not a view — only an intentional open is.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { candidateId } = await req.json();
    if (typeof candidateId !== "string" || !candidateId) {
      return NextResponse.json({ error: "candidateId is required" }, { status: 400 });
    }

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true },
    });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // One view per recruiter per day, so refreshing a tab cannot inflate the count.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.profileView.findFirst({
      where: { candidateId, recruiterId: recruiter?.id ?? null, viewedAt: { gte: since } },
      select: { id: true },
    });
    if (!existing) {
      await prisma.profileView.create({
        data: { candidateId, recruiterId: recruiter?.id ?? null },
      });
    }

    return NextResponse.json({ recorded: !existing });
  } catch {
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
