import { UserSessionDataResponse } from "@root/apiGateway";
import { cookies } from "next/headers";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ✅ Fetch user session from backend
const fetchUserSession = async (
  token: string
): Promise<UserSessionDataResponse | null> => {
  if (!token) return null;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_HOST_URL;
    const res = await fetch(`${apiUrl}/api/session`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data as UserSessionDataResponse;
  } catch {
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = await cookies();

  // ✅ 1. Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = cookie.get("token")?.value;
    const roleCookie = cookie.get("role")?.value;

    if (!token) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      cookie.delete("token");
      cookie.delete("userId");
      cookie.delete("role");
      return response;
    }

    const session = await fetchUserSession(token);

    // ❌ Invalid session or role mismatch → force logout
    if (
      !session?.responseData?.role ||
      session.responseData.role !== roleCookie
    ) {
      const response = NextResponse.redirect(new URL("/logout", request.url));
      cookie.delete("token");
      cookie.delete("userId");
      cookie.delete("role");
      return response;
    }
  }

  // ✅ 2. Prevent logged-in users from accessing login page
  if (pathname === "/login") {
    const token = cookie.get("token")?.value;

    if (token) {
      const session = await fetchUserSession(token);

      if (session?.responseData?.role) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // ✅ 3. Continue normally
  return NextResponse.next();
}

// ✅ 4. Middleware config — match all except _next/static, images, favicon, etc.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
