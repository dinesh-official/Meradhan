import type { BaseResponseData } from "../../../types/base";

export type ISignupOtpVerifyResponse = BaseResponseData<{
    token: string;
}>

export type IAuthCompleteResponse = BaseResponseData<{
    id: number;
    email: string;
    avatar: string | null;
    token: string;
}>

export type ISignInRequestResponse = BaseResponseData<{
    id: number,
    firstName: string,
    lastName: string
}>

export type ISignInSendOtpResponse = BaseResponseData<{
    id: number,
    firstName: string,
    lastName: string,
    token: string
}>

export type IResetPasswordResponse = BaseResponseData<{
    message: string
}>