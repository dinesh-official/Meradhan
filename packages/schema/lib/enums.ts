import z from "zod";

export const CrmUserROLEEnum = z.enum([
    "VIEWER","ADMIN","SALES","SUPPORT","RELATIONSHIP_MANAGER"
]);

export const AccountStatusEnum = z.enum(["SUSPENDED", "ACTIVE"]);
export const gender = ["MALE", "FEMALE", "OTHER",]
export const GenderEnum = z.enum(gender, { error: "Invalid select valid gender type" });
