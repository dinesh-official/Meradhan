"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import z from "zod";
export type IsinFilterType = z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>;

export function useNseIsinPickerState() {
    const [filters, setFilters] = useState<IsinFilterType>({
        symbol: undefined,
        description: undefined,
        issuer: undefined,
        filtIssueCategory: undefined,
        filtMaturity: undefined,
        filtCoupon: undefined,
    });

    const handleChange = <K extends keyof IsinFilterType>(
        key: K,
        value: IsinFilterType[K]
    ) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            symbol: undefined,
            description: undefined,
            issuer: undefined,
            filtIssueCategory: undefined,
            filtMaturity: undefined,
            filtCoupon: undefined,
        });
    };


    const isinApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
    const searchIsinMutation = useMutation({
        mutationKey: ['searchIsinMutation', filters],
        mutationFn: async () => {
            return await isinApi.getAllIsin(filters)
        }
    })

    return { filters, handleChange, resetFilters, searchIsinMutation };
}
