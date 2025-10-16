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
  createdBy: number;
};

export type CrmUserAccountStatus = "SUSPENDED" | "ACTIVE";

export type CrmUsersProfile = CrmUserBase & {
  accountStatus: CrmUserAccountStatus;
  createdBy: number | null;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// patch crm/users/:id
export type UpdateUserResponse = BaseResponseData<CrmUserBase>;

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
export type CustomerKycStatus = "PENDING" | "VERIFIED" | "REJECTED";

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
};

// Extended Profile
export type CustomerProfile = CustomerBase & {
  panCard: CustomerPanCard;
  utility: CustomerUtility;
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

// Customer By ID Payload
export type CustomerByIdPayload = {
  aadhaarCard: AadhaarCard | null;
  bankAccounts: BankAccount[];
  currentAddress: Address | null;
  dematAccounts: DematAccount[];
  panCard: PanCard | null;
  permanentAddress: Address | null;
  personalInformation: unknown | null;

  userName: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  emailAddress: string;
  phoneNo: string;
  whatsAppNo: string | null;
  gender: Gender;
  userType: CustomerUserType;
  kycStatus: KycStatus;

  avatar: string | null;
  VerifiedBy: number | null;
  createdBy: number | null;

  id: number;
  updatedAt: string; // ISO

  utility: CustomerUtility;
};

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

//CRM LEADS TYPES

export type NewLeadPayload = {
  id: number;
  fullName: string;
  emailAddress: string;
  phoneNo: string;
  companyName: string;
  leadSource: string;
  bondType: string;
  status: string;
  exInvestmentAmount: number | null;
  note: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
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

export type CreateNewFollowUpResponse =
  BaseResponseData<NewFollowUpPayload>;

// /crm/lead/followup/:leadId
export type GetAllFollowUpsByIdResponse = 
BaseResponseData<NewFollowUpPayload[]>


///crm/lead/followup/:followId
export type DeleteFollowUpByIdResponse=BaseResponseData<boolean>

///crm/lead/followup/:followUpId
export type UpdateFollowUpByIdResponse = BaseResponseData<NewFollowUpPayload>