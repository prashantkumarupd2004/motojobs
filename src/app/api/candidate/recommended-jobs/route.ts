import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { parseSkills } from "@/lib/jobs";

/**
 * Ranks open jobs against the candidate's onboarding profile.
 *
 * The weights are deliberately blunt: category and location dominate because in
 * auto retail a technician will not commute across states for a marginally
 * better skills match. Salary only ever adds — never penalises — so a candidate
 * who left expectations blank is not pushed down the list.
 */
const WEIGHTS = {
  category: 30,
  location: 25,
  skills: 20,
  role: 15,
  employmentType: 5,
  salary: 5,
} as const;

const unpack = (v: string | null): string[] => {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const norm = (v: string | null | undefined) => (v ?? "").trim().toLowerCase();

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Number(new URL(req.url).searchParams.get("limit") ?? 6) || 6,
    20
  );

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    include: { skills: { include: { skill: true } } },
  });
  if (!candidate) {
    return NextResponse.json({ data: [] });
  }

  const [jobs, savedJobs] = await Promise.all([
    prisma.job.findMany({
      where: { status: "APPROVED" },
      include: { company: { select: { name: true, logo: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      take: 120,
    }),
    prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      select: { jobId: true },
    }),
  ]);

  const savedIds = new Set(savedJobs.map((s) => s.jobId));
  const wantedCategories = new Set(unpack(candidate.jobCategories));
  const wantedTitles = unpack(candidate.jobTitles).map(norm);
  const mySkills = new Set(candidate.skills.map((s) => norm(s.skill.name)));
  const cities = new Set(
    [
      ...unpack(candidate.preferredLocations),
      candidate.preferredCity,
      candidate.currentCity,
    ]
      .filter(Boolean)
      .map((c) => norm(c as string))
  );
  const states = new Set(
    [candidate.preferredState, candidate.currentState].filter(Boolean).map((s) => norm(s as string))
  );

  const scored = jobs.map((job) => {
    let score = 0;
    const reasons: string[] = [];

    if (job.category && wantedCategories.has(job.category)) {
      score += WEIGHTS.category;
      reasons.push("Category match");
    }

    const jobLocation = norm(job.location);
    if (jobLocation) {
      if ([...cities].some((c) => c && jobLocation.includes(c))) {
        score += WEIGHTS.location;
        reasons.push("In your preferred city");
      } else if ([...states].some((s) => s && jobLocation.includes(s))) {
        score += Math.round(WEIGHTS.location * 0.6);
        reasons.push("In your state");
      }
    }

    const jobSkills = parseSkills(job.skills).map(norm);
    if (jobSkills.length && mySkills.size) {
      const overlap = jobSkills.filter((s) => mySkills.has(s)).length;
      if (overlap) {
        score += Math.round((overlap / jobSkills.length) * WEIGHTS.skills);
        reasons.push(`${overlap} skill${overlap > 1 ? "s" : ""} matched`);
      }
    }

    const title = norm(job.title);
    if (title) {
      const wanted = [norm(candidate.preferredRole), norm(candidate.interestedRole), ...wantedTitles];
      if (wanted.some((r) => r && (title.includes(r) || r.includes(title)))) {
        score += WEIGHTS.role;
        reasons.push("Matches your role");
      }
    }

    if (candidate.employmentType && job.jobType === candidate.employmentType) {
      score += WEIGHTS.employmentType;
    }

    if (candidate.expectedSalary && job.maxSalary && job.maxSalary >= candidate.expectedSalary) {
      score += WEIGHTS.salary;
      reasons.push("Meets your salary expectation");
    }

    return {
      ...job,
      skills: parseSkills(job.skills),
      isSaved: savedIds.has(job.id),
      matchScore: Math.min(score, 100),
      matchReasons: reasons.slice(0, 3),
    };
  });

  const data = scored
    .filter((j) => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore || +b.createdAt - +a.createdAt)
    .slice(0, limit);

  // A brand-new candidate can match nothing at all; showing the newest open
  // jobs beats an empty dashboard.
  if (data.length === 0) {
    return NextResponse.json({
      data: scored.slice(0, limit),
      fallback: true,
    });
  }

  return NextResponse.json({ data });
}
