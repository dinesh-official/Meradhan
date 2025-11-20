import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const revalidate = 0;
export const POST = async (request: Request) => {
  const cookie = await cookies();
  const reqBody = await request.json();
  const authApi = new apiGateway.auth.AuthApi(apiServerCaller);
  const response = await authApi.verifyOtp(reqBody);
  if (response.data.responseData.token) {
    const data = response.data.responseData;

    // Set cookies with proper configuration for persistence
    const cookieOptions = {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    cookie.set("token", data.token, cookieOptions);
    cookie.set("userId", data.id.toString(), cookieOptions);
    cookie.set("role", data.role, cookieOptions);
  }
  return NextResponse.json(response.data.responseData, { status: 200 });
};
