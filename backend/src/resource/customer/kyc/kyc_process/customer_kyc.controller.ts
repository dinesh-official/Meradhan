import { db } from "@core/database/database";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { CustomerKycKycService } from "./customer_kyc.service";

/** Normalize Aadhaar for comparison (masked digits often stored as x). */
function normalizeAadhaar(id: string): string {
  return (id || "").replace(/\s/g, "").replace(/x/gi, "0");
}

/** For RE_KYC, ensure new PAN and Aadhaar match the last verified KYC. */
function validateRekycIdentity(
  kycdata: { details?: { aadhaar?: { id_number?: string }; pan?: { id_number?: string } } },
  existing: {
    aadhaarCard?: { aadhaarNo: string } | null;
    panCard?: { panCardNo: string } | null;
    kycStatus?: string;
  } | null,
): void {
  if (!existing || existing.kycStatus !== "RE_KYC") return;

  const newAadhaar = kycdata.details?.aadhaar?.id_number;
  const newPan = kycdata.details?.pan?.id_number;
  const existingAadhaar = existing.aadhaarCard?.aadhaarNo;
  const existingPan = existing.panCard?.panCardNo;

  if (existingAadhaar && newAadhaar) {
    if (normalizeAadhaar(newAadhaar) !== normalizeAadhaar(existingAadhaar)) {
      throw new AppError(
        "ReKYC must use the same Aadhaar number as your last verified KYC. Please use the same Aadhaar and try again.",
        { code: "REKYC_AADHAAR_MISMATCH", statusCode: 400 },
      );
    }
  }

  if (existingPan && newPan) {
    const panNew = (newPan || "").trim().toUpperCase();
    const panExisting = (existingPan || "").trim().toUpperCase();
    if (panNew !== panExisting) {
      throw new AppError(
        "ReKYC must use the same PAN number as your last verified KYC. Please use the same PAN and try again.",
        { code: "REKYC_PAN_MISMATCH", statusCode: 400 },
      );
    }
  }
}

export class CustomerKycKycController {
  private panKycService = new CustomerKycKycService();

  async panInfoVerifyRequest(req: Request, res: Response) {
    const data = appSchema.kyc.panVerifyInfoSchema.parse(req.body);
    const response = await this.panKycService.verifyPanInfo(data);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // pan verify request
  async createPanVerifyRequest(req: Request, res: Response) {
    const id = req.customer!.id;
    const data = appSchema.kyc.kycPanInfoDataSchema.parse(req.body);

    // make sure the pan number is not already verified
    const pan = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        id,

      },
      include: { panCard: true },
    });
    if (pan?.panCard) {
      if (pan.panCard.panCardNo !== data.panCardNo) {
        throw new AppError("PAN number is not the same as the one you provided", { code: "PAN_NUMBER_MISMATCH", statusCode: 400 });
      }
    }


    const response = await this.panKycService.createPanVerifyRequest({
      id,
      data,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // pan verify response
  async verifyPanResponse(req: Request, res: Response) {
    const kid = req.params.kid!.toString();
    const id = req.customer?.id;
    const user = await db.dataBase.customerProfileDataModel.findFirst({
      where: { id },
      include: { aadhaarCard: true, panCard: true },
    });
    const response = await this.panKycService.verifyPanResponse({ kid });

    // check if aadhaar and pan details are present in response actions by digio KYC
    // if (
    //   !response.actions?.[0]?.details?.aadhaar &&
    //   !response.actions?.[0]?.details?.pan
    // ) {
    //   throw new AppError(
    //     "Your KYC verification is incomplete — both Aadhaar and PAN details are missing. Please update your KYC details and try again.",
    //     { code: "KYC_NOT_APPROVED", statusCode: 400 }
    //   );
    // } else

    if (!response.actions?.[0]?.details?.aadhaar) {
      throw new AppError(
        "Your KYC verification is incomplete — Aadhaar details are missing. Please select your Aadhaar and try again.",
        { code: "AADHAAR_NOT_FOUND", statusCode: 400 },
      );
    }

    //  else if (!response.actions?.[0]?.details?.pan) {
    //   throw new AppError(
    //     "Your KYC verification is incomplete — PAN details are missing. Please select your PAN and try again.",
    //     { code: "PAN_NOT_FOUND", statusCode: 400 }
    //   );
    // }

    const kycdata = response.actions?.[0];
    validateRekycIdentity(kycdata, user);

    const aadharData = await this.panKycService.getPanAadharDocumentFiles(
      kycdata.execution_request_id,
      user?.userName,
    );
    const aadharImage = await this.panKycService.getAadharProfileImage(
      kycdata.details.aadhaar.image,
      user?.userName,
    );

    // append file urls to kyc data response
    kycdata.details.aadhaar.image = aadharImage || "";
    kycdata.details.aadhaar.file_url = aadharData.aadhar || "";
    // kycdata.details.pan.file_url = aadharData.pan || "";

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: kycdata,
    });
  }

  // aadhaar verify request
  async createAadhaarVerifyRequest(req: Request, res: Response) {
    const id = req.customer!.id;
    const data = appSchema.kyc.kycAadhaarInfoDataSchema.parse(req.body);
    const response = await this.panKycService.createAadhaarVerifyRequest({
      id,
      data,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // selfie verify request
  async createSelfieVerifyRequest(req: Request, res: Response) {
    const id = req.customer!.id;
    const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
    const response = await this.panKycService.createSelfieVerifyRequest({
      id,
      data,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // selfie verify response
  async verifySelfieResponse(req: Request, res: Response) {
    const kid = req.params.kid!.toString();
    const id = req.customer?.id;
    const user = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        id,
      },
    });
    const response = await this.panKycService.verifySelfieResponse({
      kid,
      userName: user?.userName,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // sign verify request
  async createSignVerifyRequest(req: Request, res: Response) {
    const id = req.customer!.id;
    const data = appSchema.kyc.selfieSignRequestSchema.parse(req.body);
    const response = await this.panKycService.createSignVerifyRequest({
      id,
      data,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // sign verify response
  async verifySignResponse(req: Request, res: Response) {
    const kid = req.params.kid!.toString();
    const id = req.customer?.id;
    const user = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        id,
      },
    });
    const response = await this.panKycService.verifySignResponse({
      kid,
      userName: user?.userName,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // fetch ifsc info
  async fetchIfscInfo(req: Request, res: Response) {
    const ifsc = req.params.ifsc!;
    const response = await this.panKycService.fetchIfscInfo(ifsc.toString());
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // verify bank account
  async verifyBankAccount(req: Request, res: Response) {
    const bank = appSchema.kyc.bankInfoSchema.parse(req.body);
    const response = await this.panKycService.verifyBankAccount(bank);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // verify demat account
  async verifyDematAccount(req: Request, res: Response) {
    const data = appSchema.kyc.dpAccountInfoSchema.parse(req.body);
    const response = await this.panKycService.verifyDematAccount(data);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // e-sign request
  async getEsignRequest(req: Request, res: Response) {
    const id = req.customer!.id;

    const data = await this.panKycService.reqEsignPdf(id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  // download esign pdf
  async verifyEsignResponse(req: Request, res: Response) {
    const doc = req.params.doc!;
    const userId = req.customer!.id;

    const user = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        id: userId,
      },
    });
    const data = await this.panKycService.downloadEsignPdf(
      doc.toString(),
      userId,
      user?.userName,
    );

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        fileUrl: data,
      },
    });
  }

  // download kyc pdf
  async downloadKycPdf(req: Request, res: Response) {
    try {
      const id = Number(req.customer?.id);
      if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("Invalid user id for KYC PDF", {
          code: "INVALID_USER_ID",
          statusCode: 400,
        });
      }

      // Generate PDF and get file path
      const filePath = await this.panKycService.downloadKycPdf(id);

      // Resolve absolute path (in case the service returns a relative one)
      const absolutePath = path.resolve(filePath);

      // Check if file exists
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set headers for download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="MeraDhan-KYC-${new Date().getTime()}-UnsignedForm.pdf"`,
      );

      // Stream the file to the client
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);

      // Optionally delete the file after sending
      fileStream.on("close", () => {
        fs.unlink(absolutePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error serving KYC PDF:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to serve KYC PDF",
      });
    }
  }

  // create kra verify request
  async createKraVerifyRequest(req: Request, res: Response) {
    const id = req.customer!.id;
    const data = appSchema.kyc.kraVerifyRequestSchema.parse(req.body);
    const response = await this.panKycService.createKraVerifyRequest(id, data);
    const responseData = response ? JSON.parse(JSON.stringify(response)) : response;
    delete responseData?.rawXml;
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData
    });
  }
}
