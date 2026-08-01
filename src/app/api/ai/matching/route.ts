import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { matchCandidateToJobs } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { parseSkills, serializeJob } from "@/lib/jobs";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      include: {
        skills: { include: { skill: true } },
        education: { orderBy: { startYear: "desc" }, take: 1 },
      },
    });

    if (!candidate) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const jobs = await prisma.job.findMany({
      where: { status: "APPROVED" },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: { company: true },
    });

    if (jobs.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const topEducation = candidate.education[0];
    const result = await matchCandidateToJobs({
      candidateProfile: {
        skills: candidate.skills.map((s: any) => s.skill.name),
        experience: candidate.experience || 0,
        education: topEducation ? `${topEducation.degree}` : "Not specified",
        targetRoles: candidate.headline ? [candidate.headline] : [],
      },
      jobs: jobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        skills: parseSkills(j.skills),
        experience: j.experience || "",
      })),
    });

    const matches = (result.matches || [])
      .filter((m: { score: number }) => m.score >= 50)
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
      .slice(0, 10)
      .map((m: { jobIndex: number; score: number; reasons: string[] }) => ({
        job: jobs[m.jobIndex] ? serializeJob(jobs[m.jobIndex]) : null,
        score: m.score,
        reasons: m.reasons,
      }))
      .filter((m: { job: unknown }) => m.job !== null);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("AI Matching error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
