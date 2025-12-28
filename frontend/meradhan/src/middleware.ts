import { UserSessionDataResponse } from "@root/apiGateway";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const fetchUserSession = async (token: string) => {
  try {
    const sessionResponse = fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST_URL}/api/customer/session`,
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
    throw error;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  if (pathname.startsWith("/login")) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (token) {
      try {
        // Attempt session restore via API
        await fetchUserSession(token);
        const response = NextResponse.redirect(new URL("/dashboard", origin), {
          headers: requestHeaders,
        });
        return response;
      } catch {
        return NextResponse.next({ headers: requestHeaders });
      }
    }
  }

  // ✅ 1. Protect /dashboard routes
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

  // ✅ 2. Default: Allow request to proceed
  return NextResponse.next({ headers: requestHeaders }); // Let the request pass
}

// ✅ Match all paths (you can narrow this if needed)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)", // This means "match everything except api, static, image, favicon"
  ],
};
