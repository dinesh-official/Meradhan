import { apiClientCaller } from "@/core/connection/apiClientCaller"
import apiGateway from "@root/apiGateway"
import { useQuery } from "@tanstack/react-query"

export const useRfqisinHook = () => {

    const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller)

    const findRfqSearchMutasion = useQuery({
        queryKey: ["find-rfq"],
        queryFn: async () => {

            return await rfqApi.getRfqFind()

        }
    })


    return { findRfqSearchMutasion }


}