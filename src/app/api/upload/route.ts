import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthUser } from "@/lib/auth";
import {
  IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
  MAX_RESUME_BYTES,
  RESUME_MIME_TYPES,
} from "@/lib/automotive";
import { limitBy, LIMITS } from "@/lib/rate-limit";
import { putObject, STORAGE_CONFIGURED } from "@/lib/storage";

/**
 * The stored extension is derived from the MIME allow-list, never from the
 * client-supplied filename — otherwise `evil.pdf.html` would land in a
 * publicly served directory and execute as markup.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const ALLOWED = new Set<string>([...RESUME_MIME_TYPES, ...IMAGE_MIME_TYPES]);

function maxBytesFor(mime: string) {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mime)
    ? MAX_IMAGE_BYTES
    : MAX_RESUME_BYTES;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = limitBy(req, "upload", LIMITS.upload, user.userId);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, DOC, DOCX, JPG, PNG or WEBP." },
        { status: 415 }
      );
    }

    const maxBytes = maxBytesFor(file.type);
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${maxBytes / (1024 * 1024)}MB.` },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const isImage = (IMAGE_MIME_TYPES as readonly string[]).includes(file.type);
    // Namespaced by owner so a leaked key can't be walked to another user's files.
    const key = `${isImage ? "images" : "resumes"}/${user.userId}/${randomUUID()}.${
      EXTENSION_BY_MIME[file.type]
    }`;

    if (!STORAGE_CONFIGURED) {
      return NextResponse.json(
        { error: "File storage is not configured" },
        { status: 503 }
      );
    }

    await putObject({ key, body: buffer, contentType: file.type });

    return NextResponse.json({
      // Objects are private; this route serves them after an auth check.
      url: `/api/files/${key}`,
      key,
      // Display name only — stripped so it can never be rendered as markup.
      name: file.name.replace(/[^\w.\- ]/g, "").slice(0, 120) || key,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
