import { db } from "@core/database/database";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";

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
}
