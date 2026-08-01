import { NextRequest } from "next/server";

/**
 * In-process sliding-window rate limiter.
 *
 * Deliberately memory-backed: it resets on deploy and does not coordinate across
 * instances. That is acceptable for a single-node deployment and keeps auth
 * hardening free of an infra dependency. Swap the Store for Redis before scaling
 * horizontally — the `check` signature is designed to stay identical.
 */

type Hit = { count: number; resetAt: number };

const store = new Map<string, Hit>();

// Bound the map so a flood of unique IPs cannot exhaust memory.
const MAX_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, hit] of store) {
    if (hit.resetAt <= now) store.delete(key);
  }
  if (store.size > MAX_KEYS) {
    const excess = store.size - MAX_KEYS;
    let i = 0;
    for (const key of store.keys()) {
      if (i++ >= excess) break;
      store.delete(key);
    }
  }
}

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number;
}

export function check(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const hit = store.get(key);
  if (!hit || hit.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((hit.resetAt - now) / 1000),
    };
  }
  return { ok: true, remaining: limit - hit.count, retryAfter: 0 };
}

export function reset(key: string) {
  store.delete(key);
}

export const LIMITS = {
  login: { limit: 8, windowMs: 15 * 60_000 },
  register: { limit: 5, windowMs: 60 * 60_000 },
  sendOtp: { limit: 5, windowMs: 15 * 60_000 },
  verifyOtp: { limit: 10, windowMs: 15 * 60_000 },
  forgotPassword: { limit: 5, windowMs: 60 * 60_000 },
  resetPassword: { limit: 10, windowMs: 60 * 60_000 },
  upload: { limit: 30, windowMs: 15 * 60_000 },
  onboarding: { limit: 20, windowMs: 60 * 60_000 },
  companyProfile: { limit: 30, windowMs: 60 * 60_000 },
  companyDocument: { limit: 20, windowMs: 60 * 60_000 },
  contact: { limit: 5, windowMs: 60 * 60_000 },
} as const;

/** Convenience wrapper: `limitBy(req, "login", LIMITS.login)`. */
export function limitBy(
  req: NextRequest,
  scope: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  extra?: string
): RateLimitResult {
  const key = `${scope}:${clientIp(req)}${extra ? `:${extra}` : ""}`;
  return check(key, limit, windowMs);
}
