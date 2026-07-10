"use client"
import { useUserTracking } from "@/analytics/UserTrackingProvider";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Swal from "sweetalert2";

export const useLogoutActionHook = (id: number) => {
    const { trackActivity } = useUserTracking();

    const authApi = new apiGateway.auth.AuthApi(apiClientCaller);
    const router = useRouter()
    const mutateLogout = useMutation({
        mutationKey: ['logoutMutation', id],
        mutationFn: async () => {
            await authApi.logout()
        },
        onSuccess() {
            trackActivity("logout", {
                userId: id,
                reason: "User logged out successfully",
            });
            router.replace("/logout")
        },
        onError() {
            trackActivity("logout", {
                userId: id,
                reason: "User failed to log out",
            });
            router.replace("/logout")
        },
    });

    const handelLogout = useCallback(
        async () => {

            const result = await Swal.fire({
                title: "Are you sure?",
                text: "to logout your account.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, Logout!",
                cancelButtonText: "No, cancel",
            });


            if (result.isConfirmed) {
                mutateLogout.mutate()
            }

        }, [mutateLogout],
    )

    return { handelLogout, mutateLogout }
}