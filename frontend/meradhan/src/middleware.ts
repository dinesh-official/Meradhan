import apiGateway from '@root/apiGateway';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import apiServerCaller from './core/connection/apiServerCaller';

// Initialize Auth API client
const authApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(apiServerCaller);

// Helper: Generate Basic Auth header
const BASIC_AUTH_HEADER = "Basic " + Buffer.from("admin:admin").toString("base64");

/**
 * Next.js Middleware
 * Handles:
 *  1. Basic Authentication (production only)
 *  2. Session validation via cookies and backend API
 */
export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // ✅ 1. Basic Auth protection for production
  if (process.env.NODE_ENV === "production" && !pathname.startsWith("/api") && !pathname.startsWith("/assets")) {
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
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // No token? Try to restore session
    if (!token) {
      try {
        // Attempt session restore via API
        await authApi.getSession();
        return NextResponse.next();
      } catch (error) {
        const response = NextResponse.redirect(new URL("/logout", origin));
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
    }
  }

  // ✅ Default: Allow request to proceed
  return NextResponse.next();
}

// ✅ Match all paths (you can narrow this if needed)
export const config = {
  matcher: '/:path*',
};
