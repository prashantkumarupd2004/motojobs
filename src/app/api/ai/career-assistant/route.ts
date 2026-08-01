import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { careerAssistantChat } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, userContext } = await req.json();
    const response = await careerAssistantChat(messages, userContext || {});

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Chat error:", error);
    return NextResponse.json({
      response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
    });
  }
}
