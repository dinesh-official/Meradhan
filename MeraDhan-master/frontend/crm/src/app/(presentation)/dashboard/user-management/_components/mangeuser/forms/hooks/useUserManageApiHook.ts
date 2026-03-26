import { useUserTracking } from "@/analytics/UserTrackingProvider";
import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export const useUserManageApiHook = ({ onSuccess }: { onSuccess?: () => void }) => {
  const userApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);
  const { trackActivity } = useUserTracking();

  const handleSuccess = (msg: string) => {
    toast.success(msg);
    queryClient.invalidateQueries({ queryKey: ["searchCRMUsers"] });
    trackActivity("create_entry", {
      reason: msg,
    });
    onSuccess?.();
  };

  const handleError = (error: unknown) => {
    if (error instanceof ApiError) {
      toast.error(error.response?.data?.message);
    } else if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Something went wrong");
    }
  };

  const createUserMutation = useMutation({
    mutationKey: ["createUserMutation"],
    mutationFn: (data: z.infer<(typeof appSchema.crm.user)["createCRMUserSchema"]>) =>
      userApi.createUser(data).then((res) => res.data),
    onSuccess: () => handleSuccess("User added successfully"),
    onError: handleError,
  });

  const updateUserMutation = useMutation({
    mutationKey: ["updateUserMutation"],
    mutationFn: ({ id, data }: { id: number; data: z.infer<(typeof appSchema.crm.user)["updateUserSchema"]> }) =>
      userApi.updateUser(id, data).then((res) => res.data),
    onSuccess: () => handleSuccess("User updated successfully"),
    onError: handleError,
  });

  return { createUserMutation, updateUserMutation };
};
