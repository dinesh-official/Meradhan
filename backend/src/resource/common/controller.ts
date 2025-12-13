/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import axios from "axios";
import type { Request, Response } from "express";
import FormData from "form-data";

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

  async uploadStrapi(req: Request, res: Response) {
    const { fileUrl, filename } = req.body;
    // Download file from URL
    async function downloadFile(url: string): Promise<Buffer> {
      const response = await fetch(url);
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

      const response = await axios.post(
        `https://spyder.meradhan.co/api/upload`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer 9538e12d9a8ae051b257511fae5af06aad2a7b91e9d6bfac4d70eee547fafcfe91d5d9575b07e51c7d1b8c4227869a3bcc78e12cb1116441aa3bdd06d5fcd4ef3457dbc4ee6ea2a5f78eaaeb7663b42ff2ac334fa704abd3987bdab8ace815c2d3d37f64f83705838d7882e7c015421d08b779967ced6da398ef933aa6885c6d`,
          },
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    }

    const fileBuffer = await downloadFile(fileUrl);
    const result = await uploadToStrapi(fileBuffer, filename);
    res.send(result);
  }
}
