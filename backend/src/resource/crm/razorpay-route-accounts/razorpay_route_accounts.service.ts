import { db } from "@core/database/database";
import { env } from "@root/config/env";
import axios from "axios";
import { AppError, HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";
import { RazorpayRouteAccountsRepo } from "./razorpay_route_accounts.repo";

export type CreateRazorpayLinkedAccountInput = {
  email: string;
  phone: string;
  reference_id?: string;
  legal_business_name: string;
  business_type: string;
  contact_name: string;
  isDefault?: boolean;
  profile: {
    category: string;
    subcategory: string;
    addresses: {
      registered: {
        street1?: string;
        street2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  };
  legal_info: {
    pan?: string;
    gst?: string;
  };
};

type RazorpayCreateAccountResponse = {
  id: string;
  type: "route";
  status: string;
  email: string;
  phone: string;
  contact_name: string;
  reference_id?: string;
  business_type?: string;
  legal_business_name?: string;
  customer_facing_business_name?: string;
  created_at?: number;
  profile?: unknown;
  legal_info?: unknown;
  notes?: unknown;
  apps?: unknown;
  brand?: unknown;
  contact_info?: {
    support?: {
      email?: string;
      phone?: string | null;
      policy_url?: string | null;
    };
    refund?: {
      email?: string;
      phone?: string | null;
      policy_url?: string | null;
    };
    chargeback?: {
      email?: string;
      phone?: string | null;
      policy_url?: string | null;
    };
  };
};

export class RazorpayRouteAccountsService {
  async getAll() {
    return RazorpayRouteAccountsRepo.findMany();
  }

  async getByRazorpayAccountId(razorpayAccountId: string) {
    return RazorpayRouteAccountsRepo.findByRazorpayAccountId(razorpayAccountId);
  }

  async createLinkedAccount(input: CreateRazorpayLinkedAccountInput) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay credentials not configured", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "RAZORPAY_CONFIG_ERROR",
      });
    }

    // `isDefault` is CRM-only (DB flag) and must NOT be sent to Razorpay.
    const { isDefault: _isDefault, ...razorpayInput } = input;
    const payload = {
      ...razorpayInput,
      type: "route" as const,
    };

    const authHeader = Buffer.from(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    let created: RazorpayCreateAccountResponse;
    try {
      const { data } = await axios.post<RazorpayCreateAccountResponse>(
        "https://api.razorpay.com/v2/accounts",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          timeout: 60_000,
        }
      );
      created = data;
    } catch (err) {
      logger.logError("Razorpay linked account create failed", err);
      throw err;
    }

    const makeDefault = !!_isDefault;
    const record = await db.dataBase.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.razorpayRouteAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.razorpayRouteAccount.upsert({
        where: { razorpayAccountId: created.id },
        update: { data: created as unknown as object, ...(makeDefault ? { isDefault: true } : {}) },
        create: {
          razorpayAccountId: created.id,
          data: created as unknown as object,
          isDefault: makeDefault,
        },
      });
    });

    return { record, razorpay: created };
  }

  async createLinkedAccountDbOnly(input: CreateRazorpayLinkedAccountInput & { razorpayAccountId: string }) {
    const makeDefault = !!input.isDefault;
    const record = await db.dataBase.$transaction(async (tx) => {
      if (makeDefault) {
        await tx.razorpayRouteAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.razorpayRouteAccount.upsert({
        where: { razorpayAccountId: input.razorpayAccountId },
        update: {
          data: input as unknown as object,
          ...(typeof input.isDefault === "boolean" ? { isDefault: input.isDefault } : {}),
        },
        create: {
          razorpayAccountId: input.razorpayAccountId,
          data: input as unknown as object,
          isDefault: makeDefault,
        },
      });
    });
    return { record, razorpay: null as unknown };
  }

  async updateLinkedAccount(
    razorpayAccountId: string,
    payload: {
      legal_business_name: string;
      contact_name: string;
      isDefault?: boolean;
      profile: {
        category: string;
        subcategory: string;
        addresses: {
          registered: {
            street1?: string;
            street2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
          };
        };
      };
      legal_info: { pan?: string; gst?: string };
    }
  ) {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay credentials not configured", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "RAZORPAY_CONFIG_ERROR",
      });
    }

    const authHeader = Buffer.from(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");

    // Razorpay PATCH /v2/accounts/:id rejects extra fields like email/type/reference_id/business_type.
    // Hard whitelist allowed payload keys before sending upstream.
    const requestBody = {
      legal_business_name: payload.legal_business_name,
      contact_name: payload.contact_name,
      profile: payload.profile,
      legal_info: payload.legal_info,
    };

    let updated: RazorpayCreateAccountResponse;
    try {
      const { data } = await axios.patch<RazorpayCreateAccountResponse>(
        `https://api.razorpay.com/v2/accounts/${encodeURIComponent(razorpayAccountId)}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${authHeader}`,
          },
          timeout: 60_000,
        }
      );
      updated = data;
    } catch (err) {
      logger.logError("Razorpay linked account update failed", err);
      throw err;
    }

    const makeDefault = payload.isDefault;
    const record = await db.dataBase.$transaction(async (tx) => {
      if (makeDefault === true) {
        await tx.razorpayRouteAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.razorpayRouteAccount.upsert({
        where: { razorpayAccountId },
        update: {
          data: updated as unknown as object,
          ...(typeof makeDefault === "boolean" ? { isDefault: makeDefault } : {}),
        },
        create: {
          razorpayAccountId,
          data: updated as unknown as object,
          isDefault: makeDefault ?? false,
        },
      });
    });

    return { record, razorpay: updated };
  }

  async updateLinkedAccountDbOnly(
    razorpayAccountId: string,
    payload: {
      legal_business_name: string;
      contact_name: string;
      isDefault?: boolean;
      profile: {
        category: string;
        subcategory: string;
        addresses: {
          registered: {
            street1?: string;
            street2?: string;
            city?: string;
            state?: string;
            postal_code?: string;
            country?: string;
          };
        };
      };
      legal_info: { pan?: string; gst?: string };
    }
  ) {
    const makeDefault = payload.isDefault;
    const record = await db.dataBase.$transaction(async (tx) => {
      if (makeDefault === true) {
        await tx.razorpayRouteAccount.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      return tx.razorpayRouteAccount.upsert({
        where: { razorpayAccountId },
        update: {
          data: payload as unknown as object,
          ...(typeof makeDefault === "boolean" ? { isDefault: makeDefault } : {}),
        },
        create: {
          razorpayAccountId,
          data: payload as unknown as object,
          isDefault: makeDefault ?? false,
        },
      });
    });
    return { record, razorpay: null as unknown };
  }
}

