import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { issueEmailOtp } from "@/lib/otp";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { slugify } from "@/lib/validation/company";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required").max(60),
    lastName: z.string().trim().min(1, "Last name is required").max(60),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[a-zA-Z]/, "Password must contain a letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
    phone: z.string().trim().max(20).optional(),
    // Employers only: the HR contact's name is firstName/lastName, so the company
    // needs its own field to avoid overloading the user's display name.
    companyName: z.string().trim().max(140).optional(),
    designation: z.string().trim().max(120).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.role !== "RECRUITER" || (d.companyName?.length ?? 0) >= 2, {
    message: "Enter your company name",
    path: ["companyName"],
  });

/** Appends a short suffix until the slug is free. */
async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "company";
  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const taken = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  return `${base}-${randomUUID().slice(0, 8)}`;
}

export async function POST(req: NextRequest) {
  const limit = limitBy(req, "register", LIMITS.register);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-up attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const data = registerSchema.parse(await req.json());
    const name = `${data.firstName} ${data.lastName}`.trim();

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, email: true, name: true, isEmailVerified: true },
    });

    // An unverified account can be re-claimed by re-sending its code; a verified
    // one must not reveal that the address is taken beyond the generic message.
    if (existing) {
      if (existing.isEmailVerified) {
        return NextResponse.json(
          { error: "This email is already registered. Please log in instead." },
          { status: 409 }
        );
      }
      const echo = await issueEmailOtp(existing, "SIGNUP");
      return NextResponse.json({
        message: "Account already pending verification. A new code has been sent.",
        email: existing.email,
        needsVerification: true,
        ...echo,
      });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: data.email,
        password: await hashPassword(data.password),
        role: data.role,
        phone: data.phone,
        isEmailVerified: false,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    if (data.role === "CANDIDATE") {
      await prisma.candidate.create({ data: { userId: user.id } });
    } else {
      const companyName = data.companyName!.trim();
      const company = await prisma.company.create({
        data: { name: companyName, slug: await uniqueSlug(companyName) },
        select: { id: true },
      });
      await prisma.recruiter.create({
        data: {
          userId: user.id,
          companyId: company.id,
          designation: data.designation || null,
        },
      });
    }

    const echo = await issueEmailOtp(user, "SIGNUP");

    // No session is issued here — the account is inert until the email is verified.
    return NextResponse.json(
      {
        message: "Account created. Check your email for a 6-digit code.",
        email: user.email,
        needsVerification: true,
        ...echo,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid details", fieldErrors },
        { status: 400 }
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
