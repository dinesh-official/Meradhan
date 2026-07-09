"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import SessionLogsTable from "./SessionLogsTable";

function SessionLogsHistory() {
  const apiCaller = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);

  // Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const sessionData = useQuery({
    queryKey: [
      "session-logs-crm",
      page,
      pageSize,
      debouncedSearch,
      deviceFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await apiCaller.getSessionLogsCrm({
        page,
        pageSize,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      return response.data.responseData;
    },
  });

  // Client-side filtering for search and device type
  const filteredData =
    sessionData.data?.data?.filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        item.ipAddress.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.browserName
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        item.operatingSystem
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        item.sessionToken.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesDeviceType =
        !deviceFilter ||
        item.deviceType.toLowerCase() === deviceFilter.toLowerCase();

      return matchesSearch && matchesDeviceType;
    }) || [];

  const handleClearFilters = () => {
    setSearchTerm("");
    setDeviceFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const hasActiveFilters = searchTerm || deviceFilter || startDate || endDate;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>
            Complete log of all user sessions with page view details
          </CardDescription>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by IP, browser, OS, session..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={deviceFilter}
                onValueChange={(value) => {
                  setDeviceFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => {
                  setStartDate(
                    e.target.value ? new Date(e.target.value) : undefined
                  );
                  setPage(1);
                }}
                className="w-[200px]"
                placeholder="Start date"
              />

              <Input
                type="date"
                value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => {
                  setEndDate(
                    e.target.value ? new Date(e.target.value) : undefined
                  );
                  setPage(1);
                }}
                className="w-[200px]"
                placeholder="End date"
              />

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Showing {filteredData.length} of{" "}
                {sessionData.data?.meta.total || 0} results
              </span>
              {hasActiveFilters && (
                <span className="text-blue-600">(filtered)</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SessionLogsTable
            data={filteredData}
            isLoading={sessionData.isLoading}
            meta={sessionData.data?.meta}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            currentPage={page}
            currentPageSize={pageSize}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionLogsHistory;
