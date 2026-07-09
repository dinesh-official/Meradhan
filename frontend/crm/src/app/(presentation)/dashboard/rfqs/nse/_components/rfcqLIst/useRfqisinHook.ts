import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

interface RfqFilterState {
    searchValue?: string;
    rfqDate?: string;
    statusValue?: string;
    regTypeValue?: string;
}

export const useRfqisinHook = () => {
    // Initialize API instance
    const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

    // 🔹 Local filter states
    const [filters, setFilters] = useState<RfqFilterState>({
        searchValue: undefined,
        rfqDate: new Date().toISOString().split('T')[0],
        statusValue: undefined,
        regTypeValue: undefined,
    });

    // 🔹 Individual setters for UI binding
    const setSearchValue = (value?: string) =>
        setFilters((prev) => ({ ...prev, searchValue: value }));

    const setRfqDate = (value?: string) =>
        setFilters((prev) => ({ ...prev, rfqDate: value }));

    const setStatusValue = (value?: string) =>
        setFilters((prev) => ({ ...prev, statusValue: value }));

    const setRegTypeValue = (value?: string) =>
        setFilters((prev) => ({ ...prev, regTypeValue: value }));

    // 🔹 Fetch RFQs using filters (auto refetch on filter change)
    const findRfqSearchMutasion = useQuery({
        queryKey: ["find-rfq", filters],
        queryFn: async () => {
            // You can modify API call params as per your backend requirements
            const response = await rfqApi.getRfqFind({
                number: filters.searchValue || undefined,
                date:  filters.rfqDate? dateTimeUtils.formatDateTime(filters.rfqDate,"DD-MMM-YYYY") :undefined,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                clientRegType: filters.regTypeValue as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                status: filters.statusValue as any,
            });
            return response;
        },

        staleTime: 1000 * 60 * 2, // 2 minutes
        refetchOnWindowFocus: false,
    });

    // 🔹 Reset all filters
    const resetFilters = () => {
        setFilters({
            searchValue: "",
            rfqDate: "",
            statusValue: "",
            regTypeValue: "",
        });
    };

    return {
        // All filters and handlers
        filters,
        setSearchValue,
        setRfqDate,
        setStatusValue,
        setRegTypeValue,
        resetFilters,
        findRfqSearchMutasion
    };
};
