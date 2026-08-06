import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";
import {
  CSRF_COOKIE,
  generateCsrfToken,
  isCsrfExempt,
  setCsrfCookie,
  verifyCsrf,
} from "@/lib/csrf";

/**
 * Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function
 * from `middleware` to `proxy`. Runtime is always Node.js here.
 */

const publicPaths = [
  "/",
  "/login",
  // The admin sign-in form itself must be reachable without a session,
  // otherwise the gate below would redirect it to itself forever.
  "/admin/login",
  "/register",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/jobs",
  "/companies",
  "/company",
  "/pricing",
  "/blog",
  "/contact",
  "/terms",
  "/privacy",
  "/api/auth",
  "/api/jobs",
  "/api/companies",
  "/api/contact",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/uploads",
];

const rolePaths: Record<string, string[]> = {
  CANDIDATE: ["/candidate", "/api/candidate"],
  RECRUITER: ["/recruiter", "/api/recruiter"],
  ADMIN: ["/admin", "/api/admin"],
};

/**
 * Lives under /api/admin but is deliberately open to every signed-in user:
 * anyone can file a ticket, and the handler scopes reads to the owner.
 */
const roleGateExempt = ["/api/admin/support-tickets"];

function isPublic(pathname: string) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * The admin panel has its own entrance. Sending an unauthenticated /admin
 * request to the public /login would drop the visitor into the job seeker
 * form, so admin paths bounce to /admin/login instead.
 */
function loginUrlFor(pathname: string, req: NextRequest) {
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const url = new URL(isAdminPath ? "/admin/login" : "/login", req.url);
  url.searchParams.set("from", pathname);
  return url;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF gate runs before the auth gate: a forged request must be rejected
  // whether or not it happens to carry a valid session cookie.
  if (pathname.startsWith("/api/") && !isCsrfExempt(pathname) && !verifyCsrf(req)) {
    return NextResponse.json(
      { error: "Invalid or missing CSRF token" },
      { status: 403 }
    );
  }

  // Anonymous visitors need a token too — public forms (contact) post before any
  // session exists, and login only issues one on success. Seeded on page loads,
  // never on API calls, so it can never be minted by the request it must guard.
  const needsCsrfSeed =
    !pathname.startsWith("/api/") && !req.cookies.get(CSRF_COOKIE);

  if (pathname === "/" || isPublic(pathname)) {
    const res = NextResponse.next();
    if (needsCsrfSeed) setCsrfCookie(res, generateCsrfToken());
    return res;
  }

  const isApi = pathname.startsWith("/api/");

  const token =
    req.cookies.get("token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(loginUrlFor(pathname, req));
  }

  const user = await verifyJWT(token);
  if (!user) {
    // Clear the stale cookie so the next request does not retry a dead token.
    if (isApi) {
      const res = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      res.cookies.set("token", "", { path: "/", maxAge: 0 });
      return res;
    }
    const loginUrl = loginUrlFor(pathname, req);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    return res;
  }

  if (!roleGateExempt.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    for (const [role, paths] of Object.entries(rolePaths)) {
      if (paths.some((p) => pathname.startsWith(p)) && user.role !== role) {
        if (isApi) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(
          new URL(`/${user.role.toLowerCase()}/dashboard`, req.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|otf|mp4|mp3|pdf)).*)",
  ],
};
