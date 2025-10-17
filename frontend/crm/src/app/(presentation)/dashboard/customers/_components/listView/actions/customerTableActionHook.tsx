import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Route } from "next";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";

export const useCustomerTableActions = ({
  profileId,
}: {
  profileId: number;
}) => {
  const router = useRouter();
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller
  );

  const handleViewKyc = () => {
    const href = `/dashboard/customers/view/${encodeURIComponent(
      String(profileId)
    )}/kyc` as Route;

    router.push(href);
  };
  const handleProfileView = () => {
    const href = `/dashboard/customers/view/${encodeURIComponent(
      String(profileId)
    )}/profile` as Route;

    router.push(href);
  };

  const handleProfileUpdate = () => {
    const href = `/dashboard/customers/view/${encodeURIComponent(
      String(profileId)
    )}/update` as Route;

    router.push(href);
  };

  const deleteProfileMutation = useMutation({
    mutationKey: ["deleteProfile"],
    mutationFn: async () => {
      const response = await customerApi.deleteCustomerById(profileId);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Customer delete SuccessFully");
    },
  });

  const manageSuspendCustomerMutation = useMutation({
    mutationKey: ["manageSuspendCustomerMutation"],
    mutationFn: async (payload: {
      data: { status: "ACTIVE" | "SUSPENDED" };
      customerId: string;
    }) => {
      // matches: updateCustomer(data, customerId)
      const res = await customerApi.updateCustomer(
        payload.data,
        payload.customerId
      );
      return res.data;
    },
    onSuccess(_, payload) {
      toast.success(
        `Profile ${payload.data.status.toLowerCase()} successfully`
      );
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error?.message ?? "Something went wrong");
      }
    },
  });

  const fetchCustomerData = useQuery({
    queryKey: [],
    queryFn: async () => {
      const response = await customerApi.customerInfoById(profileId);
      return response.data;
    },
  });

  return {
    handleViewKyc,
    handleProfileView,
    fetchCustomerData,
    handleProfileUpdate,
    deleteProfileMutation,
    manageSuspendCustomerMutation,
  };
};
