"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { toast } from "sonner";

const serviceRequestsApi = new apiGateway.crm.serviceRequests.CrmServiceRequestsApi(
  apiClientCaller,
);

export function useServiceRequestsApiHook() {
  const [filters, setFilters] = useQueryStates({
    q: parseAsString.withDefault(""),
    status: parseAsString.withDefault("ALL"),
    type: parseAsString.withDefault("CLOSURE"),
    page: parseAsInteger.withDefault(1),
  });

  const query = useQuery({
    queryKey: ["serviceRequests", filters],
    queryFn: async () => {
      const res = await serviceRequestsApi.listRequests({
        page: String(filters.page),
        pageSize: "10",
        search: filters.q || undefined,
        type: filters.type === "ALL" ? undefined : (filters.type as "CLOSURE"),
        status:
          filters.status === "ALL"
            ? undefined
            : (filters.status as "PENDING" | "DONE" | "REJECTED"),
      });
      return res.data.responseData;
    },
  });

  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: (id: number) => serviceRequestsApi.closeAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      toast.success("Account closed successfully");
    },
    onError: () => toast.error("Failed to close account"),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => serviceRequestsApi.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceRequests"] });
      toast.success("Request rejected");
    },
    onError: () => toast.error("Failed to reject request"),
  });

  return {
    filters,
    setFilters,
    query,
    closeMutation,
    rejectMutation,
  };
}
