export type * from "./src/core/api/auth.api";
export type * from "./src/core/api/crm/auditlogs/auditlogs.response";
export type * from "./src/core/api/crm/RFQ/nse/isin.response";
export type * from "./src/core/api/crm/RFQ/nse/participants.response";
export * from "./src/core/connection/apiCaller";
export type * from "./src/core/connection/apiCaller.interface";

export * from "./src/core/connection/error";
export * from "./src/core/constants/role";
export * from "./src/types/response.types";

import * as auth from "./src/core/api/auth.api";

import * as crmCustomer from "./src/core/api/crm/crmCustomer.api";
import * as crmUser from "./src/core/api/crm/crmUsers.api";

import * as crmFollowUpLeads from "./src/core/api/crm/crmFollowUp.api";
import * as crmLeads from "./src/core/api/crm/crmLeads.api";
import * as crmPartnership from "./src/core/api/crm/crmPartnership.api";
import { CrmOrdersApi } from "./src/core/api/crm/orders.api";
import { CrmDashboardApi } from "./src/core/api/crm/dashboard.api";
export * from "./src/core/api/crm/crmLeads.api";
export * from "./src/core/api/crm/crmPartnership.api";
export * from "./src/core/api/crm/dashboard.api";
export type { PartnershipPayload } from "./src/core/api/crm/crmPartnership.api";
export type * from "./src/core/api/crm/orders.response";

import * as auditlogs from "./src/core/api/crm/auditlogs/auditlogs.api";

import * as participants from "./src/core/api/crm/RFQ/nse/participants.api";
import { RfqIsinApi } from "./src/core/api/crm/RFQ/nse/isin.api";

import * as customerAuthApi from "./src/core/api/meradhan/customerauth.api";
import * as bondsApi from "./src/core/api/bonds/bonds.api";
import * as auditlog from "./src/core/api/auditlogs/auditlogs.api";
export type * from "./src/core/api/auditlogs/auditlog.response";

export type * from "./src/core/api/bonds/bonds.response";

export type * from "./src/core/api/meradhan/customerauth.response";

import * as customerKycApi from "./src/core/api/meradhan/kyc/Kyc.api";
export type * from "./src/core/api/meradhan/kyc/Kyc.response";

import { CustomerOrderApi } from "./src/core/api/meradhan/order/order.api";
import { CustomerPortfolioApi } from "./src/core/api/meradhan/portfolio/portfolio.api";
export type * from "./src/core/api/meradhan/order/order.response";
export type * from "./src/core/api/meradhan/portfolio/portfolio.response";

import * as trash from "./src/core/api/trash/trash.api";
import * as commonApi from "./src/core/api/meradhan/common.api";

export type * from "./src/core/api/trash/trash.response";

export default {
  auth,
  crm: {
    user: crmUser,
    customer: crmCustomer,
    crmLeads: crmLeads,
    crmPartnership: crmPartnership,
    crmFollowup: crmFollowUpLeads,
    crmOrdersApi: CrmOrdersApi,
    dashboard: {
      CrmDashboardApi,
    },
    auditlogs,
    rfq: {
      participants,
      RfqIsinApi,
    },
  },
  meradhan: {
    customerAuthApi,
    customerKycApi,
    customerOrderApi: CustomerOrderApi,
    customerPortfolioApi: CustomerPortfolioApi,
    commonApi,
  },
  bondsApi,
  trash,
  auditlog,
};
