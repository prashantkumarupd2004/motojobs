import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const ratings = await prisma.candidateRating.findMany({
      where: { recruiterId: recruiter.id },
      orderBy: { createdAt: "desc" },
      include: {
        candidate: {
          include: {
            user: { select: { id: true, name: true, email: true, profileImage: true } },
          },
        },
      },
    });

    return NextResponse.json({ ratings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recruiter = await prisma.recruiter.findUnique({ where: { userId: user.userId } });
    if (!recruiter) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { candidateId, jobId, rating, notes, tags } = await req.json();

    const ratingRecord = await prisma.candidateRating.create({
      data: {
        candidateId,
        recruiterId: recruiter.id,
        jobId,
        rating: parseInt(rating),
        notes,
        tags: tags || [],
      },
    });

    return NextResponse.json({ rating: ratingRecord }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create rating" }, { status: 500 });
  }
}
