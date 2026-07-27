"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import apiGateway, { ApiError } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { queryClient } from "@/core/config/reactQuery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildPdfOptionPayload,
  formatDateWithDayNameFromPicker,
  getValidatedAccruedInterestDays,
  interestPaymentDatesToFormText,
  normalizeLastCouponDateRawInput,
  type ReceiptPdfFormState,
} from "@/global/utils/receiptPdfOptions.utils";

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const data = err.response?.data as { message?: string } | undefined;
    const apiMsg = data?.message?.trim();
    if (apiMsg) return apiMsg;
  }
  if (err instanceof Error && err.message.trim() !== "") {
    return err.message;
  }
  return fallback;
}

async function getApiErrorDetails(err: unknown): Promise<{
  message: string;
  code?: string;
}> {
  if (err instanceof ApiError) {
    const data = err.response?.data as unknown;
    if (data && typeof data === "object" && !(data instanceof Blob)) {
      const obj = data as { message?: string; code?: string };
      return {
        message: obj.message?.trim() || err.message,
        code: typeof obj.code === "string" ? obj.code : undefined,
      };
    }
    if (data instanceof Blob) {
      try {
        const j = JSON.parse(await data.text()) as {
          message?: string;
          code?: string;
        };
        return {
          message: j.message?.trim() || err.message,
          code: typeof j.code === "string" ? j.code : undefined,
        };
      } catch {
        // ignore parse errors
      }
    }
    return { message: err.message };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: "Unknown error" };
}

function isPricingSnapshotMissingError(details: {
  message: string;
  code?: string;
}): boolean {
  if (details.code === "PRICING_SNAPSHOT_MISSING") return true;
  const msg = details.message.toLowerCase();
  return (
    msg.includes("pricing snapshot is missing") ||
    msg.includes("bonddetails.pricing must include")
  );
}

type ProposedPricingState = {
  orderNumber: string;
  isin: string;
  bondName: string;
  tradeNumber: string;
  sources: {
    settleOrderNumber: string;
    rfqNumber: string;
    rfqMasterNumber: string | null;
  };
  pricing: Record<string, unknown>;
};

function formatPricingField(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

const EMPTY_FORM: ReceiptPdfFormState = {
  pdfAutofillSettlementDate: "",
  pdfAccruedInterestDays: "",
  pdfSettlementNumber: "",
  pdfSettlementDateTime: "",
  pdfLastInterestPaymentDateRaw: "",
  pdfLastInterestPaymentDate: "",
  pdfInterestPaymentDates: "",
  pdfNonAmortizedBond: true,
  pdfAmortizedPrincipalPaymentDates: "",
};

type OrderPdfDownloadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  pdfType: "order" | "deal";
  defaultSettlementNumber?: string | null;
  defaultAutofillSettlementDate?: string | null;
  /** Settlement+record last-coupon (YYYY-MM-DD) from orderInfo — seeds the field before autofill. */
  defaultLastCouponDate?: string | null;
  /** NSE settle_order trade number — used to detect missing payoutTime before deal PDF. */
  settleOrderTradeNumber?: string | null;
  /** When false/omitted, show the NSE pricing checkbox (pricing snapshot missing). */
  hasPricingSnapshot?: boolean | null;
};

export function OrderPdfDownloadDialog({
  open,
  onOpenChange,
  orderNumber,
  pdfType,
  defaultSettlementNumber,
  defaultAutofillSettlementDate,
  defaultLastCouponDate,
  settleOrderTradeNumber,
  hasPricingSnapshot,
}: OrderPdfDownloadDialogProps) {
  const ordersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);
  const [form, setForm] = useState<ReceiptPdfFormState>(EMPTY_FORM);
  const [downloading, setDownloading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [resolvedDealDate, setResolvedDealDate] = useState<string | null>(null);
  // Bumped whenever saved options are hydrated so autofill always re-runs
  // afterward (avoids race where hydrate clears last coupon and autofill is skipped).
  const [optionsHydrateEpoch, setOptionsHydrateEpoch] = useState(0);
  const optionsHydrateEpochRef = useRef(0);
  const [useNsePricing, setUseNsePricing] = useState(false);
  const [proposedPricing, setProposedPricing] =
    useState<ProposedPricingState | null>(null);
  const [proposingPricing, setProposingPricing] = useState(false);
  const [pricingMissingHint, setPricingMissingHint] = useState(false);

  const { data: pdfOptionsQuery, isFetched: pdfOptionsFetched } = useQuery({
    queryKey: ["crm-receipt-pdf-options", orderNumber],
    queryFn: () => ordersApi.getReceiptPdfOptions(orderNumber),
    enabled: open && Boolean(orderNumber),
  });

  const savedPdfOptions = pdfOptionsQuery?.responseData;
  const savedPdfOptionsFingerprint =
    savedPdfOptions && savedPdfOptions.orderNumber === orderNumber
      ? [
          savedPdfOptions.orderNumber,
          savedPdfOptions.accruedInterestDays ?? "",
          savedPdfOptions.settlementNumber ?? "",
          savedPdfOptions.settlementDateTime ?? "",
          String(savedPdfOptions.nonAmortizedBond),
          savedPdfOptions.amortizedPrincipalPaymentDates ?? "",
        ].join("|")
      : "";

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      optionsHydrateEpochRef.current = 0;
      setOptionsHydrateEpoch(0);
      setResolvedDealDate(null);
      setUseNsePricing(false);
      setProposedPricing(null);
      setProposingPricing(false);
      setPricingMissingHint(false);
      return;
    }
    if (!pdfOptionsFetched) return;
    const row = savedPdfOptions;
    const seedLastRaw = defaultLastCouponDate?.trim() || "";
    const seedLastDisplay = seedLastRaw
      ? formatDateWithDayNameFromPicker(seedLastRaw)
      : "";
    if (row && row.orderNumber === orderNumber) {
      setForm({
        pdfAutofillSettlementDate: defaultAutofillSettlementDate?.trim() || "",
        pdfAccruedInterestDays:
          row.accruedInterestDays != null ? String(row.accruedInterestDays) : "",
        pdfSettlementNumber: row.settlementNumber ?? defaultSettlementNumber ?? "",
        pdfSettlementDateTime: row.settlementDateTime ?? "",
        // Prefer orderInfo last coupon immediately; autofill may refine (shut formula).
        pdfLastInterestPaymentDateRaw: seedLastRaw,
        pdfLastInterestPaymentDate: seedLastDisplay,
        pdfInterestPaymentDates: "",
        pdfNonAmortizedBond: row.nonAmortizedBond,
        pdfAmortizedPrincipalPaymentDates: row.amortizedPrincipalPaymentDates ?? "",
      });
    } else {
      setForm({
        ...EMPTY_FORM,
        pdfAutofillSettlementDate: defaultAutofillSettlementDate?.trim() || "",
        pdfSettlementNumber: defaultSettlementNumber?.trim() || "",
        pdfLastInterestPaymentDateRaw: seedLastRaw,
        pdfLastInterestPaymentDate: seedLastDisplay,
      });
    }
    setOptionsHydrateEpoch((epoch) => {
      const next = epoch + 1;
      optionsHydrateEpochRef.current = next;
      return next;
    });
  }, [
    open,
    orderNumber,
    pdfOptionsFetched,
    savedPdfOptionsFingerprint,
    defaultSettlementNumber,
    defaultAutofillSettlementDate,
    defaultLastCouponDate,
  ]);

  const patchForm = (patch: Partial<ReceiptPdfFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const persistReceiptPdfOptions = async (accruedInterestDaysNum: number) => {
    try {
      await ordersApi.upsertReceiptPdfOptions(orderNumber, {
        accruedInterestDays: accruedInterestDaysNum,
        settlementNumber: form.pdfSettlementNumber.trim() || null,
        settlementDateTime: form.pdfSettlementDateTime.trim() || null,
        lastInterestPaymentDateRaw: form.pdfLastInterestPaymentDateRaw || null,
        lastInterestPaymentDate: form.pdfLastInterestPaymentDate.trim() || null,
        interestPaymentDates: form.pdfInterestPaymentDates.trim() || null,
        nonAmortizedBond: form.pdfNonAmortizedBond,
        amortizedPrincipalPaymentDates:
          !form.pdfNonAmortizedBond && form.pdfAmortizedPrincipalPaymentDates.trim() !== ""
            ? form.pdfAmortizedPrincipalPaymentDates.trim()
            : null,
      });
      void queryClient.invalidateQueries({ queryKey: ["crm-receipt-pdf-options", orderNumber] });
    } catch {
      // Non-blocking after download
    }
  };

  const autofillReceiptPdfOptions = async (
    settlementDate: string,
    {
      silent = false,
      hydrateEpoch,
    }: { silent?: boolean; hydrateEpoch?: number } = {},
  ) => {
    // settlementDate may be empty — the backend resolves deal/settlement via
    // computeBondSettlement (market hours + holidays), same as order pricing.
    setAutofilling(true);
    try {
      const resp = await apiClientCaller.post<{
        responseData?: {
          accruedInterestDays: number;
          settlementNumber: string | null;
          lastInterestPaymentDateRaw: string | null;
          lastInterestPaymentDate: string | null;
          interestPaymentDates: string | string[] | null;
          settlementDateTime: string | null;
          nonAmortizedBond: boolean;
          amortizedPrincipalPaymentDates: string | null;
          settlementDate: string;
          dealDate: string | null;
          settlementType: number | null;
        };
        message?: string;
      }>(`/crm/orders/receipt-pdf-options/${orderNumber}/autofill`, {
        settlementDate,
      });

      // A newer hydrate cleared the form — drop this stale response.
      if (
        hydrateEpoch != null &&
        hydrateEpoch !== optionsHydrateEpochRef.current
      ) {
        return;
      }

      const d = resp.data?.responseData;
      if (!d) {
        if (!silent) toast.error(resp.data?.message || "Auto-fill failed.");
        return;
      }

      const rawLast = d.lastInterestPaymentDateRaw;
      const rawLastTrimmed =
        rawLast != null && String(rawLast).trim() !== "" ? String(rawLast).trim() : "";
      const settlementNumber =
        d.settlementNumber != null && String(d.settlementNumber).trim() !== ""
          ? String(d.settlementNumber).trim()
          : null;
      const settlementDateTime =
        d.settlementDateTime != null && String(d.settlementDateTime).trim() !== ""
          ? String(d.settlementDateTime).trim()
          : null;
      const resolvedSettlementDate =
        d.settlementDate != null && String(d.settlementDate).trim() !== ""
          ? String(d.settlementDate).trim()
          : null;
      setResolvedDealDate(
        d.dealDate != null && String(d.dealDate).trim() !== ""
          ? String(d.dealDate).trim()
          : null,
      );

      // Functional update so fallbacks read the current form state, not a
      // stale closure. Only overwrite a field when the API gives a value;
      // otherwise keep whatever is already there.
      setForm((prev) => {
        if (
          hydrateEpoch != null &&
          hydrateEpoch !== optionsHydrateEpochRef.current
        ) {
          return prev;
        }

        let lastRaw = prev.pdfLastInterestPaymentDateRaw;
        let lastDisplay = prev.pdfLastInterestPaymentDate;
        if (rawLastTrimmed !== "") {
          lastRaw = rawLastTrimmed;
          const apiDisplay =
            d.lastInterestPaymentDate != null && String(d.lastInterestPaymentDate).trim() !== ""
              ? String(d.lastInterestPaymentDate).trim()
              : "";
          lastDisplay =
            apiDisplay && !/^\d{4}-\d{2}-\d{2}$/.test(apiDisplay)
              ? apiDisplay
              : formatDateWithDayNameFromPicker(
                  /^\d{4}-\d{2}-\d{2}$/.test(rawLastTrimmed)
                    ? rawLastTrimmed
                    : /^\d{4}-\d{2}-\d{2}$/.test(apiDisplay)
                      ? apiDisplay
                      : rawLastTrimmed,
                );
        } else if (
          d.lastInterestPaymentDate != null &&
          String(d.lastInterestPaymentDate).trim() !== ""
        ) {
          lastDisplay = String(d.lastInterestPaymentDate).trim();
        }

        return {
          ...prev,
          pdfAutofillSettlementDate: resolvedSettlementDate ?? prev.pdfAutofillSettlementDate,
          pdfAccruedInterestDays: String(d.accruedInterestDays ?? ""),
          pdfSettlementNumber: settlementNumber ?? prev.pdfSettlementNumber,
          pdfLastInterestPaymentDateRaw: lastRaw,
          pdfLastInterestPaymentDate: lastDisplay,
          pdfInterestPaymentDates: interestPaymentDatesToFormText(d.interestPaymentDates),
          pdfSettlementDateTime: settlementDateTime ?? prev.pdfSettlementDateTime,
          pdfNonAmortizedBond: d.nonAmortizedBond,
          pdfAmortizedPrincipalPaymentDates: d.amortizedPrincipalPaymentDates ?? "",
        };
      });
      if (!silent) toast.success("Receipt PDF options auto-filled.");
    } catch (err) {
      if (!silent) toast.error(getApiErrorMessage(err, "Auto-fill failed"));
    } finally {
      setAutofilling(false);
    }
  };

  // Auto-prefill after saved options hydrate (last coupon uses shut-period formula).
  useEffect(() => {
    if (!open || !pdfOptionsFetched || optionsHydrateEpoch === 0) return;
    const settlementForAutofill = defaultAutofillSettlementDate?.trim() || "";
    void autofillReceiptPdfOptions(settlementForAutofill, {
      silent: true,
      hydrateEpoch: optionsHydrateEpoch,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderNumber, pdfOptionsFetched, defaultAutofillSettlementDate, optionsHydrateEpoch]);

  // Show checkbox unless we know pricing already exists on the order.
  const showNsePricingCheckbox = hasPricingSnapshot !== true;

  const applyProposedPricingToForm = (pricing: Record<string, unknown>) => {
    const settlementDate =
      typeof pricing.settlementDate === "string" ? pricing.settlementDate : null;
    const dealDate =
      typeof pricing.dealDate === "string" ? pricing.dealDate : null;
    const accruedFromPricing =
      typeof pricing.noOfAccrualDays === "number" &&
      Number.isFinite(pricing.noOfAccrualDays)
        ? Math.max(0, Math.floor(pricing.noOfAccrualDays))
        : null;

    if (dealDate) setResolvedDealDate(dealDate);
    patchForm({
      ...(settlementDate
        ? { pdfAutofillSettlementDate: settlementDate }
        : {}),
      ...(accruedFromPricing != null
        ? { pdfAccruedInterestDays: String(accruedFromPricing) }
        : {}),
    });
    return { settlementDate, dealDate, accruedFromPricing };
  };

  const loadNsePricingIntoForm = async (): Promise<ProposedPricingState | null> => {
    setProposingPricing(true);
    try {
      const resp = await ordersApi.proposeOrderPricingSnapshot(orderNumber);
      const data = resp.responseData;
      if (!data?.pricing) {
        toast.error("Could not build pricing from saved NSE data for this order.");
        return null;
      }
      if (data.alreadyHasPricing) {
        setUseNsePricing(false);
        setProposedPricing(null);
        toast.message("This order already has pricing saved.");
        return null;
      }
      const next: ProposedPricingState = {
        orderNumber: data.orderNumber,
        isin: data.isin,
        bondName: data.bondName,
        tradeNumber: data.tradeNumber,
        sources: data.sources,
        pricing: data.pricing,
      };
      setProposedPricing(next);
      const { settlementDate } = applyProposedPricingToForm(data.pricing);
      await autofillReceiptPdfOptions(settlementDate || "", { silent: true });
      toast.success("Pricing loaded from NSE saved data.");
      return next;
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          "Failed to load pricing from NSE saved data",
        ),
      );
      return null;
    } finally {
      setProposingPricing(false);
    }
  };

  const handleUseNsePricingChange = async (checked: boolean) => {
    if (!checked) {
      setUseNsePricing(false);
      setProposedPricing(null);
      return;
    }
    setUseNsePricing(true);
    const loaded = await loadNsePricingIntoForm();
    if (!loaded) {
      setUseNsePricing(false);
      setProposedPricing(null);
    }
  };

  /** Load NSE dates into the PDF request only — does not write to the order. */
  const ensureNsePricingForPdf = async (): Promise<{
    ok: boolean;
    settlementDate?: string;
    dealDate?: string;
    accruedInterestDays?: number;
  }> => {
    if (hasPricingSnapshot === true) return { ok: true };
    if (!useNsePricing) {
      if (hasPricingSnapshot !== false && !pricingMissingHint) return { ok: true };
      toast.error("Order pricing snapshot is missing.", {
        description:
          'Check “Use pricing from NSE saved data” to load values, then download again.',
      });
      setPricingMissingHint(true);
      return { ok: false };
    }
    let loaded = proposedPricing;
    if (!loaded) {
      loaded = await loadNsePricingIntoForm();
      if (!loaded) return { ok: false };
    }
    const pricing = loaded.pricing;
    const settlementDate =
      typeof pricing.settlementDate === "string"
        ? pricing.settlementDate
        : form.pdfAutofillSettlementDate.trim() || undefined;
    const dealDate =
      typeof pricing.dealDate === "string"
        ? pricing.dealDate
        : resolvedDealDate?.trim() || undefined;
    const accruedInterestDays =
      typeof pricing.noOfAccrualDays === "number" &&
      Number.isFinite(pricing.noOfAccrualDays)
        ? Math.max(0, Math.floor(pricing.noOfAccrualDays))
        : undefined;
    if (!settlementDate && !dealDate) {
      toast.error("Could not resolve deal/settlement dates from NSE data.");
      return { ok: false };
    }
    return { ok: true, settlementDate, dealDate, accruedInterestDays };
  };

  const downloadPdfWithCurrentForm = async (overrides?: {
    settlementDate?: string;
    dealDate?: string;
    accruedInterestDays?: number;
  }) => {
    const accruedInterestDaysNum =
      overrides?.accruedInterestDays ??
      getValidatedAccruedInterestDays(form.pdfAccruedInterestDays);
    if (accruedInterestDaysNum == null) return false;

    const formForPayload =
      overrides?.settlementDate != null
        ? {
            ...form,
            pdfAutofillSettlementDate: overrides.settlementDate,
            ...(overrides.accruedInterestDays != null
              ? { pdfAccruedInterestDays: String(overrides.accruedInterestDays) }
              : {}),
          }
        : form;

    const payload = buildPdfOptionPayload(formForPayload, accruedInterestDaysNum, {
      dealDate: overrides?.dealDate ?? resolvedDealDate,
    });
    const blob =
      pdfType === "deal"
        ? await ordersApi.getDealSheetPdf(orderNumber, payload)
        : await ordersApi.getOrderReceiptPdf(orderNumber, payload);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      pdfType === "deal"
        ? `deal-sheet-${orderNumber}.pdf`
        : `order-receipt-${orderNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      pdfType === "deal"
        ? "Deal sheet PDF downloaded."
        : "Order receipt PDF downloaded.",
    );
    void persistReceiptPdfOptions(accruedInterestDaysNum);
    return true;
  };

  const handleDownload = async () => {
    if (pdfType === "deal") {
      const tradeKey =
        settleOrderTradeNumber?.trim() || orderNumber.trim() || "";
      let payoutTime = "";
      if (tradeKey) {
        try {
          const rfqRes = await ordersApi.getRfqByOrderNumber(tradeKey);
          payoutTime = String(rfqRes.responseData?.payoutTime ?? "").trim();
        } catch {
          // If settle order cannot be loaded, still warn as missing.
        }
      }
      if (!payoutTime) {
        const proceed = window.confirm(
          "Payout time is not available for this order yet.\n\n" +
            "Settlement Date & Time will be left blank on the deal sheet.\n\n" +
            "Do you still want to generate the deal sheet PDF?",
        );
        if (!proceed) return;
      }
    }

    setDownloading(true);
    try {
      const pricing = await ensureNsePricingForPdf();
      if (!pricing.ok) return;

      if (
        pricing.accruedInterestDays == null &&
        getValidatedAccruedInterestDays(form.pdfAccruedInterestDays) == null
      ) {
        return;
      }

      const ok = await downloadPdfWithCurrentForm({
        settlementDate: pricing.settlementDate,
        dealDate: pricing.dealDate,
        accruedInterestDays: pricing.accruedInterestDays,
      });
      if (ok) onOpenChange(false);
    } catch (err) {
      const details = await getApiErrorDetails(err);
      if (isPricingSnapshotMissingError(details)) {
        setPricingMissingHint(true);
        toast.error("Order pricing snapshot is missing.", {
          description:
            'Check “Use pricing from NSE saved data” to load values, then download again.',
        });
      } else {
        toast.error(details.message || "Failed to download PDF");
      }
    } finally {
      setDownloading(false);
    }
  };

  const title = pdfType === "deal" ? "Download deal sheet PDF" : "Download order receipt PDF";

  const pricingPreviewRows: Array<{ label: string; key: string }> = [
    { label: "Deal date", key: "dealDate" },
    { label: "Settlement date", key: "settlementDate" },
    { label: "Clean price", key: "cleanPrice" },
    { label: "Yield", key: "yield" },
    { label: "Accrued interest", key: "accruedInterest" },
    { label: "Settlement amount", key: "settlementAmount" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Options for order {orderNumber} are prefilled from order info. Last
            coupon date is computed from the settlement date and whether the trade
            is in the shut / surtpriode window. Change settlement date to
            recompute. Edit any field to override — values save on download.
          </DialogDescription>
        </DialogHeader>

        {showNsePricingCheckbox ? (
          <div className="mb-2 space-y-3 rounded-md border border-amber-200 bg-amber-50/60 p-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="order-use-nse-pricing"
                checked={useNsePricing}
                disabled={proposingPricing || downloading}
                onCheckedChange={(v) => {
                  void handleUseNsePricingChange(v === true);
                }}
              />
              <div className="space-y-1">
                <Label htmlFor="order-use-nse-pricing" className="cursor-pointer font-medium">
                  Use pricing from NSE saved data
                </Label>
                <p className="text-xs text-muted-foreground">
                  If <code>bondDetails.pricing</code> is missing, check this to load deal /
                  settlement dates and amounts from saved NSE tables for this PDF only — nothing
                  is written to the order.
                </p>
              </div>
            </div>
            {useNsePricing && proposedPricing ? (
              <div className="rounded-md border bg-background divide-y text-sm">
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  NSE trade {proposedPricing.tradeNumber}
                  {" · "}
                  settle_order {proposedPricing.sources.settleOrderNumber}
                  {" · "}
                  RFQ {proposedPricing.sources.rfqNumber}
                  {proposedPricing.sources.rfqMasterNumber
                    ? ` · master ${proposedPricing.sources.rfqMasterNumber}`
                    : ""}
                </div>
                {pricingPreviewRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between gap-4 px-3 py-1.5"
                  >
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-mono text-right">
                      {formatPricingField(proposedPricing.pricing[row.key])}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 py-2">
          <div className="space-y-2">
            <Label htmlFor="order-pdf-autofill-settlement-date">Settlement date</Label>
            <Input
              id="order-pdf-autofill-settlement-date"
              type="date"
              value={form.pdfAutofillSettlementDate}
              disabled={autofilling || downloading || proposingPricing}
              onChange={(e) => {
                const v = e.target.value;
                patchForm({ pdfAutofillSettlementDate: v });
                if (v) void autofillReceiptPdfOptions(v);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Deal date</Label>
            <Input
              value={resolvedDealDate ?? ""}
              readOnly
              disabled
              placeholder="—"
              className="bg-muted/40"
            />
          </div>

          <p className="sm:col-span-2 text-xs text-muted-foreground flex items-center gap-1.5">
            {autofilling || proposingPricing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {proposingPricing
                  ? "Loading proposed pricing from NSE saved data…"
                  : "Auto-filling from order info…"}
              </>
            ) : (
              "Settlement & deal dates are calculated from trade time (market hours & holidays). Change the settlement date to re-fetch related fields."
            )}
          </p>

          <div className="space-y-2">
            <Label htmlFor="order-pdf-accrued-days">No. of Days *</Label>
            <Input
              id="order-pdf-accrued-days"
              type="number"
              min={0}
              placeholder="e.g. 12"
              value={form.pdfAccruedInterestDays}
              onChange={(e) => patchForm({ pdfAccruedInterestDays: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-pdf-settlement-no">Settlement No.</Label>
            <Input
              id="order-pdf-settlement-no"
              placeholder="e.g. 2602020"
              value={form.pdfSettlementNumber}
              onChange={(e) => patchForm({ pdfSettlementNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="order-pdf-last-coupon-date">Last coupon date</Label>
            <Input
              id="order-pdf-last-coupon-date"
              type="text"
              placeholder="YYYY-MM-DD or DD/MM/YYYY"
              className="font-mono text-sm"
              value={form.pdfLastInterestPaymentDateRaw}
              onChange={(e) => {
                const v = e.target.value;
                const parsed = normalizeLastCouponDateRawInput(v);
                patchForm({
                  pdfLastInterestPaymentDateRaw: v,
                  pdfLastInterestPaymentDate: parsed?.display ?? (v.trim() === "" ? "" : form.pdfLastInterestPaymentDate),
                });
              }}
              onBlur={() => {
                const t = form.pdfLastInterestPaymentDateRaw.trim();
                if (t === "") {
                  patchForm({ pdfLastInterestPaymentDate: "" });
                  return;
                }
                const parsed = normalizeLastCouponDateRawInput(t);
                if (!parsed) {
                  toast.error("Invalid last coupon date. Use YYYY-MM-DD or DD/MM/YYYY.");
                  patchForm({ pdfLastInterestPaymentDate: "" });
                  return;
                }
                patchForm({
                  pdfLastInterestPaymentDateRaw: parsed.iso,
                  pdfLastInterestPaymentDate: parsed.display,
                });
              }}
            />
            {form.pdfLastInterestPaymentDate ? (
              <p className="text-xs text-muted-foreground">{form.pdfLastInterestPaymentDate}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="order-pdf-interest-payment-dates">Interest Payment Dates</Label>
            <Input
              id="order-pdf-interest-payment-dates"
              type="text"
              placeholder="e.g. 16-Feb, 16-May, 16-Aug"
              value={form.pdfInterestPaymentDates}
              onChange={(e) => patchForm({ pdfInterestPaymentDates: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="order-pdf-non-amortized-bond"
                checked={form.pdfNonAmortizedBond}
                onCheckedChange={(checked) =>
                  patchForm({ pdfNonAmortizedBond: checked === true })
                }
              />
              <Label htmlFor="order-pdf-non-amortized-bond" className="cursor-pointer font-normal">
                Non-Amortized Bond
              </Label>
            </div>
          </div>

          {!form.pdfNonAmortizedBond ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="order-pdf-amortized-principal-dates">
                Amortized Principal Payment Dates
              </Label>
              <Input
                id="order-pdf-amortized-principal-dates"
                type="text"
                placeholder="e.g. 20-Nov-2026 50%, 20-May-2027 50%"
                value={form.pdfAmortizedPrincipalPaymentDates}
                onChange={(e) =>
                  patchForm({ pdfAmortizedPrincipalPaymentDates: e.target.value })
                }
              />
            </div>
          ) : null}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="order-pdf-settlement-datetime">Customer confirmation Date & Time</Label>
            <Input
              id="order-pdf-settlement-datetime"
              type="text"
              placeholder="e.g. 23-Feb-2026 17:30:00"
              value={form.pdfSettlementDateTime}
              onChange={(e) => patchForm({ pdfSettlementDateTime: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={downloading || proposingPricing}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleDownload()}
            disabled={
              downloading ||
              proposingPricing ||
              form.pdfAccruedInterestDays.trim() === ""
            }
          >
            {downloading || proposingPricing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {proposingPricing ? "Checking pricing…" : "Generating..."}
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
