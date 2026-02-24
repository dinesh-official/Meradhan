"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, UserPlus, FileDown } from "lucide-react";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import type {
  RfqByOrderNumberSettleOrder,
  CustomerFullOrder,
  CustomerProfile,
} from "@root/apiGateway";
import { SelectCustomerUser } from "@/global/elements/autocomplete/SelectCustomerUser";
import { queryClient } from "@/core/config/reactQuery";
import { toast } from "sonner";
import { useState, useEffect } from "react";

function formatVal(v: string | number | null | undefined): string {
  if (v == null) return "—";
  return String(v);
}

function getPreferredValue(
  data: Record<string, unknown>,
  keys: string[]
): string | number | undefined {
  for (const key of keys) {
    const value = data[key];
    if (value == null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (typeof value === "string" || typeof value === "number") return value;
  }
  return undefined;
}

function formatDealDateForEmail(value?: string | null): string {
  if (!value) return "—";
  const s = String(value).trim();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const digits = s.replace(/\D/g, "");
  if (digits.length === 8) {
    const dd = Number(digits.slice(0, 2));
    const mm = Number(digits.slice(2, 4));
    const yyyy = Number(digits.slice(4, 8));
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
      return `${String(dd).padStart(2, "0")}-${months[mm - 1]}-${yyyy}`;
    }
  }
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()}`;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-1 md:gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium break-all md:text-right">{formatVal(value)}</span>
    </div>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0 text-sm">{children}</CardContent>
    </Card>
  );
}

function GeneratePdfContent() {
  const params = useParams();
  const orderNumber = params?.orderid as string | undefined;
  const senderEmail = "noreply@meradhan.co";
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [downloadingOrderPdf, setDownloadingOrderPdf] = useState(false);
  const [downloadingDealPdf, setDownloadingDealPdf] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [sendingPdfEmail, setSendingPdfEmail] = useState(false);
  const [emailPdfType, setEmailPdfType] = useState<"order" | "deal">("order");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [pdfAccruedInterestDays, setPdfAccruedInterestDays] = useState("");
  const [pdfSettlementNumber, setPdfSettlementNumber] = useState("");
  const [pdfLastInterestPaymentDate, setPdfLastInterestPaymentDate] = useState("");
  const ordersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rfq-by-order", orderNumber],
    queryFn: () => ordersApi.getRfqByOrderNumber(orderNumber!),
    enabled: Boolean(orderNumber),
  });

  const {
    data: customerOrderData,
    isLoading: customerOrderLoading,
    refetch: refetchCustomerOrder,
  } = useQuery({
    queryKey: ["customer-full-order", orderNumber],
    queryFn: () => ordersApi.getCustomerFullOrder(orderNumber!),
    enabled: Boolean(orderNumber),
  });

  const assignOrderMutation = useMutation({
    mutationFn: () =>
      ordersApi.createOrderFromRfq({
        orderNumber: orderNumber!,
        customerId: selectedCustomer!.id,
      }),
    onSuccess: () => {
      toast.success("Order assigned to Customer.");
      setSelectedCustomer(null);
      void refetchCustomerOrder();
      queryClient.invalidateQueries({ queryKey: ["customer-full-order", orderNumber] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to assign order");
    },
  });

  const rfq: RfqByOrderNumberSettleOrder | null | undefined =
    data?.responseData ?? null;
  const customerOrder: CustomerFullOrder | null =
    customerOrderData?.responseData ?? null;
  const customerGenderRaw = String(
    (customerOrder?.customerProfile as { gender?: string } | undefined)?.gender ?? ""
  )
    .trim()
    .toLowerCase();
  const salutationPrefix = customerGenderRaw === "female" ? "Ms." : "Mr.";
  const clientFullName = `${customerOrder?.customerProfile?.firstName ?? ""} ${customerOrder?.customerProfile?.middleName ?? ""} ${customerOrder?.customerProfile?.lastName ?? ""}`
    .trim()
    .toUpperCase();
  const securityName = customerOrder?.bondName ?? "—";
  const customerOrderId = customerOrder?.orderNumber ?? orderNumber ?? "—";
  const isin = rfq?.symbol ?? "—";
  const rfqBuySell = String((rfq as { buySell?: string } | null)?.buySell ?? "")
    .trim()
    .toUpperCase();
  const transactionLabel = rfqBuySell === "S" ? "sell" : "buy";
  const dealDateText = formatDealDateForEmail(rfq?.modSettleDate ?? rfq?.createdAt ?? null);

  useEffect(() => {
    if (rfq?.settlementNo != null && pdfSettlementNumber === "") {
      setPdfSettlementNumber(String(rfq.settlementNo));
    }
  }, [rfq?.settlementNo, pdfSettlementNumber]);

  useEffect(() => {
    if (!emailTo && customerOrder?.customerProfile?.emailAddress) {
      setEmailTo(customerOrder.customerProfile.emailAddress);
    }
  }, [customerOrder?.customerProfile?.emailAddress, emailTo]);

  const applyEmailTemplate = (type: "order" | "deal") => {
    if (type === "deal") {
      setEmailSubject(
        `Deal Sheet for ISIN ${isin} - Security Name ${securityName} - Deal Date ${dealDateText}`
      );
      setEmailBody(
        `Dear ${salutationPrefix} ${clientFullName || "CUSTOMER"},

Thank you for investing with MeraDhan. We truly value your trust and remain committed to providing you with a seamless bond investment experience.

We are pleased to inform you that your deal has been successfully settled. The Clearing Corporation has initiated the release of securities to your Demat account for this ${transactionLabel} transaction. We kindly request you to review your Demat account and confirm receipt of the securities.

Please find the Deal Sheet enclosed for your records. Should you have any queries or notice any discrepancy, feel free to contact us at backoffice@meradhan.co.

We look forward to serving you again.

Warm regards,

MeraDhan Team`
      );
      return;
    }
    setEmailSubject(
      `Buy Order Receipt - ${securityName} - Order ID ${customerOrderId}`
    );
    setEmailBody(
      `Dear ${salutationPrefix} ${clientFullName || "CUSTOMER"},

Thank you for placing your ${transactionLabel} order through MeraDhan. As per your authorization, we have initiated the non-negotiable order (One-to-One Mode) on the RFQ platform of the stock exchanges.

Please find the Order Receipt attached for your records. You are requested to fulfil the pay-in obligation (funds) within the stipulated timeline. Kindly disregard this message if the payment has already been completed.

Please note that the Order Receipt reflects the intention of the parties to enter into the transaction and should not be considered a Deal Confirmation. The Deal Sheet will be issued upon successful settlement of the transaction.

Additionally, please ensure that the Demat account mentioned in the Order Receipt is active and capable of receiving the bonds/securities.

Regards,
MeraDhan Team`
    );
  };

  const getValidatedAccruedInterestDays = (): number | null => {
    const daysRaw = pdfAccruedInterestDays.trim();
    if (daysRaw === "") {
      toast.error("No. of Days is required.");
      return null;
    }
    const accruedInterestDaysNum = Number(daysRaw);
    if (!Number.isFinite(accruedInterestDaysNum) || accruedInterestDaysNum < 0) {
      toast.error("No. of Days must be a valid non-negative number.");
      return null;
    }
    return accruedInterestDaysNum;
  };

  const buildPdfOptionPayload = (accruedInterestDaysNum: number) => {
    const settlementNumberVal =
      pdfSettlementNumber.trim() !== "" ? pdfSettlementNumber.trim() : undefined;
    const lastInterestVal =
      pdfLastInterestPaymentDate.trim() !== ""
        ? pdfLastInterestPaymentDate.trim()
        : undefined;
    return {
      accruedInterestDays: accruedInterestDaysNum,
      ...(settlementNumberVal && { settlementNumber: settlementNumberVal }),
      ...(lastInterestVal && { lastInterestPaymentDate: lastInterestVal }),
    };
  };

  const downloadPdf = async (type: "order" | "deal") => {
    if (!orderNumber) return;
    const accruedInterestDaysNum = getValidatedAccruedInterestDays();
    if (accruedInterestDaysNum == null) return;

    if (type === "order") setDownloadingOrderPdf(true);
    if (type === "deal") setDownloadingDealPdf(true);
    try {
      const payload = buildPdfOptionPayload(accruedInterestDaysNum);
      const blob =
        type === "deal"
          ? await ordersApi.getDealSheetPdf(orderNumber, payload)
          : await ordersApi.getOrderReceiptPdf(orderNumber, payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "deal"
        ? `deal-sheet-${orderNumber}.pdf`
        : `order-receipt-${orderNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(type === "deal" ? "Deal sheet PDF downloaded." : "Order receipt PDF downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download PDF");
    } finally {
      if (type === "order") setDownloadingOrderPdf(false);
      if (type === "deal") setDownloadingDealPdf(false);
    }
  };

  const sendPdfByEmail = async () => {
    if (!orderNumber) return;
    const accruedInterestDaysNum = getValidatedAccruedInterestDays();
    if (accruedInterestDaysNum == null) return;
    if (!emailSubject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!emailBody.trim()) {
      toast.error("Message body is required.");
      return;
    }
    if (!emailTo.trim()) {
      toast.error("Client email is not available.");
      return;
    }

    setSendingPdfEmail(true);
    try {
      const payload = {
        ...buildPdfOptionPayload(accruedInterestDaysNum),
        pdfType: emailPdfType,
        fromEmail: senderEmail,
        toEmail: emailTo.trim(),
        subject: emailSubject.trim(),
        messageBody: emailBody.trim(),
      };
      await ordersApi.sendPdfEmailToClient(orderNumber, payload);
      toast.success("Email sent to client with PDF attachment.");
      setSendEmailOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSendingPdfEmail(false);
    }
  };

  if (!orderNumber) {
    return (
      <>
        <PageInfoBar title="Generate PDF" />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Missing order number.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/rfqs/nse/settle-orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settle Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageInfoBar title="Generate PDF" />
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Loading settlement details…</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (isError || !rfq) {
    return (
      <>
        <PageInfoBar title="Generate PDF" />
        <br />
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error instanceof Error ? error.message : "Settlement not found for this order number."}
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/rfqs/nse/settle-orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settle Orders
              </Link>
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageInfoBar title="Generate PDF" />
      <br />
      <div className="w-full max-w-none space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/rfqs/nse/settle-orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settle Orders
            </Link>
          </Button>
          {customerOrder?.customerProfile && (
            <>
              <Button
                size="sm"
                variant="default"
                disabled={downloadingOrderPdf || downloadingDealPdf || pdfAccruedInterestDays.trim() === ""}
                onClick={() => void downloadPdf("order")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {downloadingOrderPdf ? "Generating..." : "Download order receipt PDF"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={downloadingOrderPdf || downloadingDealPdf || pdfAccruedInterestDays.trim() === ""}
                onClick={() => void downloadPdf("deal")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {downloadingDealPdf ? "Generating..." : "Download deal sheet PDF"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={downloadingOrderPdf || downloadingDealPdf || pdfAccruedInterestDays.trim() === ""}
                onClick={() => {
                  setEmailPdfType("deal");
                  applyEmailTemplate("deal");
                  setSendEmailOpen(true);
                }}
              >
                Send email to client
              </Button>
            </>
          )}
        </div>

        {customerOrder?.customerProfile && (
          <Section title="Receipt PDF options (fill before generating PDF)">
            <p className="text-muted-foreground text-sm mb-3">Accrued / Ex Interest is taken from settlement (negotiations) data.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pdf-accrued-days">No. of Days *</Label>
                <Input
                  id="pdf-accrued-days"
                  type="number"
                  min={0}
                  placeholder="e.g. 12"
                  value={pdfAccruedInterestDays}
                  required
                  onChange={(e) => setPdfAccruedInterestDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-settlement-no">Settlement No.</Label>
                <Input
                  id="pdf-settlement-no"
                  placeholder="e.g. 2602020"
                  value={pdfSettlementNumber}
                  onChange={(e) => setPdfSettlementNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-last-interest-date">Last payment date (enter full text as in PDF)</Label>
                <Input
                  id="pdf-last-interest-date"
                  type="text"
                  placeholder="e.g. 02-Mar-2001 (Sunday)"
                  value={pdfLastInterestPaymentDate}
                  onChange={(e) => setPdfLastInterestPaymentDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Enter exactly as it should appear: DD-MMM-YYYY (DayName)</p>
              </div>
            </div>
          </Section>
        )}

        {/* Customer: show full info if assigned, else select + assign */}
        {customerOrderLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Loading Customer...</p>
            </CardContent>
          </Card>
        ) : customerOrder?.customerProfile ? (
          <Section title="Customer (assigned order)">
            <InfoRow label="Name" value={`${customerOrder.customerProfile.firstName ?? ""} ${customerOrder.customerProfile.middleName ?? ""} ${customerOrder.customerProfile.lastName ?? ""}`.trim() || "—"} />
            <InfoRow label="Email" value={customerOrder.customerProfile.emailAddress} />
            <InfoRow label="Phone" value={customerOrder.customerProfile.phoneNo} />
            <InfoRow label="User name" value={customerOrder.customerProfile.userName} />
            <InfoRow label="KYC status" value={customerOrder.customerProfile.kycStatus} />
            {customerOrder.customerProfile.bankAccounts?.length ? (
              <>
                <div className="py-2 border-b border-border/50 font-medium">Bank accounts</div>
                {customerOrder.customerProfile.bankAccounts.map((acc, i) => (
                  <div key={acc.id ?? i} className="py-2 border-b border-border/50 last:border-0 pl-2 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      Account {i + 1} {((acc as { isPrimary?: boolean }).isPrimary) ? "(Primary)" : ""}
                    </div>
                    {(() => {
                      const bank = acc as Record<string, unknown>;
                      return (
                        <>
                          <div>Account Holder Name: {formatVal(getPreferredValue(bank, ["accountHolderName", "holderName", "beneficiaryName", "name"]))}</div>
                          <div>Bank Account Type: {formatVal(getPreferredValue(bank, ["bankAccountType", "accountType", "type"]))}</div>
                          <div>Account Number: {formatVal(getPreferredValue(bank, ["accountNo", "accountNumber"]))}</div>
                          <div>Ifsc Code: {formatVal(getPreferredValue(bank, ["ifscCode", "ifsc"]))}</div>
                          <div>Bank Name: {formatVal(getPreferredValue(bank, ["bankName"]))}</div>
                          <div>Branch: {formatVal(getPreferredValue(bank, ["branch", "branchName"]))}</div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </>
            ) : null}
            {customerOrder.customerProfile.dematAccounts?.length ? (
              <>
                <div className="py-2 border-b border-border/50 font-medium mt-2">Demat accounts</div>
                {customerOrder.customerProfile.dematAccounts.map((d, i) => (
                  <div key={d.id ?? i} className="py-2 border-b border-border/50 last:border-0 pl-2 text-muted-foreground">
                    <div className="font-medium text-foreground">
                      Demat {i + 1} {((d as { isPrimary?: boolean }).isPrimary) ? "(Primary)" : ""}
                    </div>
                    {(() => {
                      const demat = d as Record<string, unknown>;
                      return (
                        <>
                          <div>Depository Name: {formatVal(getPreferredValue(demat, ["depositoryName", "depository", "dpName"]))}</div>
                          <div>Dp Id: {formatVal(getPreferredValue(demat, ["dpId"]))}</div>
                          <div>Client Id: {formatVal(getPreferredValue(demat, ["clientId", "benId"]))}</div>
                          <div>Account Type: {formatVal(getPreferredValue(demat, ["accountType", "type"]))}</div>
                          <div>Depository Participant Name: {formatVal(getPreferredValue(demat, ["depositoryParticipantName", "dpName", "participantName"]))}</div>
                          <div>Primary Pan Number: {formatVal(getPreferredValue(demat, ["primaryPanNumber", "panNumber", "panCardNo"]))}</div>
                          <div>Account Holder Name: {formatVal(getPreferredValue(demat, ["accountHolderName", "holderName", "name"]))}</div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </>
            ) : null}
          </Section>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">No Customer assigned</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">Select a Customer and assign this settlement order to them. Only Customers with verified KYC can be assigned.</p>
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[220px]">
                  <SelectCustomerUser
                    placeholder="Search and select Customer..."
                    value={selectedCustomer ?? undefined}
                    onSelect={setSelectedCustomer}
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!selectedCustomer || assignOrderMutation.isPending || String(selectedCustomer?.kycStatus) !== "VERIFIED"}
                  onClick={() => assignOrderMutation.mutate()}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {assignOrderMutation.isPending ? "Assigning..." : "Assign order to Customer"}
                </Button>
              </div>
              {selectedCustomer && String(selectedCustomer.kycStatus) !== "VERIFIED" && (
                <p className="text-destructive text-sm">Selected Customer KYC is not verified. Only VERIFIED Customers can be assigned.</p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 w-full">
          <Section title="Order & symbol">
            <InfoRow label="ID" value={rfq.id} />
            <InfoRow label="Order Number" value={rfq.orderNumber} />
            <InfoRow label="Symbol (ISIN)" value={rfq.symbol} />
          </Section>

          <Section title="Counterparties">
            <InfoRow label="Buy Participant Login ID" value={rfq.buyParticipantLoginId} />
            <InfoRow label="Sell Participant Login ID" value={rfq.sellParticipantLoginId} />
            <InfoRow label="Buyer Ref No" value={rfq.buyerRefNo} />
            <InfoRow label="Seller Ref No" value={rfq.sellerRefNo} />
            <InfoRow label="Buy Backoffice Login ID" value={rfq.buyBackofficeLoginId} />
            <InfoRow label="Sell Backoffice Login ID" value={rfq.sellBackofficeLoginId} />
            <InfoRow label="Buy Broker Login ID" value={rfq.buyBrokerLoginId} />
            <InfoRow label="Sell Broker Login ID" value={rfq.sellBrokerLoginId} />
          </Section>

          <Section title="Price & value">
            <InfoRow label="Price" value={rfq.price} />
            <InfoRow label="Yield Type" value={rfq.yieldType} />
            <InfoRow label="Yield" value={rfq.yield} />
            <InfoRow label="Value" value={rfq.value} />
            <InfoRow label="Source" value={rfq.source} />
          </Section>

          <Section title="Modification (if any)">
            <InfoRow label="Mod Settle Date" value={rfq.modSettleDate} />
            <InfoRow label="Mod Quantity" value={rfq.modQuantity} />
            <InfoRow label="Mod Accrued Interest" value={rfq.modAccrInt} />
            <InfoRow label="Mod Consideration" value={rfq.modConsideration} />
          </Section>

          <Section title="Settlement">
            <InfoRow label="Settlement No" value={rfq.settlementNo} />
            <InfoRow label="Settle Status" value={rfq.settleStatus} />
            <InfoRow label="Stamp Duty Amount" value={rfq.stampDutyAmount} />
            <InfoRow label="Stamp Duty Bearer" value={rfq.stampDutyBearer} />
            <InfoRow label="Buyer Fund Payin Obligation" value={rfq.buyerFundPayinObligation} />
            <InfoRow label="Seller Fund Payout Obligation" value={rfq.sellerFundPayoutObligation} />
            <InfoRow label="Fund Payin Ref ID" value={rfq.fundPayinRefId} />
          </Section>

          <Section title="Securities pay-in">
            <InfoRow label="Sec Payin Quantity" value={rfq.secPayinQuantity} />
            <InfoRow label="Sec Payin Remarks" value={rfq.secPayinRemarks} />
            <InfoRow label="Sec Payin Time" value={rfq.secPayinTime} />
          </Section>

          <Section title="Funds pay-in">
            <InfoRow label="Funds Payin Amount" value={rfq.fundsPayinAmount} />
            <InfoRow label="Funds Payin Remarks" value={rfq.fundsPayinRemarks} />
            <InfoRow label="Funds Payin Time" value={rfq.fundsPayinTime} />
          </Section>

          <Section title="Payout">
            <InfoRow label="Payout Remarks" value={rfq.payoutRemarks} />
            <InfoRow label="Payout Time" value={rfq.payoutTime} />
          </Section>

          <Section title="Bank & demat">
            <InfoRow label="IFSC Code" value={rfq.ifscCode} />
            <InfoRow label="Account No" value={rfq.accountNo} />
            <InfoRow label="UTR Number" value={rfq.utrNumber} />
            <InfoRow label="DP ID" value={rfq.dpId} />
            <InfoRow label="Ben ID" value={rfq.benId} />
          </Section>

          <Section title="Timestamps">
            <InfoRow label="Created At" value={rfq.createdAt} />
            <InfoRow label="Updated At" value={rfq.updatedAt} />
          </Section>
        </div>
      </div>

      <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send PDF to client</DialogTitle>
            <DialogDescription>
              Choose PDF type, write message, and send as attachment to the assigned client.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client email</Label>
              <Input
                type="email"
                value={emailTo}
                placeholder="client@email.com"
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-pdf-type">PDF type</Label>
              <Select
                value={emailPdfType}
                onValueChange={(val) => {
                  const pdfType = val as "order" | "deal";
                  setEmailPdfType(pdfType);
                  applyEmailTemplate(pdfType);
                }}
              >
                <SelectTrigger id="email-pdf-type">
                  <SelectValue placeholder="Select PDF type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order receipt PDF</SelectItem>
                  <SelectItem value="deal">Deal sheet PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-from">From email</Label>
            <Input
              id="email-from"
              type="email"
              value={senderEmail}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              placeholder="Enter email subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Message body</Label>
            <Textarea
              id="email-body"
              placeholder="Write message to client..."
              rows={7}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSendEmailOpen(false)}
              disabled={sendingPdfEmail}
            >
              Cancel
            </Button>
            <Button onClick={() => void sendPdfByEmail()} disabled={sendingPdfEmail}>
              {sendingPdfEmail ? "Sending..." : "Send email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default GeneratePdfContent;
