import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { ensureStarterSubscription } from "@/lib/subscription";
import { EMPLOYER_STEP_COMPLETION } from "@/lib/automotive";
import { packList, unauthorized, unpackList, zodResponse } from "@/lib/employer";
import { slugify } from "@/lib/validation/company";
import {
  EMPLOYER_LAST_STEP,
  employerDraftSchema,
  employerOnboardingSchema,
  type EmployerDraft,
} from "@/lib/validation/employer";

/**
 * Employer onboarding: Welcome → Company Information → Company Address →
 * Hiring Preferences. Mirrors the candidate wizard's contract — GET restores a
 * draft, PATCH autosaves one step, POST commits the finished profile.
 *
 * There is deliberately no verification step: the spec puts employers straight
 * into the dashboard, and document review stays a separate, optional flow.
 */

async function uniqueSlug(name: string, excludeId: string): Promise<string> {
  const base = slugify(name) || "company";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken || taken.id === excludeId) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

/**
 * Maps validated wizard input onto Company columns. Only keys present in `d`
 * are emitted, so the same function serves the partial PATCH and the full POST.
 */
function toCompanyFields(d: EmployerDraft) {
  const fields: Record<string, unknown> = {};
  const set = (key: string, value: unknown) => {
    if (value !== undefined) fields[key] = value;
  };

  set("name", d.name);
  set("logo", d.logo);
  // The wizard's "company type" is the same column the public directory reads
  // as `industry`; storing it twice would let the two drift apart.
  set("industry", d.companyType);
  set("description", d.description);
  set("website", d.website);
  set("gstNumber", d.gstNumber);
  set("panNumber", d.panNumber);
  set("email", d.email);
  set("phone", d.phone);

  set("state", d.state);
  set("city", d.city);
  set("addressLine", d.addressLine);
  set("pincode", d.pincode);
  set("mapsUrl", d.mapsUrl);

  set("hiringCategories", d.hiringCategories && packList(d.hiringCategories));
  set("hiringFrequency", d.hiringFrequency);
  set("size", d.size);
  set("hrName", d.hrName);
  set("hrPhone", d.hrPhone);

  // Kept in sync so listings that already read `headquarters` stay correct.
  if (d.city !== undefined || d.state !== undefined) {
    const parts = [d.city, d.state].filter(Boolean);
    if (parts.length) fields.headquarters = parts.join(", ");
  }

  return fields;
}

/** Feeds the wizard its saved draft so a returning employer resumes in place. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") return unauthorized();

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    include: { company: true },
  });
  const account = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true, phone: true },
  });

  const company = recruiter?.company;
  if (!company) {
    return NextResponse.json({ data: { onboardingStep: 0, account } });
  }

  return NextResponse.json({
    data: {
      ...company,
      companyType: company.industry,
      hiringCategories: unpackList(company.hiringCategories),
      account,
    },
  });
}

/** Per-step autosave, so an abandoned wizard can be resumed. */
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") return unauthorized();

  const limit = limitBy(
    req,
    "employerOnboardingDraft",
    LIMITS.employerOnboardingDraft,
    user.userId
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const step = z.number().int().min(0).max(EMPLOYER_LAST_STEP).parse(body.step);
    const draft = employerDraftSchema.parse(body.data ?? {});

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true, companyId: true },
    });
    if (!recruiter) return unauthorized();

    const existing = recruiter.companyId
      ? await prisma.company.findUnique({
          where: { id: recruiter.companyId },
          select: { onboardingStep: true, isProfileComplete: true, name: true },
        })
      : null;

    const fields = toCompanyFields(draft);
    // A completed profile keeps its 100%; a draft is only ever worth the
    // furthest step it reached.
    const onboardingStep = Math.max(step, existing?.onboardingStep ?? 0);
    const progress = {
      onboardingStep,
      ...(existing?.isProfileComplete
        ? {}
        : { profileCompletion: EMPLOYER_STEP_COMPLETION[onboardingStep] }),
    };

    let companyId = recruiter.companyId;
    if (companyId) {
      const renamed = draft.name && draft.name !== existing?.name;
      await prisma.company.update({
        where: { id: companyId },
        data: {
          ...fields,
          ...progress,
          ...(renamed ? { slug: await uniqueSlug(draft.name!, companyId) } : {}),
        },
      });
    } else {
      // Registration normally creates the company, but a recruiter row can
      // predate it — create on first save rather than dropping the draft.
      const name = draft.name?.trim() || "My company";
      const created = await prisma.company.create({
        data: { ...fields, ...progress, name, slug: await uniqueSlug(name, "") },
        select: { id: true },
      });
      companyId = created.id;
      await prisma.recruiter.update({
        where: { id: recruiter.id },
        data: { companyId },
      });
    }

    if (draft.hrName || draft.hrPhone) {
      await prisma.user.update({
        where: { id: user.userId },
        data: {
          ...(draft.hrName ? { name: draft.hrName } : {}),
          ...(draft.hrPhone ? { phone: draft.hrPhone } : {}),
        },
      });
    }

    return NextResponse.json({
      onboardingStep,
      profileCompletion: EMPLOYER_STEP_COMPLETION[onboardingStep],
    });
  } catch (error) {
    if (error instanceof z.ZodError) return zodResponse(error);
    console.error("Employer onboarding draft error:", error);
    return NextResponse.json({ error: "Could not save your progress" }, { status: 500 });
  }
}

/** Final submit — completes the profile and unlocks job posting. */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") return unauthorized();

  const limit = limitBy(req, "employerOnboarding", LIMITS.employerOnboarding, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = employerOnboardingSchema.parse(await req.json());

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true, companyId: true },
    });
    if (!recruiter) return unauthorized();

    const profile = {
      ...toCompanyFields(data),
      isProfileComplete: true,
      onboardingStep: EMPLOYER_LAST_STEP,
      profileCompletion: EMPLOYER_STEP_COMPLETION[EMPLOYER_LAST_STEP],
    };

    const company = recruiter.companyId
      ? await prisma.company.update({
          where: { id: recruiter.companyId },
          data: { ...profile, slug: await uniqueSlug(data.name, recruiter.companyId) },
        })
      : await prisma.company.create({
          data: { ...profile, name: data.name, slug: await uniqueSlug(data.name, "") },
        });

    await prisma.recruiter.update({
      where: { id: recruiter.id },
      data: { companyId: company.id },
    });

    // Gives quota checks something to read; free while BILLING_ENABLED is off.
    await ensureStarterSubscription(company.id);

    await prisma.user.update({
      where: { id: user.userId },
      data: { name: data.hrName, phone: data.hrPhone },
    });

    return NextResponse.json({
      message: "Company profile complete. Welcome aboard.",
      companyId: company.id,
      profileCompletion: profile.profileCompletion,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return zodResponse(error);
    console.error("Employer onboarding error:", error);
    return NextResponse.json({ error: "Could not save your profile" }, { status: 500 });
  }
}
