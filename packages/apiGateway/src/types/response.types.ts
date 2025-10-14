import type { ROLES } from "../core/constants/role";

type Role = typeof ROLES[number];

export type BaseResponseData<T =  undefined> = {
    statusCode: number;
    success: boolean;
    message: string;
    responseData: T;
};

// auth/login-with-otp
export type LoginWithOtpDataResponse = BaseResponseData<{
    token: string
}>;

// auth/verify-otp
export type OtpVerifyDataResponse = BaseResponseData<{
    token: string;
    id: number;
    email: string;
    name: string;
    phoneNo: string;
    avatar: string;
    role: Role;
}>;

// /session
export type UserSessionDataResponse = BaseResponseData<{
    id: number;
    email: string;
    name: string;
    phoneNo: string;
    avatar: string;
    role: Role;
}>;
