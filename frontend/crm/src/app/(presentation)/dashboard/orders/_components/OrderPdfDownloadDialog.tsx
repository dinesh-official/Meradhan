"use client";

import { useEffect, useState } from "react";
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

  const autofillReceiptPdfOptions = async () => {
    if (!form.pdfAutofillSettlementDate) {
      toast.error("Settlement date is required for auto-fill.");
      return;
    }
    setAutofilling(true);
    try {
      const resp = await apiClientCaller.post<{
        responseData?: {
          accruedInterestDays: number;
          settlementNumber: string | null;
          lastInterestPaymentDateRaw: string | null;
          lastInterestPaymentDate: string | null;
          interestPaymentDates: string | string[] | null;
        };
        message?: string;
      }>(`/crm/orders/receipt-pdf-options/${orderNumber}/autofill`, {
        settlementDate: form.pdfAutofillSettlementDate,
      });

      const d = resp.data?.responseData;
      if (!d) {
        toast.error(resp.data?.message || "Auto-fill failed.");
        return;
      }

      const rawLast = d.lastInterestPaymentDateRaw;
      const rawLastTrimmed =
        rawLast != null && String(rawLast).trim() !== "" ? String(rawLast).trim() : "";
      let lastRaw = form.pdfLastInterestPaymentDateRaw;
      let lastDisplay = form.pdfLastInterestPaymentDate;
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

      patchForm({
        pdfAccruedInterestDays: String(d.accruedInterestDays ?? ""),
        pdfSettlementNumber:
          d.settlementNumber != null ? String(d.settlementNumber) : form.pdfSettlementNumber,
        pdfLastInterestPaymentDateRaw: lastRaw,
        pdfLastInterestPaymentDate: lastDisplay,
        pdfInterestPaymentDates: interestPaymentDatesToFormText(d.interestPaymentDates),
      });
      toast.success("Receipt PDF options auto-filled.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Auto-fill failed"));
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
            Fill the receipt PDF options below for order {orderNumber}. No. of Days is required.
            Values are saved when you download.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2 py-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="order-pdf-autofill-settlement-date">Settlement date (for auto-fill)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="order-pdf-autofill-settlement-date"
                type="date"
                value={form.pdfAutofillSettlementDate}
                onChange={(e) => patchForm({ pdfAutofillSettlementDate: e.target.value })}
              />
              <Button
                type="button"
                variant="outline"
                disabled={autofilling || downloading || !form.pdfAutofillSettlementDate}
                onClick={() => void autofillReceiptPdfOptions()}
              >
                {autofilling ? "Auto-filling..." : "Auto-fill"}
              </Button>
            </div>
          </div>

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
