import type { BaseResponseData } from "../../../types/base";

export type ISignupOtpVerifyResponse = BaseResponseData<{
    token: string;
}>

export type ISignupCompleteResponse = BaseResponseData<{
    id: number;
    email: string;
    avatar: string | null;
    token: string;
}>