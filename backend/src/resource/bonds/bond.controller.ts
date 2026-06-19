/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import { BondService, parseHomepageBondLimit } from "./bond.service";
import { HttpStatus } from "@utils/error/AppError";
import { appSchema } from "@root/schema";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { getBondDealAutofill } from "./bond_clac";
import { getBondInfoCalcData } from "./fill-bonds-auto";
import logger from "@utils/logger/logger";
import e from "express";
import { isAxiosError } from "axios";

export class BondController {
  private bondService = new BondService();

  async getBondDetails(req: Request, res: Response) {
    const isin = req.params.isin!.toString();
    const data = await this.bondService.getBondDetails(isin);
    if (!data) {
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: null,
      });
    }
    const [enriched] = await this.bondService.enrichBondsWithCrmInventory([data]);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: enriched,
    });
  }

  async getBondOrderPricing(req: Request, res: Response) {
    const isin = req.params.isin!.toString();
    const quantity = req.query.quantity ? Number(req.query.quantity) : 1;
    const settlementTypeRaw = req.query.settlementType?.toString();
    const settlementType =
      settlementTypeRaw === "T+0" || settlementTypeRaw === "T+1"
        ? (settlementTypeRaw as "T+0" | "T+1")
        : undefined;
    const result = await this.bondService.getBondOrderPricing(isin, quantity, settlementType);

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

  /**
   * CRM: suggested bond fields + sale price from calc service, using DB + margin/yield logic in `bond_clac`.
   * GET query: quantity, settlementDate (YYYY-MM-DD), pricingYield (optional; legacy).
   * POST JSON body: { quantity?, settlementDate?, pricingYield? } — preferred for custom pricing yield (no query params).
   */
  async getBondDealAutofill(req: Request, res: Response) {
    const isin = req.params.isin?.toString() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }
    const fromBody =
      req.method === "POST" &&
      req.body != null &&
      typeof req.body === "object" &&
      !Array.isArray(req.body);

    let quantity = 1;
    let settlementDate: string | undefined;
    let pricingYield: number | undefined;

    if (fromBody) {
      const b = req.body as Record<string, unknown>;
      const qRaw = b.quantity;
      const q = qRaw != null && String(qRaw).trim() !== "" ? Number(qRaw) : 1;
      quantity = Number.isFinite(q) && q > 0 ? q : 1;
      const sd = b.settlementDate;
      settlementDate =
        sd != null && String(sd).trim() !== "" ? String(sd) : undefined;
      const pyRaw = b.pricingYield;
      if (pyRaw != null && String(pyRaw).trim() !== "") {
        const n = Number(pyRaw);
        pricingYield = Number.isFinite(n) ? n : undefined;
      }
    } else {
      const q = req.query.quantity ? Number(req.query.quantity) : 1;
      quantity = Number.isFinite(q) && q > 0 ? q : 1;
      settlementDate = req.query.settlementDate?.toString();
      const pyRaw = req.query.pricingYield;
      pricingYield =
        pyRaw != null && String(pyRaw).trim() !== ""
          ? Number(pyRaw)
          : undefined;
      pricingYield =
        pricingYield != null && Number.isFinite(pricingYield)
          ? pricingYield
          : undefined;
    }

    try {
      const data = await getBondDealAutofill({
        isin,
        quantity,
        settlementDate,
        pricingYield:
          pricingYield != null && Number.isFinite(pricingYield)
            ? pricingYield
            : undefined,
      });
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: data,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to build deal autofill";
      if (msg.includes("not found")) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          success: false,
          message: msg,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: msg,
      });
    }
  }

  /**
   * CRM bond auto-update (sale-ready): simpler calc-based autofill.
   * Uses `getBondInfoCalcData` and returns a `BondDealAutofillResponse`-compatible payload.
   *
   * GET query: quantity, pricingYield (optional).
   * POST JSON body: { quantity?, pricingYield? } — preferred when sending custom yield.
   */
  async getBondDealAutofillCalc(req: Request, res: Response) {
    const isin = req.params.isin?.toString() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    const fromBody =
      req.method === "POST" &&
      req.body != null &&
      typeof req.body === "object" &&
      !Array.isArray(req.body);

    let quantity = 1;
    let pricingYield: number | undefined;

    if (fromBody) {
      const b = req.body as Record<string, unknown>;
      const qRaw = b.quantity;
      const q = qRaw != null && String(qRaw).trim() !== "" ? Number(qRaw) : 1;
      quantity = Number.isFinite(q) && q > 0 ? q : 1;
      const pyRaw = b.pricingYield;
      if (pyRaw != null && String(pyRaw).trim() !== "") {
        const n = Number(pyRaw);
        pricingYield = Number.isFinite(n) ? n : undefined;
      }
    } else {
      const q = req.query.quantity ? Number(req.query.quantity) : 1;
      quantity = Number.isFinite(q) && q > 0 ? q : 1;
      const pyRaw = req.query.pricingYield;
      pricingYield =
        pyRaw != null && String(pyRaw).trim() !== ""
          ? Number(pyRaw)
          : undefined;
      pricingYield =
        pricingYield != null && Number.isFinite(pricingYield)
          ? pricingYield
          : undefined;
    }

    try {
      const calcRes = await getBondInfoCalcData(isin, {
        yeild:
          pricingYield != null && Number.isFinite(pricingYield)
            ? String(pricingYield)
            : undefined,
      });

      const suggested = calcRes.suggested;

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: {
          isin,
          quantity,
          sources: {
            usedReferenceMetadata: true,
            usedCouponSchedule: true,
            yieldSource: pricingYield != null && Number.isFinite(pricingYield) ? "override" : "bonds",
          },
          suggested,
          pricing: {
            finalPrice: suggested.sellPrice != null && Number(suggested.sellPrice) ? suggested.sellPrice : null,
            finalYieldRaw: suggested.yield != null && Number(suggested.yield) ? suggested.yield : 0,
            settlementAmount: null,
            totalAccruedInterest: null,
            principalAmount: null,
            totalConsideration: null,
            calc: calcRes.calc,
          },
          margin: {},
        },
      });
    } catch (err: unknown) {

      const msg =
        err instanceof Error ? err.message : "Failed to build calc autofill";
      if (isAxiosError(err)) {
        if (err.response?.data.error) {
          return res.sendResponse({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: err.response?.data.error,
          });
        }
      }
      if (msg.includes("not found")) {
        return res.sendResponse({
          statusCode: HttpStatus.NOT_FOUND,
          success: false,
          message: msg,
        });
      }
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: msg,
      });
    }
  }

  async filterListedBonds(req: Request, res: Response) {
    const filters = appSchema.bonds.bondsFilterSchema.parse(req.body);

    const data = await this.bondService.filterBonds(filters, req.query);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  // [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
  async getBondFilterOptions(req: Request, res: Response) {
    const category = req.query.category?.toString();
    const data = await this.bondService.getAvailableFilterOptions(category);
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

  async getHomepageBonds(req: Request, res: Response) {
    const limit = parseHomepageBondLimit(req.query.limit ?? req.query.count, 40);
    const data = await this.bondService.getHomepageBonds(limit);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async getLatestListedBonds(req: Request, res: Response) {
    const limit = parseHomepageBondLimit(req.query.limit ?? req.query.count);
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

  async getHighYieldListedBonds(req: Request, res: Response) {
    const limit = parseHomepageBondLimit(req.query.limit ?? req.query.count);
    const data = await this.bondService.getHighYieldBonds(limit);
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async getZeroCouponListedBonds(req: Request, res: Response) {
    const limit = parseHomepageBondLimit(req.query.limit ?? req.query.count);
    const data = await this.bondService.getZeroCouponBonds(limit);
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

      // Read the autofill-save flag from raw body BEFORE Zod strips unknown keys.
      // The underscore prefix signals this is a meta-flag, not a bond field.
      const autofillSave =
        typeof req.body === "object" &&
        req.body !== null &&
        (req.body as Record<string, unknown>)._autofillSave === true;

      const bondData = appSchema.bonds.bondCreateUpdateSchema.parse(req.body);

      // Get existing bond data for comparison in activity log
      const existingBond = await this.bondService.getBondDetails(isin);

      const data = await this.bondService.updateBond(isin, bondData, { autofillSave });

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
