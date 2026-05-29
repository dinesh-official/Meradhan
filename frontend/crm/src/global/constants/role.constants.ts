import { ROLES } from "@root/apiGateway";

export type Role = (typeof ROLES)[number];

export const MODULES = [
  "dashboard",
  "leads",
  "customer",
  "customerkyc",
  "sales",
  "rfq",
  "support",
  "reports",
  "user",
  "bin",
  "webauditlogs",
  "crmauditlogs",
  "webanalytics",
  "bonds",
  "orders",
] as const;

export type ModuleName = (typeof MODULES)[number];

export { ROLES };
