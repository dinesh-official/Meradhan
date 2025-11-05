"use client";

import React from "react";
import { IndianRupee } from "lucide-react";
import { useXirr } from "../_hooks/useXirr";
import { CashFlowData } from "../_helpers/xirr";
import { cn } from "@/lib/utils";

// Simple date formatter as fallback
const formatDateSimple = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export default function FlowTable({ flowData }: { flowData: CashFlowData }) {
  return (
    <div className="container">
      <h2 className="mb-6 text-[32px] quicksand-semibold">
        XIRR <span className="text-red-600"> Cash Flow</span>
      </h2>

      <div className="w-full overflow-x-auto">
        <table className="divide-y first:divide-white w-full table-fixed">
          <thead className="rounded overflow-hidden">
            <tr className="bg-[#F5F5F5] p-3 rounded-3xl text-black text-sm">
              <th className="p-4"></th>
              <th className="p-4 font-medium text-sm text-left">
                Payment Date
              </th>
              <th className="p-4 font-medium text-sm text-left">
                Cash Flow
              </th>
              <th className="p-4 font-medium text-sm text-left">
                Payment Type
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {flowData.cashflow.map((flow, index) => {
              return (
                // make last 2 rows bold
                <tr key={index} className={cn("hover:bg-gray-50", { "font-bold": index >= flowData.cashflow.length - 2 })}>
                  <td className="p-4 text-left">{index + 1}</td>
                  <td className="p-4 text-left">
                    {formatDateSimple(flow.paymentDate)}
                  </td>
                  <td className="p-4 text-left">
                    <span className={`flex items-center `}>
                      <IndianRupee size={14} className="mt-0.5" />
                      {Math.abs(flow.amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="p-4 text-left">{flow.type}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
