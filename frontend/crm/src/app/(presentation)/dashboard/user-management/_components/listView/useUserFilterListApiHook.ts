import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { TUserFilterListHook } from "./useUserFilterListHook";

export const useFilterListApiHook = (filterState: TUserFilterListHook) => {
  const usersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);
  const state = filterState.state;

  const fetchUserQuery = useQuery({
    queryKey: [
      "searchCRMUsers",
      state.paginationIndex,
      state.accountStatus,
      state.search,
      state.roleFilter,
    ],
    queryFn: async () => {
      const params = {
        page: state.paginationIndex.toString(),
        role:
          state.roleFilter !== "ALL"
            ? (state.roleFilter as z.infer<
                typeof appSchema.crm.user.findManyUserSchema
              >["role"])
            : undefined,
        search: state.search || undefined,
        status:
          state.accountStatus !== "ALL"
            ? (state.accountStatus as Partial<
                z.infer<typeof appSchema.crm.user.findManyUserSchema>["status"]
              >)
            : undefined,
      };

      const response = await usersApi.findUsers(params);
      return response.data;
    },
  });

  return { fetchUserQuery };
};
