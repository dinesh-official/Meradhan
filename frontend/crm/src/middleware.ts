import { UserSessionDataResponse } from '@root/apiGateway';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

// ✅ Basic Auth Header
const BASIC_AUTH_HEADER = 'Basic ' + Buffer.from('admin:admin').toString('base64');

// ✅ Fetch user session from backend
const fetchUserSession = async (token: string): Promise<UserSessionDataResponse | null> => {
  if (!token) return null;

  try {
    const res = await fetch('http://localhost:4000/api/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data as UserSessionDataResponse;
  } catch (error) {
    console.error('❌ Error fetching user session:', error);
    return null;
  }
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();

  // ✅ 1. Basic Auth for production (only for non-static, non-api routes)
  if (
    isProduction &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/assets') &&
    !pathname.startsWith('/_next')
  ) {
    const authHeader = request.headers.get('authorization');

    if (authHeader !== BASIC_AUTH_HEADER) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': "Basic realm='MeraDhan Subdomain'",
        },
      });
    }
  }

  // ✅ 2. Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = cookieStore.get('token')?.value;
    const roleCookie = cookieStore.get('role')?.value;

    if (!token) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userId');
      response.cookies.delete('role');
      return response;
    }

    const session = await fetchUserSession(token);
    console.log(session);
    

    // ❌ Invalid session or role mismatch → force logout
    if (!session?.responseData?.role || session.responseData.role !== roleCookie) {
      const response = NextResponse.redirect(new URL('/logout', request.url));
      response.cookies.delete('token');
      response.cookies.delete('userId');
      response.cookies.delete('role');
      return response;
    }
  }

  // ✅ 3. Continue normally
  return NextResponse.next();
}

// ✅ 4. Middleware config — match all except _next/static, images, favicon, etc.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
