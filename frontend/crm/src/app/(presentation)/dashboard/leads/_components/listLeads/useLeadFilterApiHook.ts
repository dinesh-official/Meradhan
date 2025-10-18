import apiGateway from "@root/apiGateway";
import { TLeadFilterListHook } from "./useLeadFilterListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import { appSchema } from "@root/schema";
import z from "zod";

export const useLeadFilterApiHook = (filterState: TLeadFilterListHook) => {
  const leadApi = new apiGateway.crm.crmLeads.CrmLeadApi(apiClientCaller);
  const state = filterState.state;

  const fetchLeadsQuery = useQuery({
    queryKey: [
      "fetchLeadQuery",
      state.paginationIndex,
      state.search,
      state.sourceFilter,
      state.statusFilter,
    ],
    queryFn: async () => {
      const params = {
        page: state.paginationIndex.toString(),
        status:
          state.statusFilter !== "ALL"
            ? (state.statusFilter as z.infer<
                typeof appSchema.crm.leads.findManyLeadsSchema
              >["status"])
            : undefined,
        search: state.search,
        source:
          state.sourceFilter !== "ALL"
            ? (state.sourceFilter as z.infer<
                typeof appSchema.crm.leads.findManyLeadsSchema
              >["source"])
            : undefined,
      };
      const response = await leadApi.findLeads(params);
      return response.data;
    },
  });
  return { fetchLeadsQuery };
};
