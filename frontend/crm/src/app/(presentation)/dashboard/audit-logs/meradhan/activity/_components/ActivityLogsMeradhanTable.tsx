"use client";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { T_ACTIVITY_LOGS_MERADHAN_RESPONSE } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ActivityLogsMeradhanTableProps {
  data: T_ACTIVITY_LOGS_MERADHAN_RESPONSE["responseData"]["data"];
  isLoading?: boolean;
  meta?: T_ACTIVITY_LOGS_MERADHAN_RESPONSE["responseData"]["meta"];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  currentPageSize?: number;
}

const getEntityBadgeColor = (entityType: string) => {
  const colors: Record<string, string> = {
    auth: "bg-purple-100 text-purple-800 border-purple-200",
    customer: "bg-blue-100 text-blue-800 border-blue-200",
    bonds: "bg-green-100 text-green-800 border-green-200",
    portfolio: "bg-orange-100 text-orange-800 border-orange-200",
    kyc: "bg-cyan-100 text-cyan-800 border-cyan-200",
    payment: "bg-pink-100 text-pink-800 border-pink-200",
  };
  return (
    colors[entityType.toLowerCase()] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

const getActionBadgeColor = (action: string) => {
  const actionLower = action.toLowerCase();
  if (actionLower.includes("create")) {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (actionLower.includes("add")) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (actionLower.includes("update")) {
    return "bg-sky-100 text-sky-800 border-sky-200";
  }
  if (actionLower.includes("edit")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (actionLower.includes("modify")) {
    return "bg-cyan-100 text-cyan-800 border-cyan-200";
  }
  if (actionLower.includes("delete")) {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (actionLower.includes("remove")) {
    return "bg-rose-100 text-rose-800 border-rose-200";
  }
  if (actionLower.includes("login")) {
    return "bg-indigo-100 text-indigo-800 border-indigo-200";
  }
  if (actionLower.includes("logout")) {
    return "bg-pink-100 text-pink-800 border-pink-200";
  }
  if (actionLower.includes("auth")) {
    return "bg-purple-100 text-purple-800 border-purple-200";
  }
  if (actionLower.includes("view")) {
    return "bg-slate-100 text-slate-800 border-slate-200";
  }
  if (actionLower.includes("read")) {
    return "bg-gray-100 text-gray-800 border-gray-200";
  }
  if (actionLower.includes("fetch")) {
    return "bg-zinc-100 text-zinc-800 border-zinc-200";
  }
  return "bg-amber-100 text-amber-800 border-amber-200";
};

function ActivityLogsMeradhanTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  currentPageSize = 10,
}: ActivityLogsMeradhanTableProps) {
  return (
    <div className="space-y-4">
      <UniversalTable<
        T_ACTIVITY_LOGS_MERADHAN_RESPONSE["responseData"]["data"][number]
      >
        initialPageSize={currentPageSize}
        data={data || []}
        isLoading={isLoading}
        fields={[
          { key: "createdAt", label: "Timestamp", type: "datetime" },
          {
            key: "entityType",
            label: "Entity",
            cell: (row) => (
              <Badge
                variant="outline"
                className={getEntityBadgeColor(row.entityType)}
              >
                {row.entityType}
              </Badge>
            ),
          },
          {
            key: "action",
            label: "Action",
            cell: (row) => (
              <Badge
                variant="outline"
                className={getActionBadgeColor(row.action)}
              >
                {row.action}
              </Badge>
            ),
          },
          {
            key: "entityType",
            label: "Details",
            cell(row) {
              return (
                <div className="text-xs text-gray-600 max-w-md">
                  <div className="mb-1">
                    {Object.keys(row.details).length > 0 ? (
                      <div className="space-y-0.5">
                        {Object.entries(row.details)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <div key={key} className="truncate">
                              <span className="font-medium">{key}:</span>{" "}
                              {String(value)}
                            </div>
                          ))}
                        {Object.keys(row.details).length > 3 && (
                          <div className="text-gray-400">
                            +{Object.keys(row.details).length - 3} more
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No details</span>
                    )}
                  </div>
                  {(row.deviceType ||
                    row.browserName ||
                    row.operatingSystem) && (
                    <div className="text-gray-500 mt-2 pt-2 border-t">
                      {row.deviceType && row.browserName && (
                        <div>
                          Device: {row.deviceType} - {row.browserName}
                        </div>
                      )}
                      {row.operatingSystem && (
                        <div>OS: {row.operatingSystem}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            key: "userId",
            label: "User",
            cell: (row) => (
              <div className="text-sm">
                <p className="font-medium">{row.name || "Guest"}</p>
                <p className="text-gray-500 text-xs">{row.email}</p>
              </div>
            ),
          },
          {
            key: "ipAddress",
            label: "IP Address",
            cell: (row) => (
              <p className="font-mono text-sm">{row.ipAddress || "N/A"}</p>
            ),
          },
        ]}
      />

      {/* Server-side Pagination Controls */}
      {meta && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select
              value={String(currentPageSize)}
              onValueChange={(value) => onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={!meta.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={!meta.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogsMeradhanTable;
