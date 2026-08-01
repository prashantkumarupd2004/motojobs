import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { ensureStarterSubscription } from "@/lib/subscription";
import {
  companyProfileSchema,
  isCompanyComplete,
  slugify,
} from "@/lib/validation/company";

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

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    include: {
      company: { include: { documents: { orderBy: { uploadedAt: "desc" } } } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });

  if (!recruiter) {
    return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
  }

  return NextResponse.json({
    company: recruiter.company,
    designation: recruiter.designation,
    hrName: recruiter.user.name,
    isVerified: recruiter.isVerified,
  });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = limitBy(req, "companyProfile", LIMITS.companyProfile, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many updates. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { designation, hrName, ...company } = companyProfileSchema.parse(
      await req.json()
    );

    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: user.userId },
      select: { id: true, companyId: true },
    });
    if (!recruiter) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
    }

    const data = {
      ...company,
      // Kept in sync so listings that already read `headquarters` stay correct.
      headquarters: [company.city, company.state].filter(Boolean).join(", ") || null,
      isProfileComplete: isCompanyComplete(company),
    };

    const saved = recruiter.companyId
      ? await prisma.company.update({
          where: { id: recruiter.companyId },
          data: { ...data, slug: await uniqueSlug(company.name, recruiter.companyId) },
        })
      : await prisma.company.create({
          data: { ...data, slug: await uniqueSlug(company.name, "") },
        });

    await prisma.recruiter.update({
      where: { id: recruiter.id },
      data: { companyId: saved.id, designation: designation ?? null },
    });

    await ensureStarterSubscription(saved.id);

    if (hrName) {
      await prisma.user.update({ where: { id: user.userId }, data: { name: hrName } });
    }

    return NextResponse.json({ message: "Company profile saved", company: saved });
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
    console.error("Company profile error:", error);
    return NextResponse.json({ error: "Could not save your company" }, { status: 500 });
  }
}
