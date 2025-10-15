"use client"
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import Swal from "sweetalert2";

export const useLogoutActionHook = (id: number) => {

    const authApi = new apiGateway.auth.AuthApi(apiClientCaller);
    const router = useRouter()
    const mutateLogout = useMutation({
        mutationKey: ['logoutMutation', id],
        mutationFn: async () => {
            await authApi.logout()
        },
        onSuccess() {
            router.replace("/logout")
        },
        onError() {
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