import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/rate-limit";

/**
 * Notifications and the audit trail. Both are side effects of an action that
 * already succeeded, so every helper here swallows its own errors: failing to
 * record a notification must never roll back the job approval that caused it.
 */

export type NotificationType =
  | "APPLICATION_STATUS"
  | "NEW_APPLICANT"
  | "JOB_APPROVED"
  | "JOB_REJECTED"
  | "DOCUMENT_REVIEWED"
  | "SUBSCRIPTION"
  | "MESSAGE"
  | "SYSTEM";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
}) {
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
      },
    });
  } catch (error) {
    console.error("notify failed:", error);
  }
}

/** Resolves the user behind a company so a company-level event can reach a person. */
export async function notifyCompany(
  companyId: string,
  input: Omit<Parameters<typeof notify>[0], "userId">
) {
  const recruiters = await prisma.recruiter.findMany({
    where: { companyId },
    select: { userId: true },
  });
  await Promise.all(recruiters.map((r) => notify({ ...input, userId: r.userId })));
}

export async function logActivity(input: {
  req?: NextRequest;
  actorId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ipAddress: input.req ? clientIp(input.req) : null,
      },
    });
  } catch (error) {
    console.error("logActivity failed:", error);
  }
}
