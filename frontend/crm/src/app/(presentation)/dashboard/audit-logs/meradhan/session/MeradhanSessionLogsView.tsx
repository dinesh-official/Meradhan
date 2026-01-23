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
import { Download, Search, X } from "lucide-react";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useEffect, useState } from "react";
import SessionLogsMeradhanTable from "./_components/SessionLogsMeradhanTable";

function SessionLogsMeradhan() {
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
      "session-logs-meradhan",
      page,
      pageSize,
      debouncedSearch,
      deviceFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const response = await apiCaller.getSessionLogsMeradhan({
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
        (item.ipAddress &&
          item.ipAddress
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        (item.browserName &&
          item.browserName
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        (item.operatingSystem &&
          item.operatingSystem
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())) ||
        item.sessionToken
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        item.trackingToken
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesDeviceType =
        !deviceFilter ||
        (item.deviceType &&
          item.deviceType.toLowerCase() === deviceFilter.toLowerCase());

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

  const handleExport = () => {
    if (!filteredData || filteredData.length === 0) {
      return;
    }

    const escapeCsvValue = (
      val: string | number | null | undefined
    ): string => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      // Always wrap in quotes for proper CSV formatting and escape internal quotes
      return `"${str.replace(/"/g, '""')}"`;
    };

    const toCsvRow = (values: Array<string | number | null | undefined>) => {
      return values.map(escapeCsvValue).join(",");
    };

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${secs}s`;
      }
      return `${secs}s`;
    };

    const lines: string[] = [];
    // Header row
    lines.push(
      toCsvRow([
        "Session ID",
        "User Name",
        "User Email",
        "Start Time",
        "End Time",
        "Duration",
        "Status",
        "Environment (Device, Browser, OS)",
        "IP Address",
        "Total Pages",
        "Total Duration (seconds)",
      ])
    );

    // Data rows
    filteredData.forEach((session) => {
      // Format user name
      // Format user name - handle empty/null values
      const userName = session.user
        ? `${session.user.firstName || ""} ${session.user.middleName || ""} ${session.user.lastName || ""
          }`.trim() || "Unknown"
        : "Unknown";

      // Format user email - handle empty/null values
      const userEmail = session.user?.email?.trim() || "N/A";

      // Format timestamps with seconds (matching UI format)
      const startTime = dateTimeUtils.formatDateTime(
        session.startTime,
        "DD MMM YYYY hh:mm:ss AA"
      );
      const endTime = session.endTime
        ? dateTimeUtils.formatDateTime(
          session.endTime,
          "DD MMM YYYY hh:mm:ss AA"
        )
        : "N/A";

      // Format environment in combined format (same as UI)
      const envParts: string[] = [];
      if (session.browserName) envParts.push(session.browserName);
      if (session.deviceType) {
        envParts.push(
          session.deviceType.charAt(0).toUpperCase() +
          session.deviceType.slice(1).toLowerCase()
        );
      }
      if (session.operatingSystem) envParts.push(session.operatingSystem);
      const environment = envParts.join(", ") || "N/A";

      // Get session status
      const now = new Date();
      const startTimeDate = new Date(session.startTime);
      const hoursSinceStart =
        (now.getTime() - startTimeDate.getTime()) / (1000 * 60 * 60);

      let status = "Active";
      if (session.endTime && session.endReason) {
        status = session.endReason;
      } else if (session.endTime) {
        status = "Expired";
      } else if (hoursSinceStart > 24) {
        status = "Auto Expired";
      }

      // Format IP address
      const ipAddress = session.ipAddress?.trim() || "N/A";

      // Format session ID
      const sessionId = `#${String(session.id + 9).padStart(6, "0")}`;

      lines.push(
        toCsvRow([
          sessionId,
          userName,
          userEmail,
          startTime,
          endTime,
          formatDuration(session.duration),
          status,
          environment,
          ipAddress,
          session.pageViews.length,
          session.duration,
        ])
      );
    });

    // Add BOM for Excel compatibility (UTF-8 with BOM)
    const BOM = "\uFEFF";
    const csvContent = BOM + lines.join("\r\n"); // Use \r\n for better Excel compatibility
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = format(new Date(), "yyyy-MM-dd");
    link.download = `meradhan-session-logs-${dateStr}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Meradhan Session History</CardTitle>
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>
                  Showing {filteredData.length} of{" "}
                  {sessionData.data?.meta.total || 0} results
                </span>
                {hasActiveFilters && (
                  <span className="text-blue-600">(filtered)</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!filteredData || filteredData.length === 0}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <SessionLogsMeradhanTable
            data={filteredData}
            isLoading={sessionData.isLoading}
            meta={sessionData.data?.meta}
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

export default SessionLogsMeradhan;
