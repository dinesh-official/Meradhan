import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

export const useCustomerApiHook = ({
  backOnDone = true,
  onCustomerCreated,
}: { backOnDone?: boolean; onCustomerCreated?: () => void } = {}) => {
  const router = useRouter();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );

  const createCustomerMutation = useMutation({
    mutationKey: ["createCustomerMutation"],
    mutationFn: async (
      data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>
    ) => {
      const response = await customerApi.createCustomer(data);
      return response.data;
    },
    onSuccess() {
      toast.success("User added Successfully");
      onCustomerCreated?.();
      if (backOnDone) {
        router.back();
      } else {
        router.refresh();
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  const updateCustomerMutation = useMutation({
    mutationKey: ["updateCustomerMutation"],
    mutationFn: async (payload: {
      data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>;
      customerId: string;
    }) => {

      const res = await customerApi.updateCustomer(
        {
          ...payload.data,
          password: undefined
        },
        payload.customerId
      );
      return res.data;
    },
    onSuccess() {
      toast.success("User updated successfully");
      router.back();
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error?.message ?? "Something went wrong");
      }
    },
  });

  const fetchCustomerByid = useMutation({
    mutationKey: ['customerInfoById'],
    mutationFn: async (profileId: number) => {
      const response = await customerApi.customerInfoById(profileId);
      return response.data;
    },
  });




  return {
    updateCustomerMutation,
    createCustomerMutation,
    fetchCustomerByid
  };
};
