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

    const savedJobs = await prisma.savedJob.findMany({
      where: { candidateId: candidate.id },
      orderBy: { savedAt: "desc" },
      include: {
        job: { include: { company: true, _count: { select: { applications: true } } } },
      },
    });

    return NextResponse.json({
      savedJobs: savedJobs.map((s) => ({ ...s, job: serializeJob(s.job) })),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved jobs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await req.json();
    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await prisma.savedJob.findUnique({
      where: { candidateId_jobId: { candidateId: candidate.id, jobId } },
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: { candidateId_jobId: { candidateId: candidate.id, jobId } },
      });
      return NextResponse.json({ message: "Job unsaved", saved: false });
    }

    await prisma.savedJob.create({ data: { candidateId: candidate.id, jobId } });
    return NextResponse.json({ message: "Job saved", saved: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
