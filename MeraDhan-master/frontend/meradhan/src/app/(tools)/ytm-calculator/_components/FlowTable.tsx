"use client";

import { cn } from "@/lib/utils";
import { IndianRupee } from "lucide-react";
import { ApiCashflowItem } from "../_hooks/useYtm";

// Simple date formatter as fallback
const parseDdMmYyyy = (value: string): Date | null => {
  const parts = value.split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(yyyy, mm - 1, dd);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateSimple = (dateStr: string): string => {
  try {
    const parsed = parseDdMmYyyy(dateStr);
    const date = parsed ?? new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatNumber = (value: string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function FlowTable({
  cashflow,
}: {
  cashflow: ApiCashflowItem[];
}) {
  return (
    <div className="container">
      <h2 className="mb-6 text-[32px] quicksand-semibold">
        Cash <span className="text-red-600"> Flow</span>
      </h2>
      <div className="w-full overflow-x-auto">
        <table className="divide-y first:divide-white w-full table-fixed">
          <thead className="rounded overflow-hidden">
            <tr className="bg-[#F5F5F5] p-3 rounded-3xl text-black text-sm">
              <th className="p-4 text-left">Period</th>
              <th className="p-4 font-medium text-sm text-left">Date</th>
              <th className="p-4 font-medium text-sm text-left">Coupon</th>
              <th className="p-4 font-medium text-sm text-left">Principal</th>
              <th className="p-4 font-medium text-sm text-left">
                Total Cashflow
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {cashflow.map((flow, index) => {
              const total = Number(flow.totalCashflow);
              return (
                <tr
                  key={`${flow.period}-${flow.date}-${index}`}
                  className={cn("hover:bg-gray-50", {
                    "font-bold": Number(flow.principal) > 0,
                  })}
                >
                  <td className="p-4 text-left">{flow.period}</td>
                  <td className="p-4 text-left">
                    {formatDateSimple(flow.date)}
                  </td>
                  <td className="p-4 text-left">
                    <span className="flex items-center">
                      <IndianRupee size={14} className="mt-0.5" />
                      {formatNumber(flow.coupon)}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <span className="flex items-center">
                      <IndianRupee size={14} className="mt-0.5" />
                      {formatNumber(flow.principal)}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <span className="flex items-center">
                      {Number.isFinite(total) && total < 0 ? "-" : ""}
                      <IndianRupee size={14} className="mt-0.5" />
                      {formatNumber(String(Math.abs(total)))}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
