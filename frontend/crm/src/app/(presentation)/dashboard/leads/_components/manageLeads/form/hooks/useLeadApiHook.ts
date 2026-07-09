import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useLeadFollowUpApiHook = ({
  goBackOnSuccess,
  onComplete,
}: {
  onComplete?: () => void;
  goBackOnSuccess?: boolean;
}) => {
  const router = useRouter();
  const leadFollowUpApi = new apiGateway.crm.crmLeads.CrmLeadApi(
    apiClientCaller,
  );

  const createLeadMutation = useMutation({
    mutationKey: ["createLeadMutation"],
    mutationFn: async (
      data: z.infer<(typeof appSchema.crm.leads)["createNewLeadSchema"]>,
    ) => {
      const response = await leadFollowUpApi.createNewLead(data);
      return response.data;
    },
    onSuccess() {
      toast.success("Lead Create Successfully");
      if (goBackOnSuccess) {
        router.back();
      }
      queryClient.invalidateQueries({ queryKey: ["fetchLeadQuery"] });
      onComplete?.();
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  const updateLeadMutation = useMutation({
    mutationKey: ["updateLead"],
    mutationFn: async (payload: {
      data: z.infer<(typeof appSchema.crm.leads)["updateLeadSchema"]>;
      leadId: number;
    }) => {
      const response = await leadFollowUpApi.updateNewLeadById(
        payload.leadId,
        payload.data,
      );

      return response.data;
    },
    onSuccess() {
      toast.success("Lead Update Successfully");
      queryClient.invalidateQueries({ queryKey: ["fetchLeadQuery"] });
      if (goBackOnSuccess) {
        router.back();
      }
      onComplete?.();
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });
  return {
    updateLeadMutation,
    createLeadMutation,
  };
};
