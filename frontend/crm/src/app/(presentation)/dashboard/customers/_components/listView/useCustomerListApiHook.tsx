import apiGateway from "@root/apiGateway";
import { TCustomerFilterListHook } from "./useCustomerListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { appSchema } from "@root/schema";

export const useFilterListApiHook = (filterStatus: TCustomerFilterListHook) => {
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );
  const state = filterStatus.state;

  const fetchCustomerQuery = useQuery({
    queryKey: [
      "searchCustomersList",
      state.accountKycStatus,
      state.accountStatus,
      state.paginationIndex,
      state.search,
    ],
    queryFn: async () => {
      const params = {
        page: state.paginationIndex.toString(),
        search: state.search || undefined,
        accountStatus:
          state.accountStatus === "ALL"
            ? undefined
            : (state.accountStatus as z.infer<
                typeof appSchema.customer.findManyCustomerSchema
              >["accountStatus"]),
        kycStatus:
          state.accountKycStatus === "ALL"
            ? undefined
            : (state.accountKycStatus as z.infer<
                typeof appSchema.customer.findManyCustomerSchema
              >["kycStatus"]),
      };
      const response = await customerApi.getCustomer(params);
      return response.data
    },
  });

  return { fetchCustomerQuery };
};
