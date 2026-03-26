import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { useCallback } from "react";
import { toast } from "sonner";

export const useCurrentUserProfileHook = () => {
    const { user: currentUser } = useCurrentUserData();
    const usersApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

    const fetchCurrentUserProfile = async () => {
        if (!currentUser?.id) {
            throw new Error("User ID not available");
        }

        try {
            const response = await usersApi.getUserById(currentUser.id);
            return response.data.responseData;
        } catch (error) {
            if (error instanceof ApiError) {
                throw new Error(error.message || "Failed to fetch user profile");
            }
            throw new Error("An unexpected error occurred while fetching your profile");
        }
    };

    const {
        data: userProfile,
        isLoading,
        error,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ["currentUserProfile", currentUser?.id],
        queryFn: fetchCurrentUserProfile,
        enabled: !!currentUser?.id, // Only run the query if user ID is available
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: (failureCount, error) => {
            // Retry up to 3 times, but not for authentication errors
            if ((error as Error).message.includes("authentication") || 
                (error as Error).message.includes("unauthorized")) {
                return false;
            }
            return failureCount < 3;
        },
    });

    const refreshProfile = useCallback(async () => {
        try {
            await refetch();
            toast.success("Profile updated successfully");
        } catch  {
            toast.error("Failed to refresh profile");
        }
    }, [refetch]);

    return {
        userProfile,
        isLoading: isLoading || isRefetching,
        error,
        refetch,
        refreshProfile,
        isEnabled: !!currentUser?.id,
    };
};