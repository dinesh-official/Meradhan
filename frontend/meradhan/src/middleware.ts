/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserSessionDataResponse } from "@root/apiGateway";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Helper: Generate Basic Auth header
const BASIC_AUTH_HEADER =
  "Basic " + Buffer.from("admin:admin").toString("base64");

const fetchUserSession = async (token: string) => {
  console.log(token);

  try {
    const sessionResponse = fetch(
      "http://localhost:4000/api/customer/session",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    ).then((res) => res.json());
    return sessionResponse as Promise<UserSessionDataResponse>;
  } catch (error) {
    console.error("Error fetching user session:", error);
    throw error;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // ✅ 1. Basic Auth protection for production
  // if (
  //   process.env.NODE_ENV === "production" &&
  //   !pathname.startsWith("/api") &&
  //   !pathname.startsWith("/assets") &&
  //   !pathname.startsWith("/_next")
  // ) {
  //   const authHeader = request.headers.get("authorization");

  //   if (authHeader !== BASIC_AUTH_HEADER) {
  //     return new Response("Unauthorized", {
  //       status: 401,
  //       headers: {
  //         "WWW-Authenticate": "Basic realm='MeraDhan Subdomain'",
  //       },
  //     });
  //   }
  // }

  if (pathname.startsWith("/login")) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      try {
        console.log({ token });
        // Attempt session restore via API
        await fetchUserSession(token);
        const response = NextResponse.redirect(new URL("/dashboard", origin), {
          headers: requestHeaders,
        });
        return response;
      } catch (error) {
        console.log(error);
        return NextResponse.next({ headers: requestHeaders });
      }
    }
  }

  // ✅ 2. Protect /dashboard routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/place-order")
  ) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // No token? Try to restore session
    if (token) {
      try {
        // Attempt session restore via API
        await fetchUserSession(token);
        return NextResponse.next({ headers: requestHeaders });
      } catch (error) {
        console.log(error);
        const response = NextResponse.redirect(new URL("/login", origin), {
          headers: requestHeaders,
        });
        const allCookies = cookieStore.getAll();
        for (const cookie of allCookies) {
          response.cookies.set({
            name: cookie.name,
            value: "",
            expires: new Date(0),
            path: "/",
          });
        }
        console.error("Session validation failed:", error);
        // Redirect to login if session is invalid
        return response;
      }
    } else {
      const response = NextResponse.redirect(new URL("/logout", origin), {
        headers: requestHeaders,
      });
      return response;
    }
  }

  // ✅ Default: Allow request to proceed
  return NextResponse.next({ headers: requestHeaders }); // Let the request pass
}

// ✅ Match all paths (you can narrow this if needed)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // This means "match everything except api, static, image, favicon"
  ],
};
