import type { BaseResponseData } from "./base";

export type ServiceRequestType = "CLOSURE";
export type ServiceRequestStatus = "PENDING" | "DONE" | "REJECTED";

export type ServiceRequestReason = {
  id: number;
  type: ServiceRequestType;
  text: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CustomerServiceRequest = {
  id: number;
  type: ServiceRequestType;
  reasonId: number | null;
  reasonRemark: string | null;
  status: ServiceRequestStatus;
  processedAt: string | null;
  processedBy: number | null;
  createdAt: string;
  updatedAt: string;
  reason?: { id: number; text: string } | null;
};

export type CrmServiceRequestRow = CustomerServiceRequest & {
  customer: {
    id: number;
    firstName: string;
    middleName: string | null;
    lastName: string;
    emailAddress: string;
    phoneNo: string | null;
  };
  processedByName?: string | null;
};

export type ListServiceRequestsResponse = BaseResponseData<{
  data: CrmServiceRequestRow[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}>;

export type ServiceRequestReasonsResponse = BaseResponseData<ServiceRequestReason[]>;
export type CreateServiceRequestResponse = BaseResponseData<CustomerServiceRequest>;
export type MyServiceRequestsResponse = BaseResponseData<CustomerServiceRequest[]>;
export type ServiceRequestActionResponse = BaseResponseData<CustomerServiceRequest>;
