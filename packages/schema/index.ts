import * as authSchema from "./lib/auth/auth.schema";
import * as userSchema from "./lib/crm/users.schema";
import * as leadSchema from "./lib/crm/leads.schema";

import * as customerSchema from "./lib/customers/customers.schema";
import * as customerKycSchema from "./lib/customers/kyc.schema";

import * as nseIsinSchema from "./lib/crm/req/nse/isin/filterIsin.schema";
import * as getParticipants from "./lib/crm/req/nse/isin/getParticipants.schema";
import * as auditlogs from "./lib/crm/auditlogs.schema";



import * as Enum from "./lib/enums"



export const appSchema = {
   auth: authSchema,
   crm: {
      user: userSchema,
      leads: leadSchema,
      auditlogs,
      rfq: {
         nse: {
            isin: nseIsinSchema,
            getParticipants
         }
      }
   },
   Enum,
   customer: customerSchema,
   kyc: customerKycSchema

};
