import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 0;

export const POST = async () => {
  try {
    const cookieStore = await cookies();

    if (!cookieStore.get("impersonatorToken")?.value) {
      return NextResponse.json(
        { message: "No active impersonation session." },
        { status: 400 },
      );
    }

    const authApi = new apiGateway.auth.AuthApi(apiServerCaller);
    const response = await authApi.exitImpersonation();
    const data = response.data.responseData;

    const res = NextResponse.json(data, { status: 200 });
    const cookieOptions = { path: "/" as const };

    res.cookies.delete("impersonatorToken");
    res.cookies.set("token", data.token, cookieOptions);
    res.cookies.set("userId", String(data.id), cookieOptions);
    res.cookies.set("role", data.role, cookieOptions);

    return res;
  } catch (error) {
    console.error("Error in /api/auth/impersonate/exit:", error);
    return NextResponse.json((error as AxiosError)?.response?.data, {
      status: (error as AxiosError)?.response?.status ?? 500,
    });
  }
};
