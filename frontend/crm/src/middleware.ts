import { UserSessionDataResponse } from "@root/apiGateway";
import { cookies } from "next/headers";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const isProduction = process.env.NEXT_PUBLIC_DIGIO === "production";

// ✅ Basic Auth Header
const BASIC_AUTH_HEADER =
  "Basic " + Buffer.from("admin:admin").toString("base64");

// ✅ Fetch user session from backend
const fetchUserSession = async (
  token: string
): Promise<UserSessionDataResponse | null> => {
  if (!token) return null;

  try {
    const apiUrl = "http://localhost:4000";
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
  } catch (error) {
    console.error("❌ Error fetching user session:", error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = await cookies();

  // ✅ 1. Basic Auth for production (only for non-static, non-api routes)
  if (
    !isProduction &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/assets") &&
    !pathname.startsWith("/_next")
  ) {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== BASIC_AUTH_HEADER) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "WWW-Authenticate": "Basic realm='MeraDhan Subdomain'",
        },
      });
    }
  }

  // ✅ 2. Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = cookie.get("token")?.value;
    const roleCookie = cookie.get("role")?.value;
    console.log({ token });

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

  // ✅ 3. Prevent logged-in users from accessing login page
  if (pathname === "/login") {
    const token = cookie.get("token")?.value;

    if (token) {
      const session = await fetchUserSession(token);

      if (session?.responseData?.role) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // ✅ 4. Continue normally
  return NextResponse.next();
}

// ✅ 5. Middleware config — match all except _next/static, images, favicon, etc.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
