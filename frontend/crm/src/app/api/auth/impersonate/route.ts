import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 0;

export const POST = async (request: Request) => {
  try {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get("token")?.value;

    if (!currentToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (cookieStore.get("impersonatorToken")?.value) {
      return NextResponse.json(
        {
          message:
            "Exit the current impersonation session before switching again.",
        },
        { status: 400 },
      );
    }

    const reqBody = await request.json();
    const authApi = new apiGateway.auth.AuthApi(apiServerCaller);
    const response = await authApi.impersonate(reqBody);
    const data = response.data.responseData;

    const res = NextResponse.json(data, { status: 200 });
    const cookieOptions = { path: "/" as const };

    res.cookies.set("impersonatorToken", currentToken, {
      ...cookieOptions,
      httpOnly: true,
      sameSite: "lax",
    });
    res.cookies.set("token", data.token, cookieOptions);
    res.cookies.set("userId", String(data.id), cookieOptions);
    res.cookies.set("role", data.role, cookieOptions);

    return res;
  } catch (error) {
    console.error("Error in /api/auth/impersonate:", error);
    return NextResponse.json((error as AxiosError)?.response?.data, {
      status: (error as AxiosError)?.response?.status ?? 500,
    });
  }
};
