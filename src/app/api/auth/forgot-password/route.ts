import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issuePasswordResetOtp } from "@/lib/otp";
import { limitBy, LIMITS } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "forgotPassword", LIMITS.forgotPassword);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always the same answer — a differing response would let an attacker
    // enumerate which addresses hold accounts.
    const message = "If an account exists for that email, a reset code has been sent.";

    if (!user?.password) return NextResponse.json({ message });

    const echo = await issuePasswordResetOtp(user);
    return NextResponse.json({ message, ...echo });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Could not send reset code" }, { status: 500 });
  }
}
