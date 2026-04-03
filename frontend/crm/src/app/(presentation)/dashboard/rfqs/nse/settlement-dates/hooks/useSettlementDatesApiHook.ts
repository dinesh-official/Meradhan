import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import type { SettlementCsvRow } from "../_utils/parseSettlementCsv";

const PAGE_SIZE_DEFAULT = 20;

export type SettlementDatesListFilters = {
  yearMonth: string;
  page: number;
  pageSize?: number;
};

export function useSettlementDatesApiHook(filters: SettlementDatesListFilters) {
  const queryClient = useQueryClient();
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const pageSize = filters.pageSize ?? PAGE_SIZE_DEFAULT;

  const settlementNosQuery = useQuery({
    queryKey: [
      "settlementNos",
      "list",
      filters.yearMonth,
      filters.page,
      pageSize,
    ],
    queryFn: async () => {
      const res = await rfqApi.getAllSettlementNos({
        page: filters.page,
        pageSize,
        yearMonth: filters.yearMonth,
      });
      const data = res.responseData;
      if (!data) {
        return {
          items: [],
          total: 0,
          page: filters.page,
          pageSize,
        };
      }
      return data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const saveCsvRowsMutation = useMutation({
    mutationFn: async (rows: SettlementCsvRow[]) => {
      for (const row of rows) {
        await rfqApi.createOrUpdateSettlementNo({
          date: row.date,
          settlementNo: row.settlementNo,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settlementNos"] });
    },
  });

  return { settlementNosQuery, saveCsvRowsMutation, pageSize };
}
