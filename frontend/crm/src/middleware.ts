import { UserSessionDataResponse } from '@root/apiGateway';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { API_BACKEND_URL_IP } from './global/constants/domains';
// Environment detection for middleware
const isProduction = process.env.NODE_ENV === "production";

// Helper: Generate Basic Auth header
const BASIC_AUTH_HEADER = "Basic " + Buffer.from("admin:admin").toString("base64");

const fetchUserSession = async (token: string) => {
  try {
    const sessionResponse = fetch(API_BACKEND_URL_IP + "/session", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
    return sessionResponse as Promise<UserSessionDataResponse>;
  } catch (error) {
    console.error("Error fetching user session:", error);
    throw error;
  }
}


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
      const session = await fetchUserSession(cookieStore.get('token')?.value || '');


      const roleCookie = cookieStore.get('role')?.value;

      // If role mismatch or session is invalid, clear cookies and redirect
      if (!session?.responseData?.role || session.responseData.role !== roleCookie) {
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

// ✅ Match all paths (you can narrow this if needed)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)', // This means "match everything except api, static, image, favicon"
  ],
};