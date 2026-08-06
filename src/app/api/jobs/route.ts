import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob, candidateArea, hasArea, locationRank } from "@/lib/jobs";
import { getEntitlements } from "@/lib/subscription";

/**
 * The signed-in candidate's home and preferred locations, or null when there is
 * nobody to rank for — anonymous visitors, employers, and candidates who never
 * filled in a location all fall through to plain newest-first ordering rather
 * than seeing an error.
 */
async function candidateAreaFor(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") return null;

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    select: { currentCity: true, currentState: true, preferredLocations: true },
  });
  if (!candidate) return null;

  const area = candidateArea(candidate);
  if (!hasArea(area)) return null;

  // `area` is normalised for matching; the raw value is what the UI shows.
  return { area, label: candidate.currentCity || candidate.currentState || null };
}

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
    const maxSalary = searchParams.get("maxSalary");
    const experience = searchParams.get("experience") || "";
    const skills = searchParams.get("skills") || "";
    const category = searchParams.get("category") || "";
    const nearMe = searchParams.get("nearMe") === "1";
    const sort = searchParams.get("sort") || "latest";

    // Jobs without a stated salary sort last on a salary request rather than
    // leading the list, which is what Postgres would do for DESC by default.
    const orderBy =
      sort === "salary_desc" ? [{ maxSalary: { sort: "desc" as const, nulls: "last" as const } }, { createdAt: "desc" as const }]
      : sort === "salary_asc" ? [{ minSalary: { sort: "asc" as const, nulls: "last" as const } }, { createdAt: "desc" as const }]
      : [{ createdAt: "desc" as const }];

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
    // A ceiling filters on the bottom of the job's band: a role starting above
    // the cap is out of range, but one that merely tops out higher is not.
    if (maxSalary) where.minSalary = { ...(where.minSalary as object ?? {}), lte: parseFloat(maxSalary) };
    if (experience) where.experience = { in: experience.split(",").map((e) => e.trim()) };
    if (skills) {
      // `skills` is a JSON string column, so match by substring rather than `hasSome`.
      where.AND = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ skills: { contains: s } }));
    }

    const nearby = nearMe ? await candidateAreaFor(req) : null;

    // Proximity ordering has to be applied across the whole result set, not
    // just the requested page, or page 2 would re-sort its own slice and repeat
    // jobs already shown on page 1. The filtered set is small enough to rank in
    // memory; without `nearMe` the database paginates as before.
    if (nearby) {
      const all = await prisma.job.findMany({
        where,
        orderBy,
        include: {
          company: true,
          recruiter: { include: { user: { select: { name: true } } } },
          _count: { select: { applications: true } },
        },
      });

      // Stable within a rank because `all` is already newest-first.
      const ranked = all
        .map((job, index) => ({ job, rank: locationRank(job, nearby.area), index }))
        .sort((a, b) => a.rank - b.rank || a.index - b.index)
        .map((entry) => entry.job);

      return NextResponse.json({
        jobs: ranked.slice(skip, skip + limit).map(serializeJob),
        total: ranked.length,
        page,
        limit,
        pages: Math.ceil(ranked.length / limit),
        nearMe: true,
        nearLabel: nearby.label,
      });
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
