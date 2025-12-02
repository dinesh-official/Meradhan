export interface CrmOrder {
  id: number;
  orderNumber: string;
  bondName: string;
  quantity: number;
  faceValue: string;
  totalAmount: string;
  status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED";
  bondDetails: any;
  createdAt: string;
  customerProfile: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNo?: string;
  };
}

export interface GetCrmOrdersResponse {
  responseData: {
    data: CrmOrder[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
