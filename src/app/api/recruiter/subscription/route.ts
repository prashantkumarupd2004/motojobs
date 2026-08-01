import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { getEntitlements } from "@/lib/subscription";

/** The signed-in recruiter's plan and current usage, for the dashboard meter. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { companyId: true },
  });
  if (!recruiter) {
    return NextResponse.json({ error: "Recruiter profile not found" }, { status: 404 });
  }

  return NextResponse.json({ entitlements: await getEntitlements(recruiter.companyId) });
}
