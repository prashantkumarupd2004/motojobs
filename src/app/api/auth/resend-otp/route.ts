import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { issueEmailOtp } from "@/lib/otp";
import { limitBy, LIMITS } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "sendOtp", LIMITS.sendOtp);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Please wait ${limit.retryAfter}s before requesting another code.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, isEmailVerified: true },
    });

    // Generic response regardless of whether the account exists or is already
    // verified — the endpoint must not confirm which emails are registered.
    const generic = NextResponse.json({
      message: "If that account needs verification, a code is on its way.",
    });

    if (!user || user.isEmailVerified) return generic;

    const echo = await issueEmailOtp(user, "SIGNUP");
    return NextResponse.json({
      message: "If that account needs verification, a code is on its way.",
      ...echo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    console.error("Resend OTP error:", error);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
