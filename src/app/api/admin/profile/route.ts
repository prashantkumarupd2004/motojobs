import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/auth";
import { auditAdmin, badRequest, requireAdmin, serverError, zodResponse } from "@/lib/admin";

/**
 * The single admin's own account. Deliberately narrow: name, phone and
 * password. The role is not editable — there is one admin, and letting it
 * demote itself would lock everyone out of the panel.
 */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120).optional(),
  phone: z.string().trim().max(20).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128)
    .regex(/[a-zA-Z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
});

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const [user, recentLogins] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.loginHistory.findMany({
        where: { userId: auth.user.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, success: true, ipAddress: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({ user, recentLogins });
  } catch (error) {
    return serverError("load your profile", error);
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();

    if (body.action === "password") {
      const parsed = passwordSchema.safeParse(body);
      if (!parsed.success) return zodResponse(parsed.error);

      const user = await prisma.user.findUnique({
        where: { id: auth.user.userId },
        select: { password: true },
      });
      if (!user?.password) {
        return badRequest("This account has no password set");
      }

      const valid = await comparePassword(parsed.data.currentPassword, user.password);
      if (!valid) {
        return badRequest("That is not your current password", {
          currentPassword: "Incorrect password",
        });
      }

      await prisma.user.update({
        where: { id: auth.user.userId },
        data: { password: await hashPassword(parsed.data.newPassword) },
      });

      auditAdmin({
        req,
        actorId: auth.user.userId,
        action: "ADMIN_PASSWORD_CHANGED",
        entityType: "users",
        entityId: auth.user.userId,
      });

      return NextResponse.json({ message: "Password updated" });
    }

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return zodResponse(parsed.error);

    const user = await prisma.user.update({
      where: { id: auth.user.userId },
      data: parsed.data,
      select: { id: true, name: true, email: true, phone: true },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "ADMIN_PROFILE_UPDATED",
      entityType: "users",
      entityId: auth.user.userId,
    });

    return NextResponse.json({ user });
  } catch (error) {
    return serverError("save your profile", error);
  }
}
