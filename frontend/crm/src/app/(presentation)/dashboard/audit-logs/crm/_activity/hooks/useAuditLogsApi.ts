import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { CrmUserBase } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

export const useAuditLogsApi = () => {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [type, setType] = useState<string | undefined>(undefined);
    const [user, setUser] = useState<CrmUserBase | undefined>(undefined)

    const auditlogsApi = new apiGateway.crm.auditlogs.AuditLogsApi(apiClientCaller);


    const fetchLogs = useQuery({
        queryKey: ['fetchAuditLogsData', page, type, user, search],
        queryFn: async () => {
            return await auditlogsApi.getAuditLogs({
                page: page,
                type: type?.toLowerCase() == "all" ? undefined : type,
                userId: user?.id.toString(),
                search
            })
        }
    })

    return {
        fetchLogs,
        state: {
            search,
            setSearch,
            page,
            setPage,
            type,
            setType,
            user,
            setUser
        }
    }

}