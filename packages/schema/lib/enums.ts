import z from "zod";

const UserRoles = ["VIEWER", "ADMIN", "SUPER_ADMIN", "SALES", "SUPPORT", "RELATIONSHIP_MANAGER"] as const;

export const CrmUserROLEEnum = z.enum(
   UserRoles
);

export const AccountStatusEnum = z.enum(["SUSPENDED", "ACTIVE"]);
export const gender = ["MALE", "FEMALE", "OTHER"] as const;
export const GenderEnum = z.enum(gender, { error: "Invalid select valid gender type" });

