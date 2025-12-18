import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { toast } from "sonner";
import Swal from "sweetalert2";
import z from "zod";

export const useCreateRfqHook = () => {
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const router = useRouter();

  const newRfqMutation = useMutation({
    mutationKey: ["create-nse-rfq"],
    mutationFn: async (payload: z.infer<typeof appSchema.rfq.addIsinSchema>) =>
      await rfqApi.addIsinToRfq(payload),
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "RFQ Created Successfully",
        timer: 2000,
        showConfirmButton: true,
      });
      queryClient.invalidateQueries({ queryKey: ["find-rfq"] });
      router.back();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.response?.data?.responseData) {
          Swal.fire({
            icon: "info",
            title: "Failed Creating RFQ",
            html: error.response.data.responseData.join("<br/>"),
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
          });
        }
      } else {
        toast.error("Something went wrong while creating RFQ");
      }
    },
  });

  return {
    newRfqMutation,
  };
};
