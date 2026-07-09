"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { T_SESSION_LOGS_CRM_RESPONSE } from "@root/apiGateway";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

interface SessionLogsTableProps {
  data: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["data"];
  isLoading: boolean;
  meta?: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["meta"];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  currentPage: number;
  currentPageSize: number;
}

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

const getSessionStatus = (
  session: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["data"][number]
) => {
  const now = new Date();
  const startTime = new Date(session.startTime);
  const hoursSinceStart =
    (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  // Check for logout specifically - endReason might contain "logout" or sessionType might be set
  const endReasonLower = session.endReason?.toLowerCase() || "";
  const isLogout =
    endReasonLower.includes("logout") ||
    endReasonLower === "logout" ||
    session.endReason === "logout";

  // If session has end time with logout reason, show Closed
  if (session.endTime && isLogout) {
    return {
      status: "Closed",
      color: "bg-purple-100 text-purple-800",
    };
  }

  // If session has end time with a reason, show the reason
  if (session.endTime && session.endReason) {
    return {
      status: session.endReason,
      color: "bg-red-100 text-red-800",
    };
  }

  // If session has end time without reason, it's expired
  if (session.endTime) {
    return {
      status: "Expired",
      color: "bg-red-100 text-red-800",
    };
  }

  // If session is older than 24 hours with no end time, show Session Closed
  if (hoursSinceStart > 24) {
    return {
      status: "Session Closed",
      color: "bg-orange-100 text-orange-800",
    };
  }

  // Session is active
  return {
    status: "Active",
    color: "bg-green-100 text-green-800",
  };
};

const hashSessionId = (id: number) => {
  // Generate consistent alphanumeric hash from ID
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "#";
  let num = id;

  // Generate 6 character hash consistently for the same ID
  for (let i = 0; i < 6; i++) {
    hash += chars[num % chars.length];
    num = Math.floor(num / chars.length);
  }

  return hash;
};

const SessionRow = ({
  session,
}: {
  session: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["data"][number];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const sessionStatus = getSessionStatus(session);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      asChild
      className="gap-0 p-0"
    >
      <Card className="overflow-hidden p-0">
        <CollapsibleTrigger asChild className="p-0">
          <div className="px-5 cursor-pointer hover:bg-gray-50 transition-colors py-4">
            <div className="flex items-center gap-6 overflow-x-auto">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 rounded-full flex-shrink-0"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-5 flex-1 min-w-0 overflow-x-auto">
                {/* Session ID */}
                <div className="flex-shrink-0 w-[80px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Session</span>
                    <span className="font-mono text-xs font-semibold text-gray-700">
                      {hashSessionId(session.id)}
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-shrink-0 w-[150px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">User</span>
                    <span className="font-medium text-xs truncate">
                      {session.user?.name || "N/A"}
                    </span>
                    <span className="text-xs text-gray-400 truncate">
                      {session.user?.email || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Login Time */}
                <div className="flex-shrink-0 w-[150px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Login</span>
                    <span className="text-xs font-medium whitespace-nowrap">
                      {format(
                        new Date(session.startTime),
                        "MMM dd, yyyy hh:mm:ss a"
                      )}
                    </span>
                  </div>
                </div>

                {/* Logout Time */}
                <div className="flex-shrink-0 w-[170px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Logout</span>
                    {session.endTime ? (
                      <span className="text-xs font-medium whitespace-nowrap">
                        {format(
                          new Date(session.endTime),
                          "MMM dd, yyyy hh:mm:ss a"
                        )}
                      </span>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5 w-fit">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex-shrink-0 w-[170px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Status</span>
                    <Badge
                      className={`${sessionStatus.color} text-xs px-2 py-0.5`}
                    >
                      {sessionStatus.status}
                    </Badge>
                  </div>
                </div>

                {/* Environment Info - Browser, Device, OS multiline */}
                <div className="flex-shrink-0 min-w-[120px] max-w-[180px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Environment</span>
                    <div className="text-xs text-gray-600 space-y-0.5">
                      <div>Browser: {session.browserName ?? "—"}</div>
                      <div>
                        Device:{" "}
                        <span className="capitalize">
                          {session.deviceType ?? "—"}
                        </span>
                      </div>
                      <div>OS: {session.operatingSystem ?? "—"}</div>
                    </div>
                  </div>
                </div>

                {/* IP Address */}
                <div className="flex-shrink-0 min-w-[110px] max-w-[140px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">IP Address</span>
                    <span className="font-mono text-xs text-gray-600 truncate">
                      {session.ipAddress}
                    </span>
                  </div>
                </div>

                {/* Duration & Pages */}
                <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 whitespace-nowrap"
                  >
                    {session.pageViews.length} pages
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-600 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs whitespace-nowrap">
                      {formatDuration(session.duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-gray-50 p-5 border-t">
            <div className="mb-4 flex items-center gap-2">
              <h4 className="font-semibold text-sm">Page Views Details</h4>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {session.pageViews.length} total
              </Badge>
            </div>
            {session.pageViews.length === 0 ? (
              <div className="text-center text-gray-500 py-8 bg-white rounded-md border">
                No page views recorded
              </div>
            ) : (
              <div className="rounded-md border bg-white overflow-x-auto max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-black align-top w-[300px] min-w-[300px] max-w-[300px]">
                        Page Path
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-black align-top">
                        Entry Time
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-black align-top">
                        Exit Time
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-black align-top">
                        Duration
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-black align-top">
                        Scroll Depth
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-black align-top">
                        Interactions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {session.pageViews.map((pageView) => (
                      <TableRow key={pageView.id}>
                        <TableCell className="text-xs text-gray-600 w-[300px] min-w-[300px] max-w-[300px]">
                          <div className="w-full">
                            {pageView.pageTitle && (
                              <div
                                className="font-medium mb-1 truncate w-full max-w-[300px]"
                                title={pageView.pageTitle}
                              >
                                {pageView.pageTitle}
                              </div>
                            )}
                            <div
                              className="text-gray-500 truncate w-full max-w-[300px]"
                              title={pageView.pagePath}
                            >
                              {pageView.pagePath}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {dateTimeUtils.formatDateTime(
                            pageView.entryTime,
                            "DD MMM YYYY hh:mm:ss AA"
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          {pageView.exitTime ? (
                            <span>
                              {dateTimeUtils.formatDateTime(
                                pageView.exitTime,
                                "DD MMM YYYY hh:mm:ss AA"
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs">
                              {pageView.exitTime
                                ? formatDuration(
                                  Math.floor(
                                    (new Date(pageView.exitTime).getTime() -
                                      new Date(
                                        pageView.entryTime
                                      ).getTime()) /
                                    1000
                                  )
                                )
                                : formatDuration(pageView.duration)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    pageView.scrollDepth,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">
                              {pageView.scrollDepth}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 text-xs px-2 py-0.5"
                          >
                            {pageView.interactions}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const SessionLogsTable = ({
  data,
  isLoading,
  meta,
  onPageChange,
  onPageSizeChange,
  currentPage,
  currentPageSize,
}: SessionLogsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading session logs...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 border rounded-md">
        <div className="text-gray-500">No session logs found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.map((session) => (
          <SessionRow key={session.id} session={session} />
        ))}
      </div>

      {meta && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <Select
              value={currentPageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {meta.totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!meta.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!meta.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionLogsTable;
