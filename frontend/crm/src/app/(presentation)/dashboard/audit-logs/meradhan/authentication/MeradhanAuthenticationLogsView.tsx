"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import CardPagination from "@/global/elements/table/CardPagination";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import MeradhanLogsCardHeaderFilters from "../_components/MeradhanLogsCardHeaderFilters";

export interface GroupQuery {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

const getSessionTypeBadgeColor = (sessionType: string) => {
  const colors: Record<string, string> = {
    login: "bg-green-500/10 text-green-700 dark:text-green-400",
    logout: "bg-red-500/10 text-red-700 dark:text-red-400",
    "session-expired": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  };
  return (
    colors[sessionType] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"
  );
};

function MeradhanAuthenticationLogsView() {
  const logsApi = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);

  const [filters, setFilters] = useState<GroupQuery>({
    page: 1,
    limit: 10,
    userId: undefined,
    search: undefined,
  });

  const handleFilterChange = useCallback((newFilters: Partial<GroupQuery>) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, ...newFilters };

      // Reset to page 1 when search or userId filters change (but not when page changes)
      if ("search" in newFilters || "userId" in newFilters) {
        updatedFilters.page = 1;
      }

      return updatedFilters;
    });
  }, []);

  const fetchLogsQuery = useQuery({
    queryKey: ["meradhan-authentication-logs", filters],
    queryFn: async () => {
      const response = await logsApi.getLoginLogsMeradhan({
        page: filters.page || 1,
        pageSize: filters.limit || 10,
        userId: filters.userId ? Number(filters.userId) : undefined,
      });
      return response.data;
    },
  });

  return (
    <Card>
      <MeradhanLogsCardHeaderFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={fetchLogsQuery.isLoading}
        description="Complete log of all user authentication actions on Meradhan platform"
        title="Meradhan Authentication Logs"
      />
      <CardContent>
        {fetchLogsQuery.isLoading ? (
          <div className="flex flex-col justify-center items-center space-y-2 w-full h-40">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            <p className="text-gray-500 text-sm">
              Loading authentication logs...
            </p>
          </div>
        ) : fetchLogsQuery.isError ? (
          <div className="flex flex-col justify-center items-center w-full h-40 text-red-500">
            <p className="font-medium text-lg">Error loading logs</p>
            <p className="text-sm">Please try again later</p>
          </div>
        ) : fetchLogsQuery.data?.responseData.data.length === 0 ? (
          <div className="flex flex-col justify-center items-center w-full h-40 text-gray-500">
            <p className="font-medium text-lg">No authentication logs found</p>
            <p className="text-sm text-center">
              {filters.search || filters.userId
                ? "Try adjusting your filters or search criteria"
                : "No authentication activity recorded yet"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[200px]">User</TableHead>
                  <TableHead className="min-w-[120px]">Session Type</TableHead>
                  <TableHead className="min-w-[200px]">Device Info</TableHead>
                  <TableHead className="min-w-[120px]">IP Address</TableHead>
                  <TableHead className="min-w-[150px]">Date & Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchLogsQuery.data?.responseData.data.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {log.name || "Guest"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {log.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getSessionTypeBadgeColor(log.sessionType)}
                      >
                        {log.sessionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs">
                        <div>
                          <span className="text-muted-foreground font-medium">Device: </span>
                          <span className="capitalize">
                            {log.deviceType || "Unknown"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">Browser: </span>
                          <span>{log.browserName || "Unknown"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground font-medium">OS: </span>
                          <span>{log.operatingSystem || "Unknown"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {log.ipAddress || "N/A"}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>
                          {dateTimeUtils.formatDateTime(
                            log.createdAt,
                            "DD MMM YYYY"
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {dateTimeUtils.formatDateTime(
                            log.createdAt,
                            "hh:mm:ss AA"
                          )}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardPagination
        onClick={(page) => handleFilterChange({ page })}
        page={filters.page || 1}
        totalPages={fetchLogsQuery.data?.responseData.meta.totalPages || 1}
      />
    </Card>
  );
}

export default MeradhanAuthenticationLogsView;
