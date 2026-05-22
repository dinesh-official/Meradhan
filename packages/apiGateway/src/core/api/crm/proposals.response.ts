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
  status: string;
  failedNote: string | null;
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

export type QueueProposalProcessingResponse = BaseResponseData<{
  queued: boolean;
  id: number;
}>;

export type MarkWaitingForApprovalResponse = BaseResponseData<{
  success: boolean;
}>;

