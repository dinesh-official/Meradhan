/**
 * Standalone script to download customer data and generate an Excel file.
 * Run from backend: bun run generate-excel.ts
 */
import "@packages/config/env";
import { db } from "@core/database/database";
import fs from "fs";
import path from "path";
import * as xlsx from "xlsx";

const OUT_DIR = path.join(process.cwd(), "out");
const FILE_NAME = `customers-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
const MAX_EXPORT = 50_000;

const KYC_STEP_NAMES = [
  "Identity Validation",
  "Personal Details",
  "Bank Account",
  "Demat Account",
  "Risk Profiling",
  "e-Signature",
  "100%",
] as const;

function fullName(row: {
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
}): string {
  return [row.firstName, row.middleName, row.lastName].filter(Boolean).join(" ").trim();
}

async function main() {
  await db.dataBase.$connect();

  const rawData = await db.dataBase.customerProfileDataModel.findMany({
    where: { isDeleted: false },
    take: MAX_EXPORT,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      middleName: true,
      lastName: true,
      userName: true,
      emailAddress: true,
      phoneNo: true,
      kycStatus: true,
      kraStatus: true,
      createdAt: true,
      utility: { select: { accountStatus: true } },
    },
  });

  const customerIds = rawData.map((c) => c.id);
  const kycFlows =
    customerIds.length > 0
      ? await db.dataBase.kYC_FLOW.findMany({
          where: { userID: { in: customerIds } },
          select: { userID: true, step: true, currentStepName: true },
          orderBy: { updatedAt: "desc" },
        })
      : [];

  const kycByUser = new Map<number, { step: number; currentStepName: string | null }>();
  for (const k of kycFlows) {
    if (k.userID != null && !kycByUser.has(k.userID)) {
      kycByUser.set(k.userID, { step: k.step, currentStepName: k.currentStepName });
    }
  }

  const headers = [
    "Full Name",
    "Email",
    "Mobile",
    "Username",
    "KYC Status",
    "Join Date",
    "Account Status",
    "KRA Status",
    "Current KYC Step",
  ];
  const rows = rawData.map((row) => {
    const kyc = kycByUser.get(row.id);
    const currentStep =
      kyc?.currentStepName?.trim() || (kyc ? KYC_STEP_NAMES[kyc.step - 1] : null) || "Not Started";
    return [
      fullName(row),
      row.emailAddress ?? "",
      row.phoneNo ?? "",
      row.userName ?? "",
      row.kycStatus ?? "",
      row.createdAt ? new Date(row.createdAt).toISOString().slice(0, 10) : "",
      row.utility?.accountStatus ?? "",
      row.kraStatus ?? "",
      currentStep,
    ];
  });

  const ws = xlsx.utils.aoa_to_sheet([headers, ...rows]);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, "Customers");

  const outPath = path.join(OUT_DIR, FILE_NAME);
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  xlsx.writeFile(wb, outPath);

  await db.dataBase.$disconnect();
  console.log("Excel file written:", outPath, "| Rows:", rows.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
