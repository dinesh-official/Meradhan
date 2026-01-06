"use client";

import { ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { getXirr, prepareXirrValues, XirrResult } from "../_helpers/xirr";
import { XirrLineChart } from "./XirrChart";

export const description = "XIRR Cash Flow Chart";

// Simple date formatter as fallback
// const formatDateSimple = (dateStr: string): string => {
//   try {
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "2-digit",
//       year: "2-digit",
//     });
//   } catch {
//     return dateStr;
//   }
// };

// const chartConfig = {
//   cashFlow: {
//     label: "Cash Flow",
//     color: "hsl(var(--primary))",
//   },
// } satisfies ChartConfig;

export function FlowChart({
  xirrData,
  ytm,
  yieldVal,
}: {
  xirrData: XirrResult;
  ytm: number;
  yieldVal: number;
}) {
  const values = prepareXirrValues(xirrData.cashflow);
  const result = getXirr(values);
  // const formatted =
  //   typeof result === "number" ? `${(result * 100).toFixed(2)}%` : result;

  // Get min/max for Y-axis

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-center flex-col">
        <h3 className="text-2xl text-center">
          YTM:{" "}
          {isNaN(ytm) ? (
            <span className="text-red-600">CHECK INPUTS</span>
          ) : (
            <span
              className={cn("font-semibold", {
                "text-green-600": Number(result) > 0,
                "text-red-600": Number(result) < 0,
              })}
            >
              {ytm?.toFixed(4)}%
            </span>
          )}
        </h3>

        {/* <small> (Current Yield: {yieldVal?.toFixed(4)}% )</small> */}
      </div>

      <div className="lg:h-80 relative">
        <XirrLineChart cashflowData={xirrData["cashflow"]} />
      </div>
      <p className="text-xs flex items-center justify-center gap-2 mt-2">
        <span className="bg-[#4f81bd] min-w-[20px] min-h-[6px] rounded-full inline-block"></span>
        Interest Amount
      </p>
    </div>
  );
}
