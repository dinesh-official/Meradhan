/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request, Response } from "express";
import { BondService, parseHomepageBondLimit } from "./bond.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { appSchema } from "@root/schema";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { getBondDealAutofill, parseCalcFormattedDecimal } from "./bond_clac";
import { getBondInfoCalcData } from "./fill-bonds-auto";
import { buildLocalManualProviderAutofillResponse } from "@services/order/order-pricing-helper";
import { BondCashflowService } from "./bond_cashflow.service";
import { BondDocumentsService } from "@resource/crm/bonds/bond_documents.service";
import logger from "@utils/logger/logger";
import e from "express";
import { isAxiosError } from "axios";

export class BondController {
  private bondService = new BondService();
  private bondCashflowService = new BondCashflowService();
  private bondDocumentsService = new BondDocumentsService();

  async listBondDocuments(req: Request, res: Response) {
    const isin = req.params.isin?.toString().trim() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    try {
      const canDownload = Boolean(req.customer?.id);
      const documents = await this.bondDocumentsService.list(isin);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: {
          documents: documents.map((doc) => ({
            id: doc.id,
            isin: doc.isin,
            name: doc.name,
            fileName: doc.fileName,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            canDownload,
            fileUrl: canDownload ? doc.fileUrl : null,
          })),
        },
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
      }
      logger.logError("listBondDocuments failed", err);
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to load bond documents",
      });
    }
  }

  async getBondCashflow(req: Request, res: Response) {
    const isin = req.params.isin?.toString() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    const quantity = req.query.quantity
      ? Math.max(1, Number(req.query.quantity))
      : 1;
    const settlementDate =
      typeof req.query.settlementDate === "string"
        ? req.query.settlementDate
        : undefined;
    const pricingYieldRaw = req.query.pricingYield ?? req.query.yield;
    const pricingYield =
      pricingYieldRaw != null && pricingYieldRaw !== ""
        ? Number(pricingYieldRaw)
        : undefined;

    try {
      const data = await this.bondCashflowService.getBondCashflow(isin, {
        quantity: Number.isFinite(quantity) ? quantity : 1,
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
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
      }
      logger.logError("getBondCashflow failed", err);
      return res.sendResponse({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Failed to load bond cashflow",
      });
    }
  }

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
   * GET query: quantity, settlementDate, pricingYield, providerPrice, providerQuantity, providerInterestDate, automatedSettlement.
   * POST JSON body: same fields — preferred when sending custom yield or unsaved provider values.
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

    const readNum = (raw: unknown): number | undefined => {
      if (raw == null || String(raw).trim() === "") return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };

    const readStr = (raw: unknown): string | undefined => {
      if (raw == null) return undefined;
      const s = String(raw).trim();
      return s ? s : undefined;
    };

    const readBool = (raw: unknown): boolean | undefined => {
      if (raw == null || String(raw).trim() === "") return undefined;
      const s = String(raw).trim().toLowerCase();
      if (s === "true" || s === "1" || s === "yes") return true;
      if (s === "false" || s === "0" || s === "no") return false;
      return undefined;
    };

    let quantity = 1;
    let settlementDate: string | undefined;
    let pricingYield: number | undefined;
    let providerPrice: number | undefined;
    let providerQuantity: number | undefined;
    let providerInterestDate: string | undefined;
    let automatedSettlement: boolean | undefined;
    let useLocalCalc: boolean | undefined;

    if (fromBody) {
      const b = req.body as Record<string, unknown>;
      const q = readNum(b.quantity);
      quantity = q != null && q > 0 ? q : 1;
      settlementDate = readStr(b.settlementDate);
      pricingYield = readNum(b.pricingYield);
      providerPrice = readNum(b.providerPrice);
      providerQuantity = readNum(b.providerQuantity);
      providerInterestDate = readStr(b.providerInterestDate);
      automatedSettlement = readBool(b.automatedSettlement);
      useLocalCalc = readBool(b.useLocalCalc);
    } else {
      const q = req.query.quantity ? Number(req.query.quantity) : 1;
      quantity = Number.isFinite(q) && q > 0 ? q : 1;
      settlementDate = readStr(req.query.settlementDate);
      pricingYield = readNum(req.query.pricingYield);
      providerPrice = readNum(req.query.providerPrice);
      providerQuantity = readNum(req.query.providerQuantity);
      providerInterestDate = readStr(req.query.providerInterestDate);
      automatedSettlement = readBool(req.query.automatedSettlement);
      useLocalCalc = readBool(req.query.useLocalCalc);
    }

    try {
      if (useLocalCalc) {
        if (providerPrice == null || !Number.isFinite(providerPrice) || providerPrice <= 0) {
          return res.sendResponse({
            statusCode: HttpStatus.BAD_REQUEST,
            success: false,
            message: "Provider price is required for local manual calc",
          });
        }
        const qty =
          providerQuantity != null && providerQuantity > 0
            ? providerQuantity
            : quantity;
        const localRes = await buildLocalManualProviderAutofillResponse(isin, {
          quantity: qty,
          providerPrice,
          providerQuantity,
        });
        return res.sendResponse({
          statusCode: HttpStatus.OK,
          responseData: localRes,
        });
      }

      const calcRes = await getBondInfoCalcData(isin, {
        quantity,
        settlementDate,
        pricingYield,
        providerPrice,
        providerQuantity,
        providerInterestDate,
        automatedSettlement,
      });

      const suggested = calcRes.suggested;
      const calc = calcRes.calc;
      const finalPrice =
        parseCalcFormattedDecimal(calc.final_price) ??
        (suggested.sellPrice != null && Number(suggested.sellPrice)
          ? suggested.sellPrice
          : null);

      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: {
          isin,
          quantity: calcRes.payload.Quantity
            ? Number(calcRes.payload.Quantity)
            : quantity,
          sources: {
            usedReferenceMetadata: true,
            usedCouponSchedule: true,
            yieldSource:
              pricingYield != null && Number.isFinite(pricingYield)
                ? "override"
                : "bonds",
            usedProviderPrice: calcRes.inputSources.usedProviderPrice,
            usedProviderQuantity: calcRes.inputSources.usedProviderQuantity,
            usedProviderSettlementDate:
              calcRes.inputSources.usedProviderSettlementDate,
          },
          suggested,
          pricing: {
            finalPrice,
            finalYieldRaw:
              calc.final_yield_raw ??
              (suggested.yield != null && Number(suggested.yield)
                ? suggested.yield
                : 0),
            settlementAmount: parseCalcFormattedDecimal(calc.settlement_amount),
            totalAccruedInterest: parseCalcFormattedDecimal(calc.total_ai),
            principalAmount: parseCalcFormattedDecimal(calc.principal_amount),
            totalConsideration: parseCalcFormattedDecimal(
              calc.total_consideration,
            ),
            calc,
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
