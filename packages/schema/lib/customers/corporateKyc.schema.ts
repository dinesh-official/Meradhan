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
// Keep "NO" for backward compatibility with older saved values.
// New UI uses "NA" (Not applicable).
export const PepDeclarationEnum = z.enum(["PEP", "RPEP", "NA", "NO"]);

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
  panCopyFileUrl: z.string().optional(),
  aadharCopyFileUrl: z.string().optional(),
  passportPhotoFileUrl: z.string().optional(),
  pepDeclaration: PepDeclarationEnum.optional(),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  mobile: z.string().optional(),
});

export const corporateKycPromoterSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Promoter full name is required"),
  pan: z.string().optional(),
  panCopyFileUrl: z.string().optional(),
  aadharCopyFileUrl: z.string().optional(),
  passportPhotoFileUrl: z.string().optional(),
  pepDeclaration: PepDeclarationEnum.optional(),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  mobile: z.string().optional(),
});

// LLP / Partnership firm partner – same shape as Director/Promoter so they
// share the NDML APP_ADDL_DATA pipeline (partners go in with rel-code "06").
export const corporateKycPartnerSchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Partner full name is required"),
  pan: z.string().optional(),
  panCopyFileUrl: z.string().optional(),
  aadharCopyFileUrl: z.string().optional(),
  passportPhotoFileUrl: z.string().optional(),
  pepDeclaration: PepDeclarationEnum.optional(),
  designation: z.string().optional(),
  din: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  mobile: z.string().optional(),
});

export const corporateKycAuthorisedSignatorySchema = z.object({
  id: z.number().optional(),
  fullName: z.string().min(1, "Full name is required"),
  pan: z.string().min(1, "PAN is required"),
  signatureFileUrl: z.string().optional(),
  panCopyFileUrl: z.string().optional(),
  aadharCopyFileUrl: z.string().optional(),
  passportPhotoFileUrl: z.string().optional(),
  pepDeclaration: PepDeclarationEnum.optional(),
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
  correspondenceLine3: z.string().optional(),
  correspondenceCity: z.string().optional(),
  correspondenceDistrict: z.string().optional(),
  correspondencePinCode: z.string().optional(),
  correspondenceState: z.string().optional(),
  correspondenceAddressProofType: z.string().optional(),
  correspondenceAddressProofCopyUrl: z.string().optional(),

  // Registered address
  registeredFullAddress: z.string().optional(),
  registeredLine1: z.string().optional(),
  registeredLine2: z.string().optional(),
  registeredLine3: z.string().optional(),
  registeredCity: z.string().optional(),
  registeredDistrict: z.string().optional(),
  registeredPinCode: z.string().optional(),
  registeredState: z.string().optional(),
  registeredAddressProofType: z.string().optional(),
  registeredAddressProofCopyUrl: z.string().optional(),

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

  // "Use existing KYC" declarations
  existingKycFileUrl: z.string().optional(),
  useExistingKycDeclarationUrl: z.string().optional(),

  // Attachments / verifications (uploads)
  termsAndConditionsUrl: z.string().optional(),

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
  partners: z.array(corporateKycPartnerSchema).default([]),
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
export type CorporateKycPartnerPayload = z.infer<
  typeof corporateKycPartnerSchema
>;
export type CorporateKycAuthorisedSignatoryPayload = z.infer<
  typeof corporateKycAuthorisedSignatorySchema
>;

export const CorporateKraPastExecutionEnum = z.enum([
  "MODIFY",
  "REGISTER",
  "NONE",
  "CBRICS_ONLY",
]);

export const triggerCorporateKraSchema = z.object({
  pastExecution: CorporateKraPastExecutionEnum,
  delayMs: z.number().int().nonnegative().optional(),
});

export type CorporateKraPastExecution = z.infer<typeof CorporateKraPastExecutionEnum>;
export type TriggerCorporateKraPayload = z.infer<typeof triggerCorporateKraSchema>;

/**
 * Payload for the CRM "Autofill from KRA" action on the corporate KYC form.
 *
 * The operator supplies the company PAN + Date of Incorporation (which NDML's
 * `panDownloadDetailsComplete` requires in lieu of a DOB). The backend uses
 * these to fetch the entity's current KRA record and return a partial form
 * patch the UI can merge into the open corporate-KYC form.
 */
export const autofillCorporateKraSchema = z.object({
  pan: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z]{3}[CHFATBLJGP][A-Z]\d{4}[A-Z]$/,
      "PAN must look like a non-individual PAN (e.g. ABCAA1234B)",
    ),
  /** Accepts ISO `YYYY-MM-DD` or `DD-MM-YYYY` / `DD/MM/YYYY`. */
  dateOfIncorporation: z
    .string()
    .trim()
    .min(1, "Date of incorporation is required")
    .refine(
      (v) =>
        /^\d{4}-\d{2}-\d{2}/.test(v) ||
        /^\d{2}[-/]\d{2}[-/]\d{4}$/.test(v),
      "Date of incorporation must be YYYY-MM-DD or DD-MM-YYYY",
    ),
});

export type AutofillCorporateKraPayload = z.infer<typeof autofillCorporateKraSchema>;

// ---------------------------------------------------------------------------
// Corporate KYC – E-Sign requests (CRM operator workflow)
// ---------------------------------------------------------------------------

export const ESignRequestStatusEnum = z.enum([
  "PENDING",
  "COMPLETED",
  "REJECTED",
]);

export type ESignRequestStatusValue = z.infer<typeof ESignRequestStatusEnum>;

/**
 * Body for `POST /corporate-kyc/e-sign-requests`. The CRM operator uploads a
 * PDF (`eSignDocumentUrl`) and picks one authorised signatory whose name +
 * (optional) contact details are snapshotted into the request row.
 */
export const createCorporateESignRequestSchema = z.object({
  eSignDocumentUrl: z
    .string()
    .trim()
    .min(1, "Please upload the document to be signed"),
  personName: z.string().trim().min(1, "Signatory name is required"),
  authorisedSignatoryId: z.number().int().positive().optional(),
  signatoryEmail: z
    .string()
    .trim()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  signatoryPan: z.string().trim().toUpperCase().optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type CreateCorporateESignRequestPayload = z.infer<
  typeof createCorporateESignRequestSchema
>;

/**
 * Body for `PATCH /corporate-kyc/e-sign-requests/:requestId`. The CRM
 * operator uploads the signed PDF (`signFileUrl`) and/or changes the status.
 * All fields are optional so the same endpoint handles "attach signed file",
 * "mark completed", "reject" etc.
 */
export const updateCorporateESignRequestSchema = z
  .object({
    status: ESignRequestStatusEnum.optional(),
    signFileUrl: z.string().trim().optional().or(z.literal("")),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine(
    (v) =>
      v.status !== undefined ||
      (v.signFileUrl !== undefined && v.signFileUrl !== "") ||
      v.notes !== undefined,
    "Pass at least one of: status, signFileUrl, notes",
  );

export type UpdateCorporateESignRequestPayload = z.infer<
  typeof updateCorporateESignRequestSchema
>;
