import type { Request, Response } from "express";
import { z } from "zod";
import { HttpStatus } from "@utils/error/AppError";
import { AppError } from "@utils/error/AppError";
import { BondLogoService } from "./bond_logo.service";

export class BondLogoController {
  private service = new BondLogoService();

  get = async (req: Request, res: Response) => {
    try {
      const isin = req.params.isin?.trim() ?? "";
      if (!isin) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing ISIN",
        });
      }

      const bond = await this.service.get(isin);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: { logoUrl: bond.logoUrl },
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
      }
      throw err;
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const isin = req.params.isin?.trim() ?? "";
      if (!isin) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing ISIN",
        });
      }

      const body = z
        .object({
          logoUrl: z.string().trim().min(1, "Logo URL is required"),
        })
        .parse(req.body);

      const bond = await this.service.update(isin, body.logoUrl);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Bond logo updated",
        responseData: { logoUrl: bond.logoUrl },
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
      }
      throw err;
    }
  };

  remove = async (req: Request, res: Response) => {
    try {
      const isin = req.params.isin?.trim() ?? "";
      if (!isin) {
        return res.sendResponse({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          message: "Missing ISIN",
        });
      }

      await this.service.remove(isin);
      return res.sendResponse({
        statusCode: HttpStatus.OK,
        message: "Bond logo removed",
        responseData: { logoUrl: null },
      });
    } catch (err) {
      if (err instanceof AppError) {
        return res.sendResponse({
          statusCode: err.statusCode,
          success: false,
          message: err.message,
        });
      }
      throw err;
    }
  };
}
