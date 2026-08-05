import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";
import { getEntitlements } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const jobType = searchParams.get("jobType") || "";
    const workMode = searchParams.get("workMode") || "";
    const minSalary = searchParams.get("minSalary");
    const experience = searchParams.get("experience") || "";
    const skills = searchParams.get("skills") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // SQLite has no `mode: "insensitive"` — its LIKE is already case-insensitive for ASCII.
    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { company: { name: { contains: search } } },
      ];
    }
    if (location) where.location = { contains: location };
    if (jobType) where.jobType = { in: jobType.split(",").map((t) => t.trim()) };
    if (workMode) where.workMode = { in: workMode.split(",").map((m) => m.trim()) };
    if (category) where.category = { in: category.split(",").map((c) => c.trim()) };
    if (minSalary) where.minSalary = { gte: parseFloat(minSalary) };
    if (experience) where.experience = { contains: experience };
    if (skills) {
      // `skills` is a JSON string column, so match by substring rather than `hasSome`.
      where.AND = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ skills: { contains: s } }));
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          company: true,
          recruiter: { include: { user: { select: { name: true } } } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs: jobs.map(serializeJob),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Jobs GET error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title, description, requirements, responsibilities, skills,
      jobType, workMode, location, state, city, minSalary, maxSalary, currency,
      experience, education, openings, deadline, category,
      benefits, joiningTimeline, status,
    } = body;

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
    });

    if (!recruiter) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
    }

    // A draft is never published, so it occupies no slot and skips the quota
    // check entirely — an employer can always park work in progress.
    const isDraft = status === "DRAFT";

    if (!isDraft) {
      const entitlements = await getEntitlements(recruiter.companyId);
      if (!entitlements.canPostJob) {
        return NextResponse.json(
          {
            error: recruiter.companyId
              ? `Your ${entitlements.planName} plan allows ${entitlements.jobPostLimit} active job post${entitlements.jobPostLimit === 1 ? "" : "s"}. Close a role or upgrade to post another.`
              : "Add your company profile before posting a job.",
            code: "QUOTA_EXCEEDED",
            entitlements,
          },
          { status: 403 }
        );
      }
    }

    const job = await prisma.job.create({
      data: {
        recruiterId: recruiter.id,
        companyId: recruiter.companyId,
        title,
        description,
        requirements,
        responsibilities,
        skills: JSON.stringify(skills ?? []),
        benefits: JSON.stringify(benefits ?? []),
        joiningTimeline,
        category,
        jobType,
        workMode,
        location: location || [city, state].filter(Boolean).join(", ") || null,
        state,
        city,
        minSalary: minSalary ? parseFloat(minSalary) : undefined,
        maxSalary: maxSalary ? parseFloat(maxSalary) : undefined,
        currency: currency || "INR",
        experience,
        education,
        openings: openings || 1,
        deadline: deadline ? new Date(deadline) : undefined,
        status: isDraft ? "DRAFT" : "PENDING",
      },
      include: { company: true },
    });

    // Reporting counter for the billing period. The quota itself is enforced
    // from the live job count above, so this drifting is not a correctness bug.
    if (recruiter.companyId && !isDraft) {
      await prisma.subscription.updateMany({
        where: { companyId: recruiter.companyId, status: "ACTIVE" },
        data: { jobPostsUsed: { increment: 1 } },
      });
    }

    return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
  } catch (error) {
    console.error("Job POST error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
