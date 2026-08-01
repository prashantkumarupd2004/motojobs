import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { screenCandidate } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, applicationId } = await req.json();

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!recruiter) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Both lookups are scoped to this recruiter's own roles. Keyed on the
    // client-supplied ids alone, any recruiter could screen — and overwrite the
    // aiScore of — an applicant to a competitor's job.
    const [job, application] = await Promise.all([
      prisma.job.findFirst({ where: { id: jobId, recruiterId: recruiter.id } }),
      prisma.application.findFirst({
        where: { id: applicationId, job: { recruiterId: recruiter.id } },
        include: {
          candidate: {
            include: {
              skills: { include: { skill: true } },
              education: true,
              workExperience: true,
            },
          },
        },
      }),
    ]);

    if (!job || !application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const candidate = application.candidate;
    const topEducation = candidate.education[0];
    const result = await screenCandidate({
      jobTitle: job.title,
      jobRequirements: job.requirements || job.description,
      jobSkills: JSON.parse(job.skills || "[]"),
      candidateProfile: {
        experience: candidate.experience || 0,
        skills: candidate.skills.map((s: any) => s.skill.name),
        education: topEducation ? `${topEducation.degree} from ${topEducation.institution}` : "Not specified",
        summary: "", // candidate.summary
      },
    });

    // Save AI score to application
    await prisma.application.update({
      where: { id: applicationId },
      data: { aiScore: result.score, aiNotes: result.summary },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI Screening error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
