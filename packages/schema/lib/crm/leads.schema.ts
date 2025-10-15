import { z } from "zod";

// Lead enums
export const LeadSource = z.enum([
    "WEBSITE",
    "REFERRAL",
    "SOCIAL",
    "ADVERTISEMENT",
    "EVENT",
    "COLD_CALL",
    "EMAIL",
    "OTHER",
]);

export const LeadStatus = z.enum([
    "NEW",
    "CONTACTED",
    "QUALIFIED",
    "UNQUALIFIED",
    "CONVERTED",
]);

export const BondType = z.enum([
    "GOVERNMENT",
    "CORPORATE",
    "TAX_FREE",
    "SOVEREIGN_GOLD_BOND",
    "PSU",
    "OTHER",
]);


export const filterLeadSchema = z.object({
    page: z.string().regex(/^\d+$/, { message: "Page must be a numeric string" }).default("1").optional(),
    search: z.string().optional(),
    status: LeadStatus.optional(),
    source: LeadSource.optional(),
})

// Main Lead schema
export const createNewLeadSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    emailAddress: z.email("Invalid email address"),
    phoneNo: z.string().min(10, "Phone number must have at least 10 digits"),
    companyName: z.string().min(1, "Company name is required"),
    leadSource: LeadSource,
    bondType: BondType,
    status: LeadStatus,
    exInvestmentAmount: z.number().int().optional(),
    note: z.string().optional(),
});

export const updateLeadSchema = createNewLeadSchema.partial();


export const createNewLeadFollowUpNoteSchema = z.object({
    text: z.string().min(1, "Note text is required"),
    nextDate: z.coerce.date().optional(), // accepts string or Date
});

export const updateLeadFollowUpNoteSchema = createNewLeadFollowUpNoteSchema.partial() 