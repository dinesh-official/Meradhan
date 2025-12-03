import apiGateway from "@root/apiGateway";
import { TOrderFilterListHook } from "./useOrderListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const useOrderFilterListApiHook = (filterStatus: TOrderFilterListHook) => {
  const orderApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);
  const state = filterStatus.state;

  const fetchOrderQuery = useQuery({
    queryKey: [
      "crmOrders",
      state.paginationIndex,
      state.statusFilter,
      state.bondTypeFilter,
      state.search,
      state.date,
    ],
    queryFn: async () => {
      return orderApi.getAllOrders({
        page: state.paginationIndex.toString(),
        limit: "10",
        status: state.statusFilter === "ALL" ? undefined : state.statusFilter,
        bondType: state.bondTypeFilter === "ALL" ? undefined : state.bondTypeFilter,
        search: state.search || undefined,
        date: state.date
          ? format(state.date, "yyyy-MM-dd")
          : undefined,
      });
    },
  });

  return { fetchOrderQuery };
};
