import type { Request, Response } from "express";
import { isAxiosError } from "axios";
import { HttpStatus } from "@utils/error/AppError";
import { BondAutoUpdateAutofillService } from "./bond_auto_update_autofill.service";

export class BondAutoUpdateAutofillController {
  private service = new BondAutoUpdateAutofillService();

  async autofill(req: Request, res: Response) {
    const isin = req.params.isin?.toString().trim() ?? "";
    if (!isin) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: "Missing ISIN",
      });
    }

    const body =
      req.body != null && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : {};

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

    const quantity = readNum(body.quantity);
    const settlementDate = readStr(body.settlementDate);
    const pricingYield = readNum(body.pricingYield);
    const cleanPrice = readNum(body.cleanPrice);
    const pricingModeRaw = readStr(body.pricingMode);
    const pricingMode =
      pricingModeRaw === "cleanPrice" ? "cleanPrice" : "ytm";

    try {
      const data = await this.service.buildAutofill(isin, {
        quantity: quantity != null && quantity > 0 ? quantity : 1,
        settlementDate,
        pricingYield,
        cleanPrice,
        pricingMode,
      });
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: data,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to build auto-update autofill";
      if (isAxiosError(err) && err.response?.data?.error) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: String(err.response.data.error),
        });
      }
      if (msg.toLowerCase().includes("not found")) {
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
}
