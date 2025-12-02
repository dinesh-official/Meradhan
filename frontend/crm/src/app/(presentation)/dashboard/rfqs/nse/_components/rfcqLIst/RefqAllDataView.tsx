"use client";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import NseTableView from "./NseTableView";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterStatusOptions } from "./NseRFQSearchFilterBar";
import CardPagination from "@/global/elements/table/CardPagination";
import { useRouter } from "nextjs-toploader/app";

function RefqAllDataView() {
  // Check if any filter is active
  const router = useRouter();

  const handleClearFilters = () => {
    setFrom(undefined);
    setTo(undefined);
    setStatus(undefined);
    setSearch("");
    setPage(1);
  };
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);
  const [from, setFrom] = useState<string | undefined>();
  const [to, setTo] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [search, setSearch] = useState<string>();
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;
  const isAnyFilterActive = Boolean(search || from || to || status);
  const refqData = useQuery({
    queryKey: ["RefqAllDataView", { from, to, status, search, page, pageSize }],
    queryFn: async () => {
      return rfqApi.getAllLocalIsin({
        from,
        to,
        status,
        search,
        page,
      });
    },
  });

  // Extract meta and data safely
  const tableData = refqData.data?.data.responseData.data || [];
  const meta = refqData.data?.data.responseData.meta || { page: 1, pages: 1 };

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrom(e.target.value || undefined);
    setPage(1);
  };
  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTo(e.target.value || undefined);
    setPage(1);
  };
  const handleStatusChange = (value: string) => {
    setStatus(value || undefined);
    setPage(1);
  };
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search RFQ..."
                value={search}
                onChange={handleSearchChange}
              />
              {isAnyFilterActive && (
                <button
                  className="ml-2 px-3 py-1 rounded bg-gray-200 text-sm hover:bg-gray-300 text-nowrap"
                  onClick={handleClearFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-5">
              <Input
                type="date"
                value={from || ""}
                onChange={handleFromChange}
              />
              <Input type="date" value={to || ""} onChange={handleToChange} />
              <Select value={status || ""} onValueChange={handleStatusChange}>
                <SelectTrigger className="bg-secondary border-none w-[160px]">
                  <SelectValue placeholder="Apply Status" />
                </SelectTrigger>
                <SelectContent>
                  {filterStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {refqData.isLoading ? (
            <div className="flex justify-center items-center py-10">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></span>
              <span className="text-blue-500 text-sm">Loading data...</span>
            </div>
          ) : (
            <NseTableView
              data={tableData}
              onClick={(e) => {
                router.push(
                  "/dashboard/rfqs/nse/manage/" + e.number + "?date=" + e.date
                );
              }}
            />
          )}
        </CardContent>
        <CardFooter>
          <CardPagination
            page={meta.page}
            totalPages={meta.pages}
            onClick={handlePageChange}
          />
        </CardFooter>
      </Card>
    </div>
  );
}

export default RefqAllDataView;
