import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signJWT, setSessionCookie } from "@/lib/auth";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { consumeEmailOtp, otpErrorMessage } from "@/lib/otp";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { sendWelcomeEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "verifyOtp", LIMITS.verifyOtp);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { email, otp } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: "No active code. Please request a new one." },
        { status: 400 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email already verified. Please log in.", alreadyVerified: true },
        { status: 200 }
      );
    }

    const verdict = await consumeEmailOtp(user.id, otp, "SIGNUP");
    if (!verdict.ok) {
      return NextResponse.json({ error: otpErrorMessage(verdict.reason) }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifiedAt: new Date() },
    });

    sendWelcomeEmail(user.email, user.name, user.role).catch(console.error);

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Email verified. Your account is now active.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    setSessionCookie(response, token);
    setCsrfCookie(response, generateCsrfToken());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid code" },
        { status: 400 }
      );
    }
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
