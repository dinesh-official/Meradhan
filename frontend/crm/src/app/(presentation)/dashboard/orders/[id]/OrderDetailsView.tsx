"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { decodeId } from "@/global/utils/url.utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import OrderStatusBadge from "@/global/elements/wrapper/badges/OrderStatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  FileText,
  ChevronDown,
  Mail,
  FileDown,
  Info,
  Landmark,
  Handshake,
  CircleCheck,
  Route,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { payinDateTimeToPickerValue } from "@/global/utils/receiptPdfOptions.utils";
import { OrderPdfDownloadDialog } from "../_components/OrderPdfDownloadDialog";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

const SETTLEMENT_STAGE_META: Record<
  string,
  { label: string; Icon: typeof FileText }
> = {
  add_isin: { label: "Add ISIN", Icon: FileText },
  quote_accept: { label: "Quote Accept", Icon: Handshake },
  deal_propose: { label: "Deal Propose", Icon: Landmark },
  deal_accept: { label: "Deal Accept", Icon: CircleCheck },
  pg_routing: { label: "PG Routing", Icon: Route },
};

// Helper functions to safely extract values from Record<string, unknown>
const getBondDetail = (
  bondDetails: Record<string, unknown>,
  key: string
): unknown => {
  return bondDetails[key];
};

const hasBondDetail = (
  bondDetails: Record<string, unknown>,
  key: string
): boolean => {
  const value = bondDetails[key];
  return value !== null && value !== undefined;
};

const getBondDetailString = (
  bondDetails: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const getBondDetailNumber = (
  bondDetails: Record<string, unknown>,
  key: string
): number | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

function formatBusinessDateLabel(value: unknown): string {
  if (value == null || String(value).trim() === "") return "—";
  const s = String(value).trim();
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/i.test(s)) return s;
  const formatted = dateTimeUtils.formatDateTime(s, "DD MMM YYYY");
  return formatted && formatted !== "Invalid Date" ? formatted : s;
}

/** Color classes for a payment / razorpay status pill. */
function statusPillClasses(value: string | null | undefined): string {
  const v = (value ?? "").toUpperCase();
  if (["COMPLETED", "CAPTURED", "APPLIED", "SETTLED"].includes(v))
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  if (["CANCELLED", "FAILED", "REJECTED", "EXPIRED"].includes(v))
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  if (["REFUNDED"].includes(v))
    return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
  if (["PENDING", "CREATED", "AUTHORIZED", "IN_PROGRESS"].includes(v))
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function OrderDetailsView() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = decodeId(params.id as string);

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfDialogType, setPdfDialogType] = useState<"order" | "deal">("order");

  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{
    ok: boolean;
    message: string;
    razorpayPaymentId?: string | null;
    razorpayStatus?: string | null;
    currentPaymentStatus?: string | null;
    proposedPaymentStatus?: string | null;
    proposedOrderStatus?: string | null;
    hasDefinitiveStatus?: boolean;
    willChange?: boolean;
    applied?: boolean;
  } | null>(null);

  const [settleDialogOpen, setSettleDialogOpen] = useState(false);
  const [resumeConfirmOpen, setResumeConfirmOpen] = useState(false);
  const [stageDetailsId, setStageDetailsId] = useState<number | null>(null);
  const [resumeSubmitted, setResumeSubmitted] = useState(false);
  const [settleResult, setSettleResult] = useState<{
    ok: boolean;
    message: string;
    nseTradeNumber?: string | null;
    settleStatus?: number | null;
    settleStatusLabel?: string | null;
    currentOrderStatus?: string | null;
    proposedOrderStatus?: string | null;
    hasDefinitiveStatus?: boolean;
    willChange?: boolean;
    applied?: boolean;
  } | null>(null);

  const apiCaller = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const { data, isLoading, error } = useQuery({
    queryKey: ["crm-order", orderId],
    queryFn: () => apiCaller.getOrderById(orderId),
    enabled: !!orderId && orderId > 0,
  });

  const parseVerifyError = (error: unknown): string =>
    (error as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ||
    (error as { message?: string })?.message ||
    "Failed to verify payment";

  // Step 1: preview only — fetches the live Razorpay status, does NOT write.
  const verifyPaymentMutation = useMutation({
    mutationFn: () => apiCaller.verifyOrderPayment(orderId, { apply: false }),
    onSuccess: (res) => {
      const d = res?.responseData;
      setVerifyResult({
        ok: true,
        message: res?.message ?? "Payment verified",
        razorpayPaymentId: d?.razorpayPaymentId ?? null,
        razorpayStatus: d?.razorpayStatus ?? null,
        currentPaymentStatus: d?.currentPaymentStatus ?? null,
        proposedPaymentStatus: d?.proposedPaymentStatus ?? null,
        proposedOrderStatus: d?.proposedOrderStatus ?? null,
        hasDefinitiveStatus: d?.hasDefinitiveStatus ?? false,
        willChange: d?.willChange ?? false,
        applied: d?.applied ?? false,
      });
      setVerifyDialogOpen(true);
    },
    onError: (error: unknown) => {
      setVerifyResult({ ok: false, message: parseVerifyError(error) });
      setVerifyDialogOpen(true);
    },
  });

  // Step 2: accept — commits the resolved status to the database.
  const applyPaymentMutation = useMutation({
    mutationFn: () => apiCaller.verifyOrderPayment(orderId, { apply: true }),
    onSuccess: (res) => {
      const d = res?.responseData;
      setVerifyResult({
        ok: true,
        message: res?.message ?? "Payment status updated",
        razorpayPaymentId: d?.razorpayPaymentId ?? null,
        razorpayStatus: d?.razorpayStatus ?? null,
        currentPaymentStatus: d?.currentPaymentStatus ?? null,
        proposedPaymentStatus: d?.proposedPaymentStatus ?? null,
        proposedOrderStatus: d?.proposedOrderStatus ?? null,
        hasDefinitiveStatus: d?.hasDefinitiveStatus ?? false,
        willChange: d?.willChange ?? false,
        applied: d?.applied ?? false,
      });
      queryClient.invalidateQueries({ queryKey: ["crm-order", orderId] });
    },
    onError: (error: unknown) => {
      setVerifyResult((prev) =>
        prev ? { ...prev, ok: false, message: parseVerifyError(error) } : {
          ok: false,
          message: parseVerifyError(error),
        },
      );
    },
  });

  // Settlement — step 1: preview only (queries live NSE settlement API).
  const verifySettlementMutation = useMutation({
    mutationFn: () => apiCaller.verifyOrderSettlement(orderId, { apply: false }),
    onSuccess: (res) => {
      const d = res?.responseData;
      setSettleResult({
        ok: true,
        message: res?.message ?? "Settlement verified",
        nseTradeNumber: d?.nseTradeNumber ?? null,
        settleStatus: d?.settleStatus ?? null,
        settleStatusLabel: d?.settleStatusLabel ?? null,
        currentOrderStatus: d?.currentOrderStatus ?? null,
        proposedOrderStatus: d?.proposedOrderStatus ?? null,
        hasDefinitiveStatus: d?.hasDefinitiveStatus ?? false,
        willChange: d?.willChange ?? false,
        applied: d?.applied ?? false,
      });
      setSettleDialogOpen(true);
    },
    onError: (error: unknown) => {
      setSettleResult({ ok: false, message: parseVerifyError(error) });
      setSettleDialogOpen(true);
    },
  });

  // Settlement — step 2: accept — commits the mapped status to the order.
  const applySettlementMutation = useMutation({
    mutationFn: () => apiCaller.verifyOrderSettlement(orderId, { apply: true }),
    onSuccess: (res) => {
      const d = res?.responseData;
      setSettleResult({
        ok: true,
        message: res?.message ?? "Order status updated",
        nseTradeNumber: d?.nseTradeNumber ?? null,
        settleStatus: d?.settleStatus ?? null,
        settleStatusLabel: d?.settleStatusLabel ?? null,
        currentOrderStatus: d?.currentOrderStatus ?? null,
        proposedOrderStatus: d?.proposedOrderStatus ?? null,
        hasDefinitiveStatus: d?.hasDefinitiveStatus ?? false,
        willChange: d?.willChange ?? false,
        applied: d?.applied ?? false,
      });
      queryClient.invalidateQueries({ queryKey: ["crm-order", orderId] });
    },
    onError: (error: unknown) => {
      setSettleResult((prev) =>
        prev ? { ...prev, ok: false, message: parseVerifyError(error) } : {
          ok: false,
          message: parseVerifyError(error),
        },
      );
    },
  });

  const resumeSettlementMutation = useMutation({
    mutationFn: () => apiCaller.resumeOrderSettlement(orderId),
    onSuccess: () => {
      setResumeConfirmOpen(false);
      setStageDetailsId(null);
      // Keep resume controls disabled until stages refresh (WAITING/progress)
      queryClient.invalidateQueries({ queryKey: ["crm-order", orderId] });
      window.setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["crm-order", orderId] });
        setResumeSubmitted(false);
      }, 4000);
    },
    onError: () => {
      // Allow retry after a failed queue request
      setResumeSubmitted(false);
    },
  });

  const order = data?.responseData;

  const pipelineStages = Array.isArray(order?.orderStages)
    ? [...order.orderStages].sort((a, b) => a.seq - b.seq)
    : [];
  const nextResumeStage =
    pipelineStages.find((s) => s.status !== 1) ?? null;
  const hasFailedStage = pipelineStages.some((s) => s.status === 2);
  const hasWaitingStage = pipelineStages.some((s) => s.status === 3);
  const pipelineIncomplete = pipelineStages.some((s) => s.status !== 1);
  const resumeInFlight =
    resumeSubmitted ||
    resumeSettlementMutation.isPending ||
    hasWaitingStage;
  const canResumeSettlement =
    pipelineStages.length > 0 && pipelineIncomplete;
  const resumeStageLabel = nextResumeStage
    ? (SETTLEMENT_STAGE_META[nextResumeStage.stage]?.label ??
      nextResumeStage.stage.replace(/_/g, " "))
    : null;
  const selectedStageDetails =
    stageDetailsId == null
      ? null
      : (pipelineStages.find((s) => s.id === stageDetailsId) ?? null);

  const stageStatusLabel = (status: number) =>
    status === 1
      ? "SUCCESS"
      : status === 2
        ? "FAILED"
        : status === 3
          ? "WAITING"
          : "NOT STARTED";

  const requestResumeSettlement = () => {
    if (resumeInFlight) return;
    // Always confirm when restarting after a break / incomplete pipeline
    setResumeConfirmOpen(true);
  };

  const confirmResumeSettlement = () => {
    if (resumeInFlight) return;
    setResumeSubmitted(true);
    resumeSettlementMutation.mutate();
  };

  const openPdfDialog = (type: "order" | "deal") => {
    setPdfDialogType(type);
    setPdfDialogOpen(true);
  };

  const orderMetadata = order?.metadata as Record<string, unknown> | undefined;
  const defaultSettlementNumber =
    orderMetadata?.settlementNumber != null
      ? String(orderMetadata.settlementNumber)
      : orderMetadata?.settlementNo != null
        ? String(orderMetadata.settlementNo)
        : null;
  const metadataSettlement =
    orderMetadata?.settlementDate != null ? String(orderMetadata.settlementDate) : null;
  const defaultAutofillSettlementDate =
    payinDateTimeToPickerValue(metadataSettlement) ||
    payinDateTimeToPickerValue(order?.createdAt ?? null);

  const dealDateLabel = formatBusinessDateLabel(orderMetadata?.dealDate);
  const settlementDateLabel = formatBusinessDateLabel(orderMetadata?.settlementDate);
  const orderDateLabel =
    dealDateLabel !== "—"
      ? dealDateLabel
      : order?.createdAt
        ? dateTimeUtils.formatDateTime(order.createdAt, "DD MMM YYYY")
        : "—";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">
          {error ? "Failed to load order details" : "Order not found"}
        </p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }

  // Bond order pricing snapshot captured at checkout (`bondDetails.pricing`).
  const orderPricing = (order.bondDetails as Record<string, unknown> | undefined)
    ?.pricing as Record<string, unknown> | undefined;

  const pricingNumber = (key: string): number | undefined => {
    const v = orderPricing?.[key];
    if (v == null) return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const formatInrAmount = (n: number | undefined | null): string =>
    n == null || !Number.isFinite(n)
      ? "—"
      : `₹${n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

  const cleanPriceValue = pricingNumber("cleanPrice");
  const principalAmountValue = pricingNumber("principalAmount");
  const accruedInterestValue = pricingNumber("accruedInterest");
  const totalConsiderationValue = pricingNumber("totalConsideration");
  const pricingStampDutyValue = pricingNumber("stampDuty");
  const accrualDaysValue = pricingNumber("noOfAccrualDays");
  const settlementAmountValue = pricingNumber("settlementAmount");
  // Offered / sell yield from checkout snapshot (`pricing.yield`), then bondDetails.yield.
  const yieldValue =
    pricingNumber("yield") ??
    getBondDetailNumber(
      (order.bondDetails as Record<string, unknown>) ?? {},
      "yield",
    );

  const hasPricingSnapshot =
    orderPricing != null &&
    [
      cleanPriceValue,
      principalAmountValue,
      accruedInterestValue,
      totalConsiderationValue,
      settlementAmountValue,
      yieldValue,
    ].some((v) => v != null);

  const stampDutyDisplay =
    pricingStampDutyValue ?? parseFloat(order.stampDuty);
  const settlementTotalDisplay =
    settlementAmountValue ?? parseFloat(order.totalAmount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="text-muted-foreground mt-1">
            Order Number: {order.orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {order.orderNumber && (
            <>
              <Button
                variant="outline"
                onClick={() => openPdfDialog("order")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Order receipt PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => openPdfDialog("deal")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Deal sheet PDF
              </Button>
            </>
          )}
          {order.customerProfile?.userType?.toUpperCase() === "CORPORATE" &&
            order.orderNumber && (
              <Button variant="outline" asChild>
                <Link
                  href={`/dashboard/rfqs/nse/settle-orders/generate/${encodeURIComponent(order.orderNumber)}`}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send email
                </Link>
              </Button>
            )}
          <AllowOnlyView permissions={["edit:orders"]}>
            {order.paymentProvider === "RAZORPAY" && (
              <Button
                variant="outline"
                onClick={() => verifyPaymentMutation.mutate()}
                disabled={verifyPaymentMutation.isPending}
              >
                {verifyPaymentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Verify Razorpay Payment
              </Button>
            )}
            {(order.paymentProvider === "CUSTOM" ||
              (order.paymentProvider === "RAZORPAY" &&
                order.paymentStatus === "COMPLETED")) && (
                <Button
                  variant="outline"
                  onClick={() => verifySettlementMutation.mutate()}
                  disabled={verifySettlementMutation.isPending}
                >
                  {verifySettlementMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Verify Settlement
                </Button>
              )}
          </AllowOnlyView>
          <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          <Badge variant="outline">{order.paymentStatus}</Badge>
        </div>
      </div>

      {order.orderNumber ? (
        <OrderPdfDownloadDialog
          open={pdfDialogOpen}
          onOpenChange={setPdfDialogOpen}
          orderNumber={order.orderNumber}
          pdfType={pdfDialogType}
          defaultSettlementNumber={defaultSettlementNumber}
          defaultAutofillSettlementDate={defaultAutofillSettlementDate}
        />
      ) : null}

      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="sm:max-w-md shadow-none border border-slate-200 p-0 overflow-hidden gap-0">
          {/* Colored banner reflecting the outcome */}
          <div
            className={`px-6 py-4 border-b ${!verifyResult?.ok
              ? "bg-rose-50 border-rose-100"
              : verifyResult?.applied
                ? "bg-emerald-50 border-emerald-100"
                : verifyResult?.willChange
                  ? "bg-blue-50 border-blue-100"
                  : "bg-amber-50 border-amber-100"
              }`}
          >
            <DialogHeader className="space-y-1">
              <DialogTitle
                className={`flex items-center gap-2 text-base ${!verifyResult?.ok
                  ? "text-rose-700"
                  : verifyResult?.applied
                    ? "text-emerald-700"
                    : verifyResult?.willChange
                      ? "text-blue-700"
                      : "text-amber-700"
                  }`}
              >
                {!verifyResult?.ok ? (
                  <XCircle className="h-5 w-5" />
                ) : verifyResult?.applied ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : verifyResult?.willChange ? (
                  <RefreshCw className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                {verifyResult?.ok
                  ? "Razorpay Payment Verification"
                  : "Verification Failed"}
              </DialogTitle>
              <DialogDescription
                className={
                  !verifyResult?.ok
                    ? "text-rose-600/80"
                    : verifyResult?.applied
                      ? "text-emerald-600/80"
                      : verifyResult?.willChange
                        ? "text-blue-600/80"
                        : "text-amber-600/80"
                }
              >
                {verifyResult?.message}
              </DialogDescription>
            </DialogHeader>
          </div>

          {verifyResult?.ok && (
            <dl className="divide-y divide-slate-100 px-6 py-2 text-sm">
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">Razorpay Payment ID</dt>
                <dd className="text-right font-medium break-all text-slate-800">
                  {verifyResult.razorpayPaymentId ?? "—"}
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">Razorpay Status</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                      verifyResult.razorpayStatus,
                    )}`}
                  >
                    {verifyResult.razorpayStatus ?? "—"}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">
                  {verifyResult.applied
                    ? "Database Payment Status"
                    : "Payment Status (current → proposed)"}
                </dt>
                <dd className="flex items-center justify-end gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                      verifyResult.currentPaymentStatus,
                    )}`}
                  >
                    {verifyResult.currentPaymentStatus ?? "—"}
                  </span>
                  {verifyResult.willChange && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                          verifyResult.proposedPaymentStatus,
                        )}`}
                      >
                        {verifyResult.proposedPaymentStatus ?? "—"}
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">Order Status</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                      verifyResult.proposedOrderStatus,
                    )}`}
                  >
                    {verifyResult.proposedOrderStatus ?? "—"}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">Database</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${verifyResult.applied
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : verifyResult.willChange
                        ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                  >
                    {verifyResult.applied
                      ? "Updated"
                      : verifyResult.willChange
                        ? "Pending your acceptance"
                        : "No change needed"}
                  </span>
                </dd>
              </div>
            </dl>
          )}

          <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setVerifyDialogOpen(false)}
              disabled={applyPaymentMutation.isPending}
            >
              Close
            </Button>
            {verifyResult?.ok &&
              verifyResult.willChange &&
              !verifyResult.applied && (
                <Button
                  onClick={() => applyPaymentMutation.mutate()}
                  disabled={applyPaymentMutation.isPending}
                >
                  {applyPaymentMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Accept &amp; Update
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settleDialogOpen} onOpenChange={setSettleDialogOpen}>
        <DialogContent className="sm:max-w-md shadow-none border border-slate-200 p-0 overflow-hidden gap-0">
          <div
            className={`px-6 py-4 border-b ${!settleResult?.ok
              ? "bg-rose-50 border-rose-100"
              : settleResult?.applied
                ? "bg-emerald-50 border-emerald-100"
                : settleResult?.willChange
                  ? "bg-blue-50 border-blue-100"
                  : "bg-amber-50 border-amber-100"
              }`}
          >
            <DialogHeader className="space-y-1">
              <DialogTitle
                className={`flex items-center gap-2 text-base ${!settleResult?.ok
                  ? "text-rose-700"
                  : settleResult?.applied
                    ? "text-emerald-700"
                    : settleResult?.willChange
                      ? "text-blue-700"
                      : "text-amber-700"
                  }`}
              >
                {!settleResult?.ok ? (
                  <XCircle className="h-5 w-5" />
                ) : settleResult?.applied ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : settleResult?.willChange ? (
                  <RefreshCw className="h-5 w-5" />
                ) : (
                  <Clock className="h-5 w-5" />
                )}
                {settleResult?.ok
                  ? "NSE Settlement Verification"
                  : "Verification Failed"}
              </DialogTitle>
              <DialogDescription
                className={
                  !settleResult?.ok
                    ? "text-rose-600/80"
                    : settleResult?.applied
                      ? "text-emerald-600/80"
                      : settleResult?.willChange
                        ? "text-blue-600/80"
                        : "text-amber-600/80"
                }
              >
                {settleResult?.message}
              </DialogDescription>
            </DialogHeader>
          </div>

          {settleResult?.ok && (
            <dl className="divide-y divide-slate-100 px-6 py-2 text-sm">
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">NSE Trade Number</dt>
                <dd className="text-right font-medium break-all text-slate-800">
                  {settleResult.nseTradeNumber ?? "—"}
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">NSE Settlement Status</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                      settleResult.proposedOrderStatus,
                    )}`}
                  >
                    {settleResult.settleStatus != null
                      ? `${settleResult.settleStatus} · ${settleResult.settleStatusLabel ?? "Unknown"}`
                      : "—"}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">
                  {settleResult.applied
                    ? "Order Status"
                    : "Order Status (current → proposed)"}
                </dt>
                <dd className="flex items-center justify-end gap-1.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                      settleResult.currentOrderStatus,
                    )}`}
                  >
                    {settleResult.currentOrderStatus ?? "—"}
                  </span>
                  {settleResult.willChange && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPillClasses(
                          settleResult.proposedOrderStatus,
                        )}`}
                      >
                        {settleResult.proposedOrderStatus ?? "—"}
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-2 items-center gap-4 py-2.5">
                <dt className="text-muted-foreground">Database</dt>
                <dd className="text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${settleResult.applied
                      ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                      : settleResult.willChange
                        ? "bg-blue-100 text-blue-700 ring-1 ring-blue-200"
                        : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                  >
                    {settleResult.applied
                      ? "Updated"
                      : settleResult.willChange
                        ? "Pending your acceptance"
                        : "No change needed"}
                  </span>
                </dd>
              </div>
            </dl>
          )}

          <DialogFooter className="px-6 py-4 border-t border-slate-100 gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setSettleDialogOpen(false)}
              disabled={applySettlementMutation.isPending}
            >
              Close
            </Button>
            {settleResult?.ok &&
              settleResult.willChange &&
              !settleResult.applied && (
                <Button
                  onClick={() => applySettlementMutation.mutate()}
                  disabled={applySettlementMutation.isPending}
                >
                  {applySettlementMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Accept &amp; Update
                </Button>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Counterparty information — Meradhan customer (default) or
              external NSE participant (when assigned via the CRM
              assign-rfq-participant flow). */}
          <Card>
            <CardHeader>
              <CardTitle>
                {order.customerProfile
                  ? "Customer Information"
                  : "NSE Participant (counterparty)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.customerProfile ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {[
                        order.customerProfile.firstName,
                        order.customerProfile.middleName,
                        order.customerProfile.lastName,
                      ]
                        .map((p) => (typeof p === "string" ? p.trim() : ""))
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">
                      {order.customerProfile.emailAddress}
                    </p>
                  </div>
                  {order.customerProfile.phoneNo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">
                        {order.customerProfile.phoneNo}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium">{order.customerProfile.id}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Participant code
                    </p>
                    <p className="font-medium font-mono">
                      {order.linkedRfqParticipantCode ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">
                      {order.rfqParticipantInfo?.nameOverride?.trim() ||
                        order.linkedRfqParticipantCode ||
                        "—"}
                    </p>
                  </div>
                  {order.rfqParticipantInfo?.contactPerson && (
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">
                        {order.rfqParticipantInfo.contactPerson}
                      </p>
                    </div>
                  )}
                  {!!order.rfqParticipantInfo?.emailList?.length && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium break-all">
                        {order.rfqParticipantInfo.emailList.join(", ")}
                      </p>
                    </div>
                  )}
                  {!!order.rfqParticipantInfo?.mobileList?.length && (
                    <div>
                      <p className="text-sm text-muted-foreground">Mobile</p>
                      <p className="font-medium">
                        {order.rfqParticipantInfo.mobileList.join(", ")}
                      </p>
                    </div>
                  )}
                  {order.rfqParticipantInfo?.panNo && (
                    <div>
                      <p className="text-sm text-muted-foreground">PAN</p>
                      <p className="font-medium font-mono">
                        {order.rfqParticipantInfo.panNo}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bond Information */}
          <Card>
            <CardHeader>
              <CardTitle>Bond Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bond Name</p>
                  <p className="font-medium">{order.bondName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ISIN</p>
                  <p className="font-medium">{order.isin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Face Value</p>
                  <p className="font-medium">
                    ₹{parseFloat(order.faceValue).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium">
                    ₹{(order.unitPrice)}
                  </p>
                </div>
              </div>
              {order.bondDetails && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">
                    Additional Bond Details
                  </h3>
                  <div className="space-y-6">
                    {/* Financial Information */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                        Financial Information
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hasBondDetail(order.bondDetails, "couponRate") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Coupon Rate
                            </p>
                            <p className="font-medium">
                              {getBondDetailString(
                                order.bondDetails,
                                "couponRate"
                              )}
                              %
                            </p>
                          </div>
                        )}
                        {hasBondDetail(order.bondDetails, "issuePrice") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Issue Price
                            </p>
                            <p className="font-medium">
                              ₹
                              {getBondDetailNumber(
                                order.bondDetails,
                                "issuePrice"
                              )?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                        {hasBondDetail(order.bondDetails, "totalIssueSize") && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total Issue Size
                            </p>
                            <p className="font-medium">
                              ₹
                              {getBondDetailNumber(
                                order.bondDetails,
                                "totalIssueSize"
                              )?.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    {(hasBondDetail(order.bondDetails, "maturityDate") ||
                      hasBondDetail(order.bondDetails, "redemptionDate") ||
                      hasBondDetail(order.bondDetails, "dateOfAllotment")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Important Dates
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "maturityDate"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Maturity Date
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "maturityDate"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "redemptionDate"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Redemption Date
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "redemptionDate"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "dateOfAllotment"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Date of Allotment
                                  </p>
                                  <p className="font-medium">
                                    {dateTimeUtils.formatDateTime(
                                      getBondDetailString(
                                        order.bondDetails,
                                        "dateOfAllotment"
                                      )!,
                                      "DD MMM YYYY"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Rating & Status */}
                    {(hasBondDetail(order.bondDetails, "creditRating") ||
                      hasBondDetail(order.bondDetails, "taxStatus") ||
                      hasBondDetail(order.bondDetails, "isListed")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Rating & Status
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "creditRating"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Credit Rating
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "creditRating"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "taxStatus"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Tax Status
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "taxStatus"
                                    )}
                                  </p>
                                </div>
                              )}
                            {hasBondDetail(order.bondDetails, "isListed") && (
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Listing Status
                                </p>
                                <Badge variant="outline">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "isListed"
                                  )}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {getBondDetailString(
                            order.bondDetails,
                            "creditRatingInfo"
                          ) && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                  Credit Rating Info
                                </p>
                                <p className="font-medium text-sm">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "creditRatingInfo"
                                  )}
                                </p>
                              </div>
                            )}
                          {getBondDetailString(
                            order.bondDetails,
                            "ratingAgencyName"
                          ) && (
                              <div className="mt-3">
                                <p className="text-sm text-muted-foreground">
                                  Rating Agency
                                </p>
                                <p className="font-medium">
                                  {getBondDetailString(
                                    order.bondDetails,
                                    "ratingAgencyName"
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      )}

                    {/* Payment & Interest Details */}
                    {(hasBondDetail(order.bondDetails, "interestPaymentMode") ||
                      hasBondDetail(
                        order.bondDetails,
                        "interestPaymentFrequency"
                      )) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Payment & Interest
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            {getBondDetailString(
                              order.bondDetails,
                              "interestPaymentMode"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Interest Payment Mode
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "interestPaymentMode"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "interestPaymentFrequency"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Payment Frequency
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "interestPaymentFrequency"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Additional Information */}
                    {(hasBondDetail(order.bondDetails, "description") ||
                      hasBondDetail(order.bondDetails, "instrumentName") ||
                      hasBondDetail(order.bondDetails, "sectorName") ||
                      hasBondDetail(order.bondDetails, "categories")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Additional Information
                          </h4>
                          <div className="space-y-3">
                            {getBondDetailString(
                              order.bondDetails,
                              "description"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Description
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "description"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "instrumentName"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Instrument Name
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "instrumentName"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "sectorName"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Sector
                                  </p>
                                  <p className="font-medium">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "sectorName"
                                    )}
                                  </p>
                                </div>
                              )}
                            {Array.isArray(
                              getBondDetail(order.bondDetails, "categories")
                            ) &&
                              (
                                getBondDetail(
                                  order.bondDetails,
                                  "categories"
                                ) as unknown[]
                              ).length > 0 && (
                                <div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    Categories
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {(
                                      getBondDetail(
                                        order.bondDetails,
                                        "categories"
                                      ) as unknown[]
                                    ).map((cat: unknown, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {String(cat)}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Registrar & Trustee Details */}
                    {(hasBondDetail(order.bondDetails, "registrarDetails") ||
                      hasBondDetail(order.bondDetails, "debentureTrustee") ||
                      hasBondDetail(
                        order.bondDetails,
                        "certificateNumbers"
                      )) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Registrar & Trustee
                          </h4>
                          <div className="space-y-3">
                            {getBondDetailString(
                              order.bondDetails,
                              "registrarDetails"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Registrar Details
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "registrarDetails"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "debentureTrustee"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Debenture Trustee
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "debentureTrustee"
                                    )}
                                  </p>
                                </div>
                              )}
                            {getBondDetailString(
                              order.bondDetails,
                              "certificateNumbers"
                            ) && (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Certificate Numbers
                                  </p>
                                  <p className="font-medium text-sm">
                                    {getBondDetailString(
                                      order.bondDetails,
                                      "certificateNumbers"
                                    )}
                                  </p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}

                    {/* Options & Other Details */}
                    {(hasBondDetail(
                      order.bondDetails,
                      "putCallOptionDetails"
                    ) ||
                      hasBondDetail(
                        order.bondDetails,
                        "physicalSecurityAddress"
                      ) ||
                      hasBondDetail(
                        order.bondDetails,
                        "defaultedInRedemption"
                      ) ||
                      hasBondDetail(order.bondDetails, "remarks")) && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                            Options & Other Details
                          </h4>
                          <div className="space-y-3">
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "putCallOptionDetails"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Put/Call Option Details
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "physicalSecurityAddress"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Physical Security Address
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "defaultedInRedemption"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Defaulted in Redemption
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                            {(() => {
                              const value = getBondDetailString(
                                order.bondDetails,
                                "remarks"
                              );
                              return value && value.trim() ? (
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Remarks
                                  </p>
                                  <p className="font-medium text-sm">{value}</p>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {order.paymentProvider && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Provider
                    </p>
                    <p className="font-medium">{order.paymentProvider}</p>
                  </div>
                )}
                {order.paymentOrderId && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment Order ID
                    </p>
                    <p className="font-medium font-mono text-sm">
                      {order.paymentOrderId}
                    </p>
                  </div>
                )}
                {order.paymentId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-medium font-mono text-sm">
                      {order.paymentId}
                    </p>
                  </div>
                )}
              </div>
              {order.paymentMetadata && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Payment Metadata
                  </p>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto">
                    {JSON.stringify(order.paymentMetadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settlement Pipeline — Stage Timeline */}
          <Card>
            <CardHeader>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle>Settlement Pipeline</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  Workflow stages for NSE settlement. Click a step for request/response
                  details. Successful steps are skipped on resume.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {resumeSettlementMutation.isSuccess ? (
                <p className="mb-3 text-sm text-green-600">
                  {resumeSettlementMutation.data?.message ??
                    "Settlement resume requested."}
                </p>
              ) : null}
              {resumeSettlementMutation.isError ? (
                <p className="mb-3 text-sm text-red-600">
                  {(
                    resumeSettlementMutation.error as {
                      response?: { data?: { message?: string } };
                      message?: string;
                    }
                  )?.response?.data?.message ||
                    (resumeSettlementMutation.error as { message?: string })
                      ?.message ||
                    "Failed to resume settlement"}
                </p>
              ) : null}

              {pipelineStages.length > 0 ? (
                <div className="space-y-4">
                  <div className="w-full overflow-x-auto rounded-lg border border-border bg-muted/20 p-4">
                    <div
                      className="grid min-w-[640px] items-start gap-0"
                      style={{
                        gridTemplateColumns: `repeat(${pipelineStages.length}, minmax(0, 1fr))`,
                      }}
                    >
                      {pipelineStages.map((stage, index) => {
                        const meta =
                          SETTLEMENT_STAGE_META[stage.stage] ?? {
                            label: stage.stage.replace(/_/g, " "),
                            Icon: FileText,
                          };
                        const StageIcon = meta.Icon;
                        const isSuccess = stage.status === 1;
                        const isFailed = stage.status === 2;
                        const isWaiting = stage.status === 3;
                        const stagePayload =
                          stage.payload && typeof stage.payload === "object"
                            ? (stage.payload as Record<string, unknown>)
                            : {};
                        const stageResponse =
                          stage.response && typeof stage.response === "object"
                            ? (stage.response as Record<string, unknown>)
                            : {};
                        const isSkippedSuccess =
                          isSuccess &&
                          (stagePayload.skipped === true ||
                            stageResponse.skipped === true);
                        const isNext = nextResumeStage?.id === stage.id;
                        const isActive = isSuccess || isWaiting || isNext;
                        const stamp =
                          isSuccess || isFailed || isWaiting
                            ? dateTimeUtils.formatDateTime(
                                stage.updatedAt,
                                "DD MMM YY HH:mm",
                              )
                            : "—";
                        const showConnector = index < pipelineStages.length - 1;
                        const connectorDone = isSuccess;
                        const retriesLabel = `${stage.attemptCount}/5`;

                        return (
                          <div
                            key={stage.id}
                            className="relative flex flex-col items-center px-1 text-center"
                          >
                            {showConnector ? (
                              <div
                                className={`pointer-events-none absolute top-5 left-1/2 h-0.5 w-full ${
                                  connectorDone
                                    ? "bg-primary"
                                    : "bg-border"
                                }`}
                                aria-hidden
                              />
                            ) : null}

                            <button
                              type="button"
                              onClick={() => setStageDetailsId(stage.id)}
                              title={`View ${meta.label} details`}
                              className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors cursor-pointer hover:opacity-90 ${
                                isFailed
                                  ? "border-destructive bg-destructive text-white"
                                  : isWaiting
                                    ? "border-yellow-500 bg-yellow-500 text-white"
                                    : isSkippedSuccess
                                      ? "border-muted-foreground/40 bg-muted text-muted-foreground"
                                      : isSuccess
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : isNext
                                        ? "border-primary bg-background text-primary ring-2 ring-primary/20"
                                        : "border-border bg-muted text-muted-foreground"
                              }`}
                            >
                              {isFailed ? (
                                <XCircle className="h-5 w-5 text-white stroke-[2.5]" />
                              ) : isSuccess ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <StageIcon className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setStageDetailsId(stage.id)}
                              className={`mt-2 text-sm font-medium capitalize hover:underline ${
                                isFailed
                                  ? "text-destructive"
                                  : isActive
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {meta.label}
                            </button>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {stamp}
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] font-medium ${
                                stage.attemptCount > 0
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              Retries {retriesLabel}
                            </p>
                            {isFailed ? (
                              <Badge variant="destructive" className="mt-1 text-[10px]">
                                Failed
                              </Badge>
                            ) : isWaiting ? (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                Waiting
                              </Badge>
                            ) : isNext ? (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                Next
                              </Badge>
                            ) : isSkippedSuccess ? (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                Skipped
                              </Badge>
                            ) : isSuccess ? (
                              <Badge variant="secondary" className="mt-1 text-[10px]">
                                Done
                              </Badge>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {nextResumeStage ? (
                    <div
                      className={`rounded-lg border border-border bg-muted/30 p-4 ${
                        nextResumeStage.status === 2
                          ? "border-destructive/40"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Next step:{" "}
                            {SETTLEMENT_STAGE_META[nextResumeStage.stage]
                              ?.label ??
                              nextResumeStage.stage.replace(/_/g, " ")}
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              Retries {nextResumeStage.attemptCount}/5
                            </span>
                          </p>
                          {nextResumeStage.lastError ? (
                            <p className="text-sm text-destructive">
                              {nextResumeStage.lastError}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Click Continue to resume the workflow from this step.
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <AllowOnlyView permissions={["edit:orders"]}>
                            <Button
                              size="sm"
                              disabled={resumeInFlight}
                              onClick={requestResumeSettlement}
                            >
                              {resumeInFlight ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-2" />
                              )}
                              {resumeInFlight ? "Resuming…" : "Continue"}
                            </Button>
                          </AllowOnlyView>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      All settlement stages completed successfully.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Stages not seeded yet (pre-pipeline order or payment not completed).
                </p>
              )}
            </CardContent>
          </Card>

          {/* Step details: request / response / metadata */}
          <Dialog
            open={stageDetailsId != null}
            onOpenChange={(open) => {
              if (!open) setStageDetailsId(null);
            }}
          >
            <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {(selectedStageDetails &&
                    (SETTLEMENT_STAGE_META[selectedStageDetails.stage]?.label ??
                      selectedStageDetails.stage.replace(/_/g, " "))) ||
                    "Stage details"}
                </DialogTitle>
                <DialogDescription>
                  Request, response, and run metadata for this settlement step.
                </DialogDescription>
              </DialogHeader>

              {selectedStageDetails ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {stageStatusLabel(selectedStageDetails.status)}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Retries</p>
                      <p className="font-medium">
                        {selectedStageDetails.attemptCount}/5
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Sequence</p>
                      <p className="font-medium">#{selectedStageDetails.seq}</p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Order No</p>
                      <p className="font-medium font-mono text-xs">
                        {selectedStageDetails.orderNo}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium text-xs">
                        {dateTimeUtils.formatDateTime(
                          selectedStageDetails.createdAt,
                          "DD MMM YYYY hh:mm:ss AA",
                        )}
                      </p>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="font-medium text-xs">
                        {dateTimeUtils.formatDateTime(
                          selectedStageDetails.updatedAt,
                          "DD MMM YYYY hh:mm:ss AA",
                        )}
                      </p>
                    </div>
                  </div>

                  {selectedStageDetails.lastError ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <p className="mb-1 text-xs font-medium text-destructive">
                        Last error
                      </p>
                      <p className="text-sm text-destructive whitespace-pre-wrap">
                        {selectedStageDetails.lastError}
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Request (payload)
                    </p>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-56">
                      {JSON.stringify(selectedStageDetails.payload ?? {}, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-md border bg-muted/40 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Response
                    </p>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-56">
                      {JSON.stringify(selectedStageDetails.response ?? {}, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : null}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setStageDetailsId(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Confirm resume / restart after failure */}
          <Dialog
            open={resumeConfirmOpen}
            onOpenChange={(open) => {
              if (resumeInFlight) return;
              setResumeConfirmOpen(open);
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {hasFailedStage
                    ? "Restart settlement from failed step?"
                    : "Resume settlement workflow?"}
                </DialogTitle>
                <DialogDescription>
                  {hasFailedStage ? (
                    <>
                      A previous step failed
                      {resumeStageLabel ? (
                        <>
                          {" "}
                          at <strong>{resumeStageLabel}</strong>
                        </>
                      ) : null}
                      . Continuing will retry from that step only. Completed
                      earlier steps will not be re-run on NSE / Razorpay.
                    </>
                  ) : (
                    <>
                      This will continue the settlement workflow
                      {resumeStageLabel ? (
                        <>
                          {" "}
                          from <strong>{resumeStageLabel}</strong>
                        </>
                      ) : null}
                      . Completed steps are skipped automatically.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              {nextResumeStage?.lastError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {nextResumeStage.lastError}
                </div>
              ) : null}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setResumeConfirmOpen(false)}
                  disabled={resumeInFlight}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmResumeSettlement}
                  disabled={resumeInFlight}
                >
                  {resumeInFlight ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {resumeInFlight
                    ? "Resuming…"
                    : hasFailedStage
                      ? "Yes, continue from failed step"
                      : "Yes, resume"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Order Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Order Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderLogs && order.orderLogs.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                  <div className="space-y-6">
                    {order.orderLogs.map((log) => {
                      const getStepIcon = () => {
                        const step = log.step.toUpperCase();
                        if (step.includes("PAYMENT")) {
                          return <CreditCard className="h-4 w-4" />;
                        }
                        if (
                          step.includes("ORDER_CREATED") ||
                          step.includes("CREATED")
                        ) {
                          return <ShoppingCart className="h-4 w-4" />;
                        }
                        if (step.includes("STEP")) {
                          return <ArrowRight className="h-4 w-4" />;
                        }
                        return <FileText className="h-4 w-4" />;
                      };

                      const getStatusIcon = () => {
                        if (log.status === "SUCCESS") {
                          return (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          );
                        }
                        if (log.status === "FAILED") {
                          return <XCircle className="h-5 w-5 text-red-600" />;
                        }
                        return <Clock className="h-5 w-5 text-yellow-600" />;
                      };

                      const formatStepName = (step: string) => {
                        // Handle common step patterns
                        const stepUpper = step.toUpperCase();

                        // Step changed patterns
                        if (stepUpper.includes("STEP_CHANGED")) {
                          const stepName = stepUpper
                            .replace("STEP_CHANGED_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Moved to: ${stepName}`;
                        }

                        // Payment related
                        if (stepUpper === "PAYMENT_SUCCESS") {
                          return "Payment Successful";
                        }
                        if (stepUpper === "PAYMENT_FAILED") {
                          return "Payment Failed";
                        }
                        if (stepUpper === "PAYMENT_ATTEMPTED") {
                          return "Payment Attempted";
                        }

                        // Order related
                        if (stepUpper === "ORDER_CREATED") {
                          return "Order Created";
                        }

                        // Page view
                        if (stepUpper === "PAGE_VIEW") {
                          return "Page Viewed";
                        }

                        // Quantity and settlement
                        if (stepUpper === "QUANTITY_CHANGED") {
                          return "Quantity Changed";
                        }
                        if (stepUpper === "SETTLEMENT_DATE_CHANGED") {
                          return "Settlement Date Changed";
                        }

                        // Checkbox interactions
                        if (stepUpper.includes("CHECKBOX_")) {
                          const checkboxName = stepUpper
                            .replace("CHECKBOX_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Agreement: ${checkboxName}`;
                        }

                        // Error patterns
                        if (stepUpper.startsWith("ERROR_")) {
                          const errorType = stepUpper
                            .replace("ERROR_", "")
                            .replace(/_/g, " ")
                            .toLowerCase()
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ");
                          return `Error: ${errorType}`;
                        }

                        // Default: convert snake_case to Title Case
                        return step
                          .replace(/_/g, " ")
                          .toLowerCase()
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() +
                              word.slice(1).toLowerCase()
                          )
                          .join(" ");
                      };

                      const hasData = log.outputData || log.details;

                      return (
                        <div key={log.id} className="relative pl-14">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-background border-2 border-primary">
                            {getStatusIcon()}
                          </div>

                          <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-2 text-primary">
                                    {getStepIcon()}
                                    <span className="font-semibold text-sm">
                                      {formatStepName(log.step)}
                                    </span>
                                  </div>
                                  <StatusBadge value={log.status} />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {dateTimeUtils.formatDateTime(
                                    log.createdAt,
                                    "DD MMM YYYY hh:mm AA"
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* Data sections */}
                            {hasData && (
                              <Collapsible>
                                <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                                  <span>View details</span>
                                  <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                </CollapsibleTrigger>
                                <CollapsibleContent className="mt-2 space-y-3">
                                  {log.outputData && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Output Data
                                      </p>
                                      <div className="space-y-1.5">
                                        {Object.entries(log.outputData).map(
                                          ([key, value]) => (
                                            <div
                                              key={key}
                                              className="flex items-start gap-2 text-xs"
                                            >
                                              <span className="text-muted-foreground min-w-[100px] capitalize">
                                                {key
                                                  .replace(/([A-Z])/g, " $1")
                                                  .trim()}
                                                :
                                              </span>
                                              <span className="font-medium text-foreground break-all">
                                                {String(value)}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  {log.details && (
                                    <div className="bg-muted/50 p-3 rounded-md">
                                      <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Details
                                      </p>
                                      <div className="space-y-1.5">
                                        {Object.entries(log.details).map(
                                          ([key, value]) => {
                                            // Format special fields
                                            if (key === "timestamp") {
                                              return (
                                                <div
                                                  key={key}
                                                  className="flex items-start gap-2 text-xs"
                                                >
                                                  <span className="text-muted-foreground min-w-[100px] capitalize">
                                                    {key}:
                                                  </span>
                                                  <span className="font-medium text-foreground">
                                                    {dateTimeUtils.formatDateTime(
                                                      String(value),
                                                      "DD MMM YYYY hh:mm AA"
                                                    )}
                                                  </span>
                                                </div>
                                              );
                                            }
                                            if (
                                              typeof value === "object" &&
                                              value !== null
                                            ) {
                                              return (
                                                <div
                                                  key={key}
                                                  className="flex items-start gap-2 text-xs"
                                                >
                                                  <span className="text-muted-foreground min-w-[100px] capitalize">
                                                    {key
                                                      .replace(
                                                        /([A-Z])/g,
                                                        " $1"
                                                      )
                                                      .trim()}
                                                    :
                                                  </span>
                                                  <pre className="text-xs bg-background p-2 rounded border flex-1 overflow-auto">
                                                    {JSON.stringify(
                                                      value,
                                                      null,
                                                      2
                                                    )}
                                                  </pre>
                                                </div>
                                              );
                                            }
                                            return (
                                              <div
                                                key={key}
                                                className="flex items-start gap-2 text-xs"
                                              >
                                                <span className="text-muted-foreground min-w-[100px] capitalize">
                                                  {key
                                                    .replace(/([A-Z])/g, " $1")
                                                    .trim()}
                                                  :
                                                </span>
                                                <span className="font-medium text-foreground break-all">
                                                  {String(value)}
                                                </span>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No logs available for this order
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Financial Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasPricingSnapshot ? (
                <>
                  {yieldValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yield</span>
                      <span className="font-medium tabular-nums">
                        {yieldValue.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                        %
                      </span>
                    </div>
                  )}
                  {cleanPriceValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Clean Price</span>
                      <span className="font-medium">
                        {cleanPriceValue.toLocaleString("en-IN", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </span>
                    </div>
                  )}
                  {principalAmountValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Principal Amount
                      </span>
                      <span className="font-medium">
                        {formatInrAmount(principalAmountValue)}
                      </span>
                    </div>
                  )}
                  {accruedInterestValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Accrued interest
                      </span>
                      <span className="font-medium">
                        {formatInrAmount(accruedInterestValue)}
                      </span>
                    </div>
                  )}
                  {totalConsiderationValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Consideration w/o Stamp Duty
                      </span>
                      <span className="font-medium">
                        {formatInrAmount(totalConsiderationValue)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stamp duty</span>
                    <span className="font-medium">
                      {formatInrAmount(stampDutyDisplay)}
                    </span>
                  </div>
                  {/* {accrualDaysValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Accrued Interest Days
                      </span>
                      <span className="font-medium">
                        {accrualDaysValue.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )} */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">
                      {order.quantity.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Settlement Amount</span>
                    <span>{formatInrAmount(settlementTotalDisplay)}</span>
                  </div>
                </>
              ) : (
                <>
                  {yieldValue != null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yield</span>
                      <span className="font-medium tabular-nums">
                        {yieldValue.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 4,
                        })}
                        %
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      ₹{parseFloat(order.subTotal).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stamp Duty</span>
                    <span className="font-medium">
                      ₹{parseFloat(order.stampDuty).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>
                      ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Process Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Process Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {order.settlementAutomationLogs &&
                order.settlementAutomationLogs.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    order.settlementAutomationLogs.reduce(
                      (acc, log) => {
                        const key = log.paymentId || "unknown-payment";
                        if (!acc[key]) acc[key] = [];
                        acc[key].push(log);
                        return acc;
                      },
                      {} as Record<string, typeof order.settlementAutomationLogs>
                    )
                  ).map(([paymentId, logs]) => (
                    <div key={paymentId} className="rounded-lg border border-border p-4">
                      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Payment ID</p>
                          <p className="font-medium font-mono text-sm">{paymentId}</p>
                        </div>
                        <Badge variant="outline">{logs.length} logs</Badge>
                      </div>

                      <div className="space-y-3">
                        {logs.map((log) => {
                          const statusColor =
                            log.status === "SUCCESS"
                              ? "text-green-600"
                              : log.status === "FAILED"
                                ? "text-red-600"
                                : "text-yellow-600";

                          return (
                            <div
                              key={log.id}
                              className="rounded-md border border-border/70 bg-muted/30 p-3"
                            >
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">
                                      {log.step.replace(/_/g, " ")}
                                    </span>
                                    <Badge
                                      variant={
                                        log.status === "SUCCESS"
                                          ? "secondary"
                                          : log.status === "FAILED"
                                            ? "destructive"
                                            : "outline"
                                      }
                                    >
                                      {log.status}
                                    </Badge>
                                    <Badge variant="outline">{log.batchId}</Badge>
                                  </div>
                                  {log.message ? (
                                    <p className="text-sm text-muted-foreground">{log.message}</p>
                                  ) : null}
                                  <p className="text-xs text-muted-foreground">
                                    {dateTimeUtils.formatDateTime(
                                      log.createdAt,
                                      "DD MMM YYYY hh:mm:ss AA"
                                    )}
                                  </p>
                                </div>
                                <div className={statusColor}>
                                  {log.status === "SUCCESS" ? (
                                    <CheckCircle2 className="h-5 w-5" />
                                  ) : log.status === "FAILED" ? (
                                    <XCircle className="h-5 w-5" />
                                  ) : (
                                    <Clock className="h-5 w-5" />
                                  )}
                                </div>
                              </div>

                              {(log.inputData || log.outputData || log.errorData) && (
                                <Collapsible className="mt-3">
                                  <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group">
                                    <span>View payload</span>
                                    <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2 space-y-2">
                                    {log.inputData ? (
                                      <div className="rounded-md bg-muted/50 p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                          Input Data
                                        </p>
                                        <pre className="overflow-auto text-xs">
                                          {JSON.stringify(log.inputData, null, 2)}
                                        </pre>
                                      </div>
                                    ) : null}
                                    {log.outputData ? (
                                      <div className="rounded-md bg-muted/50 p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                          Output Data
                                        </p>
                                        <pre className="overflow-auto text-xs">
                                          {JSON.stringify(log.outputData, null, 2)}
                                        </pre>
                                      </div>
                                    ) : null}
                                    {log.errorData ? (
                                      <div className="rounded-md bg-muted/50 p-3">
                                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                                          Error Data
                                        </p>
                                        <pre className="overflow-auto text-xs">
                                          {JSON.stringify(log.errorData, null, 2)}
                                        </pre>
                                      </div>
                                    ) : null}
                                  </CollapsibleContent>
                                </Collapsible>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment process logs found for this order.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {dateTimeUtils.formatDateTime(
                    order.createdAt,
                    "DD MMM YYYY hh:mm AA"
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {dateTimeUtils.formatDateTime(
                    order.updatedAt,
                    "DD MMM YYYY hh:mm AA"
                  )}
                </p>
              </div>
              {order.metadata && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto">
                    {JSON.stringify(order.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Bonds (if exists) */}
          {order.customerBonds && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Bond Record</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{orderDateLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deal Date</p>
                  <p className="font-medium">{dealDateLabel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Settlement Date</p>
                  <p className="font-medium">
                    {settlementDateLabel !== "—"
                      ? settlementDateLabel
                      : order.customerBonds.purchaseDate
                        ? dateTimeUtils.formatDateTime(
                          order.customerBonds.purchaseDate,
                          "DD MMM YYYY",
                        )
                        : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Purchase Price
                  </p>
                  <p className="font-medium">
                    ₹
                    {parseFloat(
                      order.customerBonds.purchasePrice
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsView;
