import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

// Payload type for the mutation
type CreateFollowUpPayload = {
  leadId: number;
  data: z.infer<
    (typeof appSchema.crm.leads)["createNewLeadFollowUpNoteSchema"]
  >;
};
export const useFollowUpApiHook = () => {
  const leadFollowUpApi = new apiGateway.crm.crmFollowup.CrmFollowUpApi(
    apiClientCaller
  );
  const createFollowUpMutation = useMutation({
    mutationKey: ["useFollowUpNote"],
    mutationFn: async ({ leadId, data }: CreateFollowUpPayload) => {
      const response = await leadFollowUpApi.createFollowUp(leadId, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("FollowUp Lead Successfully Created!");
    },
    onError(error) {
      console.log("error", error);
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  return {
    createFollowUpMutation,
  };
};
