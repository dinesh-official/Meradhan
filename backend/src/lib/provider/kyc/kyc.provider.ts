import AdmZip from "adm-zip";
import * as fs from 'fs';
import { DigioSDK, genPdfForSign, NSDLApi, type DanRequest, type DigioAadharPanData, type DigioFaceDataResponse } from 'kyc-providers';
import os from "os";
import * as path from 'path';
import { putFileS3 } from '../fileUpload/s3FileUploader.provider';
import { AppError } from "@utils/error/AppError";
import { AxiosError } from "axios";
export class KycProvider {
    private digio = new DigioSDK()
    private nsdlApi = new NSDLApi(
        "NR100013",
        "06b2d035ad7d2f12c5d339bec39d58d4fc6e",
        false
    ); // false = test mode


    async createPanVerifyRequest({ email, id, name }: { email: string, name: string, id: string }) {
        const panDetails = await this.digio.sendTemplateRequest({
            emailId: email,
            name,
            templateName: "DIGILOCKER_AADHAAR_PAN",
            reference_id: id
        });
        return panDetails;
    }

    async verifyPan({ kid }: { kid: string }) {
        const panDetails = await this.digio.getKycgetResponse<DigioAadharPanData>(kid);
        return panDetails;
    }

    async getPanAadharDocumentFiles(rid: string) {
        const bytes = await this.digio.getMediaData(rid);
        const zipBuffer = Buffer.from(bytes);
        const zip = new AdmZip(zipBuffer);

        // Step 2: Create temp dir + extract
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "unzipped-"));
        zip.extractAllTo(tempDir, true);

        // Step 3: Collect extracted file paths
        const files = fs.readdirSync(tempDir).map((file) => path.join(tempDir, file));

        const pathData = {
            pan: files?.[0],
            aadhar: files?.[1]
        }
        const aadharUrl = await putFileS3(pathData.aadhar!, "kyc/aadhar/document");
        const panUrl = await putFileS3(pathData.pan!, "kyc/pan/document");
        return {
            aadhar: aadharUrl.location,
            pan: panUrl.location
        }
    }

    async getFileDataBytes(kid: string) {
        const bytes = await this.digio.getMediaData(kid);
        return bytes;
    }

    async getBash64File(baseData: string, data?: { name?: string, path?: string }) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "aadhar"));
        const fileName = data?.name || `file.jpeg`;
        fs.writeFileSync(path.join(tempDir, fileName), Buffer.from(baseData, "base64"));
        const location = path.join(tempDir, fileName);
        const saveData = await putFileS3(location, data?.path);
        return saveData.location;
    }

    async getFileBytesPath(bytes: string, data?: { name?: string, path?: string }) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "filedata"));
        const fileName = data?.name || `file.jpeg`;
        fs.writeFileSync(path.join(tempDir, fileName), bytes);
        const location = path.join(tempDir, fileName);
        const saveData = await putFileS3(location, data?.path);
        return saveData.location;
    }

    // sign
    async createSelfieVerifyRequest({ email, id, name }: { email: string, name: string, id: string }) {
        const selfieDetails = await this.digio.sendTemplateRequest({
            emailId: email,
            name,
            templateName: "SELFIEDATA",
            reference_id: id
        });
        return selfieDetails;
    }

    async verifySelfie({ kid }: { kid: string }) {
        const selfieDetails = await this.digio.getKycgetResponse<DigioFaceDataResponse>(kid);
        return selfieDetails;
    }


    // face 
    async createSignVerifyRequest({ email, id, name }: { email: string, name: string, id: string }) {
        const selfieDetails = await this.digio.sendTemplateRequest({
            emailId: email,
            name,
            templateName: "SIGNATURE",
            reference_id: id
        });
        return selfieDetails;
    }

    async verifySign({ kid }: { kid: string }) {
        const signDetails = await this.digio.getKycgetResponse<DigioFaceDataResponse>(kid);
        return signDetails;
    }

    async fetchIfscInfo(ifsc: string) {
        const ifscInfo = await this.digio.fetchIfscCode({ ifsc });
        return ifscInfo;
    }


    async verifyBankAccount(payload: {
        beneficiary_account_no: string
        beneficiary_ifsc: string
        beneficiary_name: string
    }) {
        const bankDetails = await this.digio.verifyBankAccount(payload);
        return bankDetails;
    }


    async verifyDmateAccount(type: "NSDL" | "CDSL", payload: DanRequest) {
        try {
            if (type == "NSDL") {
                const nsdlDetails = await this.nsdlApi.checkDANstatus(payload);
                return nsdlDetails;
            }
        } catch (error) {
            if (error) {
                throw new AppError((error as AxiosError<{ error: string }>)?.response?.data?.error || error.toString(), { code: "DEMAT_VERIFICATION_ERROR", statusCode: 400 });
            }
        }

        throw new AppError("cdsl not supported. Please use NSDL", { code: "NOT_SUPPORTED", statusCode: 400 });
    }


    async esignRequest({ email, name }: { name: string, email: string }) {
        const file = genPdfForSign();
        const reqData = await this.digio.esignRequest(file, {
            email,
            name
        })
        return reqData;
    }

    async getEsignPdf(document_id: string) {
        const pdfData = await this.digio.getSignatureEsignPdf(document_id);
        const url = this.getFileBytesPath(pdfData, { name: "esign.pdf", path: "kyc/esign" });
        return url;
    }


}
