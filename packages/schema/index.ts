import * as authSchema from "./lib/auth/auth.schema";
import * as userSchema from "./lib/crm/users.schema";


export const appSchema = {
   auth: authSchema,
   crm: {
      user: userSchema
   }
};
