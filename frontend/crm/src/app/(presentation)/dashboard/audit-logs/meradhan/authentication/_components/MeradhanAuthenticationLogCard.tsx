"use client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface MeradhanAuthenticationLogCardProps {
  logs: {
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
  }[];
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

function MeradhanAuthenticationLogCard({
  logs,
}: MeradhanAuthenticationLogCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead className="min-w-[120px]">Session Type</TableHead>
            <TableHead className="min-w-[100px]">Device</TableHead>
            <TableHead className="min-w-[100px]">Browser</TableHead>
            <TableHead className="min-w-[100px]">Operating System</TableHead>
            <TableHead className="min-w-[120px]">IP Address</TableHead>
            <TableHead className="min-w-[150px]">Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-8 text-muted-foreground"
              >
                No authentication logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default MeradhanAuthenticationLogCard;
