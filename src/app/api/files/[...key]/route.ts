import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { signedReadUrl, STORAGE_CONFIGURED } from "@/lib/storage";

/**
 * Authorised redirect to a private S3 object.
 *
 * Upload keys are `{kind}/{ownerUserId}/{uuid}.{ext}`. Owning the key is the
 * default grant; a recruiter additionally gets read access to a candidate's
 * resume only once that candidate has applied to one of their jobs. Without
 * that second rule a recruiter could not open resumes they legitimately
 * received; without the ownership check any logged-in user could read any
 * resume by guessing a key.
 */

async function canRead(
  key: string,
  user: { userId: string; role: string }
): Promise<boolean> {
  const [, ownerUserId] = key.split("/");
  if (!ownerUserId) return false;
  if (ownerUserId === user.userId) return true;
  if (user.role === "ADMIN") return true;

  if (user.role === "RECRUITER") {
    const application = await prisma.application.findFirst({
      where: {
        candidate: { userId: ownerUserId },
        job: { recruiter: { userId: user.userId } },
      },
      select: { id: true },
    });
    return Boolean(application);
  }

  return false;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!STORAGE_CONFIGURED) {
    return NextResponse.json(
      { error: "File storage is not configured" },
      { status: 503 }
    );
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  // `..` in a key would resolve to a different prefix on S3.
  if (key.includes("..")) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  if (!(await canRead(key, user))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = await signedReadUrl(key);
  return NextResponse.redirect(url, {
    // The signed URL expires quickly; caching the redirect would serve a dead link.
    headers: { "Cache-Control": "private, no-store" },
  });
}
