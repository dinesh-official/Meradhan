import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { AxiosError } from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const POST = async (request: Request) => {
  try {
    const cookie = await cookies();
    const reqBody = await request.json();

    const authApi = new apiGateway.auth.AuthApi(apiServerCaller);
    const response = await authApi.verifyOtp(reqBody);
    if (response.data.responseData.token) {
      const data = response.data.responseData;

      // Session cookie: no maxAge/expires so it is cleared on browser close
      const cookieOptions = { path: "/" };

      cookie.set("token", data.token, cookieOptions);
      cookie.set("userId", data.id.toString(), cookieOptions);
      cookie.set("role", data.role, cookieOptions);
    }

    return NextResponse.json(response.data.responseData, { status: 200 });
  } catch (error) {
    console.error("Error in /api/verify:", error);

    return NextResponse.json((error as AxiosError)?.response?.data, {
      status: 500,
    });
  }
};
