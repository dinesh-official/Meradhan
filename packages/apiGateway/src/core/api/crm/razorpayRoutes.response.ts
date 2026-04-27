import type { BaseResponseData } from "../../../types/response.types";

export type RazorpayRouteAccountRecord = {
  id: number;
  razorpayAccountId: string;
  data: unknown;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RazorpayRouteSettlementAccountRecord = {
  id: number;
  razorpayAccountId: string;
  accountNumber: string;
  ifscCode: string;
  beneficiaryName: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ListRazorpayRouteSettlementAccountsResponse = BaseResponseData<{
  records: RazorpayRouteSettlementAccountRecord[];
}>;

export type CreateRazorpayRouteSettlementAccountPayload = {
  accountNumber: string;
  ifscCode: string;
  beneficiaryName: string;
  isDefault?: boolean;
};

export type CreateRazorpayRouteSettlementAccountResponse = BaseResponseData<{
  record: RazorpayRouteSettlementAccountRecord;
}>;

export type UpdateRazorpayRouteSettlementAccountPayload = Partial<
  Omit<CreateRazorpayRouteSettlementAccountPayload, "isDefault">
> & {
  isDefault?: boolean;
};

export type UpdateRazorpayRouteSettlementAccountResponse = BaseResponseData<{
  record: RazorpayRouteSettlementAccountRecord;
}>;

export type DeleteRazorpayRouteSettlementAccountResponse = BaseResponseData<{
  success: true;
}>;

export type GetRazorpayRouteAccountsResponse = BaseResponseData<{
  accounts: RazorpayRouteAccountRecord[];
}>;

export type GetRazorpayRouteAccountByIdResponse = BaseResponseData<{
  account: RazorpayRouteAccountRecord;
}>;

export type CreateRazorpayRouteAccountPayload = {
  email: string;
  phone: string;
  reference_id?: string;
  legal_business_name: string;
  business_type: string;
  contact_name: string;
  isDefault?: boolean;
  profile: {
    category: string;
    subcategory: string;
    addresses: {
      registered: {
        street1?: string;
        street2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  };
  legal_info: {
    pan?: string;
    gst?: string;
  };
};

export type CreateRazorpayRouteAccountResponse = BaseResponseData<{
  account: unknown;
  record: RazorpayRouteAccountRecord;
}>;

export type UpdateRazorpayRouteAccountPayload = {
  legal_business_name: string;
  contact_name: string;
  isDefault?: boolean;
  profile: {
    category: string;
    subcategory: string;
    addresses: {
      registered: {
        street1?: string;
        street2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    };
  };
  legal_info: {
    pan?: string;
    gst?: string;
  };
};

export type UpdateRazorpayRouteAccountResponse = BaseResponseData<{
  account: unknown;
  record: RazorpayRouteAccountRecord;
}>;

