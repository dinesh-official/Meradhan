"use server";

import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { cookies } from "next/headers";

export async function getSession() {

    const cookie = await cookies()
    if (!cookie.get("token")) {
        return null;
    }

    try {
        const authApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(apiServerCaller);
        const session = await authApi.getSession();
        return session.responseData
    } catch {
        return null;
    }
}