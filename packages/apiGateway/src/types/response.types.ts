import type { ROLES } from "../core/constants/role";
import type {
  AadhaarCard,
  AccountStatus,
  Address,
  BankAccount,
  CustomerUserType,
  DematAccount,
  Gender,
  KycStatus,
  PanCard,
  SigninWith,
} from "./Customer_assets.type";

type Role = (typeof ROLES)[number];

export type BaseResponseData<T = undefined> = {
  statusCode: number;
  success: boolean;
  message: string;
  responseData: T;
};

export type DashboardMetric = {
  total: number;
  currentWindow: number;
  previousWindow: number;
  trendPct: number;
};

export type DashboardRateMetric = DashboardMetric & {
  ratePct: number;
  totalUsers: number;
};

export type DashboardOverviewCounts = {
  totalCustomers: number;
  kycCompleted: number;
  kycPending: number;
  totalRfq: number;
  totalLeads: number;
  bondsAllowForPurchase: number;
};

export type DashboardSummaryPayload = {
  overview: DashboardOverviewCounts;
  activeLeads: DashboardMetric;
  completedProjects: DashboardMetric;
  userDropRate: DashboardRateMetric;
  userGainRate: DashboardRateMetric;
};

export type DashboardSummaryResponse =
  BaseResponseData<DashboardSummaryPayload>;
export type SalesPerformancePoint = {
  date: string;
  current: number;
  prev: number;
};
export type SalesPerformanceResponse = BaseResponseData<{
  rangeDays: number;
  data: SalesPerformancePoint[];
}>;

export type CrmUsersSummaryResponse = BaseResponseData<{
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  salesUsers: number;
}>;

export type LeadSourceSummary = {
  source:
    | "WEBSITE"
    | "REFERRAL"
    | "SOCIAL"
    | "ADVERTISEMENT"
    | "EVENT"
    | "COLD_CALL"
    | "EMAIL"
    | "OTHER";
  count: number;
};
export type LeadSourceSummaryResponse = BaseResponseData<LeadSourceSummary[]>;
// auth/login-with-otp
export type LoginWithOtpDataResponse = BaseResponseData<{
  token: string;
}>;
// auth/verify-otp
export type OtpVerifyDataResponse = BaseResponseData<{
  token: string;
  id: number;
  email: string;
  name: string;
  phoneNo: string;
  avatar: string;
  role: Role;
}>;
// /session
export type UserSessionDataResponse = BaseResponseData<{
  id: number;
  email: string;
  name: string;
  phoneNo: string;
  avatar: string;
  role: Role;
}>;

//CRM USERS TYPES
// schema of get,create and update crm api of data users profile
export type CrmUserBase = {
  id: number;
  name: string;
  email: string;
  phoneNo: string;
  avatar: string;
  lastLogin: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
  accountStatus: AccountStatus;
  createdBy: number;
};

export type CrmUserAccountStatus = "SUSPENDED" | "ACTIVE";

export type CrmUsersProfile = CrmUserBase & {};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// patch crm/users/:id
export type UpdateUserResponse = BaseResponseData<CrmUsersProfile>;

// post crm/users
export type CreateUsersResponse = BaseResponseData<CrmUserBase>;

// GET crm/users/:id
export type UserByIdResponse = BaseResponseData<CrmUserBase>;

// delete crm/users/:id
export type DeleteUserResponse = BaseResponseData<boolean>;

// GET /crm/users (paginated list)
export type FindManyUsersResponse = BaseResponseData<{
  data: CrmUsersProfile[];
  meta: PaginationMeta;
}>;

//CRM CUSTOMER TYPES
//BASE MODEL

// Enums
export type CustomerKycStatus = "PENDING" | "APPROVED" | "REJECTED";

// Base Model
export type CustomerBase = {
  id: number;
  userName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  emailAddress: string;
  phoneNo: string;
  kycStatus: CustomerKycStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: number | null;
};

// Nested Models Customer Pan Card
export type CustomerPanCard = {
  panCardNo: string;
};

export type CustomerUtility = {
  accountStatus: CrmUserAccountStatus;
  lastLogin: string | null;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
};

// Extended Profile
export type CustomerProfile = CustomerBase & {
  panCard: CustomerPanCard;
  utility: CustomerUtility;
  userType?: CustomerUserType;
  kraStatus?: string;
  /** Current KYC step name from kyc_dump (e.g. "Identity Validation", "Personal Details", "100%", "Not Started") */
  currentKycStepName?: string;
};

//crm/customers?page=1&accountStatus=ACTIVE&kycStatus=PENDING
export type GetCustomerResponse = BaseResponseData<{
  data: CustomerProfile[];
  meta: PaginationMeta;
}>;

// Enums / Literal Types

// Customer Utility
export type CustomeredUtility = {
  accountStatus: AccountStatus;
  id: number;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  signinWith: SigninWith;
  termsAccepted: boolean;
  lastLogin: string | null; // ISO or null
  whatsAppNotificationAllow: boolean;
};

export type DetailCustomerUtility = {
  id: number;
  accountStatus: CrmUserAccountStatus; // adjust enums as per schema
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  signinWith: SigninWith; // extend if needed
  termsAccepted: boolean;
  lastLogin: string | null; // ISO string or null
  whatsAppNotificationAllow: boolean;
  relationshipManager: CrmUsersProfile | null;
};
// Customer By ID Payload
export type CustomerByIdPayload = {
  aadhaarCard: AadhaarCard | null;
  bankAccounts: BankAccount[];
  currentAddress: Address | null;
  dematAccounts: DematAccount[];
  panCard: PanCard | null;
  permanentAddress: Address | null;
  personalInformation: PersonalInfo | null;
  riskProfile: {
    id: number;
    data: {
      ans: string;
      opt: Array<string>;
      qus: string;
      index: number;
    }[];
  };

  userName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  legalEntityName: string | null;
  emailAddress: string;
  phoneNo: string;
  whatsAppNo: string | null;
  gender: Gender;
  userType: CustomerUserType;
  kycStatus: KycStatus;
  kraStatus: string;
  kycProgress?: {
    hasStarted: boolean;
    step: number;
    complete: boolean;
  };
  /** True when KYC was completed using existing KRA records (not full Aadhaar flow). */
  useKraKyc?: boolean;

  verifyDate: string | null;
  avatar: string | null;
  VerifiedBy: number | null;
  createdBy: number | null;
  createdAt: string; // ISO Date
  id: number;
  updatedAt: string; // ISO
  isAFatcaCustomer: boolean;
  allowSEBITerms: boolean;
  kycSubmitDate: string | null;
  isAPep: boolean;
  utility: DetailCustomerUtility;
};

interface PersonalInfo {
  /// Signature image URL
  SignatureUrl?: string;
  dateOfBirth?: string;
  signPdfUrl?: string;

  /// Personal info
  maritalStatus?: string;
  occupationType?: string;
  annualGrossIncome?: string;
  fatherOrSpouseName?: string;
  relationshipWithPerson?: string;
  mothersName?: string;
  nationality?: string;
  maidenName?: string;
  residentialStatus?: string;
  qualification?: string;
  politicallyExposedPerson?: string;
}

// GET /crm/customers/:id
export type GetCustomerResponseById = BaseResponseData<CustomerByIdPayload>;

// DELETE /crm/customer/:id
export type DeleteCustomerResponse = BaseResponseData<boolean>;

// POST /crm/customers
export type CreateCustomerPayload = {
  id: number;
  userName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  emailAddress: string;
  phoneNo: string;
  whatsAppNo: string | null;
  avatar: string | null;
  userType: CustomerUserType;
  kycStatus: KycStatus;
  VerifiedBy: number | null;
  customersAuthDataModelId: number;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
  createdBy: number | null;

  // Optional linked entity IDs (nullable if not created yet)
  aADHAARCardModelId: number | null;
  panCardModelId: number | null;
  customerPersonalInfoModelId: number | null;
  currentAddressModelId: number | null;
  permanentAddressModelId: number | null;
};

// CREATE Customer Response
export type CreateCustomerResponse = BaseResponseData<CreateCustomerPayload>;

//PATCH /crm/customer/:id
export type UpdateCustomerPayload = {
  id: number;
  userName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  gender: Gender;
  emailAddress: string;
  phoneNo: string;
  whatsAppNo: string | null;
  avatar: string | null;
  userType: CustomerUserType;
  kycStatus: KycStatus;
  VerifiedBy: number | null;
  customersRiskProfileModelId: number | null;
  customersAuthDataModelId: number;
  createdAt: string; // ISO Date
  updatedAt: string;
  createdBy: number | null;
  aADHAARCardModelId: number | null;
  panCardModelId: number | null;
  customerPersonalInfoModelId: number | null;
  currentAddressModelId: number | null;
  permanentAddressModelId: number | null;
};

export type UpdateCustomerResponse = BaseResponseData<UpdateCustomerPayload>;

// Corporate KYC (nested types for response)
export type CorporateKycBankAccountResponse = {
  id: number;
  accountHolderName: string;
  accountNumber: string;
  branch?: string;
  bankName: string;
  ifscCode: string;
  bankProofFileUrls: string[];
  isPrimaryAccount: boolean;
};

export type CorporateKycDematAccountResponse = {
  id: number;
  depository: string;
  accountType?: string;
  dpId: string;
  clientId: string;
  accountHolderName: string;
  dematProofFileUrl?: string;
  isPrimary: boolean;
};

export type CorporateKycDirectorResponse = {
  id: number;
  fullName: string;
  pan?: string;
  panCopyFileUrl?: string;
  aadharCopyFileUrl?: string;
  passportPhotoFileUrl?: string;
  pepDeclaration?: string;
  designation?: string;
  din?: string;
  email?: string;
  mobile?: string;
};

export type CorporateKycPromoterResponse = CorporateKycDirectorResponse;

export type CorporateKycPartnerResponse = CorporateKycDirectorResponse;

export type CorporateKycTrusteeResponse = CorporateKycDirectorResponse;

export type CorporateKycAuthorisedSignatoryResponse = {
  id: number;
  fullName: string;
  pan: string;
  signatureFileUrl?: string;
  panCopyFileUrl?: string;
  aadharCopyFileUrl?: string;
  passportPhotoFileUrl?: string;
  pepDeclaration?: string;
  designation?: string;
  din?: string;
  email: string;
  mobile?: string;
};

export type CorporateKycResponse = {
  id: number;
  customerId: number;
  entityName: string;
  dateOfCommencementOfBusiness?: string;
  countryOfIncorporation?: string;
  panCopyFileUrl?: string;
  entityConstitutionType?: string;
  otherConstitutionType?: string;
  dateOfIncorporation?: string;
  placeOfIncorporation?: string;
  panNumber?: string;
  cinOrRegistrationNumber?: string;
  correspondenceFullAddress?: string;
  correspondenceLine1?: string;
  correspondenceLine2?: string;
  correspondenceLine3?: string;
  correspondenceCity?: string;
  correspondenceDistrict?: string;
  correspondencePinCode?: string;
  correspondenceState?: string;
  correspondenceAddressProofType?: string;
  correspondenceAddressProofCopyUrl?: string;
  registeredFullAddress?: string;
  registeredLine1?: string;
  registeredLine2?: string;
  registeredLine3?: string;
  registeredCity?: string;
  registeredDistrict?: string;
  registeredPinCode?: string;
  registeredState?: string;
  registeredAddressProofType?: string;
  registeredAddressProofCopyUrl?: string;
  balanceSheetCopyUrl?: string;
  certificateOfIncorporationUrl?: string;
  memorandumCopyUrl?: string;
  boardResolutionCopyUrl?: string;
  gstCopyUrl?: string;
  clientMasterHoldingCopyUrl?: string;
  annualIncome?: string;
  shareHoldingPatternCopyUrl?: string;
  certificateOfCommencementOfBizUrl?: string;
  articlesOfAssociationUrl?: string;
  gstNumber?: string;
  directorsListCopyUrl?: string;
  powerOfAttorneyCopyUrl?: string;
  documentsType?: string;
  /** Customer's existing KYC document held by another KRA. */
  existingKycFileUrl?: string;
  /** Signed declaration authorising the reuse of the existing KYC. */
  useExistingKycDeclarationUrl?: string;
  fatcaApplicable: boolean;
  fatcaEntityName?: string;
  fatcaCountryOfIncorporation?: string;
  fatcaEntityType?: string;
  fatcaClassification?: string;
  giin?: string;
  taxResidencyOfEntity?: string;
  declarationByAuthorisedSignatory: boolean;
  bankAccounts: CorporateKycBankAccountResponse[];
  dematAccounts: CorporateKycDematAccountResponse[];
  directors: CorporateKycDirectorResponse[];
  promoters: CorporateKycPromoterResponse[];
  partners: CorporateKycPartnerResponse[];
  trustees: CorporateKycTrusteeResponse[];
  authorisedSignatories: CorporateKycAuthorisedSignatoryResponse[];
  createdAt: string;
  updatedAt: string;
  /**
   * Customer-level verification snapshot used by the CRM corporate-KYC form
   * to lock the bank + demat sections once the customer is KYC- or
   * KRA-verified. `isAccountsLocked` is the derived flag the UI checks;
   * `kycStatus` / `kraStatus` are exposed for richer messaging.
   */
  kycStatus?: string | null;
  kraStatus?: string | null;
  isAccountsLocked?: boolean;

  /**
   * S3 URL + timestamp of the most recently generated 19-page corporate
   * KYC PDF snapshot. The CRM "Download last PDF" button reads
   * `lastGeneratedPdfUrl` directly; `lastGeneratedPdfAt` is shown next to
   * the button so operators can tell how stale the file is.
   */
  lastGeneratedPdfUrl?: string | null;
  lastGeneratedPdfAt?: string | null;
};

export type CorporateKycLastPdfResponseData = {
  lastGeneratedPdfUrl: string | null;
  lastGeneratedPdfAt: string | null;
};

export type SetCorporateKycLastPdfResponse = BaseResponseData<CorporateKycLastPdfResponseData>;

export type GetCorporateKycResponse = BaseResponseData<CorporateKycResponse | null>;
export type SaveCorporateKycResponse = BaseResponseData<CorporateKycResponse>;

/**
 * Returned by `POST /crm/customer/:id/corporate-kyc/verify`.
 *
 * `syncedSections` lists customer satellites that were created/updated from
 * the corporate KYC (e.g. "panCard", "currentAddress", "bankAccounts(+2)").
 * `skippedSections` lists satellites that already had data and were left
 * alone. `warnings` surfaces non-blocking pre-flight issues (missing PAN,
 * empty banks, KRA not yet verified) for the UI to display.
 */
export type VerifyCorporateCustomerPayload = {
  verified: true;
  syncedSections: string[];
  skippedSections: string[];
  warnings: string[];
  kycStatus: "VERIFIED";
  kraStatus: "VERIFIED";
  verifyDate: string;
};
export type VerifyCorporateCustomerResponse =
  BaseResponseData<VerifyCorporateCustomerPayload>;

/**
 * Responses for the CRM-initiated customer email / mobile OTP endpoints.
 *
 * The OTP is sent to the customer's registered address — the admin asks
 * the customer for the code and confirms via `verify*Otp`. `sentTo` is
 * a masked rendering (e.g. `+91 XXXXXX1234`, `so***@example.com`) safe
 * to display inside the dialog.
 */
export type CrmCustomerOtpSendPayload = {
  otpToken: string;
  sentTo: string;
};
export type CrmCustomerOtpSendResponse =
  BaseResponseData<CrmCustomerOtpSendPayload>;

export type CrmCustomerOtpVerifyPayload = {
  verified: boolean;
};
export type CrmCustomerOtpVerifyResponse =
  BaseResponseData<CrmCustomerOtpVerifyPayload>;

//CRM LEADS TYPES

export type SourceType =
  | "WEBSITE"
  | "REFERRAL"
  | "SOCIAL"
  | "ADVERTISEMENT"
  | "EVENT"
  | "COLD_CALL"
  | "EMAIL"
  | "OTHER";

export type StatusType =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "UNQUALIFIED"
  | "CONVERTED";

export type BondType =
  | "GOVERNMENT"
  | "CORPORATE"
  | "TAX_FREE"
  | "SOVEREIGN_GOLD_BOND"
  | "PSU"
  | "OTHER";

export type NewLeadPayload = {
  id: number;
  fullName: string;
  emailAddress: string;
  phoneNo: string;
  companyName: string;
  leadSource: SourceType;
  bondType: BondType;
  status: StatusType;
  exInvestmentAmount: number | null;
  note: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  assignTo?: CrmUsersProfile;
};

//POST /crm/lead
export type CreateNewLeadResponse = BaseResponseData<NewLeadPayload>;

//GET /crm/lead/:id
export type GetNewLeadByIdResponse = BaseResponseData<NewLeadPayload>;

//PUT /crm/lead/:id
export type UpdateNewLeadByIDResponse = BaseResponseData<NewLeadPayload>;

// DELETE /crm/lead/:id
export type DeleteNewLeadByIDResponse = BaseResponseData<boolean>;

export type Leads = NewLeadPayload;

// GET /crm/leads?page=1&search=t
export type FindLeadsResponse = BaseResponseData<{
  data: Leads[];
  meta: PaginationMeta;
}>;

//CRM FOLLOW UP

export type NewFollowUpPayload = {
  id: number;
  leadId: number;
  createdByName: string;
  createdByID: number;
  text: string;
  nextDate: string | null;
  createdAt: string; // ISO Date
  updatedAt: string; // ISO Date
};

export type CreateNewFollowUpResponse = BaseResponseData<NewFollowUpPayload>;

// /crm/lead/followup/:leadId
export type GetAllFollowUpsByIdResponse = BaseResponseData<
  NewFollowUpPayload[]
>;

///crm/lead/followup/:followId
export type DeleteFollowUpByIdResponse = BaseResponseData<boolean>;

///crm/lead/followup/:followUpId
export type UpdateFollowUpByIdResponse = BaseResponseData<NewFollowUpPayload>;
