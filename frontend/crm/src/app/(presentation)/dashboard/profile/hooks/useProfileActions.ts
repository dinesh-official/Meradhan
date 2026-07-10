import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { useCallback } from "react";

export const useProfileActions = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useCurrentUserData();

  const invalidateProfileCache = useCallback(() => {
    if (currentUser?.id) {
      queryClient.invalidateQueries({
        queryKey: ["currentUserProfile", currentUser.id],
      });
    }
  }, [queryClient, currentUser?.id]);

  const refreshProfileData = useCallback(() => {
    invalidateProfileCache();
  }, [invalidateProfileCache]);

  return {
    invalidateProfileCache,
    refreshProfileData,
  };
};