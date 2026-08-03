import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { AUTOMOTIVE_SKILLS, CATEGORY_BY_JOB_TITLE, STEP_COMPLETION } from "@/lib/automotive";
import {
  onboardingDraftSchema,
  onboardingSchema,
  type OnboardingDraft,
} from "@/lib/validation/candidate";

/** SQLite has no list type — arrays are persisted as JSON strings. */
const packList = (v?: string[]) => (v && v.length ? JSON.stringify(v) : null);

const SKILL_CATEGORY = new Map(AUTOMOTIVE_SKILLS.map((s) => [s.name, s.category]));

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function zodResponse(error: z.ZodError) {
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

/**
 * Maps validated wizard input onto Candidate columns. Only keys present in
 * `d` are emitted, so the same function serves the partial PATCH autosave and
 * the complete POST submit.
 */
function toCandidateFields(d: OnboardingDraft) {
  const fields: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };

  set("dateOfBirth", d.dateOfBirth ? new Date(d.dateOfBirth) : undefined);
  set("gender", d.gender);
  set("currentCity", d.currentCity);
  set("currentState", d.currentState);
  set("location", d.currentCity);
  set("panNumber", d.panNumber);
  set("panCardUrl", d.panCardUrl);

  set("candidateType", d.candidateType);
  set("qualification", d.qualification);
  set("drivingLicense", d.drivingLicense);
  set("ownVehicle", d.ownVehicle);

  if (d.candidateType !== undefined) {
    // Branch fields are cleared on the opposite branch so a candidate who
    // switches type cannot leave contradictory data behind.
    const fresher = d.candidateType === "FRESHER";
    fields.passingYear = fresher ? (d.passingYear ?? null) : null;
    fields.college = fresher ? (d.college ?? null) : null;
    fields.internship = fresher ? (d.internship ?? null) : null;
    fields.certifications = fresher ? (d.certifications ?? null) : null;

    fields.totalExperience = fresher ? null : (d.totalExperience ?? null);
    fields.currentCompany = fresher ? null : (d.currentCompany ?? null);
    fields.currentDesignation = fresher ? null : (d.currentDesignation ?? null);
    fields.currentSalary = fresher ? null : (d.currentSalary ?? null);
    fields.noticePeriodBand = fresher ? null : (d.noticePeriodBand ?? null);
    fields.industry = d.candidateType === "NON_AUTOMOBILE" ? (d.industry ?? null) : null;
  }

  // Job postings are tagged by category, so titles are stored alongside the
  // categories they roll up to — matching reads the latter.
  if (d.jobTitles !== undefined) {
    fields.jobTitles = packList(d.jobTitles);
    const categories = [
      ...new Set(d.jobTitles.map((t) => CATEGORY_BY_JOB_TITLE[t]).filter(Boolean)),
    ];
    fields.jobCategories = packList(categories);
  }
  set("brandExperience", d.brandExperience && packList(d.brandExperience));

  set("resumeUrl", d.resumeUrl);
  set("resumeName", d.resumeName);

  set("interestedRole", d.interestedRole);
  set("headline", d.interestedRole);
  set("preferredRole", d.interestedRole);
  set("preferredBrand", d.preferredBrand);
  set("preferredState", d.preferredState);
  set("preferredCity", d.preferredCity);
  set("employmentType", d.employmentType);
  set("expectedSalary", d.expectedSalary);
  set("languages", d.languages && packList(d.languages));
  set("referralCode", d.referralCode);

  // The wizard asks for a single preferred city; matching reads the list.
  const locations = d.preferredLocations?.length
    ? d.preferredLocations
    : d.preferredCity
      ? [d.preferredCity]
      : undefined;
  set("preferredLocations", locations && packList(locations));

  return fields;
}

/** Replaces the candidate's skill set. Skills are shared rows keyed by name. */
async function saveSkills(candidateId: string, names: string[]) {
  await prisma.candidateSkill.deleteMany({ where: { candidateId } });
  for (const name of names) {
    const skill =
      (await prisma.skill.findFirst({ where: { name } })) ??
      (await prisma.skill.create({
        data: { name, category: SKILL_CATEGORY.get(name) ?? null },
      }));
    await prisma.candidateSkill.create({ data: { candidateId, skillId: skill.id } });
  }
}

async function applyProfileImage(userId: string, profileImage?: string) {
  if (profileImage) {
    await prisma.user.update({ where: { id: userId }, data: { profileImage } });
  }
}

async function applyIdentity(userId: string, name?: string, phone?: string) {
  const data: { name?: string; phone?: string } = {};
  if (name) data.name = name;
  if (phone) data.phone = phone;
  if (Object.keys(data).length) await prisma.user.update({ where: { id: userId }, data });
}

/** Per-step autosave, so an abandoned wizard can be resumed. */
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") return unauthorized();

  const limit = limitBy(req, "onboardingDraft", LIMITS.onboardingDraft, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const step = z.number().int().min(0).max(STEP_COMPLETION.length - 1).parse(body.step);
    const draft = onboardingDraftSchema.parse(body.data ?? {});

    const existing = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      select: { id: true, profileStep: true, isProfileComplete: true },
    });

    const fields = toCandidateFields(draft);
    // A completed profile keeps its 100%; a draft is only ever worth the
    // furthest step it reached.
    const profileStep = Math.max(step, existing?.profileStep ?? 0);
    const progress = {
      profileStep,
      ...(existing?.isProfileComplete ? {} : { profileScore: STEP_COMPLETION[profileStep] }),
    };

    const candidate = await prisma.candidate.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, ...fields, ...progress },
      update: { ...fields, ...progress },
    });

    if (draft.skills) await saveSkills(candidate.id, draft.skills);
    await applyProfileImage(user.userId, draft.profileImage);
    await applyIdentity(user.userId, draft.fullName, draft.phone);

    return NextResponse.json({ profileStep, profileScore: candidate.profileScore });
  } catch (error) {
    if (error instanceof z.ZodError) return zodResponse(error);
    console.error("Onboarding draft error:", error);
    return NextResponse.json({ error: "Could not save your progress" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") return unauthorized();

  const limit = limitBy(req, "onboarding", LIMITS.onboarding, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = onboardingSchema.parse(await req.json());
    const lastStep = STEP_COMPLETION.length - 1;

    const profile = {
      ...toCandidateFields(data),
      isProfileComplete: true,
      profileStep: lastStep,
      profileScore: STEP_COMPLETION[lastStep],
      acceptedTermsAt: new Date(),
    };

    const candidate = await prisma.candidate.upsert({
      where: { userId: user.userId },
      create: { userId: user.userId, ...profile },
      update: profile,
    });

    await saveSkills(candidate.id, data.skills);
    await applyProfileImage(user.userId, data.profileImage);
    await applyIdentity(user.userId, data.fullName, data.phone);

    return NextResponse.json({
      message: "Profile saved. Welcome aboard.",
      candidateId: candidate.id,
      profileScore: profile.profileScore,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return zodResponse(error);
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Could not save your profile" }, { status: 500 });
  }
}

/** Feeds the wizard its saved draft so a returning candidate resumes in place. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "CANDIDATE") return unauthorized();

  const candidate = await prisma.candidate.findUnique({
    where: { userId: user.userId },
    include: { skills: { include: { skill: true } } },
  });
  const account = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true, phone: true, profileImage: true },
  });

  if (!candidate) {
    return NextResponse.json({ data: { profileStep: 0, account } });
  }

  const unpack = (v: string | null): string[] => {
    if (!v) return [];
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return NextResponse.json({
    data: {
      ...candidate,
      account,
      preferredLocations: unpack(candidate.preferredLocations),
      brandExperience: unpack(candidate.brandExperience),
      languages: unpack(candidate.languages),
      jobCategories: unpack(candidate.jobCategories),
      jobTitles: unpack(candidate.jobTitles),
      skills: candidate.skills.map((s) => s.skill.name),
    },
  });
}
