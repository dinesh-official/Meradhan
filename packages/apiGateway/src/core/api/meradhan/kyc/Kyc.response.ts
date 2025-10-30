import { type DigioAadharPanData, type DigioBankVerifyResponse, type DigioFaceDataResponse, type TDigioWithTemplateResponse } from "kyc-providers";
import type { BaseResponseData } from "../../../../types/base";

export type IPANKycRequestResponse = BaseResponseData<TDigioWithTemplateResponse>
export type IPANKycVerifyResponse = BaseResponseData<DigioAadharPanData['actions'][number]>

// selfire
export type ISelfireKycRequestResponse = BaseResponseData<TDigioWithTemplateResponse>
export type ISelfireKycVerifyResponse = BaseResponseData<DigioFaceDataResponse>

export type ISignKycRequestResponse = BaseResponseData<TDigioWithTemplateResponse>
export type ISignKycVerifyResponse = BaseResponseData<DigioFaceDataResponse>

export type IBankKycVerifyResponse = BaseResponseData<DigioBankVerifyResponse>





export type IStoreKycGETResponse = BaseResponseData<{

  id: number
  userID: number
  step: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  createdAt: string
  updatedAt: string

} | null>
export type IStoreKycSETResponse = BaseResponseData<{
  status: boolean
}>

export type I_IFSCResponse = BaseResponseData<{
    BRANCH: string
    CENTRE: string
    DISTRICT: string
    STATE: string
    ADDRESS: string
    CONTACT: string
    IMPS: boolean
    CITY: string
    UPI: boolean
    MICR: string
    RTGS: boolean
    NEFT: boolean
    SWIFT: unknown
    ISO3166: string
    BANK: string
    BANKCODE: string
    IFSC: string
}> 