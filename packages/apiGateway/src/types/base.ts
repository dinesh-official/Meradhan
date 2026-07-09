import type { ROLES } from "../core/constants/role";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type BankAccountType = "SAVING" | "CURRENT" | "SALARY";
export type DepositoryName = "NSDL" | "CDSL";
export type DematAccountType = "SINGLE" | "JOINT";
export type AccountStatus = "ACTIVE" | "SUSPENDED";
export type SigninWith = "CREDENTIALS" | "GOOGLE" | "GITHUB" | "APPLE";
export type CustomerUserType =
  | "INDIVIDUAL"
  | "INDIVIDUAL_NRI_NRO"
  | "TRUST"
  | "CORPORATE"
  | "HUF"
  | "LLP"
  | "PARTNERSHIP_FIRM";

export type KycStatus = "PENDING" | "VERIFIED" | "REJECTED" | "RE_KYC";
export type CRMRole = (typeof ROLES)[number];

export type AadhaarCard = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fatherName: string;
  aadhaarNo: string;
  dateOfBirth: string;
  gender: Gender;
  image: string;
  isVerified: boolean;
  verifyDate: string;
  createdAt: string;
  updatedAt: string;
};

// Bank Account
export type BankAccount = {
  id: number;
  accountHolderName: string;
  bankAccountType: BankAccountType;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  isPrimary: boolean;
  isVerified: boolean;
  customerProfileDataModelId: number;
  verifyDate: string;
  createdAt: string;
  updatedAt: string;
};

// Address
export type Address = {
  id: number;
  line1: string;
  line2: string | null;
  line3: string | null;
  postOffice: string | null;
  cityOrDistrict: string;
  state: string;
  pinCode: string;
  country: string;
  fullAddress: string;
  createdAt: string;
  updatedAt: string;
};

// Demat Account
export type DematAccount = {
  id: number;
  depositoryName: DepositoryName;
  dpId: string;
  clientId: string;
  accountType: DematAccountType;
  depositoryParticipantName: string;
  primaryPanNumber: string;
  sndPanNumber: string | null;
  trdPanNumber: string | null;
  accountHolderName: string;
  isPrimary: boolean;
  isVerified: boolean;
  verifyDate: string;
  customerProfileDataModelId: number;
  createdAt: string;
  updatedAt: string;
};

// PAN Card
export type PanCard = {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  panCardNo: string;
  dateOfBirth: string;
  gender: Gender;
  isVerified: boolean;
  verifyDate: string;
  createdAt: string;
  updatedAt: string;
};

export type BaseResponseData<T = undefined> = {
  statusCode: number;
  success: boolean;
  message: string;
  responseData: T;
};

export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
