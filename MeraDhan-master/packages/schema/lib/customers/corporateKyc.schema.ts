import { z } from "zod";

export const EntityConstitutionTypeEnum = z.enum([
  "PRIVATE_LIMITED",
  "PUBLIC_LIMITED",
  "OPC",
  "LLP",
  "PARTNERSHIP",
  "TRUST",
  "OTHER",
]);

export const CorporateEntityTypeEnum = z.enum([
  "ACTIVE_NFE",
  "PASSIVE_NFE",
  "FINANCIAL_INSTITUTION",
]);

export const DepositoryNameEnum = z.enum(["NSDL", "CDSL"]);

// Nested schemas for one-to-many relations
export const corporateKycBankAccountSchema = z.object({
  id: z.number().optional(),
  accountHolderName: z.string().min(1, "Account holder name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  branch: z.string().optional(),
  bankName: z.string().min(1, "Bank name is required"),
  ifscCode: z
    .string()
    .min(1, "IFSC code is required")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC must be 11 characters (e.g. SBIN0001234)"),
  bankProofFileUrls: z.array(z.string()).default([]),
  isPrimaryAccount: z.boolean().default(false),
});

export const corporateKycDematAccountSchema = z.object({
  id: z.number().optional(),
  depository: DepositoryNameEnum,
  accountType: z.string().optional(),
  dpId: z.string().min(1, "DP ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  accountHolderName: z.string().min(1, "Demat account holder name is required"),
  dematProofFileUrl: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const corporateKycDirectorSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Director full name is required"),
  pan: z.string().optional(),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  mobile: z.string().optional(),
});

export const corporateKycPromoterSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Promoter full name is required"),
  pan: z.string().optional(),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  mobile: z.string().optional(),
});

export const corporateKycAuthorisedSignatorySchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Full name is required"),
  pan: z.string().min(1, "PAN is required"),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  mobile: z.string().optional(),
});

export const createCorporateKycSchema = z.object({
  // Entity details
  entityName: z.string().min(1, "Entity name is required"),
  dateOfCommencementOfBusiness: z.string().optional(),
  countryOfIncorporation: z.string().optional(),
  panCopyFileUrl: z.string().optional(),
  entityConstitutionType: EntityConstitutionTypeEnum.optional(),
  otherConstitutionType: z.string().optional(),
  dateOfIncorporation: z.string().optional(),
  placeOfIncorporation: z.string().optional(),
  panNumber: z
    .union([
      z.string().length(0),
      z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "PAN must be 10 characters (e.g. AAAAA9999A)"),
    ])
    .optional(),
  cinOrRegistrationNumber: z.string().optional(),

  // Correspondence address
  correspondenceFullAddress: z.string().optional(),
  correspondenceLine1: z.string().optional(),
  correspondenceLine2: z.string().optional(),
  correspondenceCity: z.string().optional(),
  correspondenceDistrict: z.string().optional(),
  correspondencePinCode: z.string().optional(),
  correspondenceState: z.string().optional(),

  // Documents
  balanceSheetCopyUrl: z.string().optional(),
  certificateOfIncorporationUrl: z.string().optional(),
  memorandumCopyUrl: z.string().optional(),
  boardResolutionCopyUrl: z.string().optional(),
  gstCopyUrl: z.string().optional(),
  clientMasterHoldingCopyUrl: z.string().optional(),
  annualIncome: z.string().optional(),
  shareHoldingPatternCopyUrl: z.string().optional(),
  certificateOfCommencementOfBizUrl: z.string().optional(),
  articlesOfAssociationUrl: z.string().optional(),
  gstNumber: z.string().optional(),
  directorsListCopyUrl: z.string().optional(),
  powerOfAttorneyCopyUrl: z.string().optional(),
  documentsType: z.string().optional(),

  // FATCA
  fatcaApplicable: z.boolean().default(false),
  fatcaEntityName: z.string().optional(),
  fatcaCountryOfIncorporation: z.string().optional(),
  fatcaEntityType: CorporateEntityTypeEnum.optional(),
  fatcaClassification: z.string().optional(),
  giin: z.string().optional(),
  taxResidencyOfEntity: z.string().optional(),
  declarationByAuthorisedSignatory: z.boolean().default(false),

  // Nested arrays
  bankAccounts: z.array(corporateKycBankAccountSchema).default([]),
  dematAccounts: z.array(corporateKycDematAccountSchema).default([]),
  directors: z.array(corporateKycDirectorSchema).default([]),
  promoters: z.array(corporateKycPromoterSchema).default([]),
  authorisedSignatories: z.array(corporateKycAuthorisedSignatorySchema).default([]),
});

export const updateCorporateKycSchema = createCorporateKycSchema.partial();

export type CreateCorporateKycPayload = z.infer<typeof createCorporateKycSchema>;
export type UpdateCorporateKycPayload = z.infer<typeof updateCorporateKycSchema>;
export type CorporateKycBankAccountPayload = z.infer<
  typeof corporateKycBankAccountSchema
>;
export type CorporateKycDematAccountPayload = z.infer<
  typeof corporateKycDematAccountSchema
>;
export type CorporateKycDirectorPayload = z.infer<
  typeof corporateKycDirectorSchema
>;
export type CorporateKycPromoterPayload = z.infer<
  typeof corporateKycPromoterSchema
>;
export type CorporateKycAuthorisedSignatoryPayload = z.infer<
  typeof corporateKycAuthorisedSignatorySchema
>;
