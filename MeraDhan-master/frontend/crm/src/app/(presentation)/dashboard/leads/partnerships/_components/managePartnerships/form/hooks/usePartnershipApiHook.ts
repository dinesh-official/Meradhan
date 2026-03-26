"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { toast } from "sonner";
import { PartnershipFormData } from "./partnershipFormData.schema";

export const usePartnershipApiHook = ({
  goBackOnSuccess,
  onComplete,
  partnershipId,
}: {
  goBackOnSuccess?: boolean;
  onComplete?: () => void;
  partnershipId?: number;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const partnershipApi = new apiGateway.crm.crmPartnership.CrmPartnershipApi(
    apiClientCaller
  );

  const createPartnershipMutation = useMutation({
    mutationFn: async (data: PartnershipFormData) => {
      const payload = appSchema.crm.partnership.createPartnershipSchema.parse(
        data
      );
      return await partnershipApi.createPartnership(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchPartnershipsQuery"] });
      toast.success("Partnership created successfully");
      if (goBackOnSuccess) {
        router.back();
      }
      onComplete?.();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create partnership";
      toast.error(errorMessage);
    },
  });

  const updatePartnershipMutation = useMutation({
    mutationFn: async (data: Partial<PartnershipFormData>) => {
      if (!partnershipId) throw new Error("Partnership ID is required");
      const payload = appSchema.crm.partnership.updatePartnershipSchema.parse(
        data
      );
      return await partnershipApi.updatePartnership(partnershipId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchPartnershipsQuery"] });
      queryClient.invalidateQueries({
        queryKey: ["fetchPartnership", partnershipId],
      });
      toast.success("Partnership updated successfully");
      if (goBackOnSuccess) {
        router.back();
      }
      onComplete?.();
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to update partnership";
      toast.error(errorMessage);
    },
  });

  return {
    createPartnershipMutation,
    updatePartnershipMutation,
  };
};

