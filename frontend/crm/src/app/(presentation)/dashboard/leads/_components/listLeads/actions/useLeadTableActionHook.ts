import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { Route } from "next";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import { encodeId } from "@/global/utils/url.utils";

export const useLeadTableActionHook = ({ leadId }: { leadId: number }) => {
  const customerApi = new apiGateway.crm.crmLeads.CrmLeadApi(
    apiClientCaller
  );
  const router = useRouter();

  const handleLeadUpdate = () => {
    const href = `/dashboard/leads/${encodeId(leadId)}/update` as Route;

    router.push(href);
  };

  const deleteLeadMutation = useMutation({
    mutationKey: ["deleteLead"],
    mutationFn: async () => {
      const response = await customerApi.deleteNewLeadById(leadId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchLeadQuery"] });
      toast.success("Customer delete SuccessFully");
    },
  });
  return {
    handleLeadUpdate,
    deleteLeadMutation,
  };
};
