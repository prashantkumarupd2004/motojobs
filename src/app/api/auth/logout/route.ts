import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { CSRF_COOKIE } from "@/lib/csrf";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });
  clearSessionCookie(response);
  response.cookies.set(CSRF_COOKIE, "", { path: "/", maxAge: 0 });
  return response;
}
