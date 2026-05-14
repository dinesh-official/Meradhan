"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import OrdersSectionTabs from "../_components/OrdersSectionTabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { ApiError } from "@root/apiGateway";
import type { CrmDraftOrderRow } from "@root/apiGateway";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function draftOrderStatusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  const u = status.toUpperCase();
  if (u === "CANCELLED" || u === "REJECTED" || u === "EXPIRED") {
    return "destructive";
  }
  if (u === "PENDING") return "secondary";
  if (u === "IN_PROGRESS") return "default";
  if (u === "SETTLED" || u === "APPLIED") return "outline";
  return "secondary";
}

const PRICING_KEY_ORDER = [
  "dealDay",
  "dealDate",
  "quantity",
  "faceValue",
  "stampDuty",
  "allowTrade",
  "cleanPrice",
  "couponRate",
  "recordDate",
  "recordDays",
  "settlementDay",
  "lastCouponDate",
  "nextCouponDate",
  "settlementDate",
  "accruedInterest",
  "noOfAccrualDays",
  "principalAmount",
  "settlementOrder",
  "settlementAmount",
  "isUnderShutPeriod",
] as const;

const PRICING_LABELS: Record<string, string> = {
  dealDay: "Deal day",
  dealDate: "Deal date",
  quantity: "Quantity",
  faceValue: "Face value",
  stampDuty: "Stamp duty",
  allowTrade: "Allow trade",
  cleanPrice: "Clean price",
  couponRate: "Coupon rate (%)",
  recordDate: "Record date",
  recordDays: "Record days",
  settlementDay: "Settlement day",
  lastCouponDate: "Last coupon date",
  nextCouponDate: "Next coupon date",
  settlementDate: "Settlement date",
  accruedInterest: "Accrued interest",
  noOfAccrualDays: "No. of accrual days",
  principalAmount: "Principal amount",
  settlementOrder: "Settlement order",
  settlementAmount: "Settlement amount",
  isUnderShutPeriod: "Under shut period",
};

/** Shown in JSON but omitted in CRM for readability */
const HIDDEN_PRICING_KEYS = new Set(["allowSettlement", "dealOrder"]);

/** ISO / date-time strings shown as YYYY-MM-DD (UTC calendar day) */
const DATE_ONLY_KEYS = new Set([
  "recordDate",
  "lastCouponDate",
  "nextCouponDate",
]);

function formatIsoDateOnlyUtc(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const t = Date.parse(value);
  if (Number.isNaN(t)) return null;
  const d = new Date(t);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Money-like fields: show exactly 4 digits after the decimal (en-IN grouping). */
const FOUR_DECIMAL_AMOUNT_KEYS = new Set(["settlementAmount", "accruedInterest"]);

function parseNumericUnknown(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatPricingValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (FOUR_DECIMAL_AMOUNT_KEYS.has(key)) {
    const n = parseNumericUnknown(value);
    if (n != null) {
      return n.toLocaleString("en-IN", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      });
    }
  }

  if (DATE_ONLY_KEYS.has(key)) {
    const asDate = formatIsoDateOnlyUtc(value);
    if (asDate !== null) return asDate;
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString("en-IN");
    return value.toLocaleString("en-IN", { maximumFractionDigits: 8 });
  }
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function orderedPricingEntries(
  data: Record<string, unknown> | null,
): Array<{ key: string; label: string; value: string }> {
  if (!data) return [];
  const seen = new Set<string>();
  const out: Array<{ key: string; label: string; value: string }> = [];

  for (const key of PRICING_KEY_ORDER) {
    if (!(key in data) || HIDDEN_PRICING_KEYS.has(key)) continue;
    seen.add(key);
    out.push({
      key,
      label: PRICING_LABELS[key] ?? key,
      value: formatPricingValue(key, data[key]),
    });
  }

  const rest = Object.keys(data)
    .filter((k) => !seen.has(k) && !HIDDEN_PRICING_KEYS.has(k))
    .sort((a, b) => a.localeCompare(b));
  for (const key of rest) {
    out.push({
      key,
      label: PRICING_LABELS[key] ?? key,
      value: formatPricingValue(key, data[key]),
    });
  }

  return out;
}

function PricingDataSection({
  row,
  canProceed,
  canCancelDraft,
  isProceeding,
  isCancelling,
  onRequestProceedConfirm,
  onRequestCancelConfirm,
}: {
  row: CrmDraftOrderRow;
  canProceed: boolean;
  canCancelDraft: boolean;
  isProceeding: boolean;
  isCancelling: boolean;
  onRequestProceedConfirm: () => void;
  onRequestCancelConfirm: () => void;
}) {
  const entries = orderedPricingEntries(row.pricingData);
  const hasEntries = entries.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="default"
          size="sm"
          disabled={!canProceed || isProceeding || isCancelling}
          onClick={(e) => {
            e.stopPropagation();
            onRequestProceedConfirm();
          }}
        >
          {isProceeding ? "Creating order…" : "Proceed order"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/50 hover:bg-destructive/10"
          disabled={!canCancelDraft || isProceeding || isCancelling}
          onClick={(e) => {
            e.stopPropagation();
            onRequestCancelConfirm();
          }}
        >
          {isCancelling ? "Cancelling…" : "Cancel draft"}
        </Button>
        {!canProceed && (
          <p className="text-xs text-muted-foreground">
            Only drafts in PENDING status can be converted to an order.
          </p>
        )}
      </div>

      {!hasEntries ? (
        <p className="text-sm text-muted-foreground py-2">No pricing data stored.</p>
      ) : (
        <div className="rounded-md border border-border bg-muted/30 p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Pricing data</h4>
          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(({ key, label, value }) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-mono text-sm text-foreground wrap-break-word">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

export default function DraftOrdersView() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [proceedConfirmDraftId, setProceedConfirmDraftId] = useState<number | null>(
    null,
  );
  const [cancelConfirmDraftId, setCancelConfirmDraftId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const crmOrdersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["crmDraftOrders"],
    queryFn: () => crmOrdersApi.getDraftOrders(),
  });

  const proceedDraft = useMutation({
    mutationFn: (draftId: number) => crmOrdersApi.proceedDraftOrder(draftId),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({ queryKey: ["crmDraftOrders"] });
      const d = res.responseData;
      const pay = d.paymentOrderId
        ? `Razorpay payment order ${d.paymentOrderId}.`
        : "No Razorpay checkout (CRM skip-PG path).";
      const rfq = d.rfqNumber ? ` RFQ started: ${d.rfqNumber}.` : "";
      toast.success(`Order ${d.orderNumber} created`, {
        description: `${pay}${rfq}`,
      });
      setExpandedId(null);
      setProceedConfirmDraftId(null);
    },
    onError: (err: unknown) => {
      let msg = "Failed to create order from draft.";
      if (err instanceof ApiError && err.response?.data) {
        const body = err.response.data as { message?: string };
        if (typeof body.message === "string" && body.message.trim()) {
          msg = body.message;
        }
      } else if (err instanceof Error && err.message) {
        msg = err.message;
      }
      toast.error(msg);
    },
  });

  const cancelDraft = useMutation({
    mutationFn: (draftId: number) => crmOrdersApi.cancelDraftOrder(draftId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crmDraftOrders"] });
      toast.success("Draft cancelled");
      setExpandedId(null);
      setCancelConfirmDraftId(null);
    },
    onError: (err: unknown) => {
      let msg = "Failed to cancel draft.";
      if (err instanceof ApiError && err.response?.data) {
        const body = err.response.data as { message?: string };
        if (typeof body.message === "string" && body.message.trim()) {
          msg = body.message;
        }
      } else if (err instanceof Error && err.message) {
        msg = err.message;
      }
      toast.error(msg);
    },
  });

  const rows = data?.responseData?.data ?? [];

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Draft orders"
        description="Meradhan checkout drafts (`draft_orders`) with stored bond pricing JSON for support and QA."
      />

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-lg">Draft orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isError && (
            <p className="text-sm text-destructive" role="alert">
              {error instanceof Error ? error.message : "Failed to load draft orders."}
            </p>
          )}
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
          {!isLoading && !isError && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No draft orders found.</p>
          )}
          {!isLoading && !isError && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>ID</TableHead>
                  <TableHead>ISIN</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Sell price</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const open = expandedId === row.id;
                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          setExpandedId((id) => (id === row.id ? null : row.id))
                        }
                      >
                        <TableCell className="w-12">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-expanded={open}
                            aria-label={open ? "Collapse pricing" : "Expand pricing"}
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedId((id) => (id === row.id ? null : row.id));
                            }}
                          >
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform",
                                open && "rotate-180",
                              )}
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{row.id}</TableCell>
                        <TableCell className="font-mono text-sm">{row.isin}</TableCell>
                        <TableCell className="max-w-56 truncate text-sm" title={row.customerName}>
                          {row.customerName}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.sellPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 6,
                          })}
                        </TableCell>
                        <TableCell className="tabular-nums">{row.userId}</TableCell>
                        <TableCell>
                          <Badge
                            variant={draftOrderStatusBadgeVariant(row.status)}
                            className="font-normal tabular-nums"
                          >
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(row.createdAt).toLocaleString("en-IN")}
                        </TableCell>
                      </TableRow>
                      {open && (
                        <TableRow key={`${row.id}-detail`} className="hover:bg-transparent">
                          <TableCell colSpan={9} className="bg-muted/20 p-4">
                            <PricingDataSection
                              row={row}
                              canProceed={row.status === "PENDING"}
                              canCancelDraft={
                                row.status === "PENDING" ||
                                row.status === "IN_PROGRESS"
                              }
                              isProceeding={
                                proceedDraft.isPending &&
                                proceedDraft.variables === row.id
                              }
                              isCancelling={
                                cancelDraft.isPending &&
                                cancelDraft.variables === row.id
                              }
                              onRequestProceedConfirm={() =>
                                setProceedConfirmDraftId(row.id)
                              }
                              onRequestCancelConfirm={() =>
                                setCancelConfirmDraftId(row.id)
                              }
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={proceedConfirmDraftId !== null}
        onOpenChange={(open) => {
          if (!open) setProceedConfirmDraftId(null);
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Create order and continue the RFQ flow?</AlertDialogTitle>
            <AlertDialogDescription className="text-left space-y-2">
              <span className="block">
                This creates a full Meradhan order for the customer from this checkout draft,
                removes the draft from this list, and automatically continues the configured
                flow (for example RFQ / settlement steps).
              </span>
              <span className="block font-medium text-foreground">
                Only continue when you intend to move this deal forward now.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Not now</AlertDialogCancel>
            <Button
              type="button"
              disabled={proceedDraft.isPending}
              onClick={() => {
                const id = proceedConfirmDraftId;
                setProceedConfirmDraftId(null);
                if (id != null) proceedDraft.mutate(id);
              }}
            >
              {proceedDraft.isPending ? "Working…" : "Yes, create order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cancelConfirmDraftId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelConfirmDraftId(null);
        }}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this draft?</AlertDialogTitle>
            <AlertDialogDescription className="text-left">
              The checkout draft will be marked as cancelled. No order will be created. The
              customer would need to start checkout again from Meradhan if they still want
              this bond.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Not now</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={cancelDraft.isPending}
              onClick={() => {
                const id = cancelConfirmDraftId;
                setCancelConfirmDraftId(null);
                if (id != null) cancelDraft.mutate(id);
              }}
            >
              {cancelDraft.isPending ? "Working…" : "Yes, cancel draft"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
