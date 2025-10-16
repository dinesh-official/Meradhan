import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";


export const useUserCreateApiHook = ({
  onSuccess
}:{onSuccess?:()=>void}) => {
  const userApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

  const createUserMutation = useMutation({
    mutationKey: ["createUserMutation"],
    mutationFn: async (
      data: z.infer<(typeof appSchema.crm.user)["createCRMUserSchema"]>
    ) => {
        console.log("data in useCustomerCreateApiHook",data)
      const response = await userApi.createUser(data);
      return response.data;
    },
    onSuccess() {
      toast.success("User added Successfully");
      onSuccess?.()
    },
    onError(error) {
        console.log("error",error)
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  return {
    createUserMutation,
  };
};
