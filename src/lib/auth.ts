import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

// Resolved on first use, not at module load: `next build` runs with
// NODE_ENV=production but without runtime secrets, so throwing at import time
// would fail the container build.
let secret: Uint8Array | undefined;

function getSecret() {
  if (!secret) {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallback-secret-key-for-dev-only-change-prod"
    );
  }
  return secret;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateOTP(): string {
  // crypto.getRandomValues avoids Math.random's predictability for a security code.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return (buf[0] % 900000 + 100000).toString();
}

/** OTPs are stored as digests so a database leak cannot reveal live codes. */
export async function hashOTP(otp: string): Promise<string> {
  const data = new TextEncoder().encode(otp);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export function getOTPExpiry(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export const SESSION_COOKIE = "token";

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization");
  const cookieToken = req.cookies.get(SESSION_COOKIE)?.value;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieToken;

  if (!token) return null;
  return verifyJWT(token);
}
