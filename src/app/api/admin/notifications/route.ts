import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  auditAdmin,
  badRequest,
  notFound,
  paging,
  requireAdmin,
  serverError,
  zodResponse,
} from "@/lib/admin";

/**
 * Announcements the admin broadcasts, plus a read-only view of the
 * notifications the platform has generated.
 *
 * Sending writes one `notifications` row per recipient rather than fanning out
 * at read time, so the audience is fixed at send and a later signup does not
 * retroactively receive an old announcement.
 */

const createSchema = z.object({
  title: z.string().trim().min(3, "Enter a title").max(200),
  body: z.string().trim().min(1, "Write the message").max(4000),
  audience: z.enum(["ALL", "CANDIDATES", "EMPLOYERS"]).default("ALL"),
  channel: z.enum(["IN_APP", "EMAIL", "BOTH"]).default("IN_APP"),
  link: z.string().trim().max(300).optional(),
});

const AUDIENCE_ROLE: Record<string, string | undefined> = {
  ALL: undefined,
  CANDIDATES: "CANDIDATE",
  EMPLOYERS: "RECRUITER",
};

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { page, limit, skip } = paging(req);
    const view = new URL(req.url).searchParams.get("view") ?? "announcements";

    if (view === "notifications") {
      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            type: true,
            title: true,
            body: true,
            readAt: true,
            createdAt: true,
            user: { select: { name: true, email: true, role: true } },
          },
        }),
        prisma.notification.count(),
      ]);
      return NextResponse.json({
        notifications,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.announcement.count(),
    ]);

    return NextResponse.json({
      announcements,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError("load notifications", error);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return zodResponse(parsed.error);

    const announcement = await prisma.announcement.create({
      data: { ...parsed.data, link: parsed.data.link || null, createdById: auth.user.userId },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "ANNOUNCEMENT_CREATED",
      entityType: "announcements",
      entityId: announcement.id,
    });

    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    return serverError("create this announcement", error);
  }
}

/** Sends a draft announcement to its audience. */
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await req.json();
    if (typeof id !== "string" || !id) return badRequest("An announcement id is required");

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) return notFound("Announcement not found");
    if (announcement.status === "SENT") {
      return badRequest("This announcement has already been sent");
    }

    const role = AUDIENCE_ROLE[announcement.audience];
    const recipients = await prisma.user.findMany({
      where: { isActive: true, ...(role ? { role } : { role: { in: ["CANDIDATE", "RECRUITER"] } }) },
      select: { id: true },
    });

    if (recipients.length > 0) {
      // createMany in one call: a per-user loop would take minutes at scale and
      // leave a half-sent announcement if the request timed out.
      await prisma.notification.createMany({
        data: recipients.map((r) => ({
          userId: r.id,
          type: "SYSTEM",
          title: announcement.title,
          body: announcement.body,
          link: announcement.link,
        })),
      });
    }

    const sent = await prisma.announcement.update({
      where: { id },
      data: { status: "SENT", sentAt: new Date(), sentCount: recipients.length },
    });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "ANNOUNCEMENT_SENT",
      entityType: "announcements",
      entityId: id,
      metadata: { recipients: recipients.length, audience: announcement.audience },
    });

    return NextResponse.json({ announcement: sent, recipients: recipients.length });
  } catch (error) {
    return serverError("send this announcement", error);
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("An announcement id is required");

    const existing = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, title: true },
    });
    if (!existing) return notFound("Announcement not found");

    // Deleting the announcement does not recall notifications already
    // delivered — they belong to the recipients now.
    await prisma.announcement.delete({ where: { id } });

    auditAdmin({
      req,
      actorId: auth.user.userId,
      action: "ANNOUNCEMENT_DELETED",
      entityType: "announcements",
      entityId: id,
      metadata: { title: existing.title },
    });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return serverError("delete this announcement", error);
  }
}
