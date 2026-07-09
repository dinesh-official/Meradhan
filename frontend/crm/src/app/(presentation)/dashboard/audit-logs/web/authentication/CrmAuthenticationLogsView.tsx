"use client";
import { Card, CardContent } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import CardPagination from "@/global/elements/table/CardPagination";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import AuditLogsView from "../../_components/AuditLogsView";
import AuthenticationLogsCardHeaderFilters from "./_components/AuthenticationLogsCardHeaderFilters";
import { useState, useCallback } from "react";

export interface GroupQuery {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

function AuthenticationActivityLogsView() {
  const logsApi = new apiGateway.crm.auditlogs.AuditLogsApi(apiClientCaller);

  const [filters, setFilters] = useState<GroupQuery>({
    page: 1,
    limit: 10,
    userId: undefined,
    search: undefined,
  });

  const handleFilterChange = useCallback((newFilters: Partial<GroupQuery>) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      
      // Reset to page 1 when search or userId filters change (but not when page changes)
      if ('search' in newFilters || 'userId' in newFilters) {
        updatedFilters.page = 1;
      }
      
      return updatedFilters;
    });
  }, []);

  const fetchLogsQuery = useQuery({
    queryKey: ["web-authentication-logs", filters],
    queryFn: async () => {
      const response = await logsApi.getAuthWebGroupedAuditLogs({
        page: filters.page || 1,
        limit: filters.limit || 10,
        userId: filters.userId,
        search: filters.search,
      });
      return response.data;
    },
  });

  return (
    <Card>
      <AuthenticationLogsCardHeaderFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={fetchLogsQuery.isLoading}
      />
      <CardContent className="space-y-4">
        {fetchLogsQuery.isLoading ? (
          <div className="flex flex-col justify-center items-center space-y-2 w-full h-40">
            <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            <p className="text-gray-500 text-sm">Loading authentication logs...</p>
          </div>
        ) : fetchLogsQuery.isError ? (
          <div className="flex flex-col justify-center items-center w-full h-40 text-red-500">
            <p className="font-medium text-lg">Error loading logs</p>
            <p className="text-sm">Please try again later</p>
          </div>
        ) : fetchLogsQuery.data?.responseData.sessions.length === 0 ? (
          <div className="flex flex-col justify-center items-center w-full h-40 text-gray-500">
            <p className="font-medium text-lg">No authentication logs found</p>
            <p className="text-sm text-center">
              {filters.search || filters.userId 
                ? "Try adjusting your filters or search criteria" 
                : "No authentication activity recorded yet"
              }
            </p>
          </div>
        ) : (
          fetchLogsQuery.data?.responseData.sessions.map((session) => (
            <AuditLogsView key={session.trackId} session={session} />
          ))
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

export default AuthenticationActivityLogsView;
