import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const alerts = await prisma.jobAlert.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const candidate = await prisma.candidate.findUnique({ where: { userId: user.userId } });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const alert = await prisma.jobAlert.create({
      data: {
        candidateId: candidate.id,
        keywords: body.keywords || [],
        location: body.location,
        jobType: body.jobType,
        minSalary: body.minSalary ? parseFloat(body.minSalary) : undefined,
        frequency: body.frequency || "daily",
        isActive: true,
      },
    });

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user || user.role !== "CANDIDATE") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const candidate = await prisma.candidate.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Scoped delete: keyed on the id alone, any candidate could delete another
    // candidate's alert.
    const { count } = await prisma.jobAlert.deleteMany({
      where: { id, candidateId: candidate.id },
    });
    if (!count) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

    return NextResponse.json({ message: "Alert deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
