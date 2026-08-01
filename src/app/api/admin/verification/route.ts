import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "recruiter"; // recruiter | candidate
    const status = searchParams.get("status") || "";

    if (type === "recruiter") {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      const verifications = await prisma.recruiterVerification.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        include: {
          recruiter: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              company: true,
            },
          },
        },
      });
      return NextResponse.json({ verifications });
    } else {
      const where: Record<string, unknown> = {};
      if (status) where.status = status;
      const verifications = await prisma.candidateVerification.findMany({
        where,
        orderBy: { submittedAt: "desc" },
        include: {
          candidate: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      });
      return NextResponse.json({ verifications });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, type, status, adminNotes } = await req.json();

    if (type === "recruiter") {
      const verification = await prisma.recruiterVerification.update({
        where: { id },
        data: { status, adminNotes, reviewedAt: new Date() },
      });

      if (status === "VERIFIED") {
        await prisma.recruiter.update({
          where: { id: verification.recruiterId },
          data: { isVerified: true },
        });
      }

      return NextResponse.json({ verification });
    } else {
      const verification = await prisma.candidateVerification.update({
        where: { id },
        data: { status, adminNotes, reviewedAt: new Date() },
      });
      return NextResponse.json({ verification });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to update verification" }, { status: 500 });
  }
}
