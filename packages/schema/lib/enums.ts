import z from "zod";

export const CrmUserROLEEnum = z.enum([
    "VIEWER","ADMIN","SALES","SUPPORT","RELATIONSHIP_MANAGER"
]);

export const AccountStatusEnum = z.enum(["SUSPENDED", "ACTIVE"]);
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER",], { error: "Invalid select valid gender type" });
