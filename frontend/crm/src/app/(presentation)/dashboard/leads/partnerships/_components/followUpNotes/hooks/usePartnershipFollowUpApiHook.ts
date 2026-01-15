"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { appSchema } from "@root/schema";
import { toast } from "sonner";
import { PartnershipFollowUpNoteFormData } from "./partnershipFollowUpFormData.schema";

export const usePartnershipFollowUpApiHook = ({
  partnershipId,
}: {
  partnershipId: number;
}) => {
  const queryClient = useQueryClient();

  const createFollowUpMutation = useMutation({
    mutationFn: async ({
      partnershipId,
      data,
    }: {
      partnershipId: number;
      data: PartnershipFollowUpNoteFormData;
    }) => {
      const payload =
        appSchema.crm.partnership.createPartnershipFollowUpNoteSchema.parse({
          text: data.text,
          nextDate: data.nextFollowUpDate
            ? new Date(data.nextFollowUpDate)
            : undefined,
        });

      // We'll need to create a partnership follow-up API client
      // For now, using fetch directly
      const response = await apiClientCaller.post(
        `/crm/partnership/followup/${partnershipId}`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partnershipFollowUps", partnershipId],
      });
      toast.success("Follow-up note created successfully");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to create follow-up note";
      toast.error(errorMessage);
    },
  });

  return {
    createFollowUpMutation,
  };
};

