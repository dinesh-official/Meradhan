import apiGateway from "@root/apiGateway";
import { TCustomerFilterListHook } from "./useCustomerListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { appSchema } from "@root/schema";

export const useFilterListApiHook = (filterStatus: TCustomerFilterListHook) => {
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );
  const { cookies } = useAppCookie();
  const state = filterStatus.state;

  const relationshipManagerId = (() => {
    if (state.rmAssignment === "ALL") return undefined;
    if (state.rmAssignment === "MY_RM" && cookies.userId) {
      const mine = Number(cookies.userId);
      return Number.isNaN(mine) ? undefined : mine;
    }
    const selected = Number(state.rmAssignment);
    return Number.isNaN(selected) ? undefined : selected;
  })();

  const fetchCustomerQuery = useQuery({
    queryKey: [
      "searchCustomersList",
      state.accountKycStatus,
      state.accountStatus,
      state.userType,
      state.rmAssignment,
      state.paginationIndex,
      state.search,
      cookies.userId,
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
        userType:
          state.userType === "ALL"
            ? undefined
            : (state.userType as z.infer<
                typeof appSchema.customer.findManyCustomerSchema
              >["userType"]),
        relationshipManagerId:
          relationshipManagerId && !Number.isNaN(relationshipManagerId)
            ? relationshipManagerId
            : undefined,
      };
      const response = await customerApi.getCustomer(params);
      return response.data
    },
  });

  return { fetchCustomerQuery };
};
