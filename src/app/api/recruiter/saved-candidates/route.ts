import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { employerContext, notFound, rateLimited, unauthorized } from "@/lib/employer";

/**
 * The employer's candidate shortlist. Scoped to the company rather than the
 * individual recruiter, so a colleague sees the same saved set.
 */

const saveSchema = z.object({
  candidateId: z.string().trim().min(1),
  notes: z.string().trim().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context) return notFound("Recruiter profile not found");
    if (!context.companyId) return NextResponse.json({ saved: [] });

    const saved = await prisma.savedCandidate.findMany({
      where: { companyId: context.companyId },
      orderBy: { savedAt: "desc" },
      include: {
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
            skills: { include: { skill: { select: { name: true } } } },
            resumes: {
              where: { isPrimary: true },
              select: { id: true, title: true, fileUrl: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ saved });
  } catch (error) {
    console.error("Saved candidates GET error:", error);
    return NextResponse.json({ error: "Failed to load saved candidates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const limit = limitBy(req, "savedCandidate", LIMITS.savedCandidate, user.userId);
    if (!limit.ok) return rateLimited(limit.retryAfter);

    const context = await employerContext(user);
    if (!context?.companyId) return notFound("Complete your company profile first");

    const parsed = saveSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }
    const { candidateId, notes } = parsed.data;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true },
    });
    if (!candidate) return notFound("Candidate not found");

    // Saving twice is a no-op rather than an error — the button is a toggle and
    // two tabs can race.
    const saved = await prisma.savedCandidate.upsert({
      where: {
        companyId_candidateId: { companyId: context.companyId, candidateId },
      },
      create: { companyId: context.companyId, candidateId, notes: notes ?? null },
      update: { ...(notes !== undefined ? { notes } : {}) },
    });

    return NextResponse.json({ saved }, { status: 201 });
  } catch (error) {
    console.error("Saved candidates POST error:", error);
    return NextResponse.json({ error: "Failed to save candidate" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") return unauthorized();

    const context = await employerContext(user);
    if (!context?.companyId) return notFound("Recruiter profile not found");

    const candidateId = new URL(req.url).searchParams.get("candidateId");
    if (!candidateId) {
      return NextResponse.json({ error: "A candidate id is required" }, { status: 400 });
    }

    const { count } = await prisma.savedCandidate.deleteMany({
      where: { companyId: context.companyId, candidateId },
    });

    return NextResponse.json({ removed: count });
  } catch (error) {
    console.error("Saved candidates DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove candidate" }, { status: 500 });
  }
}
