import type { BaseResponseData } from "../../../types/response.types";

export type CrmSavedProposalRow = {
  id: number;
  createdById: number;
  customerProfileId: number;
  isin: string;
  bondName: string;
  side: string;
  quantity: number;
  notes: string | null;
  data: unknown;
  createdAt: string;
  updatedAt: string;
};

export type CreateCrmSavedProposalResponse = BaseResponseData<{
  proposal: CrmSavedProposalRow;
}>;

export type ListCrmSavedProposalsResponse = BaseResponseData<{
  proposals: CrmSavedProposalRow[];
}>;

export type GetCrmSavedProposalResponse = BaseResponseData<{
  proposal: CrmSavedProposalRow;
}>;

export type DeleteCrmSavedProposalResponse = BaseResponseData<{
  success: true;
}>;

export type AutoCreateRfqFromProposalResponse = BaseResponseData<{
  rfq: unknown;
  redirectTo: string;
}>;

