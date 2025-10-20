export * from "./src/core/connection/apiCaller";
export * from "./src/core/connection/error";
export type * from "./src/core/api/auth.api";
export type * from "./src/core/connection/apiCaller.interface";
export * from "./src/core/constants/role";
export * from "./src/types/response.types";

import * as auth from "./src/core/api/auth.api";

import * as crmUser from "./src/core/api/crm/crmUsers.api";
import * as crmCustomer from "./src/core/api/crm/crmCustomer.api";

import * as crmLeads from "./src/core/api/crm/crmLeads.api";
import * as crmFollowUpLeads from "./src/core/api/crm/crmFollowUp.api"

import * as auditlogs from "./src/core/api/crm/auditlogs/auditlogs.api"
export type * from "./src/core/api/crm/auditlogs/auditlogs.response";

import * as participants from "./src/core/api/crm/RFQ/nse/participants.api"
export type * from "./src/core/api/crm/RFQ/nse/participants.response";


export default {
  auth,
  crm: {
    user: crmUser,
    customer: crmCustomer,
    crmLeads: crmLeads,
    crmFollowup: crmFollowUpLeads,
    auditlogs,
    rfq: {
      participants
    }
  },
};
