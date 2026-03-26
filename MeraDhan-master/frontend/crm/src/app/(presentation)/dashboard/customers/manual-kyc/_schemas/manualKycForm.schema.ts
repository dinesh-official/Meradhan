import z from "zod";

// Step 1: Basic Identity
export const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  emailAddress: z.string().email("Invalid email address"),
  username: z.string().min(1, "Username is required"),
});

// Step 2: Personal Information
export const step2Schema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  fatherOrSpouseName: z.string().min(1, "Father or Spouse name is required"),
  mothersName: z.string().min(1, "Mother's name is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  nationality: z.string().min(1, "Nationality is required"),
  residentialStatus: z.string().min(1, "Residential status is required"),
  occupationType: z.string().min(1, "Occupation type is required"),
  annualGrossIncome: z.string().min(1, "Annual gross income is required"),
  politicallyExposedPerson: z.enum(["yes", "no"], {
    message: "PEP declaration is required",
  }),
  confirmPersonalInfoTimestamp: z.string().min(1, "Confirmation timestamp is required"),
});

// Step 3: Address Details
export const currentAddressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required"),
  postOffice: z.string().min(1, "Post office is required"),
  cityOrDistrict: z.string().min(1, "City/District is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(6, "PIN code must be at least 6 characters").max(6, "PIN code must be 6 characters"),
  country: z.string().min(1, "Country is required"),
  fullAddress: z.string().min(1, "Full address is required"),
});

export const permanentAddressSchema = z.object({
  sameAsCurrent: z.enum(["yes", "no"], {
    message: "Please specify if permanent address is same as current",
  }),
  addressLine1: z.string().optional(),
  postOffice: z.string().optional(),
  cityOrDistrict: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  country: z.string().optional(),
  fullAddress: z.string().optional(),
}).refine(
  (data) => {
    if (data.sameAsCurrent === "no") {
      return (
        data.addressLine1 &&
        data.postOffice &&
        data.cityOrDistrict &&
        data.state &&
        data.pinCode &&
        data.country &&
        data.fullAddress
      );
    }
    return true;
  },
  {
    message: "All permanent address fields are required when different from current address",
  }
);

export const step3Schema = z.object({
  currentAddress: currentAddressSchema,
  permanentAddress: permanentAddressSchema,
});

// Step 4: Aadhaar KYC
export const step4Schema = z.object({
  aadhaarNumber: z.string().regex(/^\d{12}$/, "Aadhaar number must be 12 digits"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  documentFileUrl: z.string().min(1, "Aadhaar document file URL is required"),
  aadhaarConsent: z.boolean().refine((val) => val === true, {
    message: "Aadhaar consent is required",
  }),
  confirmAadhaarTimestamp: z.string().min(1, "Confirmation timestamp is required"),
});

// Step 5: PAN KYC
export const step5Schema = z.object({
  panNumber: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Gender is required"),
  documentFileUrl: z.string().optional().default(""),
  panConsent: z.boolean().refine((val) => val === true, {
    message: "PAN consent is required",
  }),
  confirmPanTimestamp: z.string().min(1, "Confirmation timestamp is required"),
});

// Step 6: Bank Account
export const bankAccountSchema = z.object({
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  accountType: z.string().min(1, "Account type is required"),
  isPrimary: z.boolean(),
  bankAccountConsent: z.boolean().refine((val) => val === true, {
    message: "Bank account consent is required",
  }),
  confirmBankTimestamp: z.string().min(1, "Confirmation timestamp is required"),
});

export const step6Schema = z.object({
  bankAccounts: z.array(bankAccountSchema).min(1, "At least one bank account is required"),
}).refine(
  (data) => data.bankAccounts.some((acc) => acc.isPrimary === true),
  {
    message: "At least one bank account must be marked as primary",
  }
);

// Step 7: Risk Profile
const riskQuestionSchema = z.object({
  qus: z.string(),
  ans: z.string().min(1, "Please select an answer"),
  index: z.number(),
  opt: z.array(z.string()),
});

export const step7Schema = z.object({
  riskQuestionnaireResponses: z.array(riskQuestionSchema).min(4, "All questions must be answered"),
});

// Step 8: Compliance Declarations
export const step8Schema = z.object({
  fatcaDeclaration: z.enum(["yes", "no"], {
    message: "FATCA declaration is required",
  }),
  pepDeclaration: z.enum(["yes", "no"], {
    message: "PEP declaration is required",
  }),
  sebiTermsAcceptance: z.boolean().refine((val) => val === true, {
    message: "SEBI terms acceptance is required",
  }),
});

// Step 9: Final Submission
export const step9Schema = z.object({
  confirmAccuracy: z.boolean().refine((val) => val === true, {
    message: "You must confirm that all information is accurate",
  }),
  kycSubmissionDate: z.string().min(1, "KYC submission date is required"),
  kycStatus: z.literal("UNDER_REVIEW"),
});

// Step 10: File Attachments
export const fileAttachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().min(1, "File URL is required"),
  fileType: z.string().min(1, "File type is required"),
  description: z.string().optional(),
});

export const step10Schema = z.object({
  eSignDocument: z.string().min(1, "E-sign document is required"),
  attachments: z.array(fileAttachmentSchema).optional().default([]),
});

// Complete form schema
export const manualKycFormSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
  step8: step8Schema,
  step9: step9Schema,
  step10: step10Schema,
});

