import { useQuery } from "@tanstack/react-query";
import { TUserFilterListHook } from "./useUserFilterListHook";
import apiGateway, { ApiCallerClient } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { appSchema } from "@root/schema";
import z from "zod";

export const useFilterListApiHook = (filterState: TUserFilterListHook) => {
  const usersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

  const fetchUserQuery = useQuery({
    queryKey: [
      "searchCRMUsers",
      filterState.state.paginationIndex,
      filterState.state.accountStatus,
      filterState.state.search,
      filterState.state.roleFilter,
    ],
    queryFn: async () => {
      const response = await usersApi.findUsers({
        page: filterState.state.paginationIndex.toString(),
        role:
          filterState.state.roleFilter === "ALL"
            ? undefined
            : (filterState.state.roleFilter as z.infer<
                typeof appSchema.Enum.CrmUserROLEEnum
              >[number]),
        search: filterState.state.search,
        status:
          (filterState.state.accountStatus === "ALL"
            ? undefined
            : (filterState.state.accountStatus as Partial<
                z.infer<typeof appSchema.crm.user.findManyUserSchema>["status"]
              >)) || undefined,
      });
      return response.data;
    },
  });

  return {
    fetchUserQuery,
  };
};
