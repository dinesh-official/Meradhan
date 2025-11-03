import type { Request, Response } from "express";
import { CustomerKycKycService } from "./customer_kyc.service";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";

export class CustomerKycKycController {
    private panKycService = new CustomerKycKycService()

    // pan verify request
    async createPanVerifyRequest(req: Request, res: Response) {
        const id = req.customer!.id
        const data = appSchema.kyc.kycPanInfoDataSchema.parse(req.body);
        const response = await this.panKycService.createPanVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // pan verify response
    async verifyPanResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        // verify pan response from digio
        const response = await this.panKycService.verifyPanResponse({ kid });
        console.log(response.status);

        // check if aadhaar and pan details are present in response actions by digio KYC
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

        // fetch aadhar and pan document files
        const kycdata = response.actions?.[0];
        const aadharData = await this.panKycService.getPanAadharDocumentFiles(kycdata.execution_request_id);
        const aadharImage = await this.panKycService.getAadharProfileImage(kycdata.details.aadhaar.image);

        // append file urls to kyc data response
        kycdata.details.aadhaar.image = aadharImage || ""
        kycdata.details.aadhaar.file_url = aadharData.aadhar || "";
        kycdata.details.pan.file_url = aadharData.pan || "";


        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: kycdata
        })
    }

    // selfie verify request
    async createSelfieVerifyRequest(req: Request, res: Response) {
        const id = req.customer!.id
        const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
        const response = await this.panKycService.createSelfieVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // selfie verify response
    async verifySelfieResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        const response = await this.panKycService.verifySelfieResponse({ kid });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // sign verify request
    async createSignVerifyRequest(req: Request, res: Response) {
        const id = req.customer!.id
        const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
        const response = await this.panKycService.createSignVerifyRequest({ id, data });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // sign verify response
    async verifySignResponse(req: Request, res: Response) {
        const kid = req.params.kid!;
        const response = await this.panKycService.verifySignResponse({ kid });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // fetch ifsc info
    async fetchIfscInfo(req: Request, res: Response) {
        const ifsc = req.params.ifsc!;
        const response = await this.panKycService.fetchIfscInfo(ifsc);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // verify bank account
    async verifyBankAccount(req: Request, res: Response) {
        const bank = appSchema.kyc.bankInfoSchema.parse(req.body);
        const response = await this.panKycService.verifyBankAccount(bank);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // verify demat account
    async verifyDematAccount(req: Request, res: Response) {
        const data = appSchema.kyc.dpAccountInfoSchema.parse(req.body);
        const response = await this.panKycService.verifyDematAccount(data);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response
        })
    }

    // e-sign request
    async getEsignRequest(req: Request, res: Response) {
        const id = req.customer!.id;
        const data = await this.panKycService.reqEsignPdf(id);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data
        })
    }

    // download esign pdf
    async verifyEsignResponse(req: Request, res: Response) {
        const doc = req.params.doc!;
        const data = await this.panKycService.downloadEsignPdf(doc);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: {
                fileUrl: data,
            }
        })
    }


}