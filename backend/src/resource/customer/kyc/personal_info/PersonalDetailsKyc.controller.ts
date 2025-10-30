import type { Request, Response } from "express";
import { PersonalDetailsKycService } from "./PersonalDetailsKyc.service";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";

export class PersonalDetailsKycController {
    private panKycService = new PersonalDetailsKycService()

    async createPanVerifyRequest(req: Request, res: Response) {
        const data = appSchema.kyc.kycPanInfoDataSchema.parse(req.body);
        const id = req.customer!.id
        const response = await this.panKycService.createPanVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async verifyPanResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        const response = await this.panKycService.verifyPanResponse({ kid });
        console.log(response.status);
        if (
            !response.actions?.[0]?.details?.aadhaar &&
            !response.actions?.[0]?.details?.pan
        ) {
            throw new AppError(
                "Your KYC verification is incomplete — both Aadhaar and PAN details are missing. Please update your KYC details and try again.",
                { code: "KYC_NOT_APPROVED", statusCode: 400 }
            );
        } else if (!response.actions?.[0]?.details?.aadhaar) {
            throw new AppError(
                "Your KYC verification is incomplete — Aadhaar details are missing. Please select your Aadhaar and try again.",
                { code: "AADHAAR_NOT_FOUND", statusCode: 400 }
            );
        } else if (!response.actions?.[0]?.details?.pan) {
            throw new AppError(
                "Your KYC verification is incomplete — PAN details are missing. Please select your PAN and try again.",
                { code: "PAN_NOT_FOUND", statusCode: 400 }
            );
        }

        const kycdata = response.actions?.[0];

        const aadharData = await this.panKycService.getPanAadharDocumentFiles(kycdata.execution_request_id);
        const aadharImage = await this.panKycService.getAadharProfileImage(kycdata.details.aadhaar.image);

        kycdata.details.aadhaar.image = aadharImage || ""


        kycdata.details.aadhaar.file_url = aadharData.aadhar || "";
        kycdata.details.pan.file_url = aadharData.pan || "";


        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: kycdata
        })
    }

    async createSelfieVerifyRequest(req: Request, res: Response) {
        const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
        const id = req.customer!.id
        const response = await this.panKycService.createSelfieVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async verifySelfieResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        const response = await this.panKycService.verifySelfieResponse({ kid });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }



    async createSignVerifyRequest(req: Request, res: Response) {
        const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
        const id = req.customer!.id
        const response = await this.panKycService.createSignVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async verifySignResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        const response = await this.panKycService.verifySignResponse({ kid });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }


    async fetchIfscInfo(req: Request, res: Response) {
        const ifsc = req.params.ifsc!;
        const response = await this.panKycService.fetchIfscInfo(ifsc);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    async verifyBankAccount(req: Request, res: Response) {
        const bank = appSchema.kyc.bankInfoSchema.parse(req.body); 
        const response = await this.panKycService.verifyBankAccount(bank);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

}