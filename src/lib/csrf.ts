import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE, CSRF_HEADER } from "./csrf-shared";

export { CSRF_COOKIE, CSRF_HEADER };


/**
 * Double-submit-cookie CSRF protection.
 *
 * The token is issued as a readable (non-httpOnly) cookie; the client echoes it
 * in the `x-csrf-token` header. An attacker on another origin can trigger the
 * request but cannot read the cookie to populate the header.
 *
 * Paired with SameSite=Lax session cookies, this covers the OWASP-recommended
 * defence in depth for state-changing requests.
 */

export const CSRF_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function generateCsrfToken(): string {
  return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}

/** Constant-time comparison — avoids leaking the token via timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyCsrf(req: NextRequest): boolean {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value;
  const headerToken = req.headers.get(CSRF_HEADER);

  if (!cookieToken || !headerToken) return false;
  return timingSafeEqual(cookieToken, headerToken);
}

export function setCsrfCookie(res: NextResponse, token: string) {
  res.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by client JS to echo into the header
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CSRF_COOKIE_MAX_AGE,
  });
}

/**
 * Pre-session auth endpoints are exempt: they carry no cookie-authenticated
 * state, and each already requires a secret the attacker cannot know (a
 * password or a mailed OTP). Everything else — including logout — is enforced.
 */
const CSRF_EXEMPT = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-email",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

export function isCsrfExempt(pathname: string) {
  return CSRF_EXEMPT.includes(pathname);
}

