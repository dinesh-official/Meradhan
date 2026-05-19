import z from "zod";
import { isCrmLoginEmailDomainAllowed } from "../auth/crm_login_email";
import { AccountStatusEnum, CrmUserROLEEnum } from "../enums";

const crmUserEmailSchema = z
  .email("Invalid email format")
  .refine(isCrmLoginEmailDomainAllowed, {
    message: "Email must be @meradhan.co or @absolutedata.ai",
  });




export const findManyUserSchema = z.object({
    page: z.string().regex(/^\d+$/, { message: "Page must be a numeric string" }).default("1").optional(),
    search: z.string().optional(),
    status: AccountStatusEnum.optional(),
    role: CrmUserROLEEnum.optional(),
})

export const createCRMUserSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must be less than 100 characters"),
    email: crmUserEmailSchema,
    phoneNo: z
        .string()
        .min(8, "Phone number must be at least 8 digits")
        .max(20, "Phone number too long"),
    role: CrmUserROLEEnum,
});

export const updateUserSchema = createCRMUserSchema.extend({
    avatar: z
        .string()
        .optional(),
    role: CrmUserROLEEnum
        .optional(),
    accountStatus: AccountStatusEnum.optional(),
}).partial()