import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";

export type ForceDeleteUserOptions = {
    /** Log counts only; no rows deleted. */
    dryRun?: boolean;
};

export type ForceDeleteUserSummary = {
    userName: string;
    customerProfileId: number;
    email: string;
    dryRun: boolean;
    deleted: Record<string, number>;
};

type TxClient = Prisma.TransactionClient;

const countOrDelete = async (
    label: string,
    dryRun: boolean,
    deleted: Record<string, number>,
    countFn: () => Promise<number>,
    deleteFn: () => Promise<{ count: number }>,
) => {
    if (dryRun) {
        deleted[label] = await countFn();
        return;
    }
    const result = await deleteFn();
    deleted[label] = result.count;
};

export const forceDeleteUser = async (
    uccCode: string,
    options: ForceDeleteUserOptions = {},
): Promise<ForceDeleteUserSummary> => {
    const dryRun = options.dryRun ?? false;
    const userName = uccCode.trim();

    if (!userName) {
        throw new Error("UCC / userName is required.");
    }

    const profile = await db.dataBase.customerProfileDataModel.findFirst({
        where: { userName },
        include: {
            panCard: { select: { panCardNo: true } },
            nseDataSet: {
                select: {
                    id: true,
                    nseCbricsParticipantModelId: true,
                },
            },
        },
    });

    if (!profile) {
        throw new Error(`Customer not found for userName (UCC): ${userName}`);
    }

    const customerProfileId = profile.id;
    const panNo = profile.panCard?.panCardNo?.trim().toUpperCase();

    const deleted: Record<string, number> = {};

    const orders = await db.dataBase.order.findMany({
        where: { customerProfileId },
        select: { id: true, orderNumber: true },
    });
    const orderIds = orders.map((o) => o.id);
    const orderNumbers = orders.map((o) => o.orderNumber);

    const kycFlows = await db.dataBase.kYC_FLOW.findMany({
        where: { userID: customerProfileId },
        select: { id: true },
    });
    const kycFlowIds = kycFlows.map((k) => k.id);

    const kraDownloadIds = panNo
        ? (
            await db.dataBase.kraDownloadResponse.findMany({
                where: { appPanNo: panNo },
                select: { id: true },
            })
        ).map((r) => r.id)
        : [];

    const runTx = async (tx: TxClient) => {
        await countOrDelete(
            "bondReminderLogs",
            dryRun,
            deleted,
            () =>
                tx.bondReminderLog.count({
                    where: { customerProfileId },
                }),
            () =>
                tx.bondReminderLog.deleteMany({
                    where: { customerProfileId },
                }),
        );

        await countOrDelete(
            "draftOrders",
            dryRun,
            deleted,
            () => tx.draftOrders.count({ where: { userId: customerProfileId } }),
            () =>
                tx.draftOrders.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "bondsWatchList",
            dryRun,
            deleted,
            () => tx.bondsWatchList.count({ where: { userId: customerProfileId } }),
            () =>
                tx.bondsWatchList.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "issueNotesWatchList",
            dryRun,
            deleted,
            () =>
                tx.issueNotesWatchList.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.issueNotesWatchList.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "storageFiles",
            dryRun,
            deleted,
            () => tx.storage.count({ where: { userId: customerProfileId } }),
            () =>
                tx.storage.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "razorpayRouteStakeholders",
            dryRun,
            deleted,
            () =>
                tx.razorpayRouteStakeholder.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.razorpayRouteStakeholder.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        const kraLogWhere: Prisma.KraDataLogsWhereInput = {
            OR: [
                { userId: customerProfileId },
                ...(kycFlowIds.length > 0 ? [{ kycId: { in: kycFlowIds } }] : []),
            ],
        };

        await countOrDelete(
            "kraDataLogs",
            dryRun,
            deleted,
            () => tx.kraDataLogs.count({ where: kraLogWhere }),
            () => tx.kraDataLogs.deleteMany({ where: kraLogWhere }),
        );

        await countOrDelete(
            "kycFlows",
            dryRun,
            deleted,
            () =>
                tx.kYC_FLOW.count({
                    where: { userID: customerProfileId },
                }),
            () =>
                tx.kYC_FLOW.deleteMany({
                    where: { userID: customerProfileId },
                }),
        );

        if (kraDownloadIds.length > 0) {
            await countOrDelete(
                "kraFatcaAddlDtls",
                dryRun,
                deleted,
                () =>
                    tx.kraFatcaAddlDtls.count({
                        where: { kraDownloadResponseId: { in: kraDownloadIds } },
                    }),
                () =>
                    tx.kraFatcaAddlDtls.deleteMany({
                        where: { kraDownloadResponseId: { in: kraDownloadIds } },
                    }),
            );

            await countOrDelete(
                "kraDownloadResponses",
                dryRun,
                deleted,
                () =>
                    tx.kraDownloadResponse.count({
                        where: { id: { in: kraDownloadIds } },
                    }),
                () =>
                    tx.kraDownloadResponse.deleteMany({
                        where: { id: { in: kraDownloadIds } },
                    }),
            );
        }

        if (orderIds.length > 0) {
            await countOrDelete(
                "orderSettlementAutomationLogs",
                dryRun,
                deleted,
                () =>
                    tx.orderSettlementAutomationLog.count({
                        where: { orderId: { in: orderIds } },
                    }),
                () =>
                    tx.orderSettlementAutomationLog.deleteMany({
                        where: { orderId: { in: orderIds } },
                    }),
            );

            await countOrDelete(
                "orderLogs",
                dryRun,
                deleted,
                () =>
                    tx.orderLogs.count({
                        where: { orderId: { in: orderIds } },
                    }),
                () =>
                    tx.orderLogs.deleteMany({
                        where: { orderId: { in: orderIds } },
                    }),
            );
        }

        if (orderNumbers.length > 0) {
            await countOrDelete(
                "crmOrderReceiptPdfOptions",
                dryRun,
                deleted,
                () =>
                    tx.crmOrderReceiptPdfOptions.count({
                        where: { orderNumber: { in: orderNumbers } },
                    }),
                () =>
                    tx.crmOrderReceiptPdfOptions.deleteMany({
                        where: { orderNumber: { in: orderNumbers } },
                    }),
            );
        }

        await countOrDelete(
            "customerBonds",
            dryRun,
            deleted,
            () =>
                tx.customerBonds.count({
                    where: { customerProfileId },
                }),
            () =>
                tx.customerBonds.deleteMany({
                    where: { customerProfileId },
                }),
        );

        await countOrDelete(
            "orders",
            dryRun,
            deleted,
            () => tx.order.count({ where: { customerProfileId } }),
            () =>
                tx.order.deleteMany({
                    where: { customerProfileId },
                }),
        );

        await countOrDelete(
            "crmSavedProposals",
            dryRun,
            deleted,
            () =>
                tx.crmSavedProposal.count({
                    where: { customerProfileId },
                }),
            () =>
                tx.crmSavedProposal.deleteMany({
                    where: { customerProfileId },
                }),
        );

        await countOrDelete(
            "notificationSavedListMembers",
            dryRun,
            deleted,
            () =>
                tx.crmNotificationSavedListMemberModel.count({
                    where: { customerProfileId },
                }),
            () =>
                tx.crmNotificationSavedListMemberModel.deleteMany({
                    where: { customerProfileId },
                }),
        );

        await countOrDelete(
            "notificationRecipientLogs",
            dryRun,
            deleted,
            () =>
                tx.notificationRecipientLogModel.count({
                    where: { customerProfileId },
                }),
            () =>
                tx.notificationRecipientLogModel.deleteMany({
                    where: { customerProfileId },
                }),
        );

        if (profile.nseDataSet) {
            const participantId = profile.nseDataSet.nseCbricsParticipantModelId;

            await countOrDelete(
                "nseBankAccounts",
                dryRun,
                deleted,
                () =>
                    tx.nSEBankAccount.count({
                        where: { nseCbricsParticipantModelId: participantId },
                    }),
                () =>
                    tx.nSEBankAccount.deleteMany({
                        where: { nseCbricsParticipantModelId: participantId },
                    }),
            );

            await countOrDelete(
                "nseDpAccounts",
                dryRun,
                deleted,
                () =>
                    tx.nSEDpAccount.count({
                        where: { nseCbricsParticipantModelId: participantId },
                    }),
                () =>
                    tx.nSEDpAccount.deleteMany({
                        where: { nseCbricsParticipantModelId: participantId },
                    }),
            );

            await countOrDelete(
                "nseDataSet",
                dryRun,
                deleted,
                () =>
                    tx.nseDataSet.count({
                        where: { customerProfileDataModelId: customerProfileId },
                    }),
                () =>
                    tx.nseDataSet.deleteMany({
                        where: { customerProfileDataModelId: customerProfileId },
                    }),
            );

            await countOrDelete(
                "nseCbricsParticipant",
                dryRun,
                deleted,
                () =>
                    tx.nseCbricsParticipantModel.count({
                        where: { id: participantId },
                    }),
                () =>
                    tx.nseCbricsParticipantModel.deleteMany({
                        where: { id: participantId },
                    }),
            );
        }

        await countOrDelete(
            "bankAccounts",
            dryRun,
            deleted,
            () =>
                tx.customersBankAccountModel.count({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
            () =>
                tx.customersBankAccountModel.deleteMany({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
        );

        await countOrDelete(
            "dematAccounts",
            dryRun,
            deleted,
            () =>
                tx.customersDematAccountModel.count({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
            () =>
                tx.customersDematAccountModel.deleteMany({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
        );

        // Meradhan audit / activity logs
        await countOrDelete(
            "activityLogsMeradhan",
            dryRun,
            deleted,
            () =>
                tx.activityLogsMeradhan.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.activityLogsMeradhan.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "loginLogsMeradhan",
            dryRun,
            deleted,
            () =>
                tx.loginLogsMeradhan.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.loginLogsMeradhan.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "sessionLogsMeradhan",
            dryRun,
            deleted,
            () =>
                tx.sessionLogsMeradhan.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.sessionLogsMeradhan.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "pageViewLogsMeradhan",
            dryRun,
            deleted,
            () =>
                tx.pageViewLogsMeradhan.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.pageViewLogsMeradhan.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        await countOrDelete(
            "webAuditLogs",
            dryRun,
            deleted,
            () =>
                tx.webAuditLogs.count({
                    where: { userId: customerProfileId },
                }),
            () =>
                tx.webAuditLogs.deleteMany({
                    where: { userId: customerProfileId },
                }),
        );

        // Corporate KYC (and children via cascade)
        await countOrDelete(
            "corporateKyc",
            dryRun,
            deleted,
            () =>
                tx.corporateKycModel.count({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
            () =>
                tx.corporateKycModel.deleteMany({
                    where: { customerProfileDataModelId: customerProfileId },
                }),
        );

        const orphanIds = {
            aadhaarId: profile.aADHAARCardModelId,
            panId: profile.panCardModelId,
            personalId: profile.customerPersonalInfoModelId,
            currentAddressId: profile.currentAddressModelId,
            permanentAddressId: profile.permanentAddressModelId,
            riskId: profile.customersRiskProfileModelId,
            authId: profile.customersAuthDataModelId,
        };

        await countOrDelete(
            "customerProfile",
            dryRun,
            deleted,
            () => tx.customerProfileDataModel.count({ where: { id: customerProfileId } }),
            () =>
                tx.customerProfileDataModel.deleteMany({
                    where: { id: customerProfileId },
                }),
        );

        const { aadhaarId, panId, personalId, currentAddressId, permanentAddressId, riskId, authId } =
            orphanIds;

        if (aadhaarId != null) {
            await countOrDelete(
                "aadhaarCard",
                dryRun,
                deleted,
                () => tx.aADHAARCardModel.count({ where: { id: aadhaarId } }),
                () =>
                    tx.aADHAARCardModel.deleteMany({
                        where: { id: aadhaarId },
                    }),
            );
        }

        if (panId != null) {
            await countOrDelete(
                "panCard",
                dryRun,
                deleted,
                () => tx.panCardModel.count({ where: { id: panId } }),
                () =>
                    tx.panCardModel.deleteMany({
                        where: { id: panId },
                    }),
            );
        }

        if (personalId != null) {
            await countOrDelete(
                "personalInfo",
                dryRun,
                deleted,
                () =>
                    tx.customerPersonalInfoModel.count({
                        where: { id: personalId },
                    }),
                () =>
                    tx.customerPersonalInfoModel.deleteMany({
                        where: { id: personalId },
                    }),
            );
        }

        if (currentAddressId != null) {
            await countOrDelete(
                "currentAddress",
                dryRun,
                deleted,
                () =>
                    tx.addressModel.count({
                        where: { id: currentAddressId },
                    }),
                () =>
                    tx.addressModel.deleteMany({
                        where: { id: currentAddressId },
                    }),
            );
        }

        if (permanentAddressId != null) {
            await countOrDelete(
                "permanentAddress",
                dryRun,
                deleted,
                () =>
                    tx.addressModel.count({
                        where: { id: permanentAddressId },
                    }),
                () =>
                    tx.addressModel.deleteMany({
                        where: { id: permanentAddressId },
                    }),
            );
        }

        if (riskId != null) {
            await countOrDelete(
                "riskProfile",
                dryRun,
                deleted,
                () =>
                    tx.customersRiskProfileModel.count({
                        where: { id: riskId },
                    }),
                () =>
                    tx.customersRiskProfileModel.deleteMany({
                        where: { id: riskId },
                    }),
            );
        }

        if (authId != null) {
            await countOrDelete(
                "authRecord",
                dryRun,
                deleted,
                () =>
                    tx.customersAuthDataModel.count({
                        where: { id: authId },
                    }),
                () =>
                    tx.customersAuthDataModel.deleteMany({
                        where: { id: authId },
                    }),
            );
        }
    };

    if (dryRun) {
        await runTx(db.dataBase as unknown as TxClient);
    } else {
        await db.dataBase.$transaction(runTx, { timeout: 120_000 });
    }

    return {
        userName: profile.userName,
        customerProfileId,
        email: profile.emailAddress,
        dryRun,
        deleted,
    };
};

if (import.meta.main) {
    const uccCode = process.argv[2];
    const dryRun = process.argv.includes("--dry-run");
    const confirm = process.argv.includes("--confirm");

    if (!uccCode) {
        console.error(
            "Usage: bun run scripts/force-delete.users.ts <uccCode> [--dry-run] [--confirm]",
        );
        process.exit(1);
    }

    if (!dryRun && !confirm) {
        console.error(
            "Permanent delete. Re-run with --confirm (or --dry-run to preview counts).",
        );
        process.exit(1);
    }

    forceDeleteUser(uccCode, { dryRun })
        .then((summary) => {
            console.log(
                dryRun
                    ? "[dry-run] Rows that would be deleted:"
                    : "Deleted rows by table:",
            );
            console.log(JSON.stringify(summary, null, 2));
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
        .finally(() => {
            void db.dataBase.$disconnect();
        });
}
