import z from 'zod'
export const customerFormDataSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional().or(z.literal("")),
    lastName: z.string().min(1, "Last name is required"),
    emailId: z.email("Invalid email address").min(1, "Email is required"),
    mobileNo: z
        .string()
        .min(1, "Mobile number is required")
        .regex(/^\+?\d{7,15}$/, "Invalid mobile number format"),
    whatsAppNumber: z
        .string()
        .optional()
        .refine(
            (v) => v === undefined || /^\+\d{7,15}$/.test(v),
            { message: "WhatsApp number must include country code (e.g., +1234567890)" }
        ),
    userType: z.string().min(1, "User type is required"),
    userName: z.string().min(3, "Username must be at least 3 characters"),
    termsAccept: z.boolean().refine((v) => v === true, { message: "You must accept terms" }),
    whatsAppNotificationAccept: z.boolean(),
    emailConfirmed: z.boolean(),
    mobileConfirm: z.boolean(),
    kycStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]),
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    relationshipManagerId: z.union([z.string(), z.number()]).optional(),
    totalInvestment: z
        .number({
            error: "Total investment is required"
        })
        .nonnegative("Total investment cannot be negative"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
        .regex(/(?=.*[0-9])/, "Password must contain at least one number")
        .regex(/(?=.*\\W)/, "Password must contain at least one special character"),
});
