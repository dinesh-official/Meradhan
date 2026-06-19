"use client";

import { cn } from "@/lib/utils";
import { ShimmerBlock } from "@/components/ui/shimmer";

function ShimmerLine({
  className,
  align = "left",
}: {
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <div className={cn(align === "right" && "flex justify-end")}>
      <ShimmerBlock className={cn("h-4 rounded", className)} />
    </div>
  );
}

const CASHFLOW_ROW_WIDTHS = [
  ["w-9", "w-28", "w-10", "w-24", "w-8", "w-28"],
  ["w-10", "w-32", "w-9", "w-20", "w-16", "w-24"],
  ["w-8", "w-28", "w-10", "w-20", "w-8", "w-24"],
  ["w-10", "w-32", "w-9", "w-24", "w-14", "w-28"],
  ["w-9", "w-28", "w-10", "w-20", "w-8", "w-24"],
  ["w-10", "w-32", "w-9", "w-20", "w-16", "w-28"],
  ["w-8", "w-28", "w-10", "w-24", "w-8", "w-24"],
] as const;

const DOCUMENT_ROW_WIDTHS = [
  ["w-[72%] max-w-[200px]", "w-[60%] max-w-[160px]", "w-24", "w-[132px]"],
  ["w-[55%] max-w-[180px]", "w-[70%] max-w-[200px]", "w-20", "w-[132px]"],
  ["w-[65%] max-w-[190px]", "w-[50%] max-w-[140px]", "w-24", "w-[132px]"],
  ["w-[58%] max-w-[170px]", "w-[62%] max-w-[175px]", "w-20", "w-[132px]"],
] as const;

export function BondCashflowTabShimmer() {
  return (
    <div
      className="w-full py-6"
      role="status"
      aria-busy="true"
      aria-label="Loading cashflow schedule"
    >
      <div className="px-0 py-4">
        <ShimmerBlock className="h-7 w-64 max-w-[90%] rounded-md" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">
                <ShimmerBlock className="h-3 w-12 rounded" />
              </th>
              <th className="px-4 py-3">
                <ShimmerBlock className="h-3 w-10 rounded" />
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-3 w-9 rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-3 w-14 rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-3 w-16 rounded" />
                </div>
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-3 w-14 rounded" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {CASHFLOW_ROW_WIDTHS.map((widths, index) => (
              <tr
                key={index}
                className={cn(
                  "border-t border-slate-100",
                  index % 2 === 0 ? "bg-sky-50/60" : "bg-white",
                )}
              >
                <td className="px-4 py-3">
                  <ShimmerLine className={widths[0]} />
                </td>
                <td className="px-4 py-3">
                  <ShimmerLine className={widths[1]} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ShimmerLine className={widths[2]} align="right" />
                </td>
                <td className="px-4 py-3 text-right">
                  <ShimmerLine className={widths[3]} align="right" />
                </td>
                <td className="px-4 py-3 text-right">
                  <ShimmerLine className={widths[4]} align="right" />
                </td>
                <td className="px-4 py-3 text-right">
                  <ShimmerLine className={widths[5]} align="right" />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
              <td className="px-4 py-3" colSpan={5}>
                <ShimmerBlock className="h-4 w-14 rounded" />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-4 w-28 rounded" />
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function BondDocumentsTabShimmer() {
  return (
    <div
      className="space-y-3 py-6"
      role="status"
      aria-busy="true"
      aria-label="Loading bond documents"
    >
      <ShimmerBlock className="h-4 w-56 max-w-[85%] rounded" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">
                <ShimmerBlock className="h-3 w-20 rounded" />
              </th>
              <th className="px-4 py-3">
                <ShimmerBlock className="h-3 w-8 rounded" />
              </th>
              <th className="px-4 py-3">
                <ShimmerBlock className="h-3 w-16 rounded" />
              </th>
              <th className="px-4 py-3 text-right">
                <div className="flex justify-end">
                  <ShimmerBlock className="h-3 w-20 rounded" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENT_ROW_WIDTHS.map((widths, index) => (
              <tr
                key={index}
                className={cn(
                  "border-t border-slate-100",
                  index % 2 === 0 ? "bg-sky-50/60" : "bg-white",
                )}
              >
                <td className="px-4 py-3">
                  <ShimmerLine className={widths[0]} />
                </td>
                <td className="px-4 py-3">
                  <ShimmerLine className={widths[1]} />
                </td>
                <td className="px-4 py-3">
                  <ShimmerLine className={widths[2]} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <ShimmerBlock className={cn("h-9 rounded-md", widths[3])} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
