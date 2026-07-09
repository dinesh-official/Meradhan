import { db } from "@core/database/database";
import { env } from "@packages/config/src/env";
import axios from "axios";
import { AppError, HttpStatus } from "@utils/error/AppError";
import logger from "@utils/logger/logger";

export type CreateRazorpayStakeholderInput = {
  name: string;
  email: string;
  userId?: number;
  addresses: {
    residential: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  kyc: { pan: string };
  notes?: Record<string, string>;
};

type RazorpayStakeholderResponse = {
  id: string; // sth_...
  entity: string;
  relationship?: unknown;
  phone?: unknown;
  notes?: unknown;
  kyc?: { pan?: string } | unknown;
  name?: string;
  email?: string;
  addresses?: unknown;
  percentage_ownership?: number;
};

export class RazorpayRouteStakeholdersService {
  async listByAccount(razorpayAccountId: string) {
    return db.dataBase.razorpayRouteStakeholder.findMany({
      where: { razorpayAccountId },
      orderBy: { createdAt: "desc" },
    });
  }

  async createStakeholder(
    razorpayAccountId: string,
    input: CreateRazorpayStakeholderInput
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

    let created: RazorpayStakeholderResponse;
    try {
      const { data } = await axios.post<RazorpayStakeholderResponse>(
        `https://api.razorpay.com/v2/accounts/${encodeURIComponent(razorpayAccountId)}/stakeholders`,
        input,
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
      logger.logError("Razorpay stakeholder create failed", err);
      throw err;
    }

    const kycPan =
      created &&
      typeof created === "object" &&
      "kyc" in created &&
      created.kyc &&
      typeof created.kyc === "object" &&
      "pan" in (created.kyc as Record<string, unknown>) &&
      typeof (created.kyc as Record<string, unknown>).pan === "string"
        ? ((created.kyc as Record<string, unknown>).pan as string)
        : undefined;

    const record = await db.dataBase.razorpayRouteStakeholder.upsert({
      where: { razorpayStakeholderId: created.id },
      update: {
        razorpayAccountId,
        userId: typeof input.userId === "number" ? input.userId : null,
        entity: created.entity ?? "stakeholder",
        name: created.name ?? input.name,
        email: created.email ?? input.email,
        kycPan,
        percentageOwnership:
          typeof created.percentage_ownership === "number"
            ? Math.trunc(created.percentage_ownership)
            : null,
        relationship: (created.relationship ?? null) as unknown as object,
        phone: (created.phone ?? null) as unknown as object,
        notes: (created.notes ?? null) as unknown as object,
        kyc: (created.kyc ?? null) as unknown as object,
        addresses: (created.addresses ?? input.addresses) as unknown as object,
        data: created as unknown as object,
      },
      create: {
        razorpayStakeholderId: created.id,
        razorpayAccountId,
        userId: typeof input.userId === "number" ? input.userId : null,
        entity: created.entity ?? "stakeholder",
        name: created.name ?? input.name,
        email: created.email ?? input.email,
        kycPan,
        percentageOwnership:
          typeof created.percentage_ownership === "number"
            ? Math.trunc(created.percentage_ownership)
            : null,
        relationship: (created.relationship ?? null) as unknown as object,
        phone: (created.phone ?? null) as unknown as object,
        notes: (created.notes ?? null) as unknown as object,
        kyc: (created.kyc ?? null) as unknown as object,
        addresses: (created.addresses ?? input.addresses) as unknown as object,
        data: created as unknown as object,
      },
    });

    return { record, razorpay: created };
  }

  async updateStakeholder(
    razorpayAccountId: string,
    razorpayStakeholderId: string,
    payload: {
      userId?: number;
      addresses: {
        residential: {
          street: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
        };
      };
      kyc: { pan: string };
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

    // Hard whitelist payload keys for Razorpay PATCH.
    const requestBody = {
      addresses: payload.addresses,
      kyc: payload.kyc,
    };

    let updated: RazorpayStakeholderResponse;
    try {
      const { data } = await axios.patch<RazorpayStakeholderResponse>(
        `https://api.razorpay.com/v2/accounts/${encodeURIComponent(razorpayAccountId)}/stakeholders/${encodeURIComponent(razorpayStakeholderId)}`,
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
      logger.logError("Razorpay stakeholder update failed", err);
      throw err;
    }

    const kycPan =
      updated &&
      typeof updated === "object" &&
      "kyc" in updated &&
      updated.kyc &&
      typeof updated.kyc === "object" &&
      "pan" in (updated.kyc as Record<string, unknown>) &&
      typeof (updated.kyc as Record<string, unknown>).pan === "string"
        ? ((updated.kyc as Record<string, unknown>).pan as string)
        : undefined;

    const record = await db.dataBase.razorpayRouteStakeholder.upsert({
      where: { razorpayStakeholderId },
      update: {
        razorpayAccountId,
        ...(typeof payload.userId === "number" ? { userId: payload.userId } : {}),
        entity: updated.entity ?? "stakeholder",
        name: updated.name ?? "",
        email: updated.email ?? null,
        kycPan,
        percentageOwnership:
          typeof updated.percentage_ownership === "number"
            ? Math.trunc(updated.percentage_ownership)
            : null,
        relationship: (updated.relationship ?? null) as unknown as object,
        phone: (updated.phone ?? null) as unknown as object,
        notes: (updated.notes ?? null) as unknown as object,
        kyc: (updated.kyc ?? null) as unknown as object,
        addresses: (updated.addresses ?? payload.addresses) as unknown as object,
        data: updated as unknown as object,
      },
      create: {
        razorpayStakeholderId,
        razorpayAccountId,
        userId: typeof payload.userId === "number" ? payload.userId : null,
        entity: updated.entity ?? "stakeholder",
        name: updated.name ?? "",
        email: updated.email ?? null,
        kycPan,
        percentageOwnership:
          typeof updated.percentage_ownership === "number"
            ? Math.trunc(updated.percentage_ownership)
            : null,
        relationship: (updated.relationship ?? null) as unknown as object,
        phone: (updated.phone ?? null) as unknown as object,
        notes: (updated.notes ?? null) as unknown as object,
        kyc: (updated.kyc ?? null) as unknown as object,
        addresses: (updated.addresses ?? payload.addresses) as unknown as object,
        data: updated as unknown as object,
      },
    });

    return { record, razorpay: updated };
  }
}

