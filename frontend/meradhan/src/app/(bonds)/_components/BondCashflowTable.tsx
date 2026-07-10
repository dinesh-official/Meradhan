"use client";

import { cn } from "@/lib/utils";
import type { BondCashflowRow } from "@root/apiGateway";
import { ChevronDown, ChevronUp, IndianRupee } from "lucide-react";
import { useState } from "react";

const TDS_RATE = 0.1;
const INITIAL_VISIBLE_ROWS = 8;

function applyTdsToInterest(interest: number, applyTds: boolean): number {
  if (!applyTds || interest <= 0) return interest;
  return interest * (1 - TDS_RATE);
}

function parseMoney(value: string | undefined): number | null {
  if (value == null || value === "" || value === "-") return null;
  const num = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(num) ? num : null;
}

function formatMoney(value: number): string {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCashflowDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  return `${day}-${month}-${d.getFullYear()}`;
}

function resolveTotal(row: BondCashflowRow): number {
  const fromRaw = Number(row.totalCashflowRaw);
  if (Number.isFinite(fromRaw) && fromRaw !== 0) return fromRaw;

  const fromTotal = parseMoney(row.totalCashflow);
  if (fromTotal != null && fromTotal !== 0) return fromTotal;

  return (parseMoney(row.coupon) ?? 0) + (parseMoney(row.principal) ?? 0);
}

function MoneyCell({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center tabular-nums">
      <IndianRupee className="mr-0.5 h-3.5 w-3.5 shrink-0" />
      {formatMoney(Math.abs(value))}
    </span>
  );
}

export default function BondCashflowTable({
  rows,
  applyTds = false,
  cashflowWindowMonths,
  totalSchedulePayments,
  tdsToggle,
}: {
  rows: BondCashflowRow[];
  applyTds?: boolean;
  cashflowWindowMonths?: number;
  totalSchedulePayments?: number;
  tdsToggle?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const paymentRows = rows.filter((row) => resolveTotal(row) >= 0);
  const displayRows = paymentRows.length > 0 ? paymentRows : rows;
  const isTruncated =
    typeof totalSchedulePayments === "number" &&
    totalSchedulePayments > displayRows.length;
  const isCollapsible = displayRows.length > INITIAL_VISIBLE_ROWS;
  const visibleRows =
    isCollapsible && !expanded
      ? displayRows.slice(0, INITIAL_VISIBLE_ROWS)
      : displayRows;
  const grandTotal = displayRows.reduce((sum, row) => {
    const coupon = parseMoney(row.coupon) ?? 0;
    const principalAmount = parseMoney(row.principal);
    const hasPrincipal =
      row.principal !== "-" &&
      principalAmount != null &&
      principalAmount > 0;
    const interest = applyTdsToInterest(coupon, applyTds);
    const principal = hasPrincipal ? principalAmount : 0;
    return sum + interest + principal;
  }, 0);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 px-0 py-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Cash Flow — {displayRows.length} payment
          {displayRows.length === 1 ? "" : "s"}
          {isTruncated && cashflowWindowMonths
            ? ` (next ${cashflowWindowMonths} months)`
            : ""}
        </h3>
        {tdsToggle}
      </div>
      {applyTds ? (
        <p className="mb-3 text-xs text-slate-500">
          10% TDS deducted on interest. Principal is shown as received.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="cashflow-table w-full min-w-[640px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Days</th>
              <th className="px-4 py-3 text-right">Interest</th>
              <th className="px-4 py-3 text-right">Principal</th>
              <th className="px-4 py-3 text-right">Total CF</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const coupon = parseMoney(row.coupon) ?? 0;
              const principalAmount = parseMoney(row.principal);
              const hasPrincipal =
                row.principal !== "-" &&
                principalAmount != null &&
                principalAmount > 0;
              const interest = applyTdsToInterest(coupon, applyTds);
              const total = interest + (hasPrincipal ? principalAmount : 0);
              const isLast = index === displayRows.length - 1;

              return (
                <tr
                  key={`${row.period}-${row.date}-${index}`}
                  className={cn(
                    "border-t border-slate-100",
                    index % 2 === 0 ? "bg-sky-50/60" : "bg-white",
                    isLast && hasPrincipal && "font-semibold text-slate-900",
                  )}
                >
                  <td className="px-4 py-3 tabular-nums">{row.period}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatCashflowDate(row.date)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {row.days}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyCell value={interest} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {hasPrincipal ? (
                      <MoneyCell value={principalAmount} />
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <MoneyCell value={total} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          {!isCollapsible || expanded ? (
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                <td className="px-4 py-3" colSpan={5}>
                  {isTruncated ? "Total (shown period)" : "Total"}
                </td>
                <td className="px-4 py-3 text-right">
                  <MoneyCell value={grandTotal} />
                </td>
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {isCollapsible ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {expanded ? (
            <>
              Show Less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show All {displayRows.length} Payments
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
