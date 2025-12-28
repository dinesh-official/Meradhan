"use client";

import { cn } from "@/lib/utils";
import { CashFlowData } from "../_helpers/xirr";
import { YtmResult } from "../_helpers/ytm";
import { XirrLineChart } from "./XirrChart";

export const description = "YTM Cash Flow Chart";

export function FlowChart({
  ytmData,
  xirrData,
  xirrRate,
}: {
  ytmData?: YtmResult | undefined;
  xirrData?: CashFlowData | undefined;
  xirrRate?: number;
}) {
  // Handle XIRR data
  if (xirrData !== undefined) {
    const hasValidData = xirrData && xirrData.cashflow && xirrData.cashflow.length > 0;
    const xirrRatePercent = xirrRate ?? 0;

    if (!hasValidData) {
      return (
        <div className="p-6">
          <div className="mb-5 flex items-center justify-center flex-col gap-4">
            <div className="flex items-center justify-center flex-col">
              <h3 className="text-2xl text-center">
                Extended Internal Rate of Return (XIRR): <span className="font-semibold">--</span>
              </h3>
              <small className="text-muted-foreground text-xs mt-1">
                (Please enter valid inputs)
              </small>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-5 flex items-center justify-center flex-col gap-4">
          <div className="flex items-center justify-center flex-col">
            <h3 className="text-2xl text-center">
              Extended Internal Rate of Return (XIRR):{" "}
              <span
                className={cn("font-semibold", {
                  "text-green-600": xirrRatePercent > 0,
                  "text-red-600": xirrRatePercent < 0,
                })}
              >
                {xirrRatePercent.toFixed(7)}%
              </span>
            </h3>
            <small className="text-muted-foreground text-xs mt-1">
              (Effective Annual Yield using XIRR)
            </small>
          </div>


        </div>

        <div className="lg:h-80 relative">
          <XirrLineChart cashflowData={xirrData.cashflow} />
        </div>
        <p className="text-xs flex items-center justify-center gap-2 mt-2">
          <span className="bg-[#4f81bd] min-w-[20px] min-h-[6px] rounded-full inline-block"></span>
          Cash Flow Amount
        </p>
      </div>
    );
  }

  // Handle YTM data (original logic)
  if (!ytmData) {
    return (
      <div className="p-6">
        <div className="mb-5 flex items-center justify-center flex-col gap-4">
          <div className="flex items-center justify-center flex-col">
            <h3 className="text-2xl text-center">
              Yield to Maturity (YTM): <span className="font-semibold">--</span>
            </h3>
            <small className="text-muted-foreground text-xs mt-1">
              (Please enter valid inputs)
            </small>
          </div>
        </div>
      </div>
    );
  }

  const effectiveAnnualYtmPercent = (ytmData.effectiveAnnualYtm || 0) * 100;

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-center flex-col gap-4">
        <div className="flex items-center justify-center flex-col">
          <h3 className="text-2xl text-center">
            YTM:{" "}
            <span
              className={cn("font-semibold", {
                "text-green-600": effectiveAnnualYtmPercent > 0,
                "text-red-600": effectiveAnnualYtmPercent < 0,
              })}
            >
              {effectiveAnnualYtmPercent?.toFixed(7)}%
            </span>
          </h3>
          <small className="text-muted-foreground text-xs mt-1">
            (Yield to Maturity - Effective Annual Yield)
          </small>
        </div>

      </div>

      <div className="lg:h-80 relative">
        <XirrLineChart cashflowData={ytmData.cashflow} />
      </div>
      <p className="text-xs flex items-center justify-center gap-2 mt-2">
        <span className="bg-[#4f81bd] min-w-[20px] min-h-[6px] rounded-full inline-block"></span>
        Cash Flow Amount
      </p>
    </div>
  );
}
