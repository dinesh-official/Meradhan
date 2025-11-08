import type { BaseResponseData } from "../../../types/base"

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ITrashCustomer {
    id: number
    userName: string
    firstName: string
    middleName: string
    lastName: string
    gender: any
    emailAddress: string
    phoneNo: string
    whatsAppNo: string
    avatar: string
    userType: string
    kycStatus: string
    VerifiedBy: any
    verifyDate: any
    customersRiskProfileModelId: any
    customersAuthDataModelId: number
    aADHAARCardModelId: any
    panCardModelId: any
    customerPersonalInfoModelId: any
    currentAddressModelId: any
    permanentAddressModelId: any
    createdAt: string
    updatedAt: string
    createdBy: any
    isDeleted: boolean
}
  
export type ITrashUserResponse = BaseResponseData<ITrashCustomer[]>