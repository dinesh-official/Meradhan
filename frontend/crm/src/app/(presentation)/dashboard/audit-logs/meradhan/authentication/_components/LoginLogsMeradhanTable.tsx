"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";

type LoginLog = {
  id: number;
  userId?: number | null;
  name?: string | null;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  browserName?: string | null;
  deviceType?: string | null;
  operatingSystem?: string | null;
  sessionType: string;
  success: boolean;
  createdAt: string;
};

interface LoginLogsMeradhanTableProps {
  data: LoginLog[];
  isLoading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    onPageChange: (page: number) => void;
  };
}

const getDeviceBadgeColor = (device?: string | null) => {
  if (!device) return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  const colors: Record<string, string> = {
    Desktop: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Mobile: "bg-green-500/10 text-green-700 dark:text-green-400",
    Tablet: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };
  return colors[device] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
};

const getBrowserBadgeColor = (browser?: string | null) => {
  if (!browser) return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  const colors: Record<string, string> = {
    Chrome: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Firefox: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Safari: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    Edge: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Opera: "bg-red-500/10 text-red-700 dark:text-red-400",
  };
  return colors[browser] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
};

const getOSBadgeColor = (os?: string | null) => {
  if (!os) return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  const colors: Record<string, string> = {
    Windows: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    macOS: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    Linux: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Android: "bg-green-500/10 text-green-700 dark:text-green-400",
    iOS: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
  };
  return colors[os] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
};

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

export function LoginLogsMeradhanTable({
  data,
  isLoading,
  pagination,
}: LoginLogsMeradhanTableProps) {
  if (isLoading) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        Loading login logs...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No login logs found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Status</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Session Type</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Browser</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((log) => (
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
                  <Badge
                    variant="secondary"
                    className={getDeviceBadgeColor(log.deviceType)}
                  >
                    <span className="capitalize">
                      {log.deviceType || "Unknown"}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getBrowserBadgeColor(log.browserName)}
                  >
                    {log.browserName || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getOSBadgeColor(log.operatingSystem)}
                  >
                    {log.operatingSystem || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {log.ipAddress || "N/A"}
                  </code>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>
                      {format(new Date(log.createdAt), "MMM dd, yyyy")}
                    </span>
                    <span className="text-muted-foreground">
                      {format(new Date(log.createdAt), "hh:mm:ss a")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
          total)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
