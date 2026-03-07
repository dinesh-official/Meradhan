"use client";

import { T_ACTIVITY_LOGS_CRM_RESPONSE } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { correctActionSpelling } from "@/app/(presentation)/dashboard/audit-logs/meradhan/activity/_utils/actionSpellingCorrections";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Spinner } from "@/components/ui/spinner";
import { useMemo } from "react";

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  panNumber?: string;
  kycStatus: "Pending" | "Verified" | "Rejected";
  status: "Active" | "Inactive";
  totalInvestment: number;
  leadId?: string;
  username?: string;
  dematAccount?: string;
  relationshipManager?: string;
  createdAt: string;
  updatedAt: string;
};

interface ActivityLogsCrmTableProps {
  data: T_ACTIVITY_LOGS_CRM_RESPONSE["responseData"]["data"];
  isLoading?: boolean;
  meta?: T_ACTIVITY_LOGS_CRM_RESPONSE["responseData"]["meta"];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  currentPage?: number;
  currentPageSize?: number;
}

const getEntityBadgeColor = (entityType: string) => {
  const colors: Record<string, string> = {
    auth: "bg-purple-100 text-purple-800 border-purple-200",
    customer: "bg-blue-100 text-blue-800 border-blue-200",
    leads: "bg-green-100 text-green-800 border-green-200",
    rfq: "bg-orange-100 text-orange-800 border-orange-200",
    users: "bg-cyan-100 text-cyan-800 border-cyan-200",
    login: "bg-pink-100 text-pink-800 border-pink-200",
  };
  return (
    colors[entityType.toLowerCase()] ||
    "bg-gray-100 text-gray-800 border-gray-200"
  );
};

/** One distinct color per action type so each is easy to tell apart. */
const ACTION_BADGE_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-800 border-emerald-200",
  add: "bg-green-100 text-green-800 border-green-200",
  update: "bg-sky-100 text-sky-800 border-sky-200",
  edit: "bg-blue-100 text-blue-800 border-blue-200",
  modify: "bg-cyan-100 text-cyan-800 border-cyan-200",
  delete: "bg-red-100 text-red-800 border-red-200",
  remove: "bg-rose-100 text-rose-800 border-rose-200",
  login: "bg-indigo-100 text-indigo-800 border-indigo-200",
  logout: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
  auth: "bg-violet-100 text-violet-800 border-violet-200",
  view: "bg-slate-100 text-slate-800 border-slate-200",
  read: "bg-stone-100 text-stone-800 border-stone-200",
  fetch: "bg-zinc-100 text-zinc-800 border-zinc-200",
  default: "bg-amber-100 text-amber-800 border-amber-200",
};

const getActionBadgeColor = (action: string) => {
  const actionLower = action.toLowerCase();
  const order: (keyof typeof ACTION_BADGE_COLORS)[] = [
    "create",
    "add",
    "update",
    "edit",
    "modify",
    "delete",
    "remove",
    "login",
    "logout",
    "auth",
    "view",
    "read",
    "fetch",
  ];
  for (const key of order) {
    if (key !== "default" && actionLower.includes(key)) {
      return ACTION_BADGE_COLORS[key];
    }
  }
  return ACTION_BADGE_COLORS.default;
};

function renderDetailValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside pl-2 space-y-0.5">
        {value.map((item, index) => (
          <li key={index}>{renderDetailValue(item)}</li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <ul className="list-none pl-3 space-y-1 border-l border-gray-200 ml-1">
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <li key={k} className="text-xs">
            <span className="font-medium text-gray-700">{k}:</span>{" "}
            <span className="text-gray-600">{renderDetailValue(v)}</span>
          </li>
        ))}
      </ul>
    );
  }
  return String(value);
}

function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  return false;
}

/** Flatten details: if key is "updatedFields" and value is an object, show only its inner fields (never show "updatedFields" label). When updatedFields is empty, nothing is shown. Skips empty values. */
function getDetailEntries(details: Record<string, unknown>): [string, unknown][] {
  const entries: [string, unknown][] = [];
  for (const [key, value] of Object.entries(details)) {
    if (key === "updatedFields") {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
          if (!isEmptyValue(v)) entries.push([k, v]);
        }
      }
      // never show "updatedFields" as a row when it's empty or not an object
    } else if (!isEmptyValue(value)) {
      entries.push([key, value]);
    }
  }
  return entries;
}

const COLUMN_COUNT = 6;

function ActivityLogsCrmTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onPageSizeChange,
  currentPage = 1,
  currentPageSize = 10,
}: ActivityLogsCrmTableProps) {
  const rows = useMemo(() => data || [], [data]);

  return (
    <div className="space-y-4">
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3 font-normal text-xs text-black text-left align-top border-r border-gray-200">
                Timestamp
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-xs text-black text-left align-top border-r border-gray-200">
                Entity
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-xs text-black text-left align-top border-r border-gray-200">
                Action
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-xs text-black text-left align-top border-r border-gray-200">
                Details
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-xs text-black text-left align-top border-r border-gray-200">
                User
              </TableHead>
              <TableHead className="px-4 py-3 font-normal text-xs text-black">
                IP Address
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="h-40 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="px-10 h-24 text-left"
                >
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const rowId = `${row.createdAt ?? ""}-${row.email ?? ""}-${row.action ?? ""}-${index}`;
                const detailEntries = getDetailEntries(
                  (row.details || {}) as Record<string, unknown>
                );
                const hasDetails = detailEntries.length > 0;

                return (
                  <TableRow key={rowId} className="align-top">
                    <TableCell className="px-4 py-3 text-sm whitespace-nowrap text-left align-top border-r border-gray-200">
                      {row.createdAt
                        ? dateTimeUtils.formatDateTime(
                            new Date(row.createdAt),
                            "DD MMM YYYY hh:mm:ss AA"
                          )
                        : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-left align-top border-r border-gray-200">
                      <Badge
                        variant="outline"
                        className={getEntityBadgeColor(row.entityType)}
                      >
                        {row.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-left align-top border-r border-gray-200">
                      <Badge
                        variant="outline"
                        className={getActionBadgeColor(
                          correctActionSpelling(row.action)
                        )}
                      >
                        {correctActionSpelling(row.action)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-600 max-w-md text-left align-top border-r border-gray-200">
                      {hasDetails ? (
                        <div className="space-y-2">
                          <ul className="list-none space-y-1">
                            {detailEntries.map(([key, value]) => (
                              <li
                                key={key}
                                className="flex gap-2 flex-wrap wrap-break-word"
                              >
                                <span className="font-medium text-gray-700 shrink-0">
                                  {key}:
                                </span>
                                <span className="text-gray-600">
                                  {renderDetailValue(value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-2 border-t border-gray-200 text-gray-500 text-xs space-y-0.5">
                            <div>Browser: {row.browserName ?? "—"}</div>
                            <div>Device: {row.deviceType ?? "—"}</div>
                            <div>OS: {row.operatingSystem ?? "—"}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-left align-top border-r border-gray-200">
                      <div className="text-sm">
                        <p className="font-medium">{row.name}</p>
                        <p className="text-gray-500 text-xs">{row.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-mono text-sm">
                      {row.ipAddress}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

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

export default ActivityLogsCrmTable;
