import apiGateway from "@root/apiGateway";
import { TCustomerFilterListHook } from "./useCustomerListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { appSchema } from "@root/schema";

export function resolveCustomerListRelationshipManagerId(
  role: string | undefined,
  userId: string | undefined,
  rmAssignment: string,
): number | undefined {
  if (role === "RELATIONSHIP_MANAGER" && userId) {
    const mine = Number(userId);
    return Number.isNaN(mine) ? undefined : mine;
  }
  if (rmAssignment === "ALL") return undefined;
  if (rmAssignment === "MY_RM" && userId) {
    const mine = Number(userId);
    return Number.isNaN(mine) ? undefined : mine;
  }
  const selected = Number(rmAssignment);
  return Number.isNaN(selected) ? undefined : selected;
}

export function buildCustomerListQueryParams(
  state: TCustomerFilterListHook["state"],
  cookies: { role?: string; userId?: string },
) {
  const relationshipManagerId = resolveCustomerListRelationshipManagerId(
    cookies.role,
    cookies.userId,
    state.rmAssignment,
  );

  return {
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
}

export const useFilterListApiHook = (filterStatus: TCustomerFilterListHook) => {
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );
  const { cookies } = useAppCookie();
  const state = filterStatus.state;

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
      cookies.role,
    ],
    queryFn: async () => {
      const params = buildCustomerListQueryParams(state, cookies);
      const response = await customerApi.getCustomer(params);
      return response.data
    },
  });

  return { fetchCustomerQuery };
};
