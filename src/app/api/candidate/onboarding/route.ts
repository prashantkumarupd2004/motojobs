import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { onboardingSchema } from "@/lib/validation/candidate";

/** SQLite has no list type — arrays are persisted as JSON strings. */
const packList = (v?: string[]) => (v && v.length ? JSON.stringify(v) : null);

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = limitBy(req, "onboarding", LIMITS.onboarding, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = onboardingSchema.parse(await req.json());
    const fresher = data.candidateType === "FRESHER";

    const profile = {
      candidateType: data.candidateType,
      isProfileComplete: true,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      gender: data.gender ?? null,
      interestedRole: data.interestedRole,
      currentCity: data.currentCity,
      location: data.currentCity,
      preferredLocations: packList(data.preferredLocations),
      qualification: data.qualification,

      // Branch fields are cleared on the opposite branch so a candidate who
      // switches type cannot leave contradictory data behind.
      passingYear: fresher ? (data.passingYear ?? null) : null,
      college: fresher ? (data.college ?? null) : null,
      internship: fresher ? (data.internship ?? null) : null,
      certifications: fresher ? (data.certifications ?? null) : null,

      totalExperience: fresher ? null : (data.totalExperience ?? null),
      currentCompany: fresher ? null : (data.currentCompany ?? null),
      currentDesignation: fresher ? null : (data.currentDesignation ?? null),
      currentSalary: fresher ? null : (data.currentSalary ?? null),
      expectedSalary: data.expectedSalary ?? null,
      noticePeriodBand: fresher ? null : (data.noticePeriodBand ?? null),
      brandExperience:
        data.candidateType === "AUTOMOBILE" ? packList(data.brandExperience) : null,
      industry: data.candidateType === "NON_AUTOMOBILE" ? (data.industry ?? null) : null,

      resumeUrl: data.resumeUrl ?? null,
      resumeName: data.resumeName ?? null,
      drivingLicense: data.drivingLicense,
      ownVehicle: data.ownVehicle,
      languages: packList(data.languages),
      referralCode: data.referralCode ?? null,
      acceptedTermsAt: new Date(),
      headline: data.interestedRole,
    };

    const candidate = await prisma.candidate.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, ...profile },
      update: profile,
    });

    if (data.profileImage) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { profileImage: data.profileImage },
      });
    }

    await prisma.candidate.update({
      where: { id: candidate.id },
      data: { profileScore: scoreProfile(data) },
    });

    return NextResponse.json({
      message: "Profile saved. Welcome aboard.",
      candidateId: candidate.id,
    });
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
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Could not save your profile" }, { status: 500 });
  }
}

type Scored = z.infer<typeof onboardingSchema>;

function scoreProfile(d: Scored): number {
  let score = 40; // completing the wizard at all covers the mandatory fields
  if (d.resumeUrl) score += 20;
  if (d.profileImage) score += 10;
  if (d.dateOfBirth) score += 5;
  if (d.preferredLocations.length > 1) score += 5;
  if (d.languages.length > 1) score += 5;
  if (d.candidateType === "FRESHER") {
    if (d.internship) score += 8;
    if (d.certifications) score += 7;
  } else {
    if (d.currentSalary) score += 5;
    if (d.expectedSalary) score += 5;
    if (d.brandExperience?.length) score += 5;
  }
  return Math.min(score, 100);
}
