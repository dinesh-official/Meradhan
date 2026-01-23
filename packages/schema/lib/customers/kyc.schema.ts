import z from "zod";

export const panVerifyInfoSchema = z.object({
  id: z.string().min(8, "Date of birth is required"),
  name: z.string().optional().default(""), // can be empty
  dob: z.string(), // can be empty
});

export const kycPanInfoDataSchema = z.object({
  panCardNo: z
    .string()
    .regex(
      /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
      "Invalid PAN format (e.g., ABCDE1234F)",
    )
    .min(10, "PAN must be 10 characters")
    .max(10, "PAN must be 10 characters"),
  dateOfBirth: z.string().min(8, "Date of birth is required"),
  firstName: z.string().min(1, "First name is required").trim(),
  middleName: z.string().optional().default(""), // can be empty
  lastName: z.string().optional().default(""), // can be empty
  checkTerms1: z.boolean().refine((val) => val === true, {
    message: "Please confirm you are not a PEP or related to one.",
  }),
  checkTerms2: z.boolean().refine((val) => val === true, {
    message:
      "Please confirm that you are not debarred from accessing or dealing in the securities market.",
  }),
  isFatca: z
    .boolean({
      error:
        "Please confirm that you are solely a tax resident of India (FATCA).",
    })
    .refine((val) => val === true, {
      message:
        "Please confirm that you are solely a tax resident of India (FATCA).",
    }),

  checkKycKraConsent: z.boolean().refine((val) => val === true, {
    message: "Please accept the consent to proceed.",
  }),

  confirmPanTimestamp: z.string().optional(),
  confirmAadhaarTimestamp: z.string().optional(),
  fetchedTimestamp: z.string().optional(),
});

export const kycAadhaarInfoDataSchema = z.object({
  // aadhaarCardNo: z
  //   .string()
  //   .regex(/^[0-9]{12}$/, "Aadhaar number must be 12 digits")
  //   .min(12, "Aadhaar number must be 12 digits")
  //   .max(12, "Aadhaar number must be 12 digits"),
  gender: z.string(),
  firstName: z.string().min(1, "First name is required").trim(),
  middleName: z.string().optional().default(""), // can be empty
  lastName: z.string().optional().default(""), // can be empty
  dateOfBirth: z.string().min(8, "Date of birth is required"),
  email: z.email("Invalid email address"),
});

export const selfieSignRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(), // can be empty
  lastName: z.string().optional().default(""), // can be empty
  confirmSelfieTimestamp: z.string().optional(),
});

export const personalInfoSchema = z.object({
  maritalStatus: z.string().min(1, "Marital status is required"),
  fatSpuName: z.string().min(1, "Father/Spouse name is required"),
  reelWithPerson: z.string().min(1, "Relationship with person is required"),
  qualification: z.string().min(1, "Qualification is required"),
  occupationType: z.string().min(1, "Occupation type is required"),
  annualGrossIncome: z.string().min(1, "Annual gross income is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  residentialStatus: z.string().min(1, "Residential status is required"),
  confirmPersonalInfoTimestamp: z.string().optional(),
  otherOccupationName: z.string().optional(),
}).superRefine((_data, _ctx) => {
  if (_data.occupationType === "Others") {
    if (!_data.otherOccupationName?.trim()) {
      _ctx.addIssue({
        code: "custom",
        message: "Please specify your occupation",
        path: ["otherOccupationName"],
      });
    }
    if (_data.otherOccupationName?.trim().length && _data.otherOccupationName?.trim().length > 30) {
      _ctx.addIssue({
        code: "custom",
        message: "Please specify your occupation in less than 30 characters",
        path: ["otherOccupationName"],
      });
    }
    // only alphabets allow not numbers or special characters
    if (_data.otherOccupationName?.trim().length && !/^[a-zA-Z]+$/.test(_data.otherOccupationName?.trim())) {
      _ctx.addIssue({
        code: "custom",
        message: "Numbers and special characters not allowed",
        path: ["otherOccupationName"],
      });
    }
  }
});

export const bankInfoSchema = z.object({
  bankAccountType: z.string().min(1, "Bank account type is required"),
  bankName: z.string().min(1, "Bank name is required"),
  branchName: z.string().min(1, "Branch name is required"),
  ifscCode: z
    .string()
    .min(1, "IFSC code is required")
    .min(11, "IFSC code must be 11 characters")
    .max(11, "IFSC code must be 11 characters")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),
  accountNumber: z
    .string({ error: "Account number is required" })
    .min(1, "Account number is required")
    .min(8, "Account number must be at least 8 digits")
    .max(18, "Account number cannot exceed 18 digits")
    .regex(/^[0-9]+$/, "Account number must contain digits only"),
  isDefault: z.boolean(),
  checkTerms: z.boolean().refine((val) => val === true, {
    message:
      "Authorization to verify your bank account via a ₹1 validation transfer is required.",
  }),
  beneficiary_name: z.string().min(1, "Beneficiary name is required"),
  confirmBankTimestamp: z.string().optional(),
  verifyTimestamp: z.string().optional(),
});
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export const dpAccountInfoSchema = z
  .object({
    depositoryName: z.enum(["CDSL", "NSDL"], {
      error: "Select a depository name",
    }),

    dpId: z.string(),

    beneficiaryClientId: z
      .string({
        error: "Beneficiary/Client ID is required",
      })
      .min(1, "Beneficiary/Client ID is required"),

    depositoryParticipantName: z.string().optional(),
    // .min(1, "Depository participant name is required"),

    //  pan numbers validation not here, handled separately
    panNumber: z
      .array(z.string())
      .nonempty("At least one PAN number is required")
      .refine(
        (arr) => {
          // If only one PAN is given, validate it normally
          if (arr.length === 1) {
            return panRegex.test(arr?.[0] || "");
          }

          // For multiple PANs:
          const allExceptLast = arr.slice(0, -1);
          const last = arr[arr.length - 1];

          // All except last must be valid
          const allValid = allExceptLast.every((v) => panRegex.test(v));
          // Last one may be empty (if user still typing) OR valid
          const lastValid = !last || panRegex.test(last);

          return allValid && lastValid;
        },
        {
          message:
            "All PAN numbers except the last one must be valid (e.g., ABCDE1234F)",
        },
      )
      .refine(
        (arr) => {
          const last = arr[arr.length - 1];
          return !last || panRegex.test(last);
        },
        { message: "Invalid format for last PAN number (e.g., ABCDE1234F)" },
      ),

    accountHolderName: z.string().min(1, "Account holder name is required"),
    accountType: z.enum(["SOLO", "JOINT"], {
      message: "Select an account type",
    }),

    isDefault: z.boolean(),
    isVerified: z.boolean().default(false),

    checkTerms: z.boolean().refine((val) => val === true, {
      message: "Authorization to verify Demat account details is required.",
    }),
    confirmDematTimestamp: z.string().optional(),
    verifyTimestamp: z.string().optional(),
  })
  .superRefine((_data, _ctx) => {
    if (_data.depositoryName === "NSDL") {
      if (!_data.dpId?.trim()) {
        _ctx.addIssue({
          code: "custom",
          message: "DP ID is required.",
          path: ["dpId"],
        });
      } else if (_data.dpId.length != 8) {
        _ctx.addIssue({
          code: "custom",
          message: "DP ID must be 8 digits.",
          path: ["dpId"],
        });
      }
      if (_data.beneficiaryClientId.length != 8) {
        _ctx.addIssue({
          code: "custom",
          message: "Beneficiary/Client ID must be 8 digits.",
          path: ["beneficiaryClientId"],
        });
      }
    } else if (_data.depositoryName === "CDSL") {
      if (_data.beneficiaryClientId.trim().length == 0) {
        _ctx.addIssue({
          code: "custom",
          message: "Beneficiary/Client ID is required.",
          path: ["beneficiaryClientId"],
        });
      }
      if (_data.beneficiaryClientId.length != 16) {
        _ctx.addIssue({
          code: "custom",
          message: "Beneficiary/Client ID must be 16 digits.",
          path: ["beneficiaryClientId"],
        });
      }
    }
  });

export const riskProfileDataSchema = z.array(
  z.object({
    index: z.number().int().nonnegative("Index must be a positive integer"),
    qus: z.string().min(1, "Question is required"),
    opt: z
      .array(z.string().min(1, "Option cannot be empty"))
      .nonempty("At least one option is required"),
    ans: z.string().min(1, "Answer is required"),
  }),
);
