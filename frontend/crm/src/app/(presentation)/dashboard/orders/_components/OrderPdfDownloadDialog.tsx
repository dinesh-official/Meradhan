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
};

export function OrderPdfDownloadDialog({
  open,
  onOpenChange,
  orderNumber,
  pdfType,
  defaultSettlementNumber,
  defaultAutofillSettlementDate,
}: OrderPdfDownloadDialogProps) {
  const ordersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);
  const [form, setForm] = useState<ReceiptPdfFormState>(EMPTY_FORM);
  const [downloading, setDownloading] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [resolvedDealDate, setResolvedDealDate] = useState<string | null>(null);

  const { data: pdfOptionsQuery, isFetched: pdfOptionsFetched } = useQuery({
    queryKey: ["crm-receipt-pdf-options", orderNumber],
    queryFn: () => ordersApi.getReceiptPdfOptions(orderNumber),
    enabled: open && Boolean(orderNumber),
  });

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      return;
    }
    if (!pdfOptionsFetched) return;
    const row = pdfOptionsQuery?.responseData;
    if (row && row.orderNumber === orderNumber) {
      setForm({
        pdfAutofillSettlementDate: defaultAutofillSettlementDate?.trim() || "",
        pdfAccruedInterestDays:
          row.accruedInterestDays != null ? String(row.accruedInterestDays) : "",
        pdfSettlementNumber: row.settlementNumber ?? defaultSettlementNumber ?? "",
        pdfSettlementDateTime: row.settlementDateTime ?? "",
        pdfLastInterestPaymentDateRaw: row.lastInterestPaymentDateRaw ?? "",
        pdfLastInterestPaymentDate: row.lastInterestPaymentDate ?? "",
        pdfInterestPaymentDates: interestPaymentDatesToFormText(row.interestPaymentDates),
        pdfNonAmortizedBond: row.nonAmortizedBond,
        pdfAmortizedPrincipalPaymentDates: row.amortizedPrincipalPaymentDates ?? "",
      });
      return;
    }
    setForm({
      ...EMPTY_FORM,
      pdfAutofillSettlementDate: defaultAutofillSettlementDate?.trim() || "",
      pdfSettlementNumber: defaultSettlementNumber?.trim() || "",
    });
  }, [
    open,
    orderNumber,
    pdfOptionsFetched,
    pdfOptionsQuery?.responseData,
    defaultSettlementNumber,
    defaultAutofillSettlementDate,
  ]);

  const patchForm = (patch: Partial<ReceiptPdfFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  // Auto-prefill everything from NSE / bond data as soon as the dialog opens —
  // no button click. Runs once per open using the settlement date the order
  // already resolves (modSettleDate → metadata.settlementDate → createdAt).
  const autofillRanForRef = useRef<string | null>(null);
  useEffect(() => {
    if (!open) {
      autofillRanForRef.current = null;
      setResolvedDealDate(null);
      return;
    }
    if (!pdfOptionsFetched) return;
    // Run once per open. No date seed needed — the backend resolves the
    // settlement date from the NSE RFQ quote / order metadata / creation date.
    if (autofillRanForRef.current === orderNumber) return;
    autofillRanForRef.current = orderNumber;
    void autofillReceiptPdfOptions("", { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderNumber, pdfOptionsFetched, defaultAutofillSettlementDate]);

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
    { silent = false }: { silent?: boolean } = {},
  ) => {
    // settlementDate may be empty — the backend resolves it from the NSE RFQ
    // quote ("Add ISIN") → order metadata → order creation date.
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
      // stale closure (the silent auto-run fires before the saved-options
      // effect has committed). Only overwrite a field when the API gives a
      // value; otherwise keep whatever is already there.
      setForm((prev) => {
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

  const handleDownload = async () => {
    const accruedInterestDaysNum = getValidatedAccruedInterestDays(form.pdfAccruedInterestDays);
    if (accruedInterestDaysNum == null) return;

    setDownloading(true);
    try {
      const payload = buildPdfOptionPayload(form, accruedInterestDaysNum);
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
        pdfType === "deal" ? "Deal sheet PDF downloaded." : "Order receipt PDF downloaded.",
      );
      void persistReceiptPdfOptions(accruedInterestDaysNum);
      onOpenChange(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to download PDF"));
    } finally {
      setDownloading(false);
    }
  };

  const title = pdfType === "deal" ? "Download deal sheet PDF" : "Download order receipt PDF";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Options for order {orderNumber} are prefilled automatically from NSE and bond
            data — just review and download. Edit any field to override. Values are saved
            when you download.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 py-2">
          <div className="space-y-2">
            <Label htmlFor="order-pdf-autofill-settlement-date">Settlement date</Label>
            <Input
              id="order-pdf-autofill-settlement-date"
              type="date"
              value={form.pdfAutofillSettlementDate}
              disabled={autofilling || downloading}
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
            {autofilling ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Auto-filling from NSE RFQ &amp; bond data…
              </>
            ) : (
              "Settlement &amp; deal dates come from the NSE RFQ quote. All fields are prefilled automatically — change the settlement date to re-fetch."
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDownload()}
            disabled={downloading || form.pdfAccruedInterestDays.trim() === ""}
          >
            {downloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
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
