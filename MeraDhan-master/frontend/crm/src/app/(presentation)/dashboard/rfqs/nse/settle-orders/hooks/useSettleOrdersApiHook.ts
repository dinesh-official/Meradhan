import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import z from "zod";
import { TSettleOrdersFilterHook, formatDateForAPI } from "./useSettleOrdersFilterHook";

export const useSettleOrdersApiHook = (filterState: TSettleOrdersFilterHook) => {
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const state = filterState.state;

  const fetchSettleOrdersQuery = useQuery({
    queryKey: [
      "settleOrders", 
      state.id,
      state.orderNumber,
      state.filtFromModSettleDate,
      state.filtToModSettleDate,
      state.filtCounterParty,
      state.paginationIndex,
    ],
    queryFn: async () => {
      // Convert input dates (YYYY-MM-DD) to API format (DD-MM-YYYY)
      const fromDateForAPI = state.filtFromModSettleDate ? 
        formatDateForAPI(new Date(state.filtFromModSettleDate)) : "";
      const toDateForAPI = state.filtToModSettleDate ? 
        formatDateForAPI(new Date(state.filtToModSettleDate)) : "";

      // Build filter payload based on current filter state
      const filterPayload: z.infer<typeof appSchema.rfq.settleOrderFilterSchema> = {
        filtFromModSettleDate: fromDateForAPI,
        filtToModSettleDate: toDateForAPI,
      };

      // Add optional filters only if they have values
      if (state.id) {
        filterPayload.id = parseInt(state.id);
      }
      
      if (state.orderNumber) {
        filterPayload.orderNumber = state.orderNumber;
      }
      
      if (state.filtCounterParty) {
        filterPayload.filtCounterParty = state.filtCounterParty;
      }

      const response = await rfqApi.getAllSettledOrders(filterPayload);
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return { fetchSettleOrdersQuery };
};