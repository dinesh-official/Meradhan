import { db } from "@core/database/database";
import { kraStatusFromCbricsWorkflowStatus } from "@modules/RFQ/nse/cbrics_workflow_kra_map";
import type z from "zod";
import type { appSchema } from "@root/schema";

export type CbricsKraResyncResultRow = {
  loginId: string;
  workflowStatus: number;
  outcome: "updated" | "skipped";
  reason?: "NO_CUSTOMER_MATCH" | "KYC_NOT_VERIFIED" | "UNCHANGED";
  customerId?: number;
  previousKraStatus?: string | null;
  newKraStatus?: string;
};

type ResyncBody = z.infer<
  typeof appSchema.crm.rfq.nse.getParticipants.ResyncKraFromCbricsParticipantsBodyZ
>;

/**
 * CRM-only: align `customerProfile.kraStatus` with CBRICS participant `workflowStatus`
 * when `loginId` matches `userName` and KYC is VERIFIED.
 *
 * Does not send emails or trigger webhook side effects.
 */
export class CbricsKraResyncService {
  async resyncFromParticipantItems(
    body: ResyncBody,
  ): Promise<{ results: CbricsKraResyncResultRow[] }> {
    const results: CbricsKraResyncResultRow[] = [];

    for (const item of body.items) {
      const loginId = item.loginId.trim();
      const workflowStatus = item.workflowStatus;
      const newKraStatus = kraStatusFromCbricsWorkflowStatus(workflowStatus);

      const customer = await db.dataBase.customerProfileDataModel.findFirst({
        where: { userName: loginId },
        select: {
          id: true,
          kycStatus: true,
          kraStatus: true,
        },
      });

      if (!customer) {
        results.push({
          loginId,
          workflowStatus,
          outcome: "skipped",
          reason: "NO_CUSTOMER_MATCH",
          newKraStatus,
        });
        continue;
      }

      if (customer.kycStatus !== "VERIFIED") {
        results.push({
          loginId,
          workflowStatus,
          outcome: "skipped",
          reason: "KYC_NOT_VERIFIED",
          customerId: customer.id,
          previousKraStatus: customer.kraStatus,
          newKraStatus,
        });
        continue;
      }

      const patch: { kraStatus?: string; verifyDate?: Date } = {};
      if (customer.kraStatus !== newKraStatus) {
        patch.kraStatus = newKraStatus;
      }
      if (workflowStatus === 1) {
        patch.verifyDate = new Date();
      }

      if (Object.keys(patch).length === 0) {
        results.push({
          loginId,
          workflowStatus,
          outcome: "skipped",
          reason: "UNCHANGED",
          customerId: customer.id,
          previousKraStatus: customer.kraStatus,
          newKraStatus,
        });
        continue;
      }

      await db.dataBase.customerProfileDataModel.update({
        where: { id: customer.id },
        data: patch,
      });

      results.push({
        loginId,
        workflowStatus,
        outcome: "updated",
        customerId: customer.id,
        previousKraStatus: customer.kraStatus,
        newKraStatus,
      });
    }

    return { results };
  }
}
