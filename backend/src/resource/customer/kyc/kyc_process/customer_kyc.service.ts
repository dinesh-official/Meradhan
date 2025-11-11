import { db } from '@core/database/database';
import { KycProvider } from './kyc_provider';
import { appSchema } from '@root/schema';
import { AppError } from '@utils/error/AppError';
import type z from 'zod';
import { makeFullname } from '@utils/generate/generate_username';

export class CustomerKycKycService {
    private kycProvider = new KycProvider()

    // pan verify request
    async createPanVerifyRequest({ id, data }: { id: number, data: z.infer<typeof appSchema.kyc.kycPanInfoDataSchema> }) {
        const { firstName, lastName, middleName } = data;
        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id }
        });

        if (!user) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }

        const fullName = makeFullname({ firstName, middleName, lastName });
        const panDetails = await this.kycProvider.createPanVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: fullName });
        return panDetails;
    }

    // pan verify response
    async verifyPanResponse({ kid }: { kid: string }) {
        const panDetails = await this.kycProvider.verifyPan({ kid: kid });
        return panDetails;
    }

    // get pan aadhar document files
    async getPanAadharDocumentFiles(kid: string) {
        const bytes = await this.kycProvider.getMediaFileDataBytes(kid);
        const files = await this.kycProvider.getPanAadharDocumentFiles(bytes);
        return files
    }

    // aadhar profile image
    async getAadharProfileImage(imageString: string) {
        const files = await this.kycProvider.getBash64File(imageString, {
            name: "profile.png",
            path: "kyc/aadhar/profile"
        });
        return files
    }


    // selfie verify
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
        const fullName = makeFullname({ firstName, middleName, lastName });
        const selfieDetails = await this.kycProvider.createSelfieVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: fullName });
        return selfieDetails;
    }

    // selfie verify response
    async verifySelfieResponse({ kid }: { kid: string }) {
        const selfieDetails = await this.kycProvider.verifySelfie({ kid: kid });
        if (!selfieDetails.actions[0]?.file_id) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const bytes = await this.kycProvider.getMediaFileDataBytes(selfieDetails.actions[0]?.file_id);
        const image = await this.kycProvider.getBash64File(bytes, { name: "selfie.jpeg", "path": "kyc/selfie" });
        selfieDetails.file_url = image

        return selfieDetails;
    }


    // sign verify
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
        const fullName = makeFullname({ firstName, middleName, lastName });
        const selfieDetails = await this.kycProvider.createSignVerifyRequest({ email: user?.emailAddress, id: user?.userName, name: fullName });
        return selfieDetails;
    }

    // sign verify response
    async verifySignResponse({ kid }: { kid: string }) {
        const selfieDetails = await this.kycProvider.verifySign({ kid: kid });
        if (!selfieDetails.actions[0]?.file_id) {
            throw new AppError("User profile Not Found", { code: "USER_NOT_FOUND", statusCode: 404 })
        }
        const bytes = await this.kycProvider.getMediaFileDataBytes(selfieDetails.actions[0]?.file_id);
        const image = await this.kycProvider.getBash64File(bytes, { name: "sign.jpeg", "path": "kyc/sign" });
        selfieDetails.file_url = image

        return selfieDetails;
    }

    // fetch ifsc info
    async fetchIfscInfo(ifsc: string) {
        const ifscCodes = await this.kycProvider.fetchIfscInfo(ifsc);
        return ifscCodes;
    }

    // verify bank account
    async verifyBankAccount(payload: z.infer<typeof appSchema.kyc.bankInfoSchema>) {
        const bankDetails = await this.kycProvider.verifyBankAccount({
            beneficiary_account_no: payload.accountNumber,
            beneficiary_ifsc: payload.ifscCode,
            beneficiary_name: payload.beneficiary_name
        });
        return bankDetails;
    }

    // verify demat account
    async verifyDematAccount(payload: z.infer<typeof appSchema.kyc.dpAccountInfoSchema>) {

        const getPans = () => {
            const pans = payload.panNumber;
            let dataPan: {
                pan1: string,
                pan2?: string,
                pan3?: string
            };

            dataPan = {
                pan1: pans[0]!,
            };

            if (pans?.[1]) {
                dataPan = {
                    ...dataPan,
                    pan2: pans[1],
                };
            }

            if (pans?.[2]) {
                dataPan = {
                    ...dataPan,
                    pan3: pans[2],
                };
            }
            return dataPan;

        };

        const pans = getPans();

        const dematDetails = await this.kycProvider.verifyDmateAccount(payload.depositoryName, {
            dpId: payload.dpId,
            boId_or_clientId: payload.beneficiaryClientId,
            ...pans,
        });
        return dematDetails;
    }

    // e-sign request
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

        const fullName = makeFullname({ firstName: panData?.['firstName'], middleName: panData?.['middleName'], lastName: panData?.['lastName'] });

        return await this.kycProvider.esignRequest({
            email: user.emailAddress,
            name: fullName,
            userId: userID
        });
    }

    // download esign pdf
    async downloadEsignPdf(document_id: string) {
        const pdfData = await this.kycProvider.getEsignPdf(document_id);
        return pdfData;
    }

    async getKycLevel(id: number) {

        const steps = [
            "Identity Validation",
            "Personal Details",
            "Bank Account",
            "Demat Account",
            "Risk Profiling",
            "e-Signature",
            "100%",
        ];


        const kycData = await db.dataBase.kYC_FLOW.findUnique({ where: { userID: id } });

        if (!kycData) {
            return "Not Started"
        }

        if (kycData.step) {
            return steps[kycData.step - 1] || "Unknown";
        }
        return "Unknown";
    }


    async downloadKycPdf(userId: number) {
        return await this.kycProvider.getKycPdfFile(userId);
    }
}