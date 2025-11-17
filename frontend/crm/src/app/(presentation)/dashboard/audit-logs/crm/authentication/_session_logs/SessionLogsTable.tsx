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

interface SessionLogsTableProps {
  data: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["data"];
  isLoading: boolean;
  meta?: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["meta"];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  currentPage: number;
  currentPageSize: number;
}

const getDeviceBadgeColor = (device: string) => {
  const lowerDevice = device.toLowerCase();
  if (lowerDevice === "desktop") return "bg-blue-100 text-blue-800";
  if (lowerDevice === "mobile") return "bg-green-100 text-green-800";
  if (lowerDevice === "tablet") return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
};

const getBrowserBadgeColor = (browser: string) => {
  const lowerBrowser = browser.toLowerCase();
  if (lowerBrowser.includes("chrome")) return "bg-emerald-100 text-emerald-800";
  if (lowerBrowser.includes("firefox")) return "bg-orange-100 text-orange-800";
  if (lowerBrowser.includes("safari")) return "bg-cyan-100 text-cyan-800";
  if (lowerBrowser.includes("edge")) return "bg-blue-100 text-blue-800";
  if (lowerBrowser.includes("opera")) return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
};

const getOSBadgeColor = (os: string) => {
  const lowerOS = os.toLowerCase();
  if (lowerOS.includes("windows")) return "bg-sky-100 text-sky-800";
  if (lowerOS.includes("mac") || lowerOS.includes("ios"))
    return "bg-gray-100 text-gray-800";
  if (lowerOS.includes("linux")) return "bg-amber-100 text-amber-800";
  if (lowerOS.includes("android")) return "bg-green-100 text-green-800";
  return "bg-zinc-100 text-zinc-800";
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

const getSessionStatus = (
  session: T_SESSION_LOGS_CRM_RESPONSE["responseData"]["data"][number]
) => {
  const now = new Date();
  const startTime = new Date(session.startTime);
  const hoursSinceStart =
    (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);

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

  // If session is older than 24 hours, auto expired
  if (hoursSinceStart > 24) {
    return {
      status: "Auto Expired",
      color: "bg-orange-100 text-orange-800",
    };
  }

  // Session is active
  return {
    status: "Active",
    color: "bg-green-100 text-green-800",
  };
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
      <Card className=" overflow-hidden p-0">
        <CollapsibleTrigger asChild className="p-0">
          <div className="px-3 cursor-pointer hover:bg-gray-50 transition-colors py-3">
            <div className="flex items-start justify-between  border-b pb-4">
              <div className="flex items-start gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-7 w-7 rounded-full"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <h3 className="font-semibold text-sm">
                    Session #{session.id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {format(
                      new Date(session.createdAt),
                      "MMMM dd, yyyy 'at' hh:mm a"
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${sessionStatus.color} text-xs px-2 py-0.5`}>
                  {sessionStatus.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5"
                >
                  {session.pageViews.length} pages
                </Badge>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs">
                    {formatDuration(session.duration)}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start mt-4">
              <div className="md:col-span-1"></div>

              <div className="md:col-span-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">User</span>
                  <span className="font-medium text-xs">
                    {session.user?.name || "N/A"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session.user?.email || "N/A"}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">
                    Session Duration
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">Start:</span>
                      <span className="text-xs">
                        {format(new Date(session.startTime), "MMM dd, hh:mm a")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">End:</span>
                      {session.endTime ? (
                        <span className="text-xs">
                          {format(new Date(session.endTime), "MMM dd, hh:mm a")}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">
                    IP Address
                  </span>
                  <span className="font-mono text-xs">{session.ipAddress}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 mb-0.5">
                    Device & Browser
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    <Badge
                      className={`${getDeviceBadgeColor(
                        session.deviceType
                      )} text-xs px-2 py-0.5`}
                    >
                      {session.deviceType}
                    </Badge>
                    <Badge
                      className={`${getBrowserBadgeColor(
                        session.browserName
                      )} text-xs px-2 py-0.5`}
                    >
                      {session.browserName}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-0.5">
                    Operating System
                  </span>
                  <Badge
                    className={`${getOSBadgeColor(
                      session.operatingSystem
                    )} text-xs px-2 py-0.5`}
                  >
                    {session.operatingSystem}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-gray-50 p-3 border-t ">
            <div className="mb-2 flex items-center gap-2">
              <h4 className="font-semibold text-xs">Page Views Details</h4>
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {session.pageViews.length} total
              </Badge>
            </div>
            <div className="rounded-md border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page Path</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Scroll Depth</TableHead>
                    <TableHead>Interactions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {session.pageViews.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-500 py-8"
                      >
                        No page views recorded
                      </TableCell>
                    </TableRow>
                  ) : (
                    session.pageViews.map((pageView) => (
                      <TableRow key={pageView.id}>
                        <TableCell>
                          <span className="font-mono text-xs text-gray-600">
                            {pageView.pagePath}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {format(
                              new Date(pageView.entryTime),
                              "MMM dd, hh:mm a"
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          {pageView.exitTime ? (
                            <span className="text-sm text-gray-700">
                              {format(
                                new Date(pageView.exitTime),
                                "MMM dd, hh:mm a"
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {formatDuration(pageView.duration)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    pageView.scrollDepth,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {pageView.scrollDepth}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700"
                          >
                            {pageView.interactions}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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
