import { z } from "zod";
import { AccountStatusEnum, GenderEnum } from "../enums";

export const UserAccountType = [
  "INDIVIDUAL",
  "INDIVIDUAL_NRI_NRO",
  "TRUST",
  "CORPORATE",
  "HUF",
  "LLP",
  "PARTNERSHIP_FIRM",
] as const;

export const kycStatus = [
  "VERIFIED",
  "PENDING",
  "REJECTED",
  "UNDER_REVIEW",
  "RE_KYC",
] as const;

const MAX_EXPORT_PAGE_SIZE = 50_000;

export const findManyCustomerSchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, { message: "Page must be a numeric string" })
    .default("1")
    .optional(),
  pageSize: z
    .string()
    .regex(/^\d+$/, { message: "Page size must be a numeric string" })
    .optional()
    .transform((v) => (v ? Math.min(Number(v), MAX_EXPORT_PAGE_SIZE) : 10)),
  search: z.string().optional(),
  accountStatus: AccountStatusEnum.optional(),
  kycStatus: z.enum([...kycStatus]).optional(),
});

export const sendEmailOtpSchema = z.object({
  email: z.email("Invalid email format."),
  name: z.string().min(1, "Name is required."),
});

export const sendMobileOtpSchema = z.object({
  mobile: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits."),
});

export const signUpWithCredentialsQuerySchema = z.object({
  otp: z.string().min(1, "OTP is required."),
  token: z.string().min(1, "Token is required.").optional(),
  verifyBy: z.enum(["email", "mobile"]).optional(),
  id: z.string(),
});

// Sign In Schemas
export const signInWithEmailPhoneRequestSchema = z.object({
  identity: z.enum(["email", "phoneNo"]),
  value: z.string().min(1, "Enter email or phone number."),
});

export const signInWithCredentialsSchema = z.object({
  identity: z.enum(["email", "phoneNo"]),
  value: z.string().min(1, "Enter your valid email or phone number."),
  password: z.string().min(4, "Enter your valid password."),
});

export const sendSignInOtpSchema = z.object({
  identity: z.enum(["email", "phoneNo"]),
  value: z.string().min(1, "Enter email or phone number."),
});

export const signInWithOtpSchema = z.object({
  identity: z.enum(["email", "phoneNo"]),
  value: z.string().min(1, "Enter email or phone number."),
  otp: z.string().min(4, "OTP is required."),
  token: z.string().min(1, "Token is required."),
});

const ProviderEnum = z.enum(["GOOGLE", "MICROSOFT", "FACEBOOK"]);
export const SocialLoginUserSchema = z.object({
  email: z.email(),
  image: z.string(), // must be a valid URL (change to .string() if not a URL)
  name: z.string().min(1), // non-empty string
  id: z.string().min(1), // non-empty string (could be UUID pattern if needed)
  provider: ProviderEnum,
});

export const sendForgetPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(4, "Enter your valid password."),
  token: z.string().min(1, "Token is required."),
});

const createNewCustomerSchemaBase = z.object({
  firstName: z
    .string({ error: "First name is required" })
    .min(1, { message: "First name must be at least 2 characters long" })
    .max(20, { message: "First name must be at most 20 characters long" })
    .regex(/^[A-Za-z\s.]+$/, {
      message: "First name can only contain letters, spaces, and periods",
    }),
  middleName: z
    .string()
    .max(20, { message: "Middle name must be at most 20 characters long" })
    .regex(/^[A-Za-z\s.]*$/, {
      message: "Middle name can only contain letters, spaces, and periods",
    })
    .optional(),
  lastName: z
    .string({ error: "Last name is required" })
    .min(1, { message: "Last name must be at least 2 characters long" })
    .max(15, { message: "Last name must be at most 15 characters long" })
    .regex(/^[A-Za-z\s.]+$/, {
      message: "Last name can only contain letters, spaces, and periods",
    }),
  emailId: z.email({ message: "Please enter a valid email address" }),
  phoneNo: z
    .string({ error: "Phone number is required" })
    .regex(/^[5-9][0-9]{9}$/, {
      message:
        "Phone number must be 10 digits and cannot start with 0, 1, 2, 3, or 4",
    }),
  whatsAppNo: z
    .string({ error: "WhatsApp number is required" })
    .regex(/^[5-9][0-9]{9}$/, {
      message:
        "WhatsApp number must be 10 digits and cannot start with 0, 1, 2, 3, or 4",
    }),
  userType: z.enum(UserAccountType, {
    error: "User account type is required",
  }),
  legalEntityName: z.string().optional(),
  termsAccepted: z.boolean({
    error: "Terms and conditions acceptance is required",
  }),
  whatsAppNotificationAllow: z.boolean({
    error: "WhatsApp notification preference is required",
  }),
  isEmailVerified: z
    .boolean({
      error: "Email verification status is required",
    })
    .optional(),
  isPhoneVerified: z
    .boolean({
      error: "Phone verification status is required",
    })
    .optional(),
  kycStatus: z
    .enum(kycStatus, { error: "Invalid KYC status provided" })
    .optional(),
  status: AccountStatusEnum.optional(),
  gender: GenderEnum.optional(),
  password: z
    .string({
      error: "Password is required",
    })
    .min(6, { message: "Password must be at least 6 characters long" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .max(20, { message: "Password must be at most 20 characters long" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must contain at least one special character",
    }),

  relationshipManagerId: z.number().optional(),

  // totalInvestment: z.string({
  //     error: "Total investment value is required",
  // }).regex(/^\d+(\.\d{1,2})?$/, { message: "Total investment must be a valid number format" }),
});

const nonIndividualUserTypes = ["TRUST", "CORPORATE", "HUF", "LLP", "PARTNERSHIP_FIRM"] as const;

export const createNewCustomerSchema = createNewCustomerSchemaBase.refine(
  (data) => {
    if ((nonIndividualUserTypes as readonly string[]).includes(data.userType)) {
      return typeof data.legalEntityName === "string" && data.legalEntityName.trim().length > 0;
    }
    return true;
  },
  { message: "Legal entity name is required for Trust, Corporate, HUF, LLP, or Partnership Firm", path: ["legalEntityName"] }
);

export const updateCustomerProfileSchema = createNewCustomerSchemaBase.partial().refine(
  (data) => {
    const userType = data.userType;
    if (!userType || !(nonIndividualUserTypes as readonly string[]).includes(userType)) return true;
    return typeof data.legalEntityName === "string" && data.legalEntityName.trim().length > 0;
  },
  { message: "Legal entity name is required for Trust, Corporate, HUF, LLP, or Partnership Firm", path: ["legalEntityName"] }
);

export const createBankAccountSchema = z.object({
  accountHolderName: z.string().min(1, "Account holder name is required"),
  bankAccountType: z.string().min(1, "Bank account type is required"),
  accountNumber: z
    .number()
    .int()
    .positive("Account number must be a positive integer"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  bankName: z.string().min(1, "Bank name is required"),
  branch: z.string().min(1, "Branch name is required"),

  // Optional flags with defaults
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

export const updateBackAccountBankAccountSchema =
  createBankAccountSchema.partial();

// Enums (define these based on your app logic)
export const DepositoryNameEnum = z.enum(["NSDL", "CDSL"]);
export const DematAccountTypeEnum = z.enum(["SOLO", "JOINT"]);

export const createDematAccountSchema = z.object({
  // Depository info
  depositoryName: DepositoryNameEnum,
  dpId: z.string().min(1, "DP ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  accountType: DematAccountTypeEnum,
  depositoryParticipantName: z
    .string()
    .min(1, "Depository participant name is required"),

  // PAN details
  primaryPanNumber: z
    .string()
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN number format"),
  sndPanNumber: z
    .string()
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN number format")
    .optional(),
  trdPanNumber: z
    .string()
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN number format")
    .optional(),
  accountHolderName: z.string().min(1, "Account holder name is required"),

  // Status flags
  isPrimary: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

export const updateDematAccountSchema = createDematAccountSchema.partial();

export const createAddressSchema = z.object({
  // Address lines
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  line3: z.string().optional(),

  // Location details
  postOffice: z.string().min(1, "Post office is required"),
  cityOrDistrict: z.string().min(1, "City or district is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Invalid PIN code format (must be 6 digits)"),
  country: z.string().min(1, "Country is required"),

  // Full address
  fullAddress: z.string().min(1, "Full address is required"),
});

export const createPanDetailsSchema = z.object({
  // Name details as per PAN
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),

  // PAN card details
  panCardNo: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  gender: GenderEnum,

  // Verification status
  isVerified: z.boolean().default(false),
  verifyDate: z.coerce.date(), // coerces string → Date
});

export const updatePanDetailsSchema = createPanDetailsSchema.partial();

export const createAadhaarDetailsSchema = z.object({
  // Name details as per Aadhaar
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),

  // Father’s name for verification
  fatherName: z.string().min(1, "Father’s name is required"),

  // Aadhaar details
  aadhaarNo: z
    .string()
    .regex(/^[2-9]{1}[0-9]{11}$/, "Invalid Aadhaar number (must be 12 digits)"),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format"),
  gender: GenderEnum,
  image: z.string("add card image"),

  // Verification status
  isVerified: z.boolean().default(false),
  verifyDate: z.coerce.date(),
});

export const updateAadhaarDetailsSchema = createAadhaarDetailsSchema.partial();

export const createPersonalInfoSchema = z.object({
  // Signature
  signatureUrl: z.url("Signature URL must be a valid URL").optional(),

  // Personal info
  maritalStatus: z.string().min(1, "Marital status is required"),
  occupationType: z.string().min(1, "Occupation type is required"),
  annualGrossIncome: z.string().min(1, "Annual gross income is required"),
  fatherOrSpouseName: z.string().min(1, "Father or spouse name is required"),
  mothersName: z.string().min(1, "Mother’s name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  maidenName: z.string().optional(),
  residentialStatus: z.string().min(1, "Residential status is required"),
  qualification: z.string().min(1, "Qualification is required"),
  politicallyExposedPerson: z.string().optional(),
});

export const updatePersonalInfoSchema = createPersonalInfoSchema.partial();

export const customerMobileUpdateRequestSchema = z.object({
  mobile: z
    .string({ error: "Mobile number is required" })
    .min(10, { message: "Mobile number must be at least 10 digits long" })
    .max(14, { message: "Mobile number must be at most 14 digits long" }),
  newWhatsAppNo: z
    .string({ error: "WhatsApp number is required" })
    .min(10, { message: "WhatsApp number must be at least 10 digits long" })
    .max(14, { message: "WhatsApp number must be at most 14 digits long" })
    .optional(),
});

export const customerMobileSendOtpRequestSchema = z.object({
  mobile: z
    .string({ error: "Mobile number is required" })
    .min(10, { message: "Mobile number must be at least 10 digits long" })
    .max(14, { message: "Mobile number must be at most 14 digits long" }),
});

export const customerMobileVerifyRequestSchema = z.object({
  mobile: z
    .string({ error: "Mobile number is required" })
    .min(10, { message: "Mobile number must be at least 10 digits long" })
    .max(14, { message: "Mobile number must be at most 14 digits long" }),
  otp: z.string({ error: "OTP is required" }).min(4, {
    message: "OTP must be at least 4 characters long",
  }),
  token: z.string({ error: "Token is required" }).min(1, {
    message: "Token must be at least 1 character long",
  }),
});

export const customerWhatsAppPreferenceSchema = z.object({
  enableWhatsApp: z.boolean({
    error: "WhatsApp preference is required",
  }),
});

export * from "./corporateKyc.schema";
