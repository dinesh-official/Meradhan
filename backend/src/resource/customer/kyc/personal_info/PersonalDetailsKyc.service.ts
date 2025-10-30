import { db } from '@core/database/database';
import { KycProvider } from '@lib/provider/kyc/kyc.provider';
import { appSchema } from '@root/schema';
import { AppError } from '@utils/error/AppError';
import type z from 'zod';
export class PersonalDetailsKycService {
    private kycProvider = new KycProvider()

    async createPanVerifyRequest({ id, data }: { id: number, data: z.infer<typeof appSchema.kyc.kycPanInfoDataSchema> }) {
        const { firstName, lastName, middleName } = data;
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                id
            }
        })
        if (!user) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const panDetails = await this.kycProvider.createPanVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: firstName + " " + middleName + " " + lastName });
        return panDetails;
    }

    async verifyPanResponse({ kid }: { kid: string }) {
        const panDetails = await this.kycProvider.verifyPan({ kid: kid });
        return panDetails;
    }

    async getPanAadharDocumentFiles(kid: string) {
        const files = await this.kycProvider.getPanAadharDocumentFiles(kid);
        return files
    }

    async getAadharProfileImage(imageString: string) {
        const files = await this.kycProvider.getBash64File(imageString, {
            name: "profile.png",
            path: "kyc/aadhar/profile"
        });
        return files
    }


    // selfie
    async createSelfieVerifyRequest({ id, data }: { id: number, data: z.infer<typeof appSchema.kyc.selfieSignRequestSchema> }) {
        const { firstName, lastName, middleName } = data;
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                id
            }
        })
        if (!user) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const selfieDetails = await this.kycProvider.createSelfieVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: firstName + " " + middleName + " " + lastName });
        return selfieDetails;
    }

    async verifySelfieResponse({ kid }: { kid: string }) {
        const selfieDetails = await this.kycProvider.verifySelfie({ kid: kid });
        if (!selfieDetails.actions[0]?.file_id) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const bytes = await this.kycProvider.getFileDataBytes(selfieDetails.actions[0]?.file_id);
        const image = await this.kycProvider.getBash64File(bytes, { name: "selfie.jpeg", "path": "kyc/selfie" });
        selfieDetails.file_url = image

        return selfieDetails;
    }


    // sign
    async createSignVerifyRequest({ id, data }: { id: number, data: z.infer<typeof appSchema.kyc.selfieSignRequestSchema> }) {
        const { firstName, lastName, middleName } = data;
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: {
                id
            }
        })
        if (!user) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const selfieDetails = await this.kycProvider.createSignVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: firstName + " " + middleName + " " + lastName });
        return selfieDetails;
    }

    async verifySignResponse({ kid }: { kid: string }) {
        const selfieDetails = await this.kycProvider.verifySign({ kid: kid });
        if (!selfieDetails.actions[0]?.file_id) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const bytes = await this.kycProvider.getFileDataBytes(selfieDetails.actions[0]?.file_id);
        const image = await this.kycProvider.getBash64File(bytes, { name: "sign.jpeg", "path": "kyc/sign" });
        selfieDetails.file_url = image

        return selfieDetails;
    }


    async fetchIfscInfo(ifsc:string) {
        const ifscCodes = await this.kycProvider.fetchIfscInfo(ifsc);
        return ifscCodes;
    }

    async verifyBankAccount(payload: z.infer<typeof appSchema.kyc.bankInfoSchema>) {
        const bankDetails = await this.kycProvider.verifyBankAccount({
            beneficiary_account_no: payload.accountNumber,
            beneficiary_ifsc: payload.ifscCode,
            beneficiary_name: payload.beneficiary_name
        });
        return bankDetails;
    }


}