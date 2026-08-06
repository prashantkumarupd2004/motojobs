import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, signJWT, setSessionCookie } from "@/lib/auth";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";
import { issueEmailOtp } from "@/lib/otp";
import { limitBy, LIMITS, reset, clientIp } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
  /// Extends the session cookie from one day to thirty.
  remember: z.boolean().optional(),
});

/**
 * Records the attempt for the admin's login-history view. Failures are logged
 * with a null userId when the address does not exist, which is what makes
 * credential stuffing visible. Swallows its own errors: a logging failure must
 * never block a legitimate sign-in.
 */
async function recordLogin(
  req: NextRequest,
  input: { userId?: string; email: string; success: boolean; failReason?: string }
) {
  try {
    await prisma.loginHistory.create({
      data: {
        userId: input.userId ?? null,
        email: input.email,
        success: input.success,
        failReason: input.failReason ?? null,
        ipAddress: clientIp(req),
        userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
      },
    });
  } catch (error) {
    console.error("recordLogin failed:", error);
  }
}

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "login", LIMITS.login);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    // Identical response for unknown email and wrong password — no enumeration.
    const invalid = () =>
      NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    if (!user?.password) {
      await recordLogin(req, {
        email: data.email,
        success: false,
        failReason: "NO_ACCOUNT",
      });
      return invalid();
    }
    if (!(await comparePassword(data.password, user.password))) {
      await recordLogin(req, {
        userId: user.id,
        email: data.email,
        success: false,
        failReason: "BAD_PASSWORD",
      });
      return invalid();
    }

    if (!user.isActive) {
      await recordLogin(req, {
        userId: user.id,
        email: data.email,
        success: false,
        failReason: "SUSPENDED",
      });
      return NextResponse.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Credentials are correct but the address was never confirmed — send a fresh
    // code and route the client to the verification step rather than signing in.
    if (!user.isEmailVerified) {
      await recordLogin(req, {
        userId: user.id,
        email: data.email,
        success: false,
        failReason: "UNVERIFIED",
      });
      const echo = await issueEmailOtp(user, "SIGNUP");
      return NextResponse.json(
        {
          error: "Please verify your email to continue.",
          needsVerification: true,
          email: user.email,
          ...echo,
        },
        { status: 403 }
      );
    }

    reset(`login:${clientIp(req)}`);

    const token = await signJWT(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      data.remember
    );

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

    setSessionCookie(response, token, data.remember);
    setCsrfCookie(response, generateCsrfToken());

    await Promise.all([
      recordLogin(req, { userId: user.id, email: user.email, success: true }),
      prisma.user
        .update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
        .catch(() => {}),
    ]);

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
