import { useUserTracking } from "@/analytics/UserTrackingProvider";
import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useUserActionHook = () => {

    const userApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);
    const { trackActivity } = useUserTracking();
    const deleteUserMutation = useMutation({
        mutationKey: ['deleteUserMutation'],
        mutationFn: async (id: number) => {
            await userApi.deleteUser(id);
        },
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ['searchCRMUsers'] });
            toast.success("Profile delete successfully")
            trackActivity("delete_entry", {
                reason: "User profile deleted successfully",
            });
        },
        onError(error) {
            toast.error(error.message);
        },
    })

    const manageSuspendUserMutation = useMutation({
        mutationKey: ['manageSuspendUserMutation'],
        mutationFn: async (data: { id: number, status: "ACTIVE" | "SUSPENDED" }) => {
            await userApi.updateUser(data.id, { accountStatus: data.status });
        },
        onSuccess(_, payload) {
            queryClient.invalidateQueries({ queryKey: ['searchCRMUsers'] });
            toast.success(`Profile ${payload.status.toLowerCase()} successfully`)
            trackActivity("update_entry", {
                reason: `User profile ${payload.status.toLowerCase()} successfully`,
            });
        },
        onError(error) {
            toast.error(error.message);
        },
    })

    return {
        deleteUserMutation,
        manageSuspendUserMutation
    }
}