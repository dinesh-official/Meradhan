"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import apiGateway from "@root/apiGateway";
import { useDebounce } from "@/global/hooks/use-debounce";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { LoginLogsMeradhanTable } from "./_components/LoginLogsMeradhanTable";

export function LoginLogsMeradhan() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  const [successFilter, setSuccessFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const apiGet = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);

  const { data, isLoading } = useQuery({
    queryKey: ["meradhan-login-logs", page, pageSize, startDate, endDate],
    queryFn: async () => {
      const response = await apiGet.getLoginLogsMeradhan({
        page,
        pageSize,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      return response.data.responseData;
    },
  });

  // Client-side filtering
  const filteredData = data?.data.filter((log) => {
    const matchesSearch =
      !debouncedSearch ||
      (log.name &&
        log.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      log.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.includes(debouncedSearch));

    const matchesDevice =
      deviceFilter === "all" || log.deviceType === deviceFilter;

    const matchesSuccess =
      successFilter === "all" ||
      (successFilter === "success" && log.success) ||
      (successFilter === "failed" && !log.success);

    return matchesSearch && matchesDevice && matchesSuccess;
  });

  const handleClearFilters = () => {
    setSearch("");
    setDeviceFilter("all");
    setSuccessFilter("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const hasActiveFilters =
    search ||
    deviceFilter !== "all" ||
    successFilter !== "all" ||
    startDate ||
    endDate;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="w-[160px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Device Type
          </label>
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="Desktop">Desktop</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="Tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[160px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Login Status
          </label>
          <Select value={successFilter} onValueChange={setSuccessFilter}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[160px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={today}
            className="h-9"
          />
        </div>

        <div className="w-[160px]">
          <label className="text-xs text-muted-foreground mb-1 block">
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={today}
            min={startDate}
            className="h-9"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-9"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-muted-foreground">
        {isLoading ? (
          "Loading..."
        ) : (
          <>
            Showing {filteredData?.length || 0} of {data?.meta.total || 0} login
            attempts
          </>
        )}
      </div>

      {/* Table */}
      <LoginLogsMeradhanTable
        data={filteredData || []}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total: data?.meta.total || 0,
          totalPages: data?.meta.totalPages || 1,
          hasNextPage: data?.meta.hasNextPage || false,
          hasPrevPage: data?.meta.hasPrevPage || false,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
