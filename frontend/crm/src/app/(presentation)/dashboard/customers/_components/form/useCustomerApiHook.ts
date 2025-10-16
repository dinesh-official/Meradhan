import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useCustomerApiHook = () => {
  const router = useRouter();
  const customerApi = new apiGateway.crm.customer.CrmCustomer(apiClientCaller);

  const createCustomerMutation = useMutation({
    mutationKey: ["createCustomerMutation"],
    mutationFn: async (
      data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>
    ) => {
      console.log("data in useCustomerApiHook", data);
      const response = await customerApi.createCustomer(data);
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
    createCustomerMutation,
  };
};
