import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

/** The signed-in user's own notifications. Never accepts a userId from the client. */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unreadOnly = new URL(req.url).searchParams.get("unread") === "1";

  const [notifications, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.userId, ...(unreadOnly ? { readAt: null } : {}) },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: user.userId, readAt: null } }),
  ]);

  return NextResponse.json({ notifications, unread });
}

/** Marks one notification read, or all of them when no id is given. */
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json().catch(() => ({ id: undefined }));

  const { count } = await prisma.notification.updateMany({
    where: {
      userId: user.userId,
      readAt: null,
      ...(typeof id === "string" ? { id } : {}),
    },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ message: "Marked as read", count });
}
