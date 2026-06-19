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
      className="py-6"
      role="status"
      aria-busy="true"
      aria-label="Loading bond documents"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex h-full flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-none"
          >
            <div className="flex items-start gap-3">
              <ShimmerBlock className="size-11 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <ShimmerBlock className="h-5 w-[85%] rounded" />
                <ShimmerBlock className="h-4 w-[65%] rounded" />
              </div>
            </div>
            <ShimmerBlock className="h-3 w-32 rounded" />
            <ShimmerBlock className="mt-auto h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
