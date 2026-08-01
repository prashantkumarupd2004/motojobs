import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, profileImage: true } },
        skills: { include: { skill: true } },
        education: true,
        workExperience: true,
        resumes: { where: { isPrimary: true } },
        verification: true,
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name, phone, headline, summary, location, experience,
      currentSalary, expectedSalary, noticePeriod, isOpenToWork,
      linkedinUrl, githubUrl, portfolioUrl, profileImage,
      education, workExperience, skills,
    } = body;

    // Update user info
    await prisma.user.update({
      where: { id: user.userId },
      data: { name, phone, profileImage },
    });

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update candidate profile
    const updated = await prisma.candidate.update({
      where: { userId: user.userId },
      data: {
        headline, summary, location,
        experience: experience ? parseInt(experience) : undefined,
        currentSalary: currentSalary ? parseFloat(currentSalary) : undefined,
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
        noticePeriod: noticePeriod ? parseInt(noticePeriod) : undefined,
        isOpenToWork,
        linkedinUrl, githubUrl, portfolioUrl,
      },
    });

    // Update education
    if (education && Array.isArray(education)) {
      await prisma.education.deleteMany({ where: { candidateId: candidate.id } });
      if (education.length > 0) {
        await prisma.education.createMany({
          data: education.map((e: any) => ({
            candidateId: candidate.id,
            degree: String(e.degree),
            institution: String(e.institution),
            field: e.field ? String(e.field) : null,
            startYear: parseInt(e.startYear),
            endYear: e.endYear ? parseInt(e.endYear) : null,
            grade: e.grade ? String(e.grade) : null,
          })),
        });
      }
    }

    // Update work experience
    if (workExperience && Array.isArray(workExperience)) {
      await prisma.workExperience.deleteMany({ where: { candidateId: candidate.id } });
      if (workExperience.length > 0) {
        await prisma.workExperience.createMany({
          data: workExperience.map((e: any) => ({
            candidateId: candidate.id,
            title: String(e.title),
            company: String(e.company),
            location: e.location ? String(e.location) : null,
            startDate: new Date(e.startDate),
            endDate: e.endDate ? new Date(e.endDate) : null,
            isCurrent: Boolean(e.isCurrent),
            description: e.description ? String(e.description) : null,
          })),
        });
      }
    }

    // Update skills
    if (skills && Array.isArray(skills)) {
      await prisma.candidateSkill.deleteMany({ where: { candidateId: candidate.id } });
      for (const skillData of skills) {
        let skill = await prisma.skill.findFirst({ where: { name: { equals: skillData.name } } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillData.name, category: skillData.category } });
        }
        await prisma.candidateSkill.create({
          data: { candidateId: candidate.id, skillId: skill.id, level: skillData.level, yearsExp: skillData.yearsExp },
        });
      }
    }

    // Calculate profile score
    const score = calculateProfileScore(updated, education, workExperience, skills);
    await prisma.candidate.update({ where: { id: candidate.id }, data: { profileScore: score } });

    return NextResponse.json({ candidate: { ...updated, profileScore: score }, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

function calculateProfileScore(
  candidate: Record<string, unknown>,
  education: unknown[],
  workExperience: unknown[],
  skills: unknown[]
): number {
  let score = 0;
  if (candidate.headline) score += 10;
  if (candidate.summary) score += 15;
  if (candidate.location) score += 5;
  if (candidate.experience !== undefined) score += 5;
  if (candidate.linkedinUrl) score += 5;
  if (candidate.githubUrl) score += 5;
  if (candidate.portfolioUrl) score += 5;
  if (education && education.length > 0) score += 15;
  if (workExperience && workExperience.length > 0) score += 20;
  if (skills && skills.length >= 5) score += 15;
  else if (skills && skills.length > 0) score += 10;
  return Math.min(score, 100);
}
