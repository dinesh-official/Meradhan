import type { ROLES } from "../core/constants/role";

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

export type CrmUserAccountStatus ="SUSPENDED"| "ACTIVE";

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
