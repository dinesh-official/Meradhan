"use client"
import { API_LOCAL_URL } from "@/global/constants/domains";
import { ApiCallerClient } from "@root/apiGateway";

export const apiClientCaller = new ApiCallerClient(API_LOCAL_URL)