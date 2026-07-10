import apiGateway from "@root/apiGateway";
import { TPartnershipFilterListHook } from "./usePartnershipFilterListHook";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import { appSchema } from "@root/schema";
import z from "zod";

export const usePartnershipFilterApiHook = (
  filterState: TPartnershipFilterListHook
) => {
  const partnershipApi = new apiGateway.crm.crmPartnership.CrmPartnershipApi(
    apiClientCaller
  );
  const state = filterState.state;

  const fetchPartnershipsQuery = useQuery({
    queryKey: [
      "fetchPartnershipsQuery",
      state.paginationIndex,
      state.search,
      state.statusFilter,
      state.partnershipModelFilter,
      state.organizationTypeFilter,
    ],
    queryFn: async () => {
      const params = {
        page: state.paginationIndex.toString(),
        status:
          state.statusFilter !== "ALL"
            ? (state.statusFilter as z.infer<
                typeof appSchema.crm.partnership.findManyPartnershipsSchema
              >["status"])
            : undefined,
        search: state.search,
        partnershipModel:
          state.partnershipModelFilter !== "ALL"
            ? (state.partnershipModelFilter as z.infer<
                typeof appSchema.crm.partnership.findManyPartnershipsSchema
              >["partnershipModel"])
            : undefined,
        organizationType: state.organizationTypeFilter || undefined,
      };
      const response = await partnershipApi.findPartnerships(params);
      return response.data;
    },
  });
  return { fetchPartnershipsQuery };
};

