
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const validAuth = "Basic " + Buffer.from("admin:admin").toString("base64");
  if (auth !== validAuth && process.env.NODE_ENV === "production") {
    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": "Basic realm='MeraDhan Subdomain'",
      },
    });
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const cookie = await cookies();

    if (!cookie.get("token")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/:path*',
}