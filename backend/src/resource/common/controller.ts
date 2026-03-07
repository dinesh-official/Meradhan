import { db } from "@core/database/database";
import { env } from "@packages/config/src/env";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import axios from "axios";
import type { Request, Response } from "express";
import FormData from "form-data";
import fs from "fs";
import os from "os";
import path from "path";
import { PartnershipManagerService } from "@resource/crm/partnership/services/partnership_manager.service";
import { putFileS3 } from "@modules/file_upload/s3_file_uploader";

export class CommonApiController {
  async contactSubmit(req: Request, res: Response) {
    const data = appSchema.contact.contactSchema.parse(req.body);
    const admin = await db.dataBase.cRMUserDataModel.findFirst({
      where: { role: "ADMIN" },
    });
    await db.dataBase.leadsModel.create({
      data: {
        fullName: data.fullName,
        emailAddress: data.email,
        leadSource: "WEBSITE",
        phoneNo: data.phone,
        status: "NEW",
        companyName: "None",
        bondType: "OTHER",
        createdBy: admin!.id,
      },
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Your form submitted successfully",
      success: true,
    });
  }

  async partnershipSubmit(req: Request, res: Response) {
    const data = appSchema.crm.partnership.createPartnershipSchema.parse(
      req.body
    );
    const admin = await db.dataBase.cRMUserDataModel.findFirst({
      where: { role: "ADMIN" },
    });
    const partnershipManager = new PartnershipManagerService();
    await partnershipManager.createNewPartnership(admin!.id, {
      ...data,
      status: "NEW",
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Your partnership request has been submitted successfully",
      success: true,
    });
  }

  async uploadStrapi(req: Request, res: Response) {
    if (req.headers.authorization !== `Bearer ${env.STRAPI_API_TOKEN}`) {
      throw new AppError("Unauthorized");
    }
    const maxSize = 50 * 1024 * 1024; // 50MB
    const { fileUrl, filename } = req.body;
    // Download file from URL
    async function downloadFile(url: string): Promise<Buffer> {
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(url);
      } catch {
        throw new AppError("Invalid URL format");
      }
      const response = await fetch(parsedUrl.toString());
      // ✅ Check content type - Block only TIFF files, allow all others
      const contentType = response.headers.get("content-type") || "";
      const contentTypeLower = contentType.toLowerCase();

      // ✅ Block TIFF files explicitly
      if (
        contentTypeLower.includes("tiff") ||
        contentTypeLower.includes("tif")
      ) {
        throw new AppError("TIFF files are not allowed", {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "TIFF_NOT_ALLOWED",
        });
      }

      // ✅ Check content length header
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        if (isNaN(size) || size > maxSize) {
          throw new AppError(
            `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
            {
              statusCode: HttpStatus.BAD_REQUEST,
              code: "FILE_TOO_LARGE",
            }
          );
        }
      }
      if (!response.ok)
        throw new Error(`Failed to download file: ${response.statusText}`);
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // Upload buffer to Strapi
    async function uploadToStrapi(fileBuffer: Buffer, filename: string) {
      const form = new FormData();
      form.append("files", fileBuffer, {
        filename,
        contentType: "application/octet-stream",
      });
      form.append(
        "fileInfo",
        JSON.stringify({
          name: filename,
          alternativeText: filename,
          caption: "Automatic upload",
        })
      );

      const response = await axios.post(`${env.STRAPI_API_URL}/upload`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${env.STRAPI_API_TOKEN}`, // ✅ Use env variable
        },
        maxBodyLength: Infinity,
      });

      return response.data;
    }

    const fileBuffer = await downloadFile(fileUrl);
    const result = await uploadToStrapi(fileBuffer, filename);
    res.send(result);
  }

  async uploadFilesS3(req: Request, res: Response) {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const directory = (req.body?.directory as string) || "kyc";
    const sanitizedName = (file.originalname || "file").replace(/[^a-zA-Z0-9.-]/g, "_");
    const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}-${sanitizedName}`);
    try {
      fs.writeFileSync(tempPath, file.buffer);
      const result = await putFileS3(tempPath, directory);
      if (!result.success || !result.location) {
        return res.status(500).json({ message: "Upload failed", success: false });
      }
      return res.status(200).json({
        success: true,
        responseData: { location: result.location, key: result.key },
      });
    } finally {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
