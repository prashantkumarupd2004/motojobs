import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { serializeJob } from "@/lib/jobs";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const page = parseInt(new URL(req.url).searchParams.get("page") || "1");
    const limit = parseInt(new URL(req.url).searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { candidateId: candidate.id },
        skip,
        take: limit,
        orderBy: { appliedAt: "desc" },
        include: {
          job: {
            include: {
              company: true,
              recruiter: { include: { user: { select: { name: true } } } },
            },
          },
          resume: { select: { title: true } },
        },
      }),
      prisma.application.count({ where: { candidateId: candidate.id } }),
    ]);

    return NextResponse.json({
      applications: applications.map((a) => ({ ...a, job: serializeJob(a.job) })),
      total,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, resumeId, coverLetter } = body;

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // An unchecked resumeId would attach another candidate's resume, leaking its
    // public file URL to the recruiter through the ATS.
    if (resumeId) {
      const owned = await prisma.resume.findFirst({
        where: { id: resumeId, candidateId: candidate.id },
        select: { id: true },
      });
      if (!owned) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId, candidateId: candidate.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied to this job" }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        candidateId: candidate.id,
        resumeId,
        coverLetter,
        status: "APPLIED",
        stage: "Applied",
      },
      include: { job: { include: { company: true } } },
    });

    return NextResponse.json(
      { application: { ...application, job: serializeJob(application.job) } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
