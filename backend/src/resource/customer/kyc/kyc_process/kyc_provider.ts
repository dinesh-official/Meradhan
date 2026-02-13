import { db } from "@core/database/database";
import { saveFileOnCloud } from "@modules/file_upload/helpers/save_file_on_cloud";
import { env } from "@packages/config/src/env";
import { AppError } from "@utils/error/AppError";
import AdmZip from "adm-zip";
import { AxiosError } from "axios";
import * as fs from "fs";
import {
  CDSLApi,
  DigioSDK,
  generateKycPdf,
  NSDLApi,
  type DigioAadharPanData,
  type DigioFaceDataResponse,
} from "kyc-providers";
import os from "os";
import * as path from "path";

// helper class for digio kyc file operations
class DigioKycFileHelper {
  constructor(private digioSdk: DigioSDK) { }

  // get pan aadhar document files from digio rid
  async getPanAadharDocumentFiles(bytes: string, userName?: string) {
    console.log(userName);

    const zipBuffer = Buffer.from(bytes);
    const zip = new AdmZip(zipBuffer);

    // Step 2: Create temp dir + extract with security validation
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "unzipped-"));
    const tempDirResolved = path.resolve(tempDir);

    // Security: Validate zip entries before extraction to prevent path traversal
    const zipEntries = zip.getEntries();
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];

    for (const entry of zipEntries) {
      // Prevent path traversal attacks
      const entryPath = path.resolve(tempDir, entry.entryName);
      if (!entryPath.startsWith(tempDirResolved)) {
        throw new AppError("Invalid zip entry: path traversal detected", {
          code: "ZIP_SECURITY_ERROR",
          statusCode: 400,
        });
      }

      // Validate file extension
      const ext = path.extname(entry.entryName).toLowerCase();
      if (!allowedExtensions.includes(ext) && !entry.isDirectory) {
        throw new AppError(`Invalid file type in zip: ${ext}`, {
          code: "ZIP_INVALID_FILE_TYPE",
          statusCode: 400,
        });
      }
    }

    // Safe extraction after validation
    zip.extractAllTo(tempDir, true);

    // Step 3: Collect extracted file paths
    const files = fs
      .readdirSync(tempDir)
      .sort((a, b) => a.localeCompare(b)) // A → Z
      .map((file) => {
        const filePath = path.join(tempDir, file);
        // Double-check resolved path is still within temp directory
        if (!path.resolve(filePath).startsWith(tempDirResolved)) {
          throw new AppError("Invalid file path after extraction", {
            code: "ZIP_EXTRACTION_ERROR",
            statusCode: 500,
          });
        }
        return filePath;
      });

    console.log(files);

    const pathData = {
      // pan: files?.[0],
      aadhar: files?.[0],
    };

    const aadharUrl = await saveFileOnCloud({
      filePath: pathData.aadhar!,
      directory: `${userName ? userName + "/" : ""}kyc`,
    });
    // const panUrl = await saveFileOnCloud({
    //   filePath: pathData.pan!,
    //   directory: `${userName ? userName + "/" : ""}kyc`,
    // });
    return {
      aadhar: aadharUrl,
      // pan: panUrl,
    };
  }

  // get file data bytes from digio kid
  async getMediaFileDataBytes(kid: string) {
    const bytes = await this.digioSdk.getMediaData(kid);
    return bytes;
  }

  // use for make file from base64 string and upload to cloud
  async getBash64File(
    baseData: string,
    data?: { name?: string; path?: string },
  ) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aadhar"));
    const fileName = data?.name || `file.jpeg`;
    fs.writeFileSync(
      path.join(tempDir, fileName),
      Buffer.from(baseData, "base64"),
    );
    const location = path.join(tempDir, fileName);
    const saveUrl = await saveFileOnCloud({
      filePath: location,
      directory: data?.path,
    });
    return saveUrl;
  }

  // use for make file from bytes string and upload to cloud
  async getFileBytesPath(
    bytes: string,
    data?: { name?: string; path?: string },
  ) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "filedata"));
    const fileName = data?.name || `file.jpeg`;
    fs.writeFileSync(path.join(tempDir, fileName), bytes);
    const location = path.join(tempDir, fileName);
    const saveUrl = await saveFileOnCloud({
      filePath: location,
      directory: data?.path,
    });
    return saveUrl;
  }
}

// main KYC provider class
export class KycProvider extends DigioKycFileHelper {
  private digio: DigioSDK;

  constructor() {
    const digio = new DigioSDK();
    super(digio);
    this.digio = digio;
  }

  private nsdlApi = new NSDLApi(
    env.NDSL_REQUESTOR_ID || "",
    env.NSDL_SECRET_KEY || "",
    env.NSDL_MODE === "PROD",
  );
  private cdslApi = new CDSLApi({
    AESKey: env.CDSL_AES_KEY || "",
    isProd: env.CDSL_MODE === "PROD",
  });

  // KYC STEP 1: PAN Verification ---------------------------------------------

  async panVerifyInfo({
    date,
    id,
    name,
  }: {
    date: string;
    name: string;
    id: string;
  }) {
    try {
      const panDetails = await this.digio.verifyPanInfo({
        id_no: id,
        name,
        dob: date,
      });
      return panDetails;
    } catch (error) {
      console.log((error as AxiosError<{ message: string }>)?.response?.data);
      throw new AppError("We couldn’t verify the PAN details. Please check the PAN number and try again.", {
        code: "PAN_VERIFICATION_FAILED",
        statusCode: 400,
      });
    }
  }

  // pan aadhar generate request to digio
  async createPanVerifyRequest({
    email,
    id,
    name,
  }: {
    email: string;
    name: string;
    id: string;
  }) {
    const panDetails = await this.digio.sendTemplateRequest({
      emailId: email,
      name,
      templateName: "DIGILOCKER_AADHAAR_PAN",
      reference_id: id,
    });
    return panDetails;
  }

  // verify pan aadhar details from digio kid
  async verifyPan({ kid }: { kid: string }) {
    const panDetails =
      await this.digio.getKycgetResponse<DigioAadharPanData>(kid);
    return panDetails;
  }

  // aadhaar generate request to digio
  async createAadhaarVerifyRequest({
    email,
    id,
    name,
  }: {
    email: string;
    name: string;
    id?: string;
  }) {
    const aadhaarDetails = await this.digio.sendTemplateRequest({
      emailId: email,
      name,
      templateName: "DIGILOCKERAADHAAR",
      reference_id: id,
    });
    return aadhaarDetails;
  }

  // // verify aadhaar from digio kid

  // async verifyAadhaar({ kid }: { kid: string }) {
  //   try {
  //     const aadhaarDetails =
  //       await this.digio.getKycgetResponse(kid);
  //     return aadhaarDetails;
  //   } catch (error) {
  //     console.log(error?.response?.data);
  //     throw new AppError("Aadhaar verification failed", {
  //       code: "AADHAAR_VERIFICATION_FAILED",
  //       statusCode: 400,
  //     });
  //   }
  // }

  // selfie generate request to digio
  async createSelfieVerifyRequest({
    email,
    id,
    name,
  }: {
    email: string;
    name: string;
    id: string;
  }) {
    const selfieDetails = await this.digio.sendTemplateRequest({
      emailId: email,
      name,
      templateName: "SELFIEDATA",
      reference_id: id,
    });
    return selfieDetails;
  }

  // verify selfie from digio kid
  async verifySelfie({ kid }: { kid: string }) {
    const selfieDetails =
      await this.digio.getKycgetResponse<DigioFaceDataResponse>(kid);
    return selfieDetails;
  }

  // face verification request to digio
  async createSignVerifyRequest({
    email,
    id,
    name,
  }: {
    email: string;
    name: string;
    id: string;
  }) {
    const selfieDetails = await this.digio.sendTemplateRequest({
      emailId: email,
      name,
      templateName: "SIGNATURE",
      reference_id: id,
    });
    return selfieDetails;
  }

  // verify sign from digio kid
  async verifySign({ kid }: { kid: string }) {
    const signDetails =
      await this.digio.getKycgetResponse<DigioFaceDataResponse>(kid);
    return signDetails;
  }

  // KYC STEP 2: BANK Verification ---------------------------------------------
  // fetch ifsc info from Razorpay
  async fetchIfscInfo(ifsc: string) {
    const ifscInfo = await this.digio.fetchIfscCode({ ifsc });
    return ifscInfo;
  }

  // verify bank account details from digio
  async verifyBankAccount(payload: {
    beneficiary_account_no: string;
    beneficiary_ifsc: string;
    beneficiary_name: string;
  }) {
    const bankDetails = await this.digio.verifyBankAccount(payload);
    return bankDetails;
  }

  // KYC STEP 3: DEMAT Verification ---------------------------------------------
  // verify demat account from NSDL/CDSL
  async verifyDmateAccount(
    type: "NSDL" | "CDSL",
    payload: {
      dpId?: string;
      boId_or_clientId: string;
      pan1: string;
      pan2?: string | null;
      pan3?: string | null;
    },
  ) {
    try {
      if (type == "NSDL") {
        const nsdlDetails = await this.nsdlApi.checkDANstatus({
          clientId: payload.boId_or_clientId,
          dpId: payload.dpId!,
          fstHoldrPan: payload.pan1,
          scndHoldrPan: payload.pan2 || undefined,
          thrdHoldrPan: payload.pan3 || undefined,
          transactionId: new Date().getTime().toString(),
        });
        return nsdlDetails;
      } else if (type == "CDSL") {
        const cdslDetails = await this.cdslApi.panVerifyRequest({
          boid: payload.boId_or_clientId,
          pan1: payload.pan1,
          pan2: payload.pan2 || undefined,
          pan3: payload.pan3 || undefined,
        });
        return cdslDetails;
      }
    } catch (error) {
      if (error) {
        throw new AppError(
          (error as AxiosError<{ error: string; ErrorDescription?: string }>)
            ?.response?.data?.ErrorDescription ||
          (error as AxiosError<{ error: string; message?: string }>)?.response
            ?.data?.error ||
          (error as AxiosError<{ error: string; message?: string }>)?.response
            ?.data?.message ||
          error.toString(),
          { code: "DEMAT_VERIFICATION_ERROR", statusCode: 400 },
        );
      }
    }

    throw new AppError("ben not supported. Please use NSDL", {
      code: "NOT_SUPPORTED",
      statusCode: 400,
    });
  }

  // KYC STEP 4: RISK PROFILE IS A PLAN Array OF JSON so use KYCStore to save IT Manage By "Client" Or "Kyc Store"
  // No External Provider Integration Required

  // KYC STEP 5: E-SIGN Verification ---------------------------------------------
  // esign request to digio
  async esignRequest({
    email,
    name,
    userId,
  }: {
    name: string;
    email: string;
    userId: number;
  }) {
    const file = await this.getKycPdfFile(userId); // pass user id here to get kyc pdf file
    const reqData = await this.digio.esignRequest(file, {
      email,
      name,
    });
    return reqData;
  }

  // get esign pdf from digio document id
  async getEsignPdf(document_id: string, userName?: string) {
    const pdfData = await this.digio.getSignatureEsignPdf(document_id);
    const url = this.getFileBytesPath(pdfData, {
      name: "esign.pdf",
      path: `${userName ? userName + "/" : ""}kyc/esign`,
    });
    return url;
  }

  async getKycPdfFile(userId: number) {
    const userData = await db.dataBase.kYC_FLOW.findFirst({
      where: {
        userID: userId,
      },
    });
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userData || !user) {
      throw new AppError("User KYC data not found", {
        code: "KYC_DATA_NOT_FOUND",
        statusCode: 404,
      });
    }

    const filePath = await generateKycPdf({
      ...((userData.data as object) || {}),
      user: user,
    });

    return filePath;
  }
}
