import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser, type JWTPayload } from "@/lib/auth";
import { logActivity } from "@/lib/notifications";

/**
 * Shared plumbing for the admin panel.
 *
 * There is exactly one privileged role. Every admin route calls `requireAdmin`
 * rather than re-checking `role === "ADMIN"` inline, so the gate cannot be
 * forgotten on a new endpoint.
 */

export type AdminUser = JWTPayload;

interface Denied {
  ok: false;
  response: NextResponse;
}

interface Allowed {
  ok: true;
  user: AdminUser;
}

export async function requireAdmin(req: NextRequest): Promise<Allowed | Denied> {
  const user = await getAuthUser(req);
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (user.role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true, user };
}

export function badRequest(message: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json({ error: message, fieldErrors }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(scope: string, error: unknown) {
  console.error(`${scope}:`, error);
  return NextResponse.json({ error: `Failed to ${scope}` }, { status: 500 });
}

/** Flattens Zod issues into the `{ error, fieldErrors }` shape the forms read. */
export function zodResponse(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return badRequest(error.issues[0]?.message ?? "Invalid details", fieldErrors);
}

export interface Paging {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Page and limit from the query string, clamped. `limit` is capped so a crafted
 * `?limit=100000` cannot pull the whole table into memory.
 */
export function paging(req: NextRequest, defaultLimit = 25, maxLimit = 100): Paging {
  const params = new URL(req.url).searchParams;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(params.get("limit")) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

/** Start of today in IST, which is the day boundary the dashboard counts by. */
export function startOfToday(): Date {
  const now = new Date();
  // IST is UTC+5:30 and observes no DST, so a fixed offset is correct.
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + IST_OFFSET_MS);
  ist.setUTCHours(0, 0, 0, 0);
  return new Date(ist.getTime() - IST_OFFSET_MS);
}

/**
 * Records a privileged action against the audit trail. Fire-and-forget: the
 * helper swallows its own errors, so a logging failure cannot roll back the
 * action it was describing.
 */
export function auditAdmin(input: {
  req: NextRequest;
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  void logActivity(input);
}

/**
 * RFC 4180 CSV. A field is quoted whenever it contains a delimiter, quote or
 * newline; embedded quotes are doubled. Without this a job title containing a
 * comma silently shifts every later column.
 */
export function toCsv(rows: Array<Record<string, unknown>>, columns: string[]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = value instanceof Date ? value.toISOString() : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const lines = [columns.join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => escape(row[c])).join(","));
  }
  // CRLF per the spec; Excel on Windows is the common consumer.
  return lines.join("\r\n");
}

export function csvResponse(csv: string, filename: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      // Quoted so a filename with a space cannot truncate the header.
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** SQLite-era convention retained on Postgres: arrays persist as JSON strings. */
export function unpackList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function packList(value?: string[] | null): string {
  return JSON.stringify(value ?? []);
}

/** Parses a CMS `blocks` column, which is a JSON object rather than an array. */
export function unpackBlocks(value: string | null | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
