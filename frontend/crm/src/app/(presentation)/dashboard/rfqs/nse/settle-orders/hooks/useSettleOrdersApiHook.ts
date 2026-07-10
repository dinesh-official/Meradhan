import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import z from "zod";
import { TSettleOrdersFilterHook, formatDateForAPI } from "./useSettleOrdersFilterHook";

export const useSettleOrdersApiHook = (filterState: TSettleOrdersFilterHook) => {
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const { applied } = filterState.state;

  const fetchSettleOrdersQuery = useQuery({
    queryKey: [
      "settleOrders",
      applied.id,
      applied.orderNumber,
      applied.filtFromModSettleDate,
      applied.filtToModSettleDate,
      applied.filtCounterParty,
      applied.paginationIndex,
    ],
    queryFn: async () => {
      // Convert input dates (YYYY-MM-DD) to API format (DD-MM-YYYY)
      const fromDateForAPI = applied.filtFromModSettleDate
        ? formatDateForAPI(new Date(applied.filtFromModSettleDate))
        : "";
      const toDateForAPI = applied.filtToModSettleDate
        ? formatDateForAPI(new Date(applied.filtToModSettleDate))
        : "";

      // Build filter payload based on applied filters
      const filterPayload: z.infer<typeof appSchema.rfq.settleOrderFilterSchema> = {
        filtFromModSettleDate: fromDateForAPI,
        filtToModSettleDate: toDateForAPI,
      };

      // Add optional filters only if they have values
      if (applied.id) {
        filterPayload.id = parseInt(applied.id, 10);
      }

      if (applied.orderNumber) {
        filterPayload.orderNumber = applied.orderNumber;
      }

      if (applied.filtCounterParty) {
        filterPayload.filtCounterParty = applied.filtCounterParty;
      }

      const response = await rfqApi.getAllSettledOrders(filterPayload);
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  return { fetchSettleOrdersQuery };
};
