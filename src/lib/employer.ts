import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { JWTPayload } from "@/lib/auth";

/**
 * Shared plumbing for the employer routes.
 *
 * Every employer query is scoped by the company resolved from the session
 * rather than by an id supplied in the request, so one employer can never read
 * or mutate another's jobs, applications, interviews or shortlist.
 */

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again in a moment." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
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
  return NextResponse.json(
    { error: error.issues[0]?.message ?? "Invalid details", fieldErrors },
    { status: 400 }
  );
}

export interface EmployerContext {
  recruiterId: string;
  companyId: string | null;
}

/** The signed-in recruiter and the company they belong to. */
export async function employerContext(
  user: JWTPayload
): Promise<EmployerContext | null> {
  const recruiter = await prisma.recruiter.findUnique({
    where: { userId: user.userId },
    select: { id: true, companyId: true },
  });
  return recruiter ? { recruiterId: recruiter.id, companyId: recruiter.companyId } : null;
}

/** SQLite-era convention retained on Postgres: arrays persist as JSON strings. */
export function packList(value?: string[] | null): string | null {
  return value && value.length ? JSON.stringify(value) : null;
}

export function unpackList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
