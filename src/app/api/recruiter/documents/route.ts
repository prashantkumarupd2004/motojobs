import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { companyDocumentSchema, qualifiesForVerification } from "@/lib/validation/company";

/**
 * Verification documents for the signed-in recruiter's own company. Every query
 * is scoped by the recruiter's companyId rather than by a client-supplied id,
 * so one employer can never read or delete another's paperwork.
 */
async function companyIdFor(userId: string) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId },
    select: { companyId: true },
  });
  return recruiter?.companyId ?? null;
}

/** Re-derives the badge from whatever is still approved. */
async function syncVerification(companyId: string) {
  const approved = await prisma.companyDocument.findMany({
    where: { companyId, status: "APPROVED" },
    select: { type: true },
  });
  await prisma.company.update({
    where: { id: companyId },
    data: { isVerified: qualifiesForVerification(approved.map((d) => d.type)) },
  });
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = await companyIdFor(user.userId);
  if (!companyId) return NextResponse.json({ documents: [] });

  const documents = await prisma.companyDocument.findMany({
    where: { companyId },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = limitBy(req, "companyDocument", LIMITS.companyDocument, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const input = companyDocumentSchema.parse(await req.json());

    const companyId = await companyIdFor(user.userId);
    if (!companyId) {
      return NextResponse.json(
        { error: "Save your company profile before uploading documents" },
        { status: 400 }
      );
    }

    // One document per type: re-uploading replaces the old file and sends the
    // company back to PENDING, so an approved record can't be quietly swapped.
    const existing = await prisma.companyDocument.findFirst({
      where: { companyId, type: input.type },
      select: { id: true },
    });

    const document = existing
      ? await prisma.companyDocument.update({
          where: { id: existing.id },
          data: {
            fileUrl: input.fileUrl,
            fileName: input.fileName ?? null,
            status: "PENDING",
            adminNotes: null,
            reviewedAt: null,
            uploadedAt: new Date(),
          },
        })
      : await prisma.companyDocument.create({
          data: {
            companyId,
            type: input.type,
            fileUrl: input.fileUrl,
            fileName: input.fileName ?? null,
          },
        });

    if (existing) {
      await syncVerification(companyId);
    }

    return NextResponse.json({ message: "Document uploaded", document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid document", fieldErrors },
        { status: 400 }
      );
    }
    console.error("Company document error:", error);
    return NextResponse.json({ error: "Could not upload the document" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Document id is required" }, { status: 400 });
  }

  const companyId = await companyIdFor(user.userId);
  if (!companyId) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const deleted = await prisma.companyDocument.deleteMany({
    where: { id, companyId },
  });
  if (deleted.count === 0) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Removing an approved proof must also remove the badge it earned.
  await syncVerification(companyId);

  return NextResponse.json({ message: "Document removed" });
}
