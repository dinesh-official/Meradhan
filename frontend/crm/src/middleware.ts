import apiGateway from '@root/apiGateway';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import apiServerCaller from './core/connection/apiServerCaller';
import { cookies } from 'next/headers';

// Environment detection for middleware
const isProduction = process.env.NODE_ENV === "production";

// Helper: Generate Basic Auth header
const BASIC_AUTH_HEADER = "Basic " + Buffer.from("admin:admin").toString("base64");

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const { pathname } = request.nextUrl;

  // ✅ 1. Basic Auth protection for production
  if (isProduction && !pathname.startsWith("/api") && !pathname.startsWith("/assets") && !pathname.startsWith("/_next")) {
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
  // Only protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const authClient = new apiGateway.auth.AuthApi(apiServerCaller);
      const session = await authClient.getSession();

      const roleCookie = cookieStore.get('role')?.value;

      // If role mismatch or session is invalid, clear cookies and redirect
      if (!session?.data?.responseData?.role || session.data.responseData.role !== roleCookie) {
        // Create a response object to delete cookies
        const response = NextResponse.redirect(new URL('/logout', request.url));

        response.cookies.delete('token');
        response.cookies.delete('userId');
        response.cookies.delete('role');

        return response;
      }
    } catch {

      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userId');
      response.cookies.delete('role');

      return response;
    }
  }

  // Allow request to continue if everything is fine
  return NextResponse.next();
}

// Match all /dashboard paths including nested ones
export const config = {
  matcher: '/:path*',
};
