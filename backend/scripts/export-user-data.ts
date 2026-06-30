import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { db } from "@core/database/database";

/**
 * Export all customer-related rows for a given `customers_profile_data.id`
 * (or UCC / userName) into a single PostgreSQL import SQL file.
 *
 * Usage:
 *   bun run scripts/export-user-data.ts <customerProfileId|userName> [output.sql]
 *
 * Example:
 *   bun run scripts/export-user-data.ts 42
 *   bun run scripts/export-user-data.ts UCC12345 ./exports/ucc12345.sql
 */

type ExportContext = {
    customerProfileId: number;
    userName: string;
    email: string;
    panNo: string | null;
    orderIds: number[];
    orderNumbers: string[];
    kycFlowIds: number[];
    kraDownloadIds: number[];
    nseParticipantId: number | null;
    corporateKycId: number | null;
    notificationLogIds: number[];
    orphanIds: {
        aadhaarId: number | null;
        panId: number | null;
        personalId: number | null;
        currentAddressId: number | null;
        permanentAddressId: number | null;
        riskId: number | null;
        authId: number | null;
    };
};

type TableExport = {
    label: string;
    table: string;
    whereSql: string;
    params: unknown[];
};

const sqlLiteral = (value: unknown): string => {
    if (value === null || value === undefined) return "NULL";
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    if (typeof value === "number") return Number.isFinite(value) ? String(value) : "NULL";
    if (typeof value === "bigint") return String(value);
    if (
        typeof value === "object" &&
        value !== null &&
        "toFixed" in value &&
        typeof (value as { toFixed?: unknown }).toFixed === "function"
    ) {
        return String(value);
    }
    if (value instanceof Date) {
        return `'${value.toISOString().replace("T", " ").replace("Z", "+00")}'`;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return "'{}'";
        }
        const elements = value.map((item) => {
            if (item === null || item === undefined) return "NULL";
            return `"${String(item).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        });
        return `'{${elements.join(",")}}'`;
    }
    if (typeof value === "object") {
        const json = JSON.stringify(value).replace(/\\/g, "\\\\").replace(/'/g, "''");
        return `'${json}'::jsonb`;
    }
    return `'${String(value).replace(/'/g, "''")}'`;
};

const quoteCol = (column: string): string =>
    /^[a-z][a-z0-9_]*$/.test(column) ? column : `"${column}"`;

const rowToInsert = (table: string, row: Record<string, unknown>): string => {
    const keys = Object.keys(row);
    const quotedTable = table.match(/^[a-z0-9_]+$/) ? table : `"${table}"`;
    const cols = keys.map((k) => `"${k}"`).join(", ");
    const vals = keys.map((k) => sqlLiteral(row[k])).join(", ");
    return `INSERT INTO ${quotedTable} (${cols}) VALUES (${vals}) ON CONFLICT DO NOTHING;`;
};

const fetchRows = async (
    table: string,
    whereSql: string,
    params: unknown[],
): Promise<Record<string, unknown>[]> => {
    const quotedTable = table.match(/^[a-z0-9_]+$/) ? table : `"${table}"`;
    return db.dataBase.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT * FROM ${quotedTable} WHERE ${whereSql}`,
        ...params,
    );
};

const inClause = (column: string, values: number[], startIndex: number) => {
    if (values.length === 0) return null;
    const placeholders = values.map((_, i) => `$${startIndex + i}`).join(", ");
    return { sql: `${quoteCol(column)} IN (${placeholders})`, params: values };
};

const buildExports = (ctx: ExportContext): TableExport[] => {
    const exports: TableExport[] = [];
    const id = ctx.customerProfileId;

    const pushIdIn = (label: string, table: string, column: string, ids: number[]) => {
        const clause = inClause(column, ids, 1);
        if (clause) exports.push({ label, table, whereSql: clause.sql, params: clause.params });
    };

    const pushEq = (label: string, table: string, column: string, value: number | string) => {
        exports.push({ label, table, whereSql: `${quoteCol(column)} = $1`, params: [value] });
    };

    // Parents first (referenced by customers_profile_data)
    if (ctx.orphanIds.currentAddressId != null) {
        pushEq("currentAddress", "addresses", "id", ctx.orphanIds.currentAddressId);
    }
    if (ctx.orphanIds.permanentAddressId != null) {
        pushEq("permanentAddress", "addresses", "id", ctx.orphanIds.permanentAddressId);
    }
    if (ctx.orphanIds.aadhaarId != null) {
        pushEq("aadhaarCard", "aadhaar_cards", "id", ctx.orphanIds.aadhaarId);
    }
    if (ctx.orphanIds.panId != null) {
        pushEq("panCard", "pan_cards", "id", ctx.orphanIds.panId);
    }
    if (ctx.orphanIds.personalId != null) {
        pushEq("personalInfo", "customers_personal_info", "id", ctx.orphanIds.personalId);
    }
    if (ctx.orphanIds.riskId != null) {
        pushEq("riskProfile", "customers_risk_profiles", "id", ctx.orphanIds.riskId);
    }
    if (ctx.orphanIds.authId != null) {
        pushEq("authRecord", "customers_auth_data", "id", ctx.orphanIds.authId);
    }

    pushEq("customerProfile", "customers_profile_data", "id", id);

    pushEq("bankAccounts", "customers_bank_accounts", "customerProfileDataModelId", id);
    pushEq("dematAccounts", "customers_demat_accounts", "customerProfileDataModelId", id);

    if (ctx.corporateKycId != null) {
        pushEq("corporateKyc", "corporate_kyc", "id", ctx.corporateKycId);
        pushEq(
            "corporateKycAttachments",
            "corporate_kyc_attachments",
            "corporateKycModelId",
            ctx.corporateKycId,
        );
        pushEq(
            "corporateKycBankAccounts",
            "corporate_kyc_bank_accounts",
            "corporateKycModelId",
            ctx.corporateKycId,
        );
        pushEq(
            "corporateKycDematAccounts",
            "corporate_kyc_demat_accounts",
            "corporateKycModelId",
            ctx.corporateKycId,
        );
        pushEq("corporateKycDirectors", "corporate_kyc_directors", "corporateKycModelId", ctx.corporateKycId);
        pushEq("corporateKycPromoters", "corporate_kyc_promoters", "corporateKycModelId", ctx.corporateKycId);
        pushEq("corporateKycPartners", "corporate_kyc_partners", "corporateKycModelId", ctx.corporateKycId);
        pushEq("corporateKycTrustees", "corporate_kyc_trustees", "corporateKycModelId", ctx.corporateKycId);
        pushEq(
            "corporateKycAuthorisedSignatories",
            "corporate_kyc_authorised_signatories",
            "corporateKycModelId",
            ctx.corporateKycId,
        );
        pushEq(
            "corporateESignRequests",
            "corporate_e_sign_requests",
            "corporateKycModelId",
            ctx.corporateKycId,
        );
    }

    if (ctx.nseParticipantId != null) {
        pushEq(
            "nseCbricsParticipant",
            "nse_cbrics_unregistered_participant",
            "id",
            ctx.nseParticipantId,
        );
        pushEq(
            "nseBankAccounts",
            "nse_cbrics_bank_account",
            "nseCbricsParticipantModelId",
            ctx.nseParticipantId,
        );
        pushEq(
            "nseDpAccounts",
            "nse_cbrics_dp_account",
            "nseCbricsParticipantModelId",
            ctx.nseParticipantId,
        );
        pushEq("nseDataSet", "nse_customer_data_set", "customerProfileDataModelId", id);
    }

    pushEq("kycFlows", "kyc_dump", "userID", id);

    if (ctx.kycFlowIds.length > 0) {
        pushIdIn("kraDataLogsByKyc", "kra_data_logs", "kycId", ctx.kycFlowIds);
    }
    pushEq("kraDataLogsByUser", "kra_data_logs", "userId", id);

    if (ctx.kraDownloadIds.length > 0) {
        pushIdIn("kraDownloadResponses", "kra_download_response", "id", ctx.kraDownloadIds);
        pushIdIn("kraFatcaAddlDtls", "kra_fatca_addl_dtls", "kraDownloadResponseId", ctx.kraDownloadIds);
    }

    pushEq("orders", "orders", "customerProfileId", id);
    pushEq("customerBonds", "customer_bonds", "customerProfileId", id);

    if (ctx.orderIds.length > 0) {
        pushIdIn("orderLogs", "order_logs", "orderId", ctx.orderIds);
        pushIdIn("orderSettlementAutomationLogs", "order_settlement_automation_logs", "orderId", ctx.orderIds);
    }

    if (ctx.orderNumbers.length > 0) {
        const placeholders = ctx.orderNumbers.map((_, i) => `$${i + 1}`).join(", ");
        exports.push({
            label: "crmOrderReceiptPdfOptions",
            table: "crm_order_receipt_pdf_options",
            whereSql: `"orderNumber" IN (${placeholders})`,
            params: ctx.orderNumbers,
        });
    }

    pushEq("draftOrders", "draft_orders", "userId", id);
    pushEq("bondsWatchList", "BondsWatchList", "userId", id);
    pushEq("issueNotesWatchList", "IssueNotesWatchList", "userId", id);
    pushEq("storageFiles", "storage", "userId", id);
    pushEq("razorpayRouteStakeholders", "razorpay_route_stakeholders", "userId", id);
    pushEq("bondReminderLogs", "bond_reminder_logs", "customerProfileId", id);
    pushEq("crmSavedProposals", "crm_saved_proposals", "customerProfileId", id);
    pushEq(
        "notificationSavedListMembers",
        "crm_notification_saved_list_members",
        "customerProfileId",
        id,
    );
    pushEq("notificationRecipientLogs", "notification_recipient_logs", "customerProfileId", id);

    if (ctx.notificationLogIds.length > 0) {
        pushIdIn("notificationLogs", "notification_logs", "id", ctx.notificationLogIds);
    }

    pushEq("activityLogsMeradhan", "activity_logs_meradhan", "userId", id);
    pushEq("loginLogsMeradhan", "login_logs_meradhan", "userId", id);
    pushEq("sessionLogsMeradhan", "session_logs_meradhan", "userId", id);
    pushEq("pageViewLogsMeradhan", "page_view_logs_meradhan", "userId", id);
    pushEq("webAuditLogs", "web_audit_logs", "userId", id);

    return exports;
};

const dedupeInserts = (lines: string[]): string[] => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of lines) {
        if (seen.has(line)) continue;
        seen.add(line);
        out.push(line);
    }
    return out;
};

const sequenceResets = (ctx: ExportContext): string[] => {
    const tables = [
        "customers_auth_data",
        "addresses",
        "aadhaar_cards",
        "pan_cards",
        "customers_personal_info",
        "customers_risk_profiles",
        "customers_profile_data",
        "customers_bank_accounts",
        "customers_demat_accounts",
        "corporate_kyc",
        "corporate_kyc_attachments",
        "corporate_kyc_bank_accounts",
        "corporate_kyc_demat_accounts",
        "corporate_kyc_directors",
        "corporate_kyc_promoters",
        "corporate_kyc_partners",
        "corporate_kyc_trustees",
        "corporate_kyc_authorised_signatories",
        "corporate_e_sign_requests",
        "nse_cbrics_unregistered_participant",
        "nse_cbrics_bank_account",
        "nse_cbrics_dp_account",
        "nse_customer_data_set",
        "kyc_dump",
        "kra_data_logs",
        "kra_download_response",
        "kra_fatca_addl_dtls",
        "orders",
        "customer_bonds",
        "order_logs",
        "order_settlement_automation_logs",
        "crm_order_receipt_pdf_options",
        "draft_orders",
        "BondsWatchList",
        "IssueNotesWatchList",
        "storage",
        "razorpay_route_stakeholders",
        "bond_reminder_logs",
        "crm_saved_proposals",
        "crm_notification_saved_list_members",
        "notification_recipient_logs",
        "notification_logs",
        "activity_logs_meradhan",
        "login_logs_meradhan",
        "session_logs_meradhan",
        "page_view_logs_meradhan",
        "web_audit_logs",
    ];

    return tables.map((table) => {
        const quoted = table.match(/^[a-z0-9_]+$/) ? table : `"${table}"`;
        return `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${quoted}), 1), true);`;
    });
};

const resolveCustomer = async (identifier: string) => {
    const asNumber = Number(identifier);
    const profile = await db.dataBase.customerProfileDataModel.findFirst({
        where: Number.isInteger(asNumber) && asNumber > 0 ? { id: asNumber } : { userName: identifier.trim() },
        include: {
            panCard: { select: { panCardNo: true } },
            corporateKyc: { select: { id: true } },
            nseDataSet: { select: { nseCbricsParticipantModelId: true } },
        },
    });

    if (!profile) {
        throw new Error(
            `Customer not found for id/userName: ${identifier}. Use customers_profile_data.id or UCC (userName).`,
        );
    }

    return profile;
};

export const exportUserData = async (
    identifier: string,
    outputPath?: string,
): Promise<{ outputFile: string; rowCounts: Record<string, number> }> => {
    const profile = await resolveCustomer(identifier);
    const customerProfileId = profile.id;
    const panNo = profile.panCard?.panCardNo?.trim().toUpperCase() ?? null;

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

    const recipientLogs = await db.dataBase.notificationRecipientLogModel.findMany({
        where: { customerProfileId },
        select: { notificationLogId: true },
    });
    const notificationLogIds = [...new Set(recipientLogs.map((r) => r.notificationLogId))];

    const ctx: ExportContext = {
        customerProfileId,
        userName: profile.userName,
        email: profile.emailAddress,
        panNo,
        orderIds,
        orderNumbers,
        kycFlowIds,
        kraDownloadIds,
        nseParticipantId: profile.nseDataSet?.nseCbricsParticipantModelId ?? null,
        corporateKycId: profile.corporateKyc?.id ?? null,
        notificationLogIds,
        orphanIds: {
            aadhaarId: profile.aADHAARCardModelId,
            panId: profile.panCardModelId,
            personalId: profile.customerPersonalInfoModelId,
            currentAddressId: profile.currentAddressModelId,
            permanentAddressId: profile.permanentAddressModelId,
            riskId: profile.customersRiskProfileModelId,
            authId: profile.customersAuthDataModelId,
        },
    };

    const exports = buildExports(ctx);
    const rowCounts: Record<string, number> = {};
    const insertLines: string[] = [];

    for (const spec of exports) {
        const rows = await fetchRows(spec.table, spec.whereSql, spec.params);
        rowCounts[spec.label] = rows.length;
        for (const row of rows) {
            insertLines.push(rowToInsert(spec.table, row));
        }
    }

    const deduped = dedupeInserts(insertLines);
    const fileName =
        outputPath ??
        resolve(process.cwd(), `user_${ctx.userName}_${customerProfileId}_export.sql`);

    const sql = [
        "-- MeraDhan customer data export",
        `-- userName (UCC): ${ctx.userName}`,
        `-- customerProfileId: ${customerProfileId}`,
        `-- email: ${ctx.email}`,
        `-- generatedAt: ${new Date().toISOString()}`,
        "",
        "BEGIN;",
        "SET session_replication_role = replica;",
        "",
        ...deduped,
        "",
        "SET session_replication_role = DEFAULT;",
        "",
        "-- Reset sequences after import",
        ...sequenceResets(ctx),
        "",
        "COMMIT;",
        "",
    ].join("\n");

    mkdirSync(dirname(fileName), { recursive: true });
    writeFileSync(fileName, sql, "utf8");

    return { outputFile: fileName, rowCounts };
};

if (import.meta.main) {
    const identifier = process.argv[2];
    const outputPath = process.argv[3];

    if (!identifier) {
        console.error(
            "Usage: bun run scripts/export-user-data.ts <customerProfileId|userName> [output.sql]",
        );
        process.exit(1);
    }

    exportUserData(identifier, outputPath)
        .then(({ outputFile, rowCounts }) => {
            console.log(`Export written to: ${outputFile}`);
            console.log("Row counts:");
            console.log(JSON.stringify(rowCounts, null, 2));
        })
        .catch((err) => {
            console.error(err);
            process.exit(1);
        })
        .finally(() => {
            void db.dataBase.$disconnect();
        });
}
