/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import { BondService } from "./bond.service";
import { HttpStatus } from "@utils/error/AppError";
import { appSchema } from "@root/schema";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class BondController {
  private bondService = new BondService();

  async getBondDetails(req: Request, res: Response) {
    const isin = req.params.isin!.toString();
    const data = await this.bondService.getBondDetails(isin);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async getBondOrderPricing(req: Request, res: Response) {
    const isin = req.params.isin!.toString();
    const quantity = req.query.quantity ? Number(req.query.quantity) : 1;
    const result = await this.bondService.getBondOrderPricing(isin, quantity);

    if (!result.ok) {
      if (result.reason === "not_found") {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: "Bond not found",
          success: false,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message:
          "Bond is missing lastCouponDate or nextCouponDate required for order pricing",
        success: false,
      });
    }

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: result.pricing,
    });
  }

  async filterListedBonds(req: Request, res: Response) {
    const filters = appSchema.bonds.bondsFilterSchema.parse(req.body);

    const data = await this.bondService.filterBonds(filters, req.query);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async autocompleteBondSearch(req: Request, res: Response) {
    const query = req.query.q as string;
    const data = await this.bondService.autocompleteBondSearch(query);
    return res.send(data);
  }

  async getLatestListedBonds(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
    const data = await this.bondService.getLatestBonds(limit);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async getUpcomingListedBonds(req: Request, res: Response) {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 6;
    const data = await this.bondService.getUpcomingBonds(limit);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async createBond(req: Request, res: Response) {
    try {
      const bondData = appSchema.bonds.bondCreateUpdateSchema.parse(req.body);
      const data = await this.bondService.createBond(bondData);

      // Create CRM activity log
      const userId = Number(req.session?.id);
      if (userId) {
        await createCrmActivityLog(req, {
          userId,
          action: "CREATE_BOND",
          entityType: "Bond",
          entityId: data.isin,
          details: {
            isin: data.isin,
            bondName: data.bondName,
            instrumentName: data.instrumentName,
            issuePrice: data.issuePrice,
            faceValue: data.faceValue,
            couponRate: data.couponRate,
            creditRating: data.creditRating,
            taxStatus: data.taxStatus,
            isListed: data.isListed,
          },
        });
      }

      return res.sendResponse({
        statusCode: HttpStatus.CREATED,
        message: "Bond created successfully",
        responseData: data,
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        // Prisma unique constraint violation
        return res.sendResponse({
          statusCode: HttpStatus.CONFLICT,
          message: "Bond with this ISIN already exists",
          success: false,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || "Failed to create bond",
        success: false,
      });
    }
  }

  async updateBond(req: Request, res: Response) {
    try {
      const isin = req.params.isin!.toString();
      const bondData = appSchema.bonds.bondCreateUpdateSchema.parse(req.body);

      // Get existing bond data for comparison in activity log
      const existingBond = await this.bondService.getBondDetails(isin);

      const data = await this.bondService.updateBond(isin, bondData);

      // Create CRM activity log
      const userId = Number(req.session?.id);
      if (userId) {
        // Identify changed fields
        const changes: Record<string, { old: any; new: any }> = {};
        if (existingBond) {
          const fieldsToTrack = [
            "bondName",
            "instrumentName",
            "description",
            "issuePrice",
            "faceValue",
            "couponRate",
            "creditRating",
            "taxStatus",
            "isListed",
            "interestPaymentMode",
            "sectorName",
          ];

          fieldsToTrack.forEach((field) => {
            const oldValue = (existingBond as any)[field];
            const newValue = (bondData as any)[field];
            if (oldValue !== newValue) {
              changes[field] = { old: oldValue, new: newValue };
            }
          });
        }

        await createCrmActivityLog(req, {
          userId,
          action: "UPDATE_BOND",
          entityType: "Bond",
          entityId: isin,
          details: {
            isin,
            bondName: data.bondName,
            changes: Object.keys(changes).length > 0 ? changes : undefined,
            updatedFields: Object.keys(changes),
          },
        });
      }

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Bond updated successfully",
        responseData: data,
      });
    } catch (error: any) {
      if (error.message?.includes("not found")) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          message: error.message,
          success: false,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || "Failed to update bond",
        success: false,
      });
    }
  }

  async getOngoingDeals(req: Request, res: Response) {
    const data = await this.bondService.getOngoingDeals();
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
  async placeOrder(req: Request, res: Response) {
    const orderData = appSchema.bonds.orderPlaceSchema.parse(req.body);
    const data = await this.bondService.placeOrder(orderData);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
