import z from "zod";

export const CrmUserROLEEnum = z.enum([
    "VIEWER","ADMIN","SALES","SUPPORT","RELATIONSHIP_MANAGER"
]);

export const AccountStatusEnum = z.enum(["SUSPENDED", "ACTIVE"]);
