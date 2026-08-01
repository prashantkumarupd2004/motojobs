import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { consumePasswordResetOtp, otpErrorMessage } from "@/lib/otp";
import { limitBy, LIMITS } from "@/lib/rate-limit";

const schema = z
  .object({
    email: z.string().trim().toLowerCase().email(),
    otp: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[a-zA-Z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "resetPassword", LIMITS.resetPassword);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { email, otp, password } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "No active code. Please request a new one." },
        { status: 400 }
      );
    }

    const verdict = await consumePasswordResetOtp(user.id, otp);
    if (!verdict.ok) {
      return NextResponse.json({ error: otpErrorMessage(verdict.reason) }, { status: 400 });
    }

    // A successful reset also proves control of the inbox, so confirm the email.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(password),
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Force a fresh sign-in rather than issuing a session from the reset flow.
    return NextResponse.json({
      message: "Password updated. You can now log in.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid details" },
        { status: 400 }
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Could not reset password" }, { status: 500 });
  }
}
