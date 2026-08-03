import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { AUTOMOTIVE_SKILLS, CATEGORY_BY_JOB_TITLE, STEP_COMPLETION } from "@/lib/automotive";
import { profileUpdateSchema } from "@/lib/validation/candidate";

const SKILL_CATEGORY = new Map(AUTOMOTIVE_SKILLS.map((s) => [s.name, s.category]));

/** SQLite has no list type — arrays are persisted as JSON strings. */
const packList = (v?: string[]) => (v && v.length ? JSON.stringify(v) : null);

const unpack = (v: string | null): string[] => {
  if (!v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

    return NextResponse.json({
      data: {
        ...candidate,
        preferredLocations: unpack(candidate.preferredLocations),
        brandExperience: unpack(candidate.brandExperience),
        languages: unpack(candidate.languages),
        jobCategories: unpack(candidate.jobCategories),
        jobTitles: unpack(candidate.jobTitles),
        skills: candidate.skills.map((s) => s.skill.name),
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = profileUpdateSchema.parse(await req.json());

    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      select: { id: true, isProfileComplete: true, profileStep: true },
    });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.fullName || body.phone || body.profileImage) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(body.fullName ? { name: body.fullName } : {}),
          ...(body.phone ? { phone: body.phone } : {}),
          ...(body.profileImage ? { profileImage: body.profileImage } : {}),
        },
      });
    }

    const set = <T,>(v: T) => (v === undefined ? undefined : v);
    const updated = await prisma.candidate.update({
      where: { userId: user.userId },
      data: {
        headline: set(body.headline),
        summary: set(body.summary),
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: set(body.gender),
        currentState: set(body.currentState),
        currentCity: set(body.currentCity),
        location: set(body.currentCity),
        panNumber: set(body.panNumber),
        panCardUrl: set(body.panCardUrl),

        candidateType: set(body.candidateType),
        qualification: set(body.qualification),
        passingYear: set(body.passingYear),
        college: set(body.college),
        totalExperience: set(body.totalExperience),
        currentCompany: set(body.currentCompany),
        currentDesignation: set(body.currentDesignation),
        currentSalary: set(body.currentSalary),
        noticePeriodBand: set(body.noticePeriodBand),
        industry: set(body.industry),
        drivingLicense: set(body.drivingLicense),
        ownVehicle: set(body.ownVehicle),

        jobTitles: body.jobTitles ? packList(body.jobTitles) : undefined,
        // Jobs are tagged by category, so titles always write both.
        jobCategories: body.jobTitles
          ? packList([
              ...new Set(
                body.jobTitles.map((t) => CATEGORY_BY_JOB_TITLE[t]).filter(Boolean)
              ),
            ])
          : undefined,
        brandExperience: body.brandExperience ? packList(body.brandExperience) : undefined,

        resumeUrl: set(body.resumeUrl),
        resumeName: set(body.resumeName),

        interestedRole: set(body.interestedRole),
        preferredRole: set(body.interestedRole),
        preferredBrand: set(body.preferredBrand),
        preferredState: set(body.preferredState),
        preferredCity: set(body.preferredCity),
        employmentType: set(body.employmentType),
        expectedSalary: set(body.expectedSalary),
        languages: body.languages ? packList(body.languages) : undefined,
        preferredLocations: body.preferredLocations
          ? packList(body.preferredLocations)
          : undefined,
        isOpenToWork: set(body.isOpenToWork),

        // Completion is owned by the onboarding step model. Editing the profile
        // must never recompute — and silently lower — a finished profile.
        profileScore: candidate.isProfileComplete
          ? STEP_COMPLETION[STEP_COMPLETION.length - 1]
          : STEP_COMPLETION[candidate.profileStep] ?? 0,
      },
    });

    if (body.skills) {
      await prisma.candidateSkill.deleteMany({ where: { candidateId: candidate.id } });
      for (const name of body.skills) {
        const skill =
          (await prisma.skill.findFirst({ where: { name } })) ??
          (await prisma.skill.create({
            data: { name, category: SKILL_CATEGORY.get(name) ?? null },
          }));
        await prisma.candidateSkill.create({
          data: { candidateId: candidate.id, skillId: skill.id },
        });
      }
    }

    return NextResponse.json({ data: updated, message: "Profile updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid details", fieldErrors },
        { status: 400 }
      );
    }
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
