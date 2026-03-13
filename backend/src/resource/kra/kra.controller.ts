import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { addKraWorkerJob } from "@jobs/kra_worker/kraWroker.helper";
import { cacheStorage } from "@store/redis_store";

const RUNNER_KEY_PREFIX = "KRA:";
const RUNNER_KEY_SUFFIX = "-RUNNER";

export class KraController {
  /**
   * POST /api/kra/reschedule-kra
   * Re-queues the KRA worker job for the given customer/KYC.
   * Returns 409 if a KRA process is already in progress (RUNNER key exists).
   */
  async rescheduleKra(req: Request, res: Response) {
    const customerId = Number(req.body?.customerId);
    const kycDataStoreId = Number(req.body?.kycDataStoreId);
    const delayMs = req.body?.delayMs != null ? Number(req.body.delayMs) : 5000;

    if (!Number.isFinite(customerId) || !Number.isFinite(kycDataStoreId)) {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "customerId and kycDataStoreId are required and must be valid numbers",
      });
    }

    const runnerCachedKey = `${RUNNER_KEY_PREFIX}${customerId}-${kycDataStoreId}${RUNNER_KEY_SUFFIX}`;
    const runner = await cacheStorage.get<string>(runnerCachedKey);
    if (runner) {
      return res.sendResponse({
        statusCode: HttpStatus.CONFLICT,
        message: "KRA process already in progress for this customer and KYC. Cannot reschedule until the current process completes or times out (72 hours).",
      });
    }

    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Customer not found",
      });
    }

    const kycFlow = await db.dataBase.kYC_FLOW.findFirst({
      where: { id: kycDataStoreId, userID: customerId },
    });
    if (!kycFlow) {
      return res.sendResponse({
        statusCode: HttpStatus.NOT_FOUND,
        message: "KYC flow record not found for this customer",
      });
    }

    if (customer.kycStatus === "VERIFIED") {
      return res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Cannot reschedule KRA: customer KYC is already VERIFIED",
      });
    }

    const job = await addKraWorkerJob(
      {
        customerId,
        kycDataStoreId,
        stage: "ENQUIRY_KRA",
      },
      delayMs
    );

    return res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "KRA process rescheduled",
      responseData: { jobId: job.id },
    });
  }
}
