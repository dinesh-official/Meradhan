import { db } from '@core/database/database';
import { KycProvider } from '@lib/provider/kyc/kyc.provider';
import { appSchema } from '@root/schema';
import { AppError } from '@utils/error/AppError';
import type z from 'zod';

export class CustomerKycKycService {
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


    async fetchIfscInfo(ifsc: string) {
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


    async verifyDematAccount(payload: z.infer<typeof appSchema.kyc.dpAccountInfoSchema>) {

        const getPans = () => {
            const pans = payload.panNumber;
            let dataPan: {
                fstHoldrPan: string,
                scndHoldrPan?: string,
                thrdHoldrPan?: string
            };

            dataPan = {
                fstHoldrPan: pans[0]!,
            };

            if (pans?.[1]) {
                dataPan = {
                    ...dataPan,
                    scndHoldrPan: pans[1],
                };
            }

            if (pans?.[2]) {
                dataPan = {
                    ...dataPan,
                    thrdHoldrPan: pans[2],
                };
            }
            return dataPan;

        };

        const pans = getPans();

        const dematDetails = await this.kycProvider.verifyDmateAccount(payload.depositoryName, {
            transactionId: new Date().getTime().toString(),
            dpId: payload.dpId,
            clientId: payload.beneficiaryClientId,
            ...pans,
        });
        return dematDetails;
    }


    async reqEsignPdf(userID: number) {
        const user = await db.dataBase.customerProfileDataModel.findUnique({ where: { id: userID }, select: { emailAddress: true } });
        if (!user) {
            throw new AppError("User Not Found")
        }
        const kycData = await db.dataBase.kYC_FLOW.findUnique({ where: { userID } });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const panData = ((kycData?.data as any)?.['step_1'] as any)?.['pan'] as any;
        if (!panData) {
            throw new AppError("not eligible for e-sign")
        }
        return await this.kycProvider.esignRequest({
            email: user.emailAddress,
            name: panData?.['firstName'] + " " + panData?.['middleName'] + " " + panData?.['lastName']
        });
    }

    async downloadEsignPdf(document_id: string) {
        const pdfData = await this.kycProvider.getEsignPdf(document_id);
        return pdfData;
    }

}