import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { documentReviewSchema, qualifiesForVerification } from "@/lib/validation/company";
import { logActivity, notifyCompany } from "@/lib/notifications";
import { COMPANY_DOCUMENT_TYPES } from "@/lib/automotive";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = new URL(req.url).searchParams.get("status") || "PENDING";
  const where = status === "ALL" ? {} : { status };

  const documents = await prisma.companyDocument.findMany({
    where,
    orderBy: { uploadedAt: "desc" },
    take: 200,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          gstNumber: true,
          city: true,
          state: true,
          isVerified: true,
        },
      },
    },
  });

  const counts = await prisma.companyDocument.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return NextResponse.json({
    documents,
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count.status])),
  });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, adminNotes } = documentReviewSchema.parse(await req.json());

    const document = await prisma.companyDocument.findUnique({
      where: { id },
      select: { companyId: true },
    });
    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const updated = await prisma.companyDocument.update({
      where: { id },
      data: { status, adminNotes: adminNotes ?? null, reviewedAt: new Date() },
    });

    const approved = await prisma.companyDocument.findMany({
      where: { companyId: document.companyId, status: "APPROVED" },
      select: { type: true },
    });

    // Recomputed from scratch on every review so a rejection can also revoke
    // a badge the company had already earned.
    const isVerified = qualifiesForVerification(approved.map((d) => d.type));
    await prisma.company.update({
      where: { id: document.companyId },
      data: { isVerified },
    });

    const label =
      COMPANY_DOCUMENT_TYPES.find((d) => d.id === updated.type)?.label ?? "Document";

    await notifyCompany(document.companyId, {
      type: "DOCUMENT_REVIEWED",
      title:
        status === "APPROVED"
          ? `${label} approved`
          : `${label} needs another look`,
      body:
        status === "APPROVED"
          ? isVerified
            ? "Your company is now verified — the badge is live on your profile."
            : "Upload one more proof to earn your verified badge."
          : adminNotes,
      link: "/recruiter/company",
    });

    await logActivity({
      req,
      actorId: user.userId,
      action: status === "APPROVED" ? "DOCUMENT_APPROVED" : "DOCUMENT_REJECTED",
      entityType: "company_documents",
      entityId: id,
      metadata: { companyId: document.companyId, type: updated.type, isVerified },
    });

    return NextResponse.json({ message: "Document reviewed", document: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid review" },
        { status: 400 }
      );
    }
    console.error("Document review error:", error);
    return NextResponse.json({ error: "Could not review the document" }, { status: 500 });
  }
}
