import {
  type DemateVerifyResponse,
  type DigioAadharPanData,
  type DigioBankVerifyResponse,
  type DigioFaceDataResponse,
  type DigioSignatureResponse,
  type TDigioWithTemplateResponse,
} from "kyc-providers";
import type { BaseResponseData } from "../../../../types/base";

// pan
export type IPANInfoVerifyResponse = BaseResponseData<{
  aadhaar_seeding_status: string;
  name_as_per_pan_match: boolean;
  pan: string;
  category: string;
  status: string;
  date_of_birth_match: boolean;
}>;

export type IPANKycRequestResponse =
  BaseResponseData<TDigioWithTemplateResponse>;
export type IPANKycVerifyResponse = BaseResponseData<
  DigioAadharPanData["actions"][number]
>;

// selfire
export type ISelfireKycRequestResponse =
  BaseResponseData<TDigioWithTemplateResponse>;
export type ISelfireKycVerifyResponse = BaseResponseData<DigioFaceDataResponse>;

export type ISignKycRequestResponse =
  BaseResponseData<TDigioWithTemplateResponse>;
export type ISignKycVerifyResponse = BaseResponseData<DigioFaceDataResponse>;

export type IBankKycVerifyResponse = BaseResponseData<DigioBankVerifyResponse>;
export type IDmatKycVerifyResponse = BaseResponseData<
  DemateVerifyResponse<DigioBankVerifyResponse>
>;

export type IEsignKycRequest = BaseResponseData<TDigioWithTemplateResponse>;
export type IEsignKycResponse = BaseResponseData<DigioSignatureResponse>;

export type IStoreKycGETResponse = BaseResponseData<{
  id: number;
  userID: number;
  step: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  createdAt: string;
  updatedAt: string;
  complete: boolean;
} | null>;

export type RescheduleKraResponse = BaseResponseData<{ jobId: string | number }>;
export type IStoreKycSETResponse = BaseResponseData<{
  status: boolean;
}>;

export type I_IFSCResponse = BaseResponseData<{
  BRANCH: string;
  CENTRE: string;
  DISTRICT: string;
  STATE: string;
  ADDRESS: string;
  CONTACT: string;
  IMPS: boolean;
  CITY: string;
  UPI: boolean;
  MICR: string;
  RTGS: boolean;
  NEFT: boolean;
  SWIFT: unknown;
  ISO3166: string;
  BANK: string;
  BANKCODE: string;
  IFSC: string;
}>;

export type KRAResponse = BaseResponseData<
  {
    error: object | null;
    id: number;
    stage: string;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    kycId: number;
    requestData: object | null;
    responseData: object | null;
    reqTime: Date;
    resTime: Date | null;
  }[]
>;
