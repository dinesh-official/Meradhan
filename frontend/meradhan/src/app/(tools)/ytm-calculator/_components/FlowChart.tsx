"use client";


import {
  ChartConfig
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import {
  getXirr,
  prepareXirrValues,
  XirrResult
} from "../_helpers/xirr";

export const description = "XIRR Cash Flow Chart";

// Simple date formatter as fallback
const formatDateSimple = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const chartConfig = {
  cashFlow: {
    label: "Cash Flow",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function FlowChart({ xirrData }: { xirrData: XirrResult }) {
  const listCashFlow = xirrData.cashflow;

  // Prepare chart data from cash flow
  const chartData = listCashFlow.map((item, index) => ({
    index: index + 1,
    date: formatDateSimple(item.paymentDate),
    cashFlow: item.amount,
    type: item.type,
    fullDate: formatDateSimple(item.paymentDate),
  }));

  const values = prepareXirrValues(xirrData.cashflow);
  const result = getXirr(values);
  const formatted =
    typeof result === "number" ? `${(result * 100).toFixed(2)}%` : result;

  // Get min/max for Y-axis

  return (
    <div className="p-6">
      <div className="mb-5">
        <h3 className="text-2xl text-center">
          XIRR:{" "}
          <span
            className={cn("font-semibold", {
              "text-green-600": Number(result) > 0,
              "text-red-600": Number(result) < 0,
            })}
          >
            {formatted}
          </span>
        </h3>
      </div>

      <div className="h-80">
        <div className="flex justify-center items-center bg-gray-50 rounded-md h-full">
          <p></p>
        </div>
      </div>
    </div>
  );
}
