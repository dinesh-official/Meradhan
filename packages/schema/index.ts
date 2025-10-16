import * as authSchema from "./lib/auth/auth.schema";
import * as userSchema from "./lib/crm/users.schema";
import * as leadSchema from "./lib/crm/leads.schema";

import * as customerSchema from "./lib/customers/customers.schema";
import * as Enum from "./lib/enums"



export const appSchema = {
   auth: authSchema,
   crm: {
      user: userSchema,
      leads: leadSchema
   },
   Enum,
   customer: customerSchema
};
