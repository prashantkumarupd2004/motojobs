import { NextResponse } from "next/server";
import { getAuthUser } from "./auth";
import { NextRequest } from "next/server";

export type ApiHandler = (
  req: NextRequest,
  context: { params: Record<string, string> },
  user: { userId: string; email: string; role: string }
) => Promise<NextResponse>;

export function withAuth(handler: ApiHandler, allowedRoles?: string[]) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, context, user);
  };
}

export function apiResponse(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
