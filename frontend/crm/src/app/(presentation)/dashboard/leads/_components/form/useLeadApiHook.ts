import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useLeadFollowUpApiHook = () => {
  const router = useRouter();
  const leadFollowUpApi = new apiGateway.crm.crmLeads.CrmLead(apiClientCaller);

  const createLeadMutation = useMutation({
    mutationKey: ["createLeadMutation"],
    mutationFn: async (
      data: z.infer<(typeof appSchema.crm.leads)["createNewLeadSchema"]>
    ) => {
      console.log("data in useLeadFollowUpApiHook", data);
      const response = await leadFollowUpApi.createNewLead(data);
      return response.data;
    },
    onSuccess() {
      toast.success("User added Successfully");
      router.back();
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
    createLeadMutation,
  };
};
