import * as authSchema from "./lib/auth/auth.schema";
import * as userSchema from "./lib/crm/users.schema";
import * as customerSchema from "./lib/customers/customers.schema";



export const appSchema = {
   auth: authSchema,
   crm: {
      user: userSchema
   },
   customer: customerSchema
};
