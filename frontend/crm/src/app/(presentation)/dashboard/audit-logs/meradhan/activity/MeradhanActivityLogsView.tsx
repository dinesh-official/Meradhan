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
import ActivityLogsMeradhanTable from "./_components/ActivityLogsMeradhanTable";

function MeradhanActivityLogsView() {
  const apiCaller = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);

  // Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const activityData = useQuery({
    queryKey: [
      "activity-logs-meradhan",
      page,
      pageSize,
      debouncedSearch,
      entityTypeFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await apiCaller.getActivityLogsMeradhan({
        page,
        pageSize,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      return response.data.responseData;
    },
  });

  // Client-side filtering for search and entity type
  const filteredData =
    activityData.data?.data?.filter((item) => {
      const matchesSearch =
        !debouncedSearch ||
        item.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.name &&
          item.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
        item.action.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (item.ipAddress &&
          item.ipAddress.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesEntityType =
        !entityTypeFilter ||
        item.entityType.toLowerCase() === entityTypeFilter.toLowerCase();

      return matchesSearch && matchesEntityType;
    }) || [];

  const handleClearFilters = () => {
    setSearchTerm("");
    setEntityTypeFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || entityTypeFilter || startDate || endDate;

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Meradhan Activity History</CardTitle>
          <CardDescription>
            Complete log of all user actions and system events on Meradhan
            platform
          </CardDescription>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, action, IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select
                value={entityTypeFilter}
                onValueChange={(value) => {
                  setEntityTypeFilter(value === "all" ? "" : value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="bonds">Bonds</SelectItem>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
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
                {activityData.data?.meta.total || 0} results
              </span>
              {hasActiveFilters && (
                <span className="text-blue-600">(filtered)</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityLogsMeradhanTable
            data={filteredData}
            isLoading={activityData.isLoading}
            meta={activityData.data?.meta}
            onPageChange={setPage}
            onPageSizeChange={(size: number) => {
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

export default MeradhanActivityLogsView;
