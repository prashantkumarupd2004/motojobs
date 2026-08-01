import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { generateResumeContent } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const result = await generateResumeContent(data);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI Resume Builder error:", error);
    return NextResponse.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
