export * from "./src/core/connection/apiCaller";
export * from "./src/core/connection/error";
export type * from "./src/core/api/auth.api";
export type * from "./src/core/connection/apiCaller.interface";
import * as auth from "./src/core/api/auth.api";
export * from "./src/core/constants/role";
export * from "./src/types/response.types";
import * as crmUser from "./src/core/api/crm/crmUsers.api";
import * as crmCustomer from "./src/core/api/crm/crmCustomer.api";
import * as crmLeads from "./src/core/api/crm/crmLeads.api";
import * as crmFollowUpLeads from "./src/core/api/crm/crmFollowUp.api"
export default {
  auth,
  crm: {
    user: crmUser,
    customer: crmCustomer,
    crmLeads: crmLeads,
    crmFollowup:crmFollowUpLeads
  },
};
