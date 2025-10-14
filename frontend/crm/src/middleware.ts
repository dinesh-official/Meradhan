import apiGateway from '@root/apiGateway';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import apiServerCaller from './core/connection/apiServerCaller';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();

  // Only protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const authClient = new apiGateway.auth.AuthApi(apiServerCaller);
      const session = await authClient.getSession();

      const roleCookie = cookieStore.get('role')?.value;

      // If role mismatch or session is invalid, clear cookies and redirect
      if (!session?.data?.responseData?.role || session.data.responseData.role !== roleCookie) {
        // Create a response object to delete cookies
        const response = NextResponse.redirect(new URL('/login', request.url));

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
  matcher: '/dashboard/:path*',
};
