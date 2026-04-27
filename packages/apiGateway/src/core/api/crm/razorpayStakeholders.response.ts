import type { BaseResponseData } from "../../../types/response.types";

export type RazorpayRouteStakeholderRecord = {
  id: number;
  razorpayStakeholderId: string;
  razorpayAccountId: string;
  userId: number | null;
  entity: string;
  name: string;
  email: string | null;
  kycPan: string | null;
  relationship: unknown;
  phone: unknown;
  notes: unknown;
  kyc: unknown;
  addresses: unknown;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};

export type ListRazorpayRouteStakeholdersResponse = BaseResponseData<{
  stakeholders: RazorpayRouteStakeholderRecord[];
}>;

export type CreateRazorpayStakeholderPayload = {
  userId?: number;
  name: string;
  email: string;
  addresses: {
    residential: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  kyc: { pan: string };
  notes?: Record<string, string>;
};

export type CreateRazorpayRouteStakeholderResponse = BaseResponseData<{
  stakeholder: unknown;
  record: RazorpayRouteStakeholderRecord;
}>;

export type UpdateRazorpayStakeholderPayload = {
  userId?: number;
  addresses: {
    residential: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  kyc: { pan: string };
};

export type UpdateRazorpayRouteStakeholderResponse = BaseResponseData<{
  stakeholder: unknown;
  record: RazorpayRouteStakeholderRecord;
}>;

