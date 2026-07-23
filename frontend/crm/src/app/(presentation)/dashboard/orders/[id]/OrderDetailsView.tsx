"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { decodeId } from "@/global/utils/url.utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import OrderStatusBadge from "@/global/elements/wrapper/badges/OrderStatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  FileText,
  ChevronDown,
  Mail,
  FileDown,
  Info,
  Landmark,
  Handshake,
  CircleCheck,
  Route,
  MoreHorizontal,
  UserRound,
  Building2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { payinDateTimeToPickerValue } from "@/global/utils/receiptPdfOptions.utils";
import {
  formatCleanPriceDisplay,
  formatInrMoneyDisplay,
  formatUnitPriceDisplay,
  formatYtmDisplay,
} from "@/global/utils/pricingDecimalDisplay";
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

/** Mirrors backend `ORDER_STAGE_MAX_ATTEMPTS` in packages/config. */
const ORDER_STAGE_MAX_ATTEMPTS = 20;

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

function DetailCell({
  label,
  children,
  className,
  mono,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div
      className={`rounded-md border border-gray-100 bg-gray-50/40 px-3 py-2.5 ${className ?? ""}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <div
        className={`mt-1 text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""
          }`}
      >
        {children}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  children,
  muted,
}: {
  label: string;
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 text-sm">
      <span className={muted ? "text-gray-400" : "text-gray-500"}>{label}</span>
      <span className="shrink-0 text-right font-medium tabular-nums text-gray-800">
        {children}
      </span>
    </div>
  );
}

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
    return "border border-emerald-200 bg-emerald-50 text-emerald-700";
  if (["CANCELLED", "FAILED", "REJECTED", "EXPIRED"].includes(v))
    return "border border-rose-200 bg-rose-50 text-rose-700";
  if (["REFUNDED"].includes(v))
    return "border border-violet-200 bg-violet-50 text-violet-700";
  if (["PENDING", "CREATED", "AUTHORIZED", "IN_PROGRESS"].includes(v))
    return "border border-amber-200 bg-amber-50 text-amber-700";
  return "border border-slate-200 bg-slate-50 text-slate-600";
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
  const orderInfo = order?.orderInfo ?? null;

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
    orderInfo?.date.settlementNo ||
    (orderMetadata?.settlementNumber != null
      ? String(orderMetadata.settlementNumber)
      : orderMetadata?.settlementNo != null
        ? String(orderMetadata.settlementNo)
        : null);
  const metadataSettlement =
    orderInfo?.date.settlementDate ||
    (orderMetadata?.settlementDate != null ? String(orderMetadata.settlementDate) : null);
  const defaultAutofillSettlementDate =
    payinDateTimeToPickerValue(metadataSettlement) ||
    payinDateTimeToPickerValue(order?.createdAt ?? null);

  const dealDateLabel = orderInfo?.date.dealDate
    ? formatBusinessDateLabel(orderInfo.date.dealDate)
    : formatBusinessDateLabel(orderMetadata?.dealDate);
  const settlementDateLabel = orderInfo?.date.settlementDate
    ? formatBusinessDateLabel(orderInfo.date.settlementDate)
    : formatBusinessDateLabel(orderMetadata?.settlementDate);
  const lastCouponDateLabel = orderInfo?.date.lastCouponDate
    ? formatBusinessDateLabel(orderInfo.date.lastCouponDate)
    : "—";
  const nextCouponDateLabel = orderInfo?.date.nextCouponDate
    ? formatBusinessDateLabel(orderInfo.date.nextCouponDate)
    : "—";

  const orderReceiptEmailSentAtRaw =
    typeof orderMetadata?.orderReceiptEmailSentAt === "string"
      ? orderMetadata.orderReceiptEmailSentAt.trim()
      : "";
  const orderReceiptEmailSentFromLogs = Boolean(
    order?.settlementAutomationLogs?.some(
      (log) =>
        log.step === "SEND_ORDER_RECEIPT_PDF_EMAIL" && log.status === "SUCCESS",
    ),
  );
  const orderReceiptEmailSent =
    orderReceiptEmailSentAtRaw !== "" || orderReceiptEmailSentFromLogs;
  const orderReceiptEmailSentAtLabel = orderReceiptEmailSentAtRaw
    ? dateTimeUtils.formatDateTime(
      orderReceiptEmailSentAtRaw,
      "DD MMM YYYY hh:mm AA",
    )
    : orderReceiptEmailSentFromLogs
      ? (() => {
        const log = order?.settlementAutomationLogs?.find(
          (l) =>
            l.step === "SEND_ORDER_RECEIPT_PDF_EMAIL" &&
            l.status === "SUCCESS",
        );
        return log?.completedAt || log?.createdAt
          ? dateTimeUtils.formatDateTime(
            String(log.completedAt ?? log.createdAt),
            "DD MMM YYYY hh:mm AA",
          )
          : null;
      })()
      : null;
  const orderDateLabel = orderInfo?.orderDate
    ? formatBusinessDateLabel(orderInfo.orderDate)
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

  // Prefer normalized `orderInfo`; fall back to bondDetails.pricing snapshot.
  const orderPricing = (order.bondDetails as Record<string, unknown> | undefined)
    ?.pricing as Record<string, unknown> | undefined;

  const pricingNumber = (key: string): number | undefined => {
    const v = orderPricing?.[key];
    if (v == null) return undefined;
    const n = typeof v === "number" ? v : Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const pricingRaw = (key: string): string | number | undefined => {
    const v = orderPricing?.[key];
    if (typeof v === "number" || typeof v === "string") return v;
    return undefined;
  };

  const formatInrAmount = (n: number | undefined | null): string =>
    formatInrMoneyDisplay(n);

  const cleanPriceValue = orderInfo
    ? orderInfo.pricing.cleanPrice
    : pricingNumber("cleanPrice");
  const unitPriceDisplaySource = orderInfo
    ? orderInfo.pricing.cleanPrice
    : (pricingRaw("cleanPrice") ?? order.unitPrice);
  const principalAmountValue = orderInfo
    ? orderInfo.pricing.principal
    : pricingNumber("principalAmount");
  const accruedInterestValue = orderInfo
    ? orderInfo.pricing.accruedInterest
    : pricingNumber("accruedInterest");
  const totalConsiderationValue = orderInfo
    ? orderInfo.pricing.totalConsiderationAmount
    : pricingNumber("totalConsideration");
  const pricingStampDutyValue = orderInfo
    ? orderInfo.pricing.stampDuty
    : pricingNumber("stampDuty");
  const settlementAmountValue = orderInfo
    ? orderInfo.pricing.settlementAmount
    : pricingNumber("settlementAmount");
  const quantumValue = orderInfo
    ? orderInfo.pricing.quantum
    : pricingNumber("quantum");
  const yieldValue = orderInfo
    ? orderInfo.pricing.yieldToMaturity
    : (pricingNumber("yield") ??
      getBondDetailNumber(
        (order.bondDetails as Record<string, unknown>) ?? {},
        "yield",
      ));
  const quantityDisplay = orderInfo?.pricing.quantity ?? order.quantity;

  const hasPricingSnapshot = orderInfo
    ? true
    : orderPricing != null &&
    [
      cleanPriceValue,
      principalAmountValue,
      accruedInterestValue,
      totalConsiderationValue,
      settlementAmountValue,
      yieldValue,
    ].some((v) => v != null);

  const stampDutyDisplay =
    orderInfo?.pricing.stampDuty ??
    pricingStampDutyValue ??
    parseFloat(order.stampDuty);
  const settlementTotalDisplay =
    orderInfo?.pricing.settlementAmount ??
    settlementAmountValue ??
    parseFloat(order.totalAmount);

  const customerDisplayName =
    orderInfo?.customer.name ||
    (order.customerProfile
      ? [
        order.customerProfile.firstName,
        order.customerProfile.middleName,
        order.customerProfile.lastName,
      ]
        .map((p) => (typeof p === "string" ? p.trim() : ""))
        .filter(Boolean)
        .join(" ")
      : null) ||
    order.rfqParticipantInfo?.nameOverride?.trim() ||
    order.linkedRfqParticipantCode ||
    null;
  const customerInitial = (customerDisplayName || "C")
    .trim()
    .charAt(0)
    .toUpperCase();
  const isMeradhanCustomer = !!(
    order.customerProfile || orderInfo?.customer.name
  );
  const customerEmail =
    orderInfo?.customer.email ||
    order.customerProfile?.emailAddress ||
    null;
  const customerPhone =
    orderInfo?.customer.phone || order.customerProfile?.phoneNo || null;
  const customerUserName =
    orderInfo?.customer.userName || order.customerProfile?.userName || null;
  const customerId =
    orderInfo?.customer.userId || order.customerProfile?.id || null;
  const paymentProviderDisplay =
    orderInfo?.payment.paymentProvider || order.paymentProvider || null;
  const paymentStatusDisplay =
    orderInfo?.payment.paymentStatus || order.paymentStatus || null;
  const paymentIdDisplay =
    orderInfo?.payment.paymentId || order.paymentId || null;
  const isCustomPaymentProvider =
    String(paymentProviderDisplay ?? order.paymentProvider ?? "")
      .trim()
      .toUpperCase() === "CUSTOM";
  const linkedRfqNumber =
    orderInfo?.rfqNumber?.trim() ||
    order.reqOrderNumber?.trim() ||
    (typeof order.metadata?.rfqNumber === "string"
      ? order.metadata.rfqNumber.trim()
      : "") ||
    "";
  // PDF / settlement actions need a completed RFQ when one is linked.
  const showOrderActions =
    Boolean(order.orderNumber) &&
    (!linkedRfqNumber || orderInfo?.rfqCompleted === true);
  const bondNameDisplay = orderInfo?.bond.name || order.bondName;
  const bondIsinDisplay = orderInfo?.bond.isin || order.isin;
  const faceValueDisplay =
    orderInfo?.bond.faceValue ?? parseFloat(order.faceValue);

  return (
    <div className="space-y-6">
      <PageInfoBar
        showBack
        title="Order Details"
        description={`Order ${order.orderNumber}`}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <OrderStatusBadge
              status={order.status}
              paymentStatus={order.paymentStatus}
              paymentProvider={order.paymentProvider}
              prefix="Settlement"
            />
            {paymentStatusDisplay ? (
              <StatusBadge value={paymentStatusDisplay} prefix="Payment" />
            ) : null}
            {showOrderActions ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="mr-1.5 h-4 w-4" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => openPdfDialog("order")}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Order receipt PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPdfDialog("deal")}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Deal sheet PDF
                  </DropdownMenuItem>
                  {((order.customerProfile as { userType?: string } | null)
                    ?.userType?.toUpperCase() === "CORPORATE") && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/dashboard/rfqs/nse/settle-orders/generate/${encodeURIComponent(order.orderNumber)}`}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Send email
                        </Link>
                      </DropdownMenuItem>
                    )}
                  <AllowOnlyView permissions={["edit:orders"]}>
                    {(order.paymentProvider === "RAZORPAY" ||
                      order.paymentProvider === "CUSTOM" ||
                      (order.paymentProvider === "RAZORPAY" &&
                        order.paymentStatus === "COMPLETED")) && (
                        <DropdownMenuSeparator />
                      )}
                    {order.paymentProvider === "RAZORPAY" && (
                      <DropdownMenuItem
                        disabled={verifyPaymentMutation.isPending}
                        onClick={() => verifyPaymentMutation.mutate()}
                      >
                        {verifyPaymentMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Verify Razorpay Payment
                      </DropdownMenuItem>
                    )}
                    {(order.paymentProvider === "CUSTOM" ||
                      (order.paymentProvider === "RAZORPAY" &&
                        order.paymentStatus === "COMPLETED")) && (
                        <DropdownMenuItem
                          disabled={verifySettlementMutation.isPending}
                          onClick={() => verifySettlementMutation.mutate()}
                        >
                          {verifySettlementMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Verify Settlement
                        </DropdownMenuItem>
                      )}
                  </AllowOnlyView>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        }
      />

      {/* Overview — primary scan surface for ops */}
      <Card className="border-gray-100 shadow-none rounded-lg overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col gap-0 lg:flex-row">
            <div className="flex-1 space-y-4 p-5 lg:p-6">
              <div className="space-y-1.5">
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Bond
                </p>
                <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                  {orderInfo?.bond.name || order.bondName}
                </h2>
                <p className="font-mono text-sm text-gray-500">
                  {orderInfo?.bond.isin || order.isin}
                </p>
              </div>

              {(orderInfo?.customer.name ||
                order.customerProfile ||
                order.linkedRfqParticipantCode ||
                orderInfo?.rfqNumber ||
                order.reqOrderNumber ||
                defaultSettlementNumber) && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(orderInfo?.customer.name ||
                      order.customerProfile ||
                      order.linkedRfqParticipantCode) && (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs text-gray-700">
                          {order.customerProfile || orderInfo?.customer.name ? (
                            <UserRound className="h-3.5 w-3.5 text-gray-400" />
                          ) : (
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          )}
                          <span className="font-medium">
                            {orderInfo?.customer.name ||
                              (order.customerProfile
                                ? [
                                  order.customerProfile.firstName,
                                  order.customerProfile.lastName,
                                ]
                                  .filter(Boolean)
                                  .join(" ")
                                : null) ||
                              order.rfqParticipantInfo?.nameOverride ||
                              order.linkedRfqParticipantCode ||
                              "—"}
                          </span>
                        </span>
                      )}
                    {(orderInfo?.rfqNumber || order.reqOrderNumber) && (
                      <span className="inline-flex items-center rounded-md border border-gray-100 px-2.5 py-1 font-mono text-[11px] text-gray-500">
                        Settlement Order Number{" "}
                        {orderInfo?.rfqNumber || order.reqOrderNumber}
                      </span>
                    )}
                    {defaultSettlementNumber ? (
                      <span className="inline-flex items-center rounded-md border border-gray-100 px-2.5 py-1 font-mono text-[11px] text-gray-500">
                        Settle #{defaultSettlementNumber}
                      </span>
                    ) : null}
                  </div>
                )}

              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                  <p className="text-[11px] text-gray-400">Deal date</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-gray-800">
                    {dealDateLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                  <p className="text-[11px] text-gray-400">Settlement date</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-gray-800">
                    {settlementDateLabel}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                  <p className="text-[11px] text-gray-400">Clean price</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-gray-800">
                    {formatUnitPriceDisplay(unitPriceDisplaySource)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white px-3 py-2.5">
                  <p className="text-[11px] text-gray-400">YTM</p>
                  <p className="mt-0.5 text-sm font-medium tabular-nums text-gray-800">
                    {yieldValue != null ? formatYtmDisplay(yieldValue) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 border-t border-gray-100 bg-gray-50/60 p-5 lg:w-72 lg:border-t-0 lg:border-l lg:p-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                  Settlement amount
                </p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums text-gray-900 sm:text-3xl">
                  {formatInrAmount(settlementTotalDisplay)}
                </p>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between gap-3">
                  <span>Quantity</span>
                  <span className="font-medium tabular-nums text-gray-700">
                    {quantityDisplay.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Unit price</span>
                  <span className="font-medium tabular-nums text-gray-700">
                    {formatUnitPriceDisplay(unitPriceDisplaySource)}
                  </span>
                </div>
                {quantumValue != null && quantumValue > 0 && (
                  <div className="flex justify-between gap-3">
                    <span>Quantum</span>
                    <span className="font-medium tabular-nums text-gray-700">
                      {formatInrAmount(quantumValue)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.orderNumber ? (
        <OrderPdfDownloadDialog
          open={pdfDialogOpen}
          onOpenChange={setPdfDialogOpen}
          orderNumber={order.orderNumber}
          pdfType={pdfDialogType}
          defaultSettlementNumber={defaultSettlementNumber}
          defaultAutofillSettlementDate={defaultAutofillSettlementDate}
          defaultLastCouponDate={orderInfo?.date.lastCouponDate || null}
          settleOrderTradeNumber={
            orderInfo?.rfqNumber || order.reqOrderNumber || null
          }
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
                      verifyResult.currentPaymentStatus,
                    )}`}
                  >
                    {verifyResult.currentPaymentStatus ?? "—"}
                  </span>
                  {verifyResult.willChange && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${verifyResult.applied
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : verifyResult.willChange
                        ? "border border-blue-200 bg-blue-50 text-blue-700"
                        : "border border-slate-200 bg-slate-50 text-slate-600"
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
                      settleResult.currentOrderStatus,
                    )}`}
                  >
                    {settleResult.currentOrderStatus ?? "—"}
                  </span>
                  {settleResult.willChange && (
                    <>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${statusPillClasses(
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
                    className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${settleResult.applied
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : settleResult.willChange
                        ? "border border-blue-200 bg-blue-50 text-blue-700"
                        : "border border-slate-200 bg-slate-50 text-slate-600"
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {/* Main column — settlement first for ops */}
        <div className="flex flex-col gap-6">
          {/* Counterparty information — Meradhan customer (default) or
              external NSE participant (when assigned via the CRM
              assign-rfq-participant flow). */}
          <Card className="order-2 border-gray-100 shadow-none rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-base">
                {isMeradhanCustomer ? (
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                )}
                {isMeradhanCustomer
                  ? "Customer Information"
                  : "NSE Participant (counterparty)"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {isMeradhanCustomer ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                      {customerInitial}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-gray-900">
                        {customerDisplayName || "—"}
                      </p>
                      {customerUserName ? (
                        <p className="font-mono text-xs text-gray-500">
                          @{customerUserName}
                        </p>
                      ) : null}
                      {customerEmail ? (
                        <p className="truncate text-sm text-gray-600">
                          {customerEmail}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {customerPhone ? (
                      <DetailCell label="Phone">{customerPhone}</DetailCell>
                    ) : null}
                    <DetailCell label="Customer ID" mono>
                      {customerId ?? "—"}
                    </DetailCell>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-base font-semibold text-gray-900">
                        {customerDisplayName || "—"}
                      </p>
                      <p className="font-mono text-xs text-gray-500">
                        {order.linkedRfqParticipantCode ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <DetailCell label="Participant code" mono>
                      {order.linkedRfqParticipantCode ?? "—"}
                    </DetailCell>
                    {order.rfqParticipantInfo?.contactPerson ? (
                      <DetailCell label="Contact">
                        {order.rfqParticipantInfo.contactPerson}
                      </DetailCell>
                    ) : null}
                    {!!order.rfqParticipantInfo?.emailList?.length && (
                      <DetailCell label="Email" className="sm:col-span-2">
                        <span className="break-all">
                          {order.rfqParticipantInfo.emailList.join(", ")}
                        </span>
                      </DetailCell>
                    )}
                    {!!order.rfqParticipantInfo?.mobileList?.length && (
                      <DetailCell label="Mobile">
                        {order.rfqParticipantInfo.mobileList.join(", ")}
                      </DetailCell>
                    )}
                    {order.rfqParticipantInfo?.panNo ? (
                      <DetailCell label="PAN" mono>
                        {order.rfqParticipantInfo.panNo}
                      </DetailCell>
                    ) : null}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Bond Information */}
          <Card className="order-3 border-gray-100 shadow-none rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                Bond Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="space-y-1.5">
                <p className="text-base font-semibold leading-snug text-gray-900">
                  {bondNameDisplay}
                </p>
                <p className="inline-flex items-center rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-600">
                  {bondIsinDisplay}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                <DetailCell label="Face Value">
                  <span className="tabular-nums">
                    ₹{faceValueDisplay.toLocaleString("en-IN")}
                  </span>
                </DetailCell>
                <DetailCell label="Quantity">
                  <span className="tabular-nums">
                    {quantityDisplay.toLocaleString("en-IN")}
                  </span>
                </DetailCell>
                <DetailCell label="Unit Price">
                  <span className="tabular-nums">
                    {formatUnitPriceDisplay(unitPriceDisplaySource)}
                  </span>
                </DetailCell>
                {orderInfo?.bond.couponRate ? (
                  <DetailCell label="Coupon Rate">
                    <span className="tabular-nums">
                      {orderInfo.bond.couponRate}%
                    </span>
                  </DetailCell>
                ) : null}
                {orderInfo?.bond.maturityDate ? (
                  <DetailCell label="Maturity Date" className="sm:col-span-2">
                    <span className="tabular-nums">
                      {formatBusinessDateLabel(orderInfo.bond.maturityDate)}
                    </span>
                  </DetailCell>
                ) : null}
              </div>
              {order.bondDetails && (
                <Collapsible className="mt-6 pt-6 border-t">
                  <CollapsibleTrigger className="flex w-full items-center justify-between group text-left">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Additional Bond Details
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Financials, ratings, dates, and instrument metadata
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4">
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
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="order-4 border-gray-100 shadow-none rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment Information
                </CardTitle>
                {paymentStatusDisplay ? (
                  <StatusBadge value={paymentStatusDisplay} />
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {paymentProviderDisplay ? (
                  <DetailCell label="Provider">
                    {paymentProviderDisplay}
                  </DetailCell>
                ) : null}
                {!isCustomPaymentProvider && order.paymentOrderId ? (
                  <DetailCell label="Payment Order ID" mono className="sm:col-span-2">
                    <span className="break-all">{order.paymentOrderId}</span>
                  </DetailCell>
                ) : null}
                {!isCustomPaymentProvider && paymentIdDisplay ? (
                  <DetailCell label="Payment ID" mono className="sm:col-span-2">
                    <span className="break-all">{paymentIdDisplay}</span>
                  </DetailCell>
                ) : null}
              </div>
              {order.paymentMetadata && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                    Payment metadata
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <pre className="overflow-auto rounded-md border border-gray-100 bg-gray-50 p-3 text-xs">
                      {JSON.stringify(order.paymentMetadata, null, 2)}
                    </pre>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </CardContent>
          </Card>

          {/* Settlement Pipeline — Stage Timeline */}
          <Card className="order-1 border-gray-100 shadow-none rounded-lg">
            <CardHeader className="pb-3 border-b border-gray-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Settlement Pipeline</CardTitle>
                </div>
                <CardDescription>
                  Workflow stages for NSE settlement. Click a step for details.
                  Successful steps are skipped on resume.
                </CardDescription>
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
                  <div className="w-full overflow-x-auto rounded-lg border border-gray-100 px-3 py-5 sm:px-5">
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
                              "DD MMM YYYY hh:mm:ss AA",
                            )
                            : "—";
                        const showConnector = index < pipelineStages.length - 1;
                        const connectorDone = isSuccess;
                        const retriesLabel = `${stage.attemptCount}/${ORDER_STAGE_MAX_ATTEMPTS}`;

                        return (
                          <div
                            key={stage.id}
                            className="relative flex flex-col items-center px-1 text-center"
                          >
                            {showConnector ? (
                              <div
                                className={`pointer-events-none absolute top-5 left-1/2 h-0.5 w-full ${connectorDone
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
                              className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors cursor-pointer hover:opacity-90 ${isFailed
                                ? "border-destructive bg-destructive text-white"
                                : isWaiting
                                  ? "border-yellow-500 bg-yellow-500 text-white"
                                  : isSkippedSuccess
                                    ? "border-muted-foreground/40 bg-muted text-muted-foreground"
                                    : isSuccess
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : isNext
                                        ? "border-primary bg-white text-primary"
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
                              className={`mt-2 text-sm font-medium capitalize hover:underline ${isFailed
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
                              className={`mt-0.5 text-[11px] font-medium ${stage.attemptCount > 0
                                ? "text-foreground"
                                : "text-muted-foreground"
                                }`}
                            >
                              Retries {retriesLabel}
                            </p>
                            {isFailed ? (
                              <Badge
                                variant="outline"
                                className="mt-1 border-rose-200 bg-rose-50 text-[10px] text-rose-700 shadow-none"
                              >
                                Failed
                              </Badge>
                            ) : isWaiting ? (
                              <Badge
                                variant="outline"
                                className="mt-1 border-amber-200 bg-amber-50 text-[10px] text-amber-700 shadow-none"
                              >
                                Waiting
                              </Badge>
                            ) : isNext ? (
                              <Badge
                                variant="outline"
                                className="mt-1 border-blue-200 bg-blue-50 text-[10px] text-blue-700 shadow-none"
                              >
                                Next
                              </Badge>
                            ) : isSkippedSuccess ? (
                              <Badge
                                variant="outline"
                                className="mt-1 border-slate-200 bg-slate-50 text-[10px] text-slate-600 shadow-none"
                              >
                                Skipped
                              </Badge>
                            ) : isSuccess ? (
                              <Badge
                                variant="outline"
                                className="mt-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 shadow-none"
                              >
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
                      className={`rounded-lg border px-4 py-3.5 ${nextResumeStage.status === 2
                        ? "border-rose-200 bg-rose-50/50"
                        : "border-gray-100 bg-white"
                        }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">
                            Next step:{" "}
                            {SETTLEMENT_STAGE_META[nextResumeStage.stage]
                              ?.label ??
                              nextResumeStage.stage.replace(/_/g, " ")}
                            <span className="ml-2 text-xs font-normal text-gray-500">
                              Retries {nextResumeStage.attemptCount}/{ORDER_STAGE_MAX_ATTEMPTS}
                            </span>
                          </p>
                          {nextResumeStage.lastError ? (
                            <p className="text-sm text-rose-600 break-words">
                              {nextResumeStage.lastError}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              Continue to resume the workflow from this step.
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
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
                    <p className="text-sm text-emerald-700">
                      All settlement stages completed successfully.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Stages not seeded yet (pre-pipeline order or payment not completed).
                </p>
              )}

              <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-100 bg-muted/30 px-4 py-3">
                <Checkbox
                  id="order-receipt-email-sent"
                  checked={orderReceiptEmailSent}
                  disabled
                  className="mt-0.5"
                  aria-label="Order receipt email sent"
                />
                <div className="min-w-0 space-y-0.5">
                  <Label
                    htmlFor="order-receipt-email-sent"
                    className="text-sm font-medium text-foreground"
                  >
                    Order receipt email sent
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {orderReceiptEmailSent
                      ? orderReceiptEmailSentAtLabel
                        ? `Sent ${orderReceiptEmailSentAtLabel}`
                        : "Receipt PDF was emailed to the customer."
                      : "Not sent yet (pipeline or CRM email)."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step details: request / response / metadata */}
          <Dialog
            open={stageDetailsId != null}
            onOpenChange={(open) => {
              if (!open) setStageDetailsId(null);
            }}
          >
            <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto shadow-none border border-gray-100">
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
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {stageStatusLabel(selectedStageDetails.status)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-muted-foreground">Retries</p>
                      <p className="font-medium">
                        {selectedStageDetails.attemptCount}/{ORDER_STAGE_MAX_ATTEMPTS}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-muted-foreground">Sequence</p>
                      <p className="font-medium">#{selectedStageDetails.seq}</p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-muted-foreground">Order No</p>
                      <p className="font-medium font-mono text-xs">
                        {selectedStageDetails.orderNo}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="font-medium text-xs">
                        {dateTimeUtils.formatDateTime(
                          selectedStageDetails.createdAt,
                          "DD MMM YYYY hh:mm:ss AA",
                        )}
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-100 p-3">
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
                    <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                      <p className="mb-1 text-xs font-medium text-rose-700">
                        Last error
                      </p>
                      <p className="text-sm text-rose-700 whitespace-pre-wrap">
                        {selectedStageDetails.lastError}
                      </p>
                    </div>
                  ) : null}

                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Request (payload)
                    </p>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-56 text-gray-700">
                      {JSON.stringify(selectedStageDetails.payload ?? {}, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-gray-100 p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Response
                    </p>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap max-h-56 text-gray-700">
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
          <Card className="order-5 border-gray-100 shadow-none rounded-lg">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Order Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.orderLogs && order.orderLogs.length > 0 ? (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[17px] top-2 bottom-2 w-px bg-gray-200" />

                  <div className="space-y-5">
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
                        <div key={log.id} className="relative pl-12">
                          {/* Timeline dot */}
                          <div className="absolute left-0 top-1.5 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white">
                            {getStatusIcon()}
                          </div>

                          <div className="space-y-2">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center gap-2 text-gray-800">
                                    {getStepIcon()}
                                    <span className="font-medium text-sm">
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
        <div className="space-y-6 lg:sticky lg:top-[10px]">
          <Card className="border-gray-100 shadow-none rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 p-0">
              {hasPricingSnapshot ? (
                <>
                  <div className="space-y-4 px-5 py-4">
                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        Pricing
                      </p>
                      <div className="divide-y divide-gray-50">
                        {yieldValue != null && (
                          <SummaryRow label="Yield">
                            {formatYtmDisplay(yieldValue)}
                          </SummaryRow>
                        )}
                        {cleanPriceValue != null && (
                          <SummaryRow label="Clean Price">
                            {orderInfo
                              ? formatCleanPriceDisplay(cleanPriceValue)
                              : formatCleanPriceDisplay(
                                pricingRaw("cleanPrice") ?? cleanPriceValue,
                              )}
                          </SummaryRow>
                        )}
                        <SummaryRow label="Quantity">
                          {quantityDisplay.toLocaleString("en-IN")}
                        </SummaryRow>
                        {quantumValue != null && quantumValue > 0 && (
                          <SummaryRow label="Quantum">
                            {formatInrAmount(quantumValue)}
                          </SummaryRow>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        Amounts
                      </p>
                      <div className="divide-y divide-gray-50">
                        {principalAmountValue != null && (
                          <SummaryRow label="Principal">
                            {formatInrAmount(principalAmountValue)}
                          </SummaryRow>
                        )}
                        {accruedInterestValue != null && (
                          <SummaryRow label="Accrued interest">
                            {formatInrAmount(accruedInterestValue)}
                          </SummaryRow>
                        )}
                        {totalConsiderationValue != null && (
                          <SummaryRow label="Consideration (ex stamp)">
                            {formatInrAmount(totalConsiderationValue)}
                          </SummaryRow>
                        )}
                        <SummaryRow label="Stamp duty">
                          {formatInrAmount(stampDutyDisplay)}
                        </SummaryRow>
                      </div>
                    </div>

                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4">
                    <span className="text-sm font-medium text-gray-600">
                      Settlement Amount
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-gray-900">
                      {formatInrAmount(settlementTotalDisplay)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="divide-y divide-gray-50 px-5 py-1">
                    {yieldValue != null && (
                      <SummaryRow label="Yield">
                        {formatYtmDisplay(yieldValue)}
                      </SummaryRow>
                    )}
                    <SummaryRow label="Subtotal">
                      {formatInrMoneyDisplay(order.subTotal)}
                    </SummaryRow>
                    <SummaryRow label="Stamp Duty">
                      {formatInrMoneyDisplay(order.stampDuty)}
                    </SummaryRow>
                  </div>
                  <div className="flex items-baseline justify-between gap-3 border-t border-gray-100 bg-gray-50/70 px-5 py-4">
                    <span className="text-sm font-medium text-gray-600">
                      Total Amount
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-gray-900">
                      {formatInrMoneyDisplay(order.totalAmount)}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Process Logs */}
          <Collapsible defaultOpen={false}>
            <Card className="border-gray-100 shadow-none rounded-lg">
              <CardHeader className="pb-3 border-b border-gray-50">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 text-left group">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Payment Process Logs
                    </CardTitle>
                    {order.settlementAutomationLogs &&
                      order.settlementAutomationLogs.length > 0 ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {order.settlementAutomationLogs.length}{" "}
                        {order.settlementAutomationLogs.length === 1
                          ? "log"
                          : "logs"}
                      </p>
                    ) : null}
                  </div>
                  <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  {order.settlementAutomationLogs &&
                    order.settlementAutomationLogs.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(
                        order.settlementAutomationLogs.reduce(
                          (acc, log) => {
                            const key = log.paymentId || "unknown-payment";
                            if (!acc[key]) acc[key] = [];
                            acc[key].push(log);
                            return acc;
                          },
                          {} as Record<
                            string,
                            typeof order.settlementAutomationLogs
                          >,
                        ),
                      ).map(([paymentId, logs]) => (
                        <div key={paymentId}>
                          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-3">
                            <div>
                              <p className="text-xs text-gray-500">Payment ID</p>
                              <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">
                                {paymentId}
                              </p>
                            </div>
                            <p className="text-xs text-gray-400">
                              {logs.length} {logs.length === 1 ? "log" : "logs"}
                            </p>
                          </div>

                          <div className="divide-y divide-gray-100">
                            {logs.map((log) => {
                              const isSuccess = log.status === "SUCCESS";
                              const isFailed = log.status === "FAILED";

                              return (
                                <div key={log.id} className="py-3.5 first:pt-1 last:pb-0">
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${isSuccess
                                        ? "border-emerald-200 text-emerald-600"
                                        : isFailed
                                          ? "border-rose-200 text-rose-600"
                                          : "border-amber-200 text-amber-600"
                                        }`}
                                    >
                                      {isSuccess ? (
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                      ) : isFailed ? (
                                        <XCircle className="h-3.5 w-3.5" />
                                      ) : (
                                        <Clock className="h-3.5 w-3.5" />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1 space-y-1">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 capitalize">
                                          {log.step.replace(/_/g, " ").toLowerCase()}
                                        </span>
                                        <span
                                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${isSuccess
                                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                            : isFailed
                                              ? "border-rose-200 bg-rose-50 text-rose-700"
                                              : "border-amber-200 bg-amber-50 text-amber-700"
                                            }`}
                                        >
                                          {log.status}
                                        </span>
                                      </div>

                                      {log.message ? (
                                        <p className="text-sm text-gray-500">
                                          {log.message}
                                        </p>
                                      ) : null}

                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                                        <span>
                                          {dateTimeUtils.formatDateTime(
                                            log.createdAt,
                                            "DD MMM YYYY hh:mm:ss AA",
                                          )}
                                        </span>
                                        {log.batchId ? (
                                          <span className="font-mono truncate max-w-full">
                                            {log.batchId}
                                          </span>
                                        ) : null}
                                      </div>

                                      {(log.inputData ||
                                        log.outputData ||
                                        log.errorData) && (
                                          <Collapsible className="pt-1">
                                            <CollapsibleTrigger className="group flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-gray-700">
                                              <span>View payload</span>
                                              <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-2 space-y-2">
                                              {log.inputData ? (
                                                <div className="rounded-lg border border-gray-100 p-3">
                                                  <p className="mb-1.5 text-[11px] font-medium text-gray-500">
                                                    Input
                                                  </p>
                                                  <pre className="overflow-auto text-xs text-gray-700">
                                                    {JSON.stringify(
                                                      log.inputData,
                                                      null,
                                                      2,
                                                    )}
                                                  </pre>
                                                </div>
                                              ) : null}
                                              {log.outputData ? (
                                                <div className="rounded-lg border border-gray-100 p-3">
                                                  <p className="mb-1.5 text-[11px] font-medium text-gray-500">
                                                    Output
                                                  </p>
                                                  <pre className="overflow-auto text-xs text-gray-700">
                                                    {JSON.stringify(
                                                      log.outputData,
                                                      null,
                                                      2,
                                                    )}
                                                  </pre>
                                                </div>
                                              ) : null}
                                              {log.errorData ? (
                                                <div className="rounded-lg border border-rose-100 p-3">
                                                  <p className="mb-1.5 text-[11px] font-medium text-rose-600">
                                                    Error
                                                  </p>
                                                  <pre className="overflow-auto text-xs text-rose-700">
                                                    {JSON.stringify(
                                                      log.errorData,
                                                      null,
                                                      2,
                                                    )}
                                                  </pre>
                                                </div>
                                              ) : null}
                                            </CollapsibleContent>
                                          </Collapsible>
                                        )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No payment process logs found for this order.
                    </p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Order Metadata */}
          <Card className="border-gray-100 shadow-none rounded-lg overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4 text-muted-foreground" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50 px-5 py-1">
                <SummaryRow label="Order Date">{orderDateLabel}</SummaryRow>
                {orderInfo?.dealId ? (
                  <SummaryRow label="Deal ID">
                    <span className="font-mono">{orderInfo.dealId}</span>
                  </SummaryRow>
                ) : null}
                {(orderInfo?.rfqNumber || order.reqOrderNumber) && (
                  <SummaryRow label="Settlement Order Number">
                    <span className="font-mono">
                      {orderInfo?.rfqNumber || order.reqOrderNumber}
                    </span>
                  </SummaryRow>
                )}
                {dealDateLabel !== "—" && (
                  <SummaryRow label="Deal Date">{dealDateLabel}</SummaryRow>
                )}
                {settlementDateLabel !== "—" && (
                  <SummaryRow label="Settlement Date">
                    {settlementDateLabel}
                  </SummaryRow>
                )}
                {defaultSettlementNumber ? (
                  <SummaryRow label="Settlement No">
                    <span className="font-mono">{defaultSettlementNumber}</span>
                  </SummaryRow>
                ) : null}
                {lastCouponDateLabel !== "—" && (
                  <SummaryRow label="Last Coupon Date">
                    {lastCouponDateLabel}
                  </SummaryRow>
                )}
                {nextCouponDateLabel !== "—" && (
                  <SummaryRow label="Next Coupon Date">
                    {nextCouponDateLabel}
                  </SummaryRow>
                )}
                <SummaryRow label="Created At">
                  {dateTimeUtils.formatDateTime(
                    order.createdAt,
                    "DD MMM YYYY hh:mm AA",
                  )}
                </SummaryRow>
                <SummaryRow label="Last Updated">
                  {dateTimeUtils.formatDateTime(
                    order.updatedAt,
                    "DD MMM YYYY hh:mm AA",
                  )}
                </SummaryRow>
              </div>
              {order.metadata && (
                <div className="border-t border-gray-50 px-5 py-3">
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors group">
                      Raw metadata
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <pre className="overflow-auto rounded-md border border-gray-100 bg-gray-50 p-3 text-xs">
                        {JSON.stringify(order.metadata, null, 2)}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsView;
