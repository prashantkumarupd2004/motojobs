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
});

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

    if (!user?.password) return invalid();
    if (!(await comparePassword(data.password, user.password))) return invalid();

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Credentials are correct but the address was never confirmed — send a fresh
    // code and route the client to the verification step rather than signing in.
    if (!user.isEmailVerified) {
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

    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

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

    setSessionCookie(response, token);
    setCsrfCookie(response, generateCsrfToken());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
