import * as authSchema from "./lib/auth/auth.schema";
import * as userSchema from "./lib/crm/users.schema";
import * as leadSchema from "./lib/crm/leads.schema";
import * as partnershipSchema from "./lib/crm/partnership.schema";
import * as crmOrdersSchema from "./lib/crm/orders.schema";

import * as customerSchema from "./lib/customers/customers.schema";
import * as customerKycSchema from "./lib/customers/kyc.schema";

export {
  createCorporateKycSchema,
  updateCorporateKycSchema,
  type CreateCorporateKycPayload,
  type UpdateCorporateKycPayload,
  type CorporateKycBankAccountPayload,
  type CorporateKycDematAccountPayload,
  type CorporateKycDirectorPayload,
  type CorporateKycPromoterPayload,
  type CorporateKycAuthorisedSignatoryPayload,
} from "./lib/customers/corporateKyc.schema";

import * as nseIsinSchema from "./lib/crm/req/nse/isin/filterIsin.schema";
import * as getParticipants from "./lib/crm/req/nse/isin/getParticipants.schema";
import * as auditlogs from "./lib/crm/auditlogs.schema";

import * as Enum from "./lib/enums";
import * as bondsSchema from "./lib/bonds/bonds.schema";
import * as rfqSchema from "./lib/rfq/rfq.schema";
import * as contactSchema from "./lib/contact.schema";
import * as auditlogsSchema from "./lib/auditlogs.schema";
import * as orderSchema from "./lib/order/order.schema";

export const appSchema = {
  auth: authSchema,
  crm: {
    user: userSchema,
    leads: leadSchema,
    partnership: partnershipSchema,
    orders: crmOrdersSchema,
    auditlogs,
    rfq: {
      nse: {
        isin: nseIsinSchema,
        getParticipants,
      },
    },
  },
  Enum,
  customer: customerSchema,
  kyc: customerKycSchema,
  bonds: bondsSchema,
  rfq: rfqSchema,

  contact: contactSchema,
  auditlogsSchema,
  order: orderSchema,
};
