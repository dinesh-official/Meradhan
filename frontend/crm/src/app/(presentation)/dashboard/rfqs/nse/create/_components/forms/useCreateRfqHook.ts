import { useMutation } from "@tanstack/react-query"

export const useCreateRfqHook = () => {

    const newRfqMutation = useMutation({
        mutationKey: ['create-nse-rfq'],
    })

}