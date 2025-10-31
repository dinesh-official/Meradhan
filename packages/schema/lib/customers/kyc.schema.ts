import z from "zod";

export const kycPanInfoDataSchema = z.object({
    panCardNo: z
        .string()
        .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)")
        .min(10, "PAN must be 10 characters")
        .max(10, "PAN must be 10 characters"),
    dateOfBirth: z
        .string()
        .min(1, "Date of birth is required")
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Date of birth must be in YYYY-MM-DD format"
        ),
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(), // can be empty
    lastName: z.string().min(1, "Last name is required"),
    checkTerms1: z
        .boolean()
        .refine(val => val === true, { message: "You must agree to terms 1" }),
    checkTerms2: z
        .boolean()
        .refine(val => val === true, { message: "You must agree to terms 2" }),
})

export const selfieSignRequestSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    middleName: z.string().optional(), // can be empty
    lastName: z.string().min(1, "Last name is required"),
})

export const personalInfoSchema = z.object({
    maritalStatus: z.string().min(1, "Marital status is required"),
    fatSpuName: z.string().min(1, "Father/Spouse name is required"),
    reelWithPerson: z.string().min(1, "Relationship with person is required"),
    qualification: z.string().min(1, "Qualification is required"),
    occupationType: z.string().min(1, "Occupation type is required"),
    annualGrossIncome: z.string().min(1, "Annual gross income is required"),
    motherName: z.string().min(1, "Mother name is required"),
    nationality: z.string().min(1, "Nationality is required"),
    residentialStatus: z.string().min(1, "Residential status is required"),
});

export const bankInfoSchema = z.object({
    bankAccountType: z.string().min(1, "Bank account type is required"),
    bankName: z.string().min(1, "Bank name is required"),
    branchName: z.string().min(1, "Branch name is required"),
    ifscCode: z
        .string()
        .min(11, "IFSC code must be 11 characters long")
        .max(11, "IFSC code must be 11 characters long")
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
    accountNumber: z
        .string()
        .min(8, "Account number must be at least 8 digits")
        .max(18, "Account number cannot exceed 18 digits")
        .regex(/^[0-9]+$/, "Account number must contain only digits"),
    isDefault: z.boolean(),
    checkTerms: z
        .boolean()
        .refine(val => val === true, { message: "You must agree to the terms" }),
    beneficiary_name: z.string().min(1, "Beneficiary name is required"),
});

export const dpAccountInfoSchema = z.object({
    depositoryName: z.enum(["CDSL", "NSDL"], {
        error: "Select a depository name",
    }),
    dpId: z
        .string()
        .min(8, "DP ID must be at least 8 characters")
        .max(16, "DP ID cannot exceed 16 characters"),
    beneficiaryClientId: z
        .string()
        .min(8, "Beneficiary Client ID must be at least 8 characters")
        .max(16, "Beneficiary Client ID cannot exceed 16 characters"),
    depositoryParticipantName: z
        .string()
        .min(1, "Depository participant name is required"),
    panNumber: z
        .array(
            z
                .string()
                .regex(
                    /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                    "Invalid PAN format (e.g., ABCDE1234F)"
                )
        )
        .nonempty("At least one PAN number is required"),
    accountHolderName: z.string().min(1, "Account holder name is required"),
    accountType: z.enum(["SOLO", "JOINT"], { error: "Select an account type" }).optional(),
    isDefault: z.boolean(),
    isVerified: z.boolean().default(false),
    checkTerms: z
        .boolean()
        .refine(val => val === true, { message: "You must agree to the terms" }),
});


export const riskProfileDataSchema = z.array(
    z.object({
        index: z.number().int().nonnegative("Index must be a positive integer"),
        qus: z.string().min(1, "Question is required"),
        opt: z.array(z.string().min(1, "Option cannot be empty")).nonempty("At least one option is required"),
        ans: z.string().min(1, "Answer is required"),
    })
);