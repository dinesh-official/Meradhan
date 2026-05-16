import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 0;

type SetSessionBody = {
  token?: string;
  userId?: string | number;
};

/** Persists auth cookies on the Next.js app host so middleware and RSC can read them. */
export const POST = async (request: Request) => {
  try {
    const body = (await request.json()) as SetSessionBody;
    const token = body.token?.trim();
    const userId = body.userId != null ? String(body.userId).trim() : "";

    if (!token || !userId) {
      return NextResponse.json(
        { message: "token and userId are required." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    const options = {
      path: "/",
      httpOnly: true,
      sameSite: "lax" as const,
      secure: isProd,
      maxAge: 60 * 60 * 24,
    };

    cookieStore.set("token", token, options);
    cookieStore.set("userId", userId, options);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/set-session:", error);
    return NextResponse.json(
      { message: "Could not establish session." },
      { status: 500 },
    );
  }
};
