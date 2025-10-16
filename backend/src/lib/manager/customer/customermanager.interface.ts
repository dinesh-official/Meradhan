import type { AADHAARCardModel, AddressModel, CustomerPersonalInfoModel, CustomerProfileDataModel, CustomersBankAccountModel, CustomersDematAccountModel, DataBaseSchema, KYCStatus, PanCardModel } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
export const fullCustomerProfileSelect: DataBaseSchema.CustomerProfileDataModelSelect = {
    aadhaarCard: true,
    bankAccounts: true,
    currentAddress: true,
    dematAccounts: true,
    panCard: true,
    permanentAddress: true,
    personalInformation: true,
    userName: true,
    firstName: true,
    lastName: true,
    updatedAt: true,
    userType: true,
    avatar: true,
    createdBy: true,
    kycStatus: true,
    middleName: true,
    emailAddress: true,
    phoneNo: true,
    gender: true,
    whatsAppNo: true,
    VerifiedBy: true,
    id: true,
    riskProfile: true,
    createdAt: true,
    utility: {
        select: {
            accountStatus: true,
            id: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            signinWith: true,
            termsAccepted: true,
            lastLogin: true,
            whatsAppNotificationAllow: true,
        },
    },

}


export const basicProfileInfoSelect: DataBaseSchema.CustomerProfileDataModelSelect = {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    userType: true,
    emailAddress: true,
    phoneNo: true,
    whatsAppNo: true,
    kycStatus: true,
    createdAt: true,
    userName: true,
    gender: true,
    avatar: true,
    utility: {
        select: {
            accountStatus: true,
            termsAccepted: true,
            whatsAppNotificationAllow: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            lastLogin: true,
            signinWith: true,
        }
    }
}

export interface IBankAccountMangeInterface {
    createBankAccount(customerProfileId: number, data: z.infer<typeof appSchema.customer.createBankAccountSchema>): Promise<CustomersBankAccountModel>,
    getBankBankAccount(bankId: number): Promise<CustomersBankAccountModel>,
    getCustomerBankBankAccounts(customerProfileId: number): Promise<CustomersBankAccountModel>,
    updateBackAccountBankAccount(bankId: number, data: z.infer<typeof appSchema.customer.updateBackAccountBankAccountSchema>): Promise<CustomersBankAccountModel>,
    removeBackAccountBankAccount(bankId: number): Promise<boolean>,
    setDefaultBackAccount(customerProfileId: number, bankId: number): Promise<CustomersBankAccountModel>,
}

export interface IDematAccountManageInterface {
    createDematAccount(customerProfileId: number, data: z.infer<typeof appSchema.customer.createDematAccountSchema>): Promise<CustomersDematAccountModel>;
    getDematAccount(dematAccountId: number): Promise<CustomersDematAccountModel>;
    getCustomerDematAccounts(customerProfileId: number): Promise<CustomersDematAccountModel[]>;
    updateDematAccount(dematAccountId: number, data: z.infer<typeof appSchema.customer.updateDematAccountSchema>): Promise<CustomersDematAccountModel>;
    removeDematAccount(dematAccountId: number): Promise<boolean>;
    setDefaultDematAccount(customerProfileId: number, dematAccountId: number): Promise<CustomersDematAccountModel>;
}

export interface IAadhaarCardManagerInterface {
    createAadhaarCard(customerProfileId: number, data: z.infer<typeof appSchema.customer.createAadhaarDetailsSchema>): Promise<AADHAARCardModel>;
    getAadhaarCard(aadhaarId: number): Promise<AADHAARCardModel>;
    getCustomerAadhaarCard(customerProfileId: number): Promise<AADHAARCardModel>;
    updateAadhaarCard(aadhaarId: number, data: z.infer<typeof appSchema.customer.updateAadhaarDetailsSchema>): Promise<AADHAARCardModel>;
    removeAadhaarCard(aadhaarId: number): Promise<boolean>;
    verifyAadhaarCard(aadhaarId: number, verifyDate?: Date): Promise<AADHAARCardModel>;
}

export interface IPanCardManagerInterface {
    createPanCard(customerProfileId: number, data: z.infer<typeof appSchema.customer.createPanDetailsSchema>): Promise<PanCardModel>;
    getPanCard(panCardId: number): Promise<PanCardModel>;
    getCustomerPanCard(customerProfileId: number): Promise<PanCardModel>;
    updatePanCard(panCardId: number, data: z.infer<typeof appSchema.customer.updatePanDetailsSchema>): Promise<PanCardModel>;
    removePanCard(panCardId: number): Promise<boolean>;
    verifyPanCard(panCardId: number, verifyDate?: Date): Promise<PanCardModel>;
}

export interface IAddressManagerInterface {
    createAddress(customerProfileId: number, data: z.infer<typeof appSchema.customer.createAddressSchema>): Promise<AddressModel>;
    getCustomerAddress(customerProfileId: number): Promise<AddressModel>;
    updateAddress(addressId: number, data: z.infer<typeof appSchema.customer.updateAadhaarDetailsSchema>): Promise<AddressModel>;
    removeAddress(addressId: number): Promise<boolean>;
}

export interface IPersonalInfoManagerInterface {
    createPersonalInfo(customerProfileId: number, data: z.infer<typeof appSchema.customer.createPersonalInfoSchema>): Promise<CustomerPersonalInfoModel>;
    getPersonalInfo(personalInfoId: number): Promise<CustomerPersonalInfoModel>;
    getCustomerPersonalInfo(customerProfileId: number): Promise<CustomerPersonalInfoModel>;
    updatePersonalInfo(personalInfoId: number, data: z.infer<typeof appSchema.customer.updatePersonalInfoSchema>): Promise<CustomerPersonalInfoModel>;
    removePersonalInfo(personalInfoId: number): Promise<boolean>;
}

export interface ICustomerProfileManagerInterface {
    createCustomerProfile(data: z.infer<typeof appSchema.customer.createNewCustomerSchema>, createdBy?: number): Promise<CustomerProfileDataModel>;
    getCustomerProfile(customerProfileId: number): Promise<CustomerProfileDataModel | null>;
    getCustomerProfileByEmail(emailAddress: string): Promise<CustomerProfileDataModel | null>;
    getCustomerProfileByUsername(userName: string): Promise<CustomerProfileDataModel | null>;
    updateCustomerProfile(customerProfileId: number, data: z.infer<typeof appSchema.customer.updateCustomerProfileSchema>): Promise<CustomerProfileDataModel>;
    removeCustomerProfile(customerProfileId: number): Promise<boolean>;
    updateKycStatus(customerProfileId: number, kycStatus: KYCStatus, verifiedBy?: number): Promise<CustomerProfileDataModel>;
}