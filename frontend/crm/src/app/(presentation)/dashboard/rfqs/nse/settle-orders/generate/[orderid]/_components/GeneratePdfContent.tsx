"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, UserPlus, FileDown, UserRound } from "lucide-react";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import apiGateway, {
  ApiError,
  type BondDetailsResponse,
  type RfqByOrderNumberSettleOrder,
  type CustomerFullOrder,
  type CustomerProfile,
  type NseRfqParticipantInfoSummary,
} from "@root/apiGateway";
import { SelectCustomerUser } from "@/global/elements/autocomplete/SelectCustomerUser";
import { genMediaUrl } from "@/global/utils/url.utils";
import { queryClient } from "@/core/config/reactQuery";
import { toast } from "sonner";
import {
  getEmailSalutationFromGender,
  resolveGenderForEmailSalutation,
} from "@root/schema";
import { useState, useEffect, useMemo, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RfqParticipantInfoDialog } from "@/app/(presentation)/dashboard/rfqs/nse/rfq-participants/_components/RfqParticipantInfoDialog";
import {
  formatCleanPriceDisplay,
  formatInrMoneyDisplay,
  formatYtmDisplay,
} from "@/global/utils/pricingDecimalDisplay";

/** Backend `sendResponse` errors expose `message` on the JSON body; axios default `Error.message` is generic. */
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

function formatVal(v: string | number | null | undefined): string {
  if (v == null) return "—";
  return String(v);
}

function maskPanLast4(pan: string | null | undefined): string {
  if (!pan || typeof pan !== "string") return "—";
  const s = pan.trim();
  if (s.length <= 4) return "—";
  return "x".repeat(s.length - 4) + s.slice(-4);
}

const RETAIL_CUSTOMER_USER_TYPES = new Set(["INDIVIDUAL", "INDIVIDUAL_NRI_NRO"]);

function isCorporateCustomerUserType(userType: unknown): boolean {
  return String(userType ?? "").trim().toUpperCase() === "CORPORATE";
}

function isB2BCustomerUserType(userType: unknown): boolean {
  const u = String(userType ?? "INDIVIDUAL").trim().toUpperCase();
  return !RETAIL_CUSTOMER_USER_TYPES.has(u);
}

/** Matches backend `dateOfBirthToPdfPassword` — used to align email copy with encryption. */
function dobRawToPdfPassword(dobRaw: string | null | undefined): string | null {
  if (dobRaw == null || String(dobRaw).trim() === "") return null;
  const s = String(dobRaw).trim();

  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso?.[1] != null && iso[2] != null && iso[3] != null) {
    return `${iso[3]}${iso[2]}${iso[1]}`;
  }

  const slash = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slash?.[1] != null && slash[2] != null && slash[3] != null) {
    return `${slash[1].padStart(2, "0")}${slash[2].padStart(2, "0")}${slash[3]}`;
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}${mm}${yyyy}`;
  }

  return null;
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

/** Autofill API returns `interestPaymentDates` as `string[]`; saved options use a single `string`. */
function interestPaymentDatesToFormText(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) {
    return value
      .map((x) => (x == null ? "" : String(x).trim()))
      .filter(Boolean)
      .join(", ");
  }
  return String(value).trim();
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

function formatDateWithDayNameFromPicker(value?: string): string {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()} (${dayNames[d.getDay()]})`;
}

function ddMmmYyyyToPickerValue(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "";
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (!m) return "";
  const dd = Number(m[1]);
  const monKey = (m[2] ?? "").slice(0, 3).toLowerCase();
  const yyyy = Number(m[3]);
  const MONTH: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
  };
  const mm = MONTH[monKey];
  if (!mm) return "";
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

/**
 * Last-resort settlement YMD from settle_order pay-in fields only.
 * Prefer RFQ master `settlementDate` / `dealDate` from the autofill API —
 * do not use modSettleDate as the primary seed (it can be a delayed settle day).
 */
function settlementDateFallbackFromSettleOrder(
  rfq: Pick<
    RfqByOrderNumberSettleOrder,
    "modSettleDate" | "fundsPayinTime" | "secPayinTime" | "payoutTime" | "createdAt"
  >,
): string {
  return (
    payinDateTimeToPickerValue(rfq.fundsPayinTime ?? null) ||
    payinDateTimeToPickerValue(rfq.secPayinTime ?? null) ||
    payinDateTimeToPickerValue(rfq.payoutTime ?? null) ||
    ddMmmYyyyToPickerValue(rfq.modSettleDate ?? null) ||
    ddMmmYyyyToPickerValue(rfq.createdAt ?? null) ||
    ""
  );
}

/** Normalize autofill API deal/settlement values to YYYY-MM-DD for the date picker. */
function toPickerYmd(value: string | null | undefined): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return (
    ddMmmYyyyToPickerValue(raw) ||
    payinDateTimeToPickerValue(raw) ||
    ""
  );
}

function payinDateTimeToPickerValue(input?: string | null): string {
  const s = String(input ?? "").trim();
  if (!s) return "";

  // If already ISO-like, Date() will parse.
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Formats like: "23-Feb-2026 17:30:00" or "23-Feb-2026"
  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})(?:\s+.*)?$/.exec(s);
  if (ddMmmYyyy) return ddMmmYyyyToPickerValue(`${ddMmmYyyy[1]}-${ddMmmYyyy[2]}-${ddMmmYyyy[3]}`);

  return "";
}

function isValidCalendarYmd(iso: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return false;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

/**
 * Parse last-coupon raw text into stored `YYYY-MM-DD` + receipt preview line.
 * Accepts ISO, DD/MM/YYYY, DD-MM-YYYY, and other strings `payinDateTimeToPickerValue` understands.
 */
function normalizeLastCouponDateRawInput(raw: string): { iso: string; display: string } | null {
  const t = raw.trim();
  if (t === "") return { iso: "", display: "" };

  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    if (!isValidCalendarYmd(t)) return null;
    const display = formatDateWithDayNameFromPicker(t);
    return display ? { iso: t, display } : null;
  }

  const dmy = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(t);
  if (dmy) {
    const dd = Number(dmy[1]);
    const mm = Number(dmy[2]);
    const yyyy = Number(dmy[3]);
    if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
    const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
    if (!isValidCalendarYmd(iso)) return null;
    const display = formatDateWithDayNameFromPicker(iso);
    return display ? { iso, display } : null;
  }

  const isoLoose = payinDateTimeToPickerValue(t) || ddMmmYyyyToPickerValue(t);
  if (isoLoose && isValidCalendarYmd(isoLoose)) {
    const display = formatDateWithDayNameFromPicker(isoLoose);
    return display ? { iso: isoLoose, display } : null;
  }

  return null;
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
  const senderEmail = "backoffice@meradhan.co";
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [downloadingOrderPdf, setDownloadingOrderPdf] = useState(false);
  const [downloadingDealPdf, setDownloadingDealPdf] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);
  const [sendingPdfEmail, setSendingPdfEmail] = useState(false);
  const [proposalEmailOpen, setProposalEmailOpen] = useState(false);
  const [sendingProposalEmail, setSendingProposalEmail] = useState(false);
  const [emailPdfType, setEmailPdfType] = useState<"order" | "deal">("order");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [pdfAutofillSettlementDate, setPdfAutofillSettlementDate] = useState("");
  const [pdfResolvedDealDate, setPdfResolvedDealDate] = useState<string | null>(null);
  const [autofillingPdfOptions, setAutofillingPdfOptions] = useState(false);
  const [pdfAccruedInterestDays, setPdfAccruedInterestDays] = useState("");
  const [pdfSettlementNumber, setPdfSettlementNumber] = useState("");
  const [pdfSettlementDateTime, setPdfSettlementDateTime] = useState("");
  const [pdfLastInterestPaymentDateRaw, setPdfLastInterestPaymentDateRaw] = useState("");
  const [pdfLastInterestPaymentDate, setPdfLastInterestPaymentDate] = useState("");
  const [pdfInterestPaymentDates, setPdfInterestPaymentDates] = useState("");
  const [pdfNonAmortizedBond, setPdfNonAmortizedBond] = useState(true);
  const [pdfAmortizedPrincipalPaymentDates, setPdfAmortizedPrincipalPaymentDates] = useState("");
  const autoAutofillRanForRef = useRef<string | null>(null);
  const ordersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const participantsApi = new apiGateway.crm.rfq.participants.RfqParticipantsApi(
    apiClientCaller,
  );
  const [participantCode, setParticipantCode] = useState<string | null>(null);
  const [isAutoFetchedCustomer, setIsAutoFetchedCustomer] = useState(false);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");

  // Owner type for the manual-assign UI: pick the source of the
  // counterparty before showing the matching picker (customer autocomplete
  // vs participant dropdown).
  const [assignKind, setAssignKind] = useState<"customer" | "rfqParticipant">(
    "customer",
  );
  const [selectedParticipantCode, setSelectedParticipantCode] = useState<
    string | null
  >(null);
  const [participantInfoDialogOpen, setParticipantInfoDialogOpen] = useState(false);

  useEffect(() => {
    if (participantCode) {
      void customerApi.getCustomerByParticipantCode(participantCode!).then((response) => {
        const customer = response.data.responseData ?? null;
        setSelectedCustomer(customer);
        setIsAutoFetchedCustomer(!!customer);
      });
    } else {
      setIsAutoFetchedCustomer(false);
    }
  }, [participantCode]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rfq-by-order", orderNumber],
    queryFn: async () => {
      const response = await ordersApi.getRfqByOrderNumber(orderNumber!);
      let code;
      if (response.responseData?.buyBrokerLoginId?.startsWith("MD")) {
        code = response.responseData?.buyBrokerLoginId;
      } else if (response.responseData?.sellBrokerLoginId?.startsWith("MD")) {
        code = response.responseData?.sellBrokerLoginId;
      } else if (response.responseData?.buyBackofficeLoginId?.startsWith("MD")) {
        code = response.responseData?.buyBackofficeLoginId;
      } else if (response.responseData?.sellBackofficeLoginId?.startsWith("MD")) {
        code = response.responseData?.sellBackofficeLoginId;
      } else if (response.responseData?.buyParticipantLoginId?.startsWith("MD")) {
        code = response.responseData?.buyParticipantLoginId;
      } else if (response.responseData?.sellParticipantLoginId?.startsWith("MD")) {
        code = response.responseData?.sellParticipantLoginId;
      } else {
        code = null;
      }

      setParticipantCode(code);
      return response;
    },
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

  const { data: pdfOptionsQuery, isFetched: pdfOptionsFetched } = useQuery({
    queryKey: ["crm-receipt-pdf-options", orderNumber],
    queryFn: () => ordersApi.getReceiptPdfOptions(orderNumber!),
    enabled: Boolean(orderNumber),
  });






  const assignOrderMutation = useMutation({
    mutationFn: () =>
      ordersApi.createOrderFromRfq({
        orderNumber: orderNumber!,
        customerId: selectedCustomer!.id,
        orderSide,
      }),
    onSuccess: () => {
      toast.success("Order assigned to Customer.");
      setSelectedCustomer(null);
      void refetchCustomerOrder();
      queryClient.invalidateQueries({ queryKey: ["customer-full-order", orderNumber] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to assign order"));
    },
  });

  // Saved RFQ participant info — used to populate the participant dropdown
  // when the operator picks "NSE Participant" as the counterparty kind.
  // We only show participants that already have a saved info row, because
  // the backend assign-RFQ-participant endpoint (and the PDF actor
  // resolver) refuse to stamp a code that hasn't been enriched.
  const savedParticipantsQuery = useQuery({
    queryKey: ["NseRfqParticipants:infoSummary"],
    queryFn: async () => {
      const res = await participantsApi.listRfqParticipantInfoSummaries();
      return res.data.responseData?.summaries ?? [];
    },
    staleTime: 30 * 1000,
  });

  const savedParticipants: NseRfqParticipantInfoSummary[] =
    savedParticipantsQuery.data ?? [];

  const assignRfqParticipantMutation = useMutation({
    mutationFn: () =>
      ordersApi.assignRfqParticipantToSettleOrder({
        orderNumber: orderNumber!,
        code: selectedParticipantCode!,
      }),
    onSuccess: (res) => {
      const r = res.responseData;
      const sideNote = r?.matchesBuySide
        ? " (buy side)"
        : r?.matchesSellSide
          ? " (sell side)"
          : "";
      const orderId = r?.order?.orderNumber;
      const dealId = r?.order?.dealId;
      const orderLine =
        orderId && dealId
          ? ` Order ${orderId} · Deal ${dealId}`
          : orderId
            ? ` Order ${orderId}`
            : "";
      toast.success(
        `Assigned ${r?.participantName ?? "participant"}${sideNote}.${orderLine}`,
      );
      setSelectedParticipantCode(null);
      // Both queries change after a participant assignment:
      //  - rfq-by-order: settle_order now has `linkedRfqParticipantCode`
      //  - customer-full-order: a real Meradhan Order row was created,
      //    so the "Order assigned" card needs to populate too.
      void queryClient.invalidateQueries({
        queryKey: ["rfq-by-order", orderNumber],
      });
      void queryClient.invalidateQueries({
        queryKey: ["customer-full-order", orderNumber],
      });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to assign participant"));
    },
  });

  const rfq: RfqByOrderNumberSettleOrder | null | undefined =
    data?.responseData ?? null;
  const customerOrder: CustomerFullOrder | null =
    customerOrderData?.responseData ?? null;

  // Participant-counterparty resolution. After the new flow runs there is
  // a real Meradhan `Order` row with `customerProfileId = null` and
  // `linkedRfqParticipantCode` set; the legacy `settle_order`-only tag
  // (from the `asign-order.ts` script) is the fallback.
  const linkedParticipantCode =
    customerOrder?.linkedRfqParticipantCode ??
    rfq?.linkedRfqParticipantCode ??
    null;
  const linkedParticipantInfo = customerOrder?.rfqParticipantInfo ?? null;
  // `NseRfqParticipantInfoSummary` is the lightweight shape used in the
  // saved-participants dropdown; the Order's hydrated participant info is
  // the richer shape and includes bank/demat lists, but we only need the
  // header fields here for the participant card.
  const linkedParticipant: NseRfqParticipantInfoSummary | null =
    linkedParticipantCode
      ? (savedParticipants.find((p) => p.code === linkedParticipantCode) ??
        (linkedParticipantInfo
          ? {
            code: linkedParticipantInfo.code,
            nameOverride: linkedParticipantInfo.nameOverride,
            contactPerson: linkedParticipantInfo.contactPerson,
            emailList: linkedParticipantInfo.emailList ?? [],
            mobileList: linkedParticipantInfo.mobileList ?? [],
            telephone: linkedParticipantInfo.telephone,
            address: linkedParticipantInfo.address,
            address2: linkedParticipantInfo.address2,
            address3: linkedParticipantInfo.address3,
            stateCode: linkedParticipantInfo.stateCode,
            panNo: linkedParticipantInfo.panNo,
            leiCode: linkedParticipantInfo.leiCode,
            custodian: linkedParticipantInfo.custodian,
            dobDoi: linkedParticipantInfo.dobDoi,
            notes: linkedParticipantInfo.notes,
            bankAccountsCount: linkedParticipantInfo.bankAccounts?.length ?? 0,
            dematAccountsCount: linkedParticipantInfo.dematAccounts?.length ?? 0,
            updatedAt: new Date().toISOString(),
          }
          : null))
      : null;
  // PDF actions / receipt options are valid in both customer and
  // participant-tagged flows; treat them as "owner is assigned".
  const hasAssignedOwner =
    !!customerOrder?.customerProfile || !!linkedParticipantCode;
  const isNseParticipantOrder =
    !!linkedParticipantCode ||
    (customerOrder != null && customerOrder.customerProfileId == null);
  const isB2BCustomer =
    !!customerOrder?.customerProfile &&
    isB2BCustomerUserType(customerOrder.customerProfile.userType);
  const isCorporateCustomer =
    !!customerOrder?.customerProfile &&
    isCorporateCustomerUserType(customerOrder.customerProfile.userType);
  const participantPrimaryEmail = useMemo(() => {
    const emails = [
      ...(linkedParticipant?.emailList ?? []),
      ...(linkedParticipantInfo?.emailList ?? []),
    ];
    return emails.map((e) => e?.trim()).find(Boolean) ?? "";
  }, [linkedParticipant?.emailList, linkedParticipantInfo?.emailList]);
  const canEmailClientPdf =
    hasAssignedOwner &&
    (!isB2BCustomer || isCorporateCustomer) &&
    (isNseParticipantOrder
      ? !!participantPrimaryEmail
      : !!customerOrder?.customerProfile?.emailAddress);
  const canEmailProposal =
    canEmailClientPdf && !isNseParticipantOrder && !!customerOrder?.customerProfile;
  const profile = customerOrder?.customerProfile;
  const panCard = profile?.panCard as { gender?: unknown } | null | undefined;
  const aadhaarCard = profile?.aadhaarCard as { gender?: unknown } | null | undefined;
  const resolvedEmailGender = resolveGenderForEmailSalutation({
    gender: profile?.gender,
    panCard,
    aadhaarCard,
  });
  const emailSalutation = getEmailSalutationFromGender(resolvedEmailGender);
  const clientFullName = `${customerOrder?.customerProfile?.firstName ?? ""} ${customerOrder?.customerProfile?.middleName ?? ""} ${customerOrder?.customerProfile?.lastName ?? ""}`
    .trim()
    .toUpperCase();
  const securityName = customerOrder?.bondName ?? "—";
  const customerOrderId = customerOrder?.orderNumber ?? orderNumber ?? "—";
  const isin = rfq?.symbol ?? "—";
  const metaSide = (customerOrder?.metadata as { clientOrderSide?: string } | undefined)
    ?.clientOrderSide;
  const effectiveOrderSide: "BUY" | "SELL" =
    metaSide === "BUY" || metaSide === "SELL" ? metaSide : orderSide;
  const transactionLabel = effectiveOrderSide === "SELL" ? "sell" : "buy";
  const dealDateText = formatDealDateForEmail(
    pdfResolvedDealDate ??
      rfq?.modSettleDate ??
      rfq?.createdAt ??
      null,
  );

  const openParticipantInfoDialog = () => {
    if (!linkedParticipantCode) return;
    setParticipantInfoDialogOpen(true);
  };

  const handleParticipantInfoDialogOpenChange = (open: boolean) => {
    setParticipantInfoDialogOpen(open);
    if (!open && orderNumber) {
      void queryClient.invalidateQueries({ queryKey: ["customer-full-order", orderNumber] });
      void queryClient.invalidateQueries({ queryKey: ["rfq-by-order", orderNumber] });
      void queryClient.invalidateQueries({ queryKey: ["NseRfqParticipants:infoSummary"] });
      void refetchCustomerOrder();
    }
  };

  const showParticipantEmailFillCta =
    isNseParticipantOrder && !participantPrimaryEmail && !!linkedParticipantCode;


  useEffect(() => {
    const bs = String((rfq as { buySell?: string } | null)?.buySell ?? "")
      .trim()
      .toUpperCase();
    if (bs === "S") setOrderSide("SELL");
    else setOrderSide("BUY");
  }, [rfq?.buySell]);

  useEffect(() => {
    const m = customerOrder?.metadata as { clientOrderSide?: string } | undefined;
    if (m?.clientOrderSide === "BUY" || m?.clientOrderSide === "SELL") {
      setOrderSide(m.clientOrderSide);
    }
  }, [customerOrder?.metadata]);

  useEffect(() => {
    if (!orderNumber) return;
    autoAutofillRanForRef.current = null;
    setPdfAutofillSettlementDate("");
    setPdfResolvedDealDate(null);
    setAutofillingPdfOptions(false);
    setPdfAccruedInterestDays("");
    setPdfSettlementNumber("");
    setPdfSettlementDateTime("");
    setPdfLastInterestPaymentDateRaw("");
    setPdfLastInterestPaymentDate("");
    setPdfInterestPaymentDates("");
    setPdfNonAmortizedBond(true);
    setPdfAmortizedPrincipalPaymentDates("");
  }, [orderNumber]);

  useEffect(() => {
    if (!pdfOptionsFetched || !orderNumber) return;
    const row = pdfOptionsQuery?.responseData;
    if (!row || row.orderNumber !== orderNumber) return;
    // Keep saved settlement datetime / amortizing flags; coupon + days come from
    // RFQ autofill (settlement-date dependent) so we don't restore stale values.
    if (row.settlementDateTime) setPdfSettlementDateTime(row.settlementDateTime);
    setPdfNonAmortizedBond(row.nonAmortizedBond);
    setPdfAmortizedPrincipalPaymentDates(row.amortizedPrincipalPaymentDates ?? "");
  }, [orderNumber, pdfOptionsFetched, pdfOptionsQuery?.responseData]);

  // Seed settlement no from settle_order only. Settlement / deal dates come from
  // the RFQ master autofill response (not modSettleDate).
  useEffect(() => {
    if (!rfq) return;
    if (rfq.settlementNo != null) {
      setPdfSettlementNumber((prev) =>
        prev.trim() !== "" ? prev : String(rfq.settlementNo),
      );
    }
  }, [rfq]);

  const autofillReceiptPdfOptions = async (options?: {
    settlementDate?: string | null;
    /** When true, omit settlementDate so the backend uses saved RFQ master dates. */
    preferRfqMasterDates?: boolean;
    silent?: boolean;
  }) => {
    if (!orderNumber) return;
    const preferRfqMaster = options?.preferRfqMasterDates === true;
    const settlementDate = preferRfqMaster
      ? ""
      : (options?.settlementDate != null
          ? String(options.settlementDate).trim()
          : "") ||
        pdfAutofillSettlementDate.trim() ||
        "";
    const silent = options?.silent === true;

    setAutofillingPdfOptions(true);
    try {
      const resp = await apiClientCaller.post<{
        responseData?: {
          accruedInterestDays: number;
          settlementNumber: string | null;
          lastInterestPaymentDateRaw: string | null;
          lastInterestPaymentDate: string | null;
          interestPaymentDates: string | string[] | null;
          settlementDate: string;
          dealDate: string | null;
          settlementDateTime?: string | null;
        };
        message?: string;
      }>(
        `/crm/orders/receipt-pdf-options/${orderNumber}/autofill`,
        // null → backend resolves settlement + deal from saved RFQ master response
        { settlementDate: settlementDate || null },
      );

      const d = resp.data?.responseData;
      if (!d) {
        if (!silent) toast.error(resp.data?.message || "Auto-fill failed.");
        return;
      }
      setPdfAccruedInterestDays(String(d.accruedInterestDays ?? ""));
      const settlementFromApi = toPickerYmd(d.settlementDate);
      if (settlementFromApi) {
        setPdfAutofillSettlementDate(settlementFromApi);
      } else if (settlementDate) {
        setPdfAutofillSettlementDate(settlementDate);
      } else if (rfq) {
        const fallback = settlementDateFallbackFromSettleOrder(rfq);
        if (fallback) setPdfAutofillSettlementDate(fallback);
      }
      if (d.dealDate != null && String(d.dealDate).trim() !== "") {
        setPdfResolvedDealDate(
          formatDealDateForEmail(String(d.dealDate).trim()) ||
            String(d.dealDate).trim(),
        );
      }
      if (d.settlementNumber != null) setPdfSettlementNumber(String(d.settlementNumber));
      if (
        d.settlementDateTime != null &&
        String(d.settlementDateTime).trim() !== ""
      ) {
        setPdfSettlementDateTime(String(d.settlementDateTime).trim());
      }
      const rawLast = d.lastInterestPaymentDateRaw;
      const rawLastTrimmed =
        rawLast != null && String(rawLast).trim() !== "" ? String(rawLast).trim() : "";
      if (rawLastTrimmed !== "") {
        setPdfLastInterestPaymentDateRaw(rawLastTrimmed);
        const apiDisplay =
          d.lastInterestPaymentDate != null && String(d.lastInterestPaymentDate).trim() !== ""
            ? String(d.lastInterestPaymentDate).trim()
            : "";
        const formatted =
          apiDisplay && !/^\d{4}-\d{2}-\d{2}$/.test(apiDisplay)
            ? apiDisplay
            : formatDateWithDayNameFromPicker(
              /^\d{4}-\d{2}-\d{2}$/.test(rawLastTrimmed)
                ? rawLastTrimmed
                : /^\d{4}-\d{2}-\d{2}$/.test(apiDisplay)
                  ? apiDisplay
                  : rawLastTrimmed,
            );
        setPdfLastInterestPaymentDate(formatted);
      } else if (
        d.lastInterestPaymentDate != null &&
        String(d.lastInterestPaymentDate).trim() !== ""
      ) {
        setPdfLastInterestPaymentDate(String(d.lastInterestPaymentDate).trim());
      }
      setPdfInterestPaymentDates(interestPaymentDatesToFormText(d.interestPaymentDates));
      if (!silent) toast.success("Receipt PDF options auto-filled.");
    } catch (err) {
      if (!silent) toast.error(getApiErrorMessage(err, "Auto-fill failed"));
    } finally {
      setAutofillingPdfOptions(false);
    }
  };

  // Once RFQ is loaded (and owner assigned so the PDF section is shown), autofill
  // from saved RFQ master settlement + deal dates — not delayed modSettleDate.
  useEffect(() => {
    if (!orderNumber || !rfq || !hasAssignedOwner || !pdfOptionsFetched) return;
    if (autoAutofillRanForRef.current === orderNumber) return;
    autoAutofillRanForRef.current = orderNumber;
    void autofillReceiptPdfOptions({
      preferRfqMasterDates: true,
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber, rfq, hasAssignedOwner, pdfOptionsFetched]);

  useEffect(() => {
    if (emailTo) return;
    if (customerOrder?.customerProfile?.emailAddress) {
      setEmailTo(customerOrder.customerProfile.emailAddress);
    } else if (participantPrimaryEmail) {
      setEmailTo(participantPrimaryEmail);
    }
  }, [
    customerOrder?.customerProfile?.emailAddress,
    participantPrimaryEmail,
    emailTo,
  ]);

  const applyEmailTemplate = (type: "order" | "deal") => {
    const dearLine =
      linkedParticipantCode || isCorporateCustomer
        ? "Dear Sir / Madam,"
        : `Dear ${emailSalutation} ${clientFullName || "CUSTOMER"},`;
    const pdfPasswordExample =
      "You may open it using your date of birth as the password. For example, if your date of birth is 3 April 1996, the password will be 03041996.";
    const participantDobRaw =
      linkedParticipantInfo?.dobDoi?.trim() ||
      linkedParticipant?.dobDoi?.trim() ||
      null;
    const participantPdfWillBeEncrypted = !!dobRawToPdfPassword(participantDobRaw);
    const showPdfPasswordLine =
      !isNseParticipantOrder || participantPdfWillBeEncrypted;
    if (type === "deal") {
      const dealSheetNote = showPdfPasswordLine
        ? `Please find the Deal Sheet enclosed for your records. The deal sheet is password protected. ${pdfPasswordExample}`
        : "Please find the Deal Sheet enclosed for your records.";
      setEmailSubject(
        `Deal Sheet for ISIN ${isin} - Security Name ${securityName} - Deal Date ${dealDateText}`
      );
      setEmailBody(
        `${dearLine}

Thank you for investing with MeraDhan. We truly value your trust and remain committed to providing you with a seamless bond investment experience.

We are pleased to inform you that your deal has been successfully settled. The Clearing Corporation has initiated the release of securities to your Demat account for this ${transactionLabel} transaction. We kindly request you to review your Demat account and confirm receipt of the securities.

${dealSheetNote}

Should you have any queries or notice any discrepancy, feel free to contact us at backoffice@meradhan.co.

We look forward to serving you again.

Warm regards,

MeraDhan Team`
      );
      return;
    }
    const orderIdTpl = customerOrderId;
    const dealIdTpl =
      (customerOrder?.metadata as { dealId?: string } | undefined)?.dealId ?? "—";
    const buySellLower = effectiveOrderSide === "SELL" ? "sell" : "buy";
    const buySellYour = effectiveOrderSide === "SELL" ? "Sell" : "Buy";

    const passwordNote = showPdfPasswordLine
      ? `Please find the Order Receipt attached for your reference. The order receipt is password protected. ${pdfPasswordExample}`
      : "Please find the Order Receipt attached for your reference.";

    setEmailSubject(`Order Confirmation & Receipt – Order ID ${orderIdTpl}`);
    setEmailBody(
      `${dearLine}

Your ${buySellLower} order has been successfully placed through MeraDhan and has been executed on the exchange.

Bond Name: ${securityName}

ISIN: ${isin}

Deal ID: ${dealIdTpl}

Order Type: Your ${buySellYour}

${passwordNote}

To proceed with settlement, please transfer the required amount from your bank account verified on MeraDhan to the designated NCL account, maintained with HDFC Bank or RBI as applicable, via NEFT / RTGS, in accordance with the instructions provided at the time of placing your order.

Kindly ensure that the payment is completed within the stipulated time to avoid cancellation of the order.

Important Notes:

This Order Receipt indicates the intention to transact and is not a Deal Confirmation.

A Deal Sheet will be shared with you once the transaction is settled.

Please ensure that the Demat Account listed in the receipt is active and ready to receive the bonds/securities.

If you require any assistance, please contact us at backoffice@meradhan.co.

Warm regards,

MeraDhan Team

Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks and default risks including delay and/or default in payment. Read all the offer related documents carefully.

BondNest Capital India Securities Private Limited operates the MeraDhan platform as an Online Bond Platform Provider (OBPP).

SEBI Registration No.: INZ000330234

NSE Member ID: 90480

BSE Member ID: 6963`
    );
  };

  const getValidatedAccruedInterestDays = (): number | null => {
    const daysRaw = pdfAccruedInterestDays.trim();
    if (daysRaw === "") {
      toast.error("No. of Days is required.");
      return null;
    }
    const accruedInterestDaysNum = Number(daysRaw);
    return accruedInterestDaysNum;
  };

  const buildPdfOptionPayload = (accruedInterestDaysNum: number) => {
    const settlementDateVal =
      pdfAutofillSettlementDate.trim() !== "" ? pdfAutofillSettlementDate.trim() : undefined;
    const dealDateVal =
      pdfResolvedDealDate != null && pdfResolvedDealDate.trim() !== ""
        ? pdfResolvedDealDate.trim()
        : undefined;
    const settlementNumberVal =
      pdfSettlementNumber.trim() !== "" ? pdfSettlementNumber.trim() : undefined;
    const settlementDateTimeVal =
      pdfSettlementDateTime.trim() !== "" ? pdfSettlementDateTime.trim() : undefined;
    const lastInterestVal =
      pdfLastInterestPaymentDate.trim() !== ""
        ? pdfLastInterestPaymentDate.trim()
        : undefined;
    const interestPaymentDatesVal =
      pdfInterestPaymentDates.trim() !== ""
        ? pdfInterestPaymentDates.trim()
        : undefined;
    const amortizedPrincipalPaymentDatesVal =
      !pdfNonAmortizedBond && pdfAmortizedPrincipalPaymentDates.trim() !== ""
        ? pdfAmortizedPrincipalPaymentDates.trim()
        : undefined;
    return {
      accruedInterestDays: accruedInterestDaysNum,
      ...(settlementDateVal && { settlementDate: settlementDateVal }),
      ...(dealDateVal && { dealDate: dealDateVal }),
      ...(settlementNumberVal && { settlementNumber: settlementNumberVal }),
      ...(settlementDateTimeVal && { settlementDateTime: settlementDateTimeVal }),
      ...(lastInterestVal && { lastInterestPaymentDate: lastInterestVal }),
      ...(interestPaymentDatesVal && { interestPaymentDates: interestPaymentDatesVal }),
      nonAmortizedBond: pdfNonAmortizedBond,
      ...(amortizedPrincipalPaymentDatesVal && { amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesVal }),
    };
  };

  const persistReceiptPdfOptions = async (accruedInterestDaysNum: number) => {
    if (!orderNumber) return;
    try {
      await ordersApi.upsertReceiptPdfOptions(orderNumber, {
        accruedInterestDays: accruedInterestDaysNum,
        settlementNumber: pdfSettlementNumber.trim() || null,
        settlementDateTime: pdfSettlementDateTime.trim() || null,
        lastInterestPaymentDateRaw: pdfLastInterestPaymentDateRaw || null,
        lastInterestPaymentDate: pdfLastInterestPaymentDate.trim() || null,
        interestPaymentDates: pdfInterestPaymentDates.trim() || null,
        nonAmortizedBond: pdfNonAmortizedBond,
        amortizedPrincipalPaymentDates:
          !pdfNonAmortizedBond && pdfAmortizedPrincipalPaymentDates.trim() !== ""
            ? pdfAmortizedPrincipalPaymentDates.trim()
            : null,
      });
      void queryClient.invalidateQueries({ queryKey: ["crm-receipt-pdf-options", orderNumber] });
      toast.success("Receipt PDF options saved for next time.");
    } catch {
      // Non-blocking: PDF already generated
    }
  };

  const downloadPdf = async (type: "order" | "deal") => {
    if (!orderNumber) return;
    const accruedInterestDaysNum = getValidatedAccruedInterestDays();
    if (accruedInterestDaysNum == null) return;

    if (type === "deal") {
      const payoutTime = String(rfq?.payoutTime ?? "").trim();
      if (!payoutTime) {
        const proceed = window.confirm(
          "Payout time is not available for this order yet.\n\n" +
            "Settlement Date & Time will be left blank on the deal sheet.\n\n" +
            "Do you still want to generate the deal sheet PDF?",
        );
        if (!proceed) return;
      }
    }

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
      void persistReceiptPdfOptions(accruedInterestDaysNum);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to download PDF"));
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

    if (emailPdfType === "deal") {
      const payoutTime = String(rfq?.payoutTime ?? "").trim();
      if (!payoutTime) {
        const proceed = window.confirm(
          "Payout time is not available for this order yet.\n\n" +
            "Settlement Date & Time will be left blank on the deal sheet.\n\n" +
            "Do you still want to email the deal sheet PDF?",
        );
        if (!proceed) return;
      }
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
      void persistReceiptPdfOptions(accruedInterestDaysNum);
      setSendEmailOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to send email"));
    } finally {
      setSendingPdfEmail(false);
    }
  };

  const sendProposalEmail = async () => {
    if (!orderNumber) return;
    if (!emailTo.trim()) {
      toast.error("Client email is not available.");
      return;
    }
    if (!rfq) {
      toast.error("Settlement details not loaded.");
      return;
    }

    const quantity =
      (customerOrder as unknown as { quantity?: number | string | null })?.quantity ??
      (rfq as unknown as { modQuantity?: number | string | null })?.modQuantity ??
      null;
    const faceValue =
      (customerOrder as unknown as { faceValue?: number | string | null })?.faceValue ?? null;
    const quantum =
      Number(faceValue ?? 0) && Number(quantity ?? 0)
        ? Number(faceValue) * Number(quantity)
        : undefined;

    const rate =
      (rfq as unknown as { price?: number | string | null })?.price ??
      (customerOrder as unknown as { unitPrice?: number | string | null })?.unitPrice ??
      null;

    const accruedInterest =
      (rfq as unknown as { modAccrInt?: number | string | null })?.modAccrInt ?? null;

    const totalConsideration =
      (rfq as unknown as { modConsideration?: number | string | null })?.modConsideration ??
      (customerOrder as unknown as { totalAmount?: number | string | null })?.totalAmount ??
      null;

    const stampDuty =
      (rfq as unknown as { stampDutyAmount?: number | string | null })?.stampDutyAmount ??
      (customerOrder as unknown as { stampDuty?: number | string | null })?.stampDuty ??
      null;

    const settlementAmount =
      Number(totalConsideration ?? NaN) && Number(stampDuty ?? NaN)
        ? Number(totalConsideration) + Number(stampDuty)
        : undefined;

    const bondDetails = (customerOrder as unknown as { bondDetails?: BondDetailsResponse | null })
      ?.bondDetails;
    const pricingSnap =
      bondDetails &&
        typeof (bondDetails as { pricing?: Record<string, unknown> }).pricing === "object"
        ? (bondDetails as { pricing?: Record<string, unknown> }).pricing
        : undefined;
    const principalFromBond =
      pricingSnap?.principalAmount != null ? Number(pricingSnap.principalAmount) : null;
    const noOfDaysFromBond =
      pricingSnap?.noOfAccrualDays != null ? Number(pricingSnap.noOfAccrualDays) : null;

    const payload = {
      toEmail: emailTo.trim(),
      customerName:
        `${customerOrder?.customerProfile?.firstName ?? ""} ${customerOrder?.customerProfile?.lastName ?? ""}`.trim() ||
        clientFullName ||
        "Customer",
      gender: resolvedEmailGender,
      customerProfileId: customerOrder?.customerProfile?.id ?? null,
      side: effectiveOrderSide,
      bondName: securityName,
      isin: String((rfq as unknown as { symbol?: string | null })?.symbol ?? ""),
      dealDate: String((rfq as unknown as { createdAt?: string | null })?.createdAt ?? ""),
      settlementDate: String((rfq as unknown as { modSettleDate?: string | null })?.modSettleDate ?? ""),
      quantum: quantum ?? Number(quantum ?? 0),
      quantity: quantity != null ? Number(quantity) : 0,
      rate: rate != null ? Number(rate) : 0,
      ytmAnn:
        (rfq as unknown as { yield?: number | string | null })?.yield != null
          ? Number((rfq as unknown as { yield?: number | string | null }).yield)
          : null,
      lastIpDate: bondDetails?.lastCouponDate ?? null,
      noOfDays:
        noOfDaysFromBond != null && Number.isFinite(noOfDaysFromBond) ? noOfDaysFromBond : null,
      principalAmount:
        principalFromBond != null && Number.isFinite(principalFromBond) ? principalFromBond : null,
      accruedInterest: accruedInterest != null ? Number(accruedInterest) : null,
      totalConsideration: totalConsideration != null ? Number(totalConsideration) : null,
      stampDuty: stampDuty != null ? Number(stampDuty) : null,
      settlementAmount: settlementAmount != null ? Number(settlementAmount) : null,
      maturityDate: bondDetails?.maturityDate ?? null,
      faceValue: faceValue != null ? Number(faceValue) : null,
      cleanPrice: rate != null ? Number(rate) : null,
      couponRate:
        bondDetails?.couponRate != null && Number.isFinite(Number(bondDetails.couponRate))
          ? Number(bondDetails.couponRate)
          : null,
    };

    setSendingProposalEmail(true);
    try {
      await ordersApi.sendProposalEmail(payload);
      toast.success("Proposal email sent to client.");
      setProposalEmailOpen(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to send proposal email"));
    } finally {
      setSendingProposalEmail(false);
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
          {hasAssignedOwner && (
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
              {/* Email PDFs: retail customers or NSE participants with email on file. */}
              {canEmailClientPdf && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={downloadingOrderPdf || downloadingDealPdf || pdfAccruedInterestDays.trim() === ""}
                    onClick={() => {
                      setEmailPdfType("order");
                      applyEmailTemplate("order");
                      setSendEmailOpen(true);
                    }}
                  >
                    Email order receipt
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
                    Email deal sheet
                  </Button>
                  {canEmailProposal && (
                    <Button
                      size="sm"
                      variant="default"
                      disabled={downloadingOrderPdf || downloadingDealPdf}
                      onClick={() => setProposalEmailOpen(true)}
                    >
                      Email proposal
                    </Button>
                  )}
                </>
              )}
              {!!customerOrder?.customerProfile && isB2BCustomer && !isCorporateCustomer && (
                <p className="text-sm text-muted-foreground">
                  Send-to-email is hidden on this PDF page for this B2B customer type.
                </p>
              )}
              {showParticipantEmailFillCta && (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Add an email on the NSE participant profile to enable send-to-email.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openParticipantInfoDialog}
                  >
                    <UserRound className="h-4 w-4 mr-1.5" />
                    Fill participant info
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {hasAssignedOwner && (
          <Section title="Receipt PDF options (fill before generating PDF)">
            <p className="text-muted-foreground text-sm mb-3">
              Values are auto-filled from the saved RFQ response (deal date + settlement date) when this page opens. You can still edit fields before download or email.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pdf-autofill-settlement-date">Settlement date</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="pdf-autofill-settlement-date"
                    type="date"
                    value={pdfAutofillSettlementDate}
                    onChange={(e) => setPdfAutofillSettlementDate(e.target.value)}
                    disabled={autofillingPdfOptions}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={autofillingPdfOptions || downloadingOrderPdf || downloadingDealPdf || !orderNumber}
                    onClick={() =>
                      void autofillReceiptPdfOptions({
                        // Empty date → re-resolve from saved RFQ master response
                        settlementDate: pdfAutofillSettlementDate.trim() || null,
                        preferRfqMasterDates: !pdfAutofillSettlementDate.trim(),
                      })
                    }
                  >
                    {autofillingPdfOptions ? "Auto-filling..." : "Refresh auto-fill"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Taken from the saved RFQ response settlement date (not delayed mod settle). Change the date and refresh if you need a different settlement.
                </p>
              </div>
              {pdfResolvedDealDate ? (
                <div className="space-y-2">
                  <Label>Deal date</Label>
                  <Input value={pdfResolvedDealDate} readOnly disabled className="bg-muted/40" />
                </div>
              ) : null}
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
                <Label htmlFor="pdf-last-coupon-date">Last coupon date</Label>
                <Input
                  id="pdf-last-coupon-date"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  placeholder="YYYY-MM-DD or DD/MM/YYYY"
                  className="font-mono text-sm"
                  value={pdfLastInterestPaymentDateRaw}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPdfLastInterestPaymentDateRaw(v);
                    const p = normalizeLastCouponDateRawInput(v);
                    if (p?.display) setPdfLastInterestPaymentDate(p.display);
                    else if (v.trim() === "") setPdfLastInterestPaymentDate("");
                  }}
                  onBlur={() => {
                    const t = pdfLastInterestPaymentDateRaw.trim();
                    if (t === "") {
                      setPdfLastInterestPaymentDate("");
                      return;
                    }
                    const parsed = normalizeLastCouponDateRawInput(t);
                    if (!parsed) {
                      toast.error("Invalid last coupon date. Use YYYY-MM-DD or DD/MM/YYYY.");
                      setPdfLastInterestPaymentDate("");
                      return;
                    }
                    setPdfLastInterestPaymentDateRaw(parsed.iso);
                    setPdfLastInterestPaymentDate(parsed.display);
                  }}
                />
                {pdfLastInterestPaymentDate ? (
                  <p className="text-xs text-muted-foreground" aria-live="polite">
                    {pdfLastInterestPaymentDate}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf-interest-payment-dates">Interest Payment Dates</Label>
                <Input
                  id="pdf-interest-payment-dates"
                  type="text"
                  placeholder="e.g. 16-Feb, 16-May, 16-Aug"
                  value={pdfInterestPaymentDates}
                  onChange={(e) => setPdfInterestPaymentDates(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated (e.g. 16-Feb, 16-May, 16-Aug). Leave empty to derive from Last coupon date.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pdf-non-amortized-bond"
                    checked={pdfNonAmortizedBond}
                    onCheckedChange={(checked) => setPdfNonAmortizedBond(checked === true)}
                  />
                  <Label htmlFor="pdf-non-amortized-bond" className="cursor-pointer font-normal">
                    Non-Amortized Bond
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">When checked, Maturity Date row in PDF shows 100.0000%. When unchecked, use the value from Amortized Principal Payment Dates below.</p>
              </div>
              {!pdfNonAmortizedBond ? (
                <div className="space-y-2">
                  <Label htmlFor="pdf-amortized-principal-dates">Amortized Principal Payment Dates</Label>
                  <Input
                    id="pdf-amortized-principal-dates"
                    type="text"
                    placeholder="e.g. 20-Nov-2026 50%, 20-May-2027 50%"
                    value={pdfAmortizedPrincipalPaymentDates}
                    onChange={(e) => setPdfAmortizedPrincipalPaymentDates(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Shown in PDF Maturity Date row when Non-Amortized Bond is unchecked.</p>
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="pdf-settlement-datetime">Customer confirmation Date & Time</Label>
                <Input
                  id="pdf-settlement-datetime"
                  type="text"
                  placeholder="e.g. 23-Feb-2026 17:30:00"
                  value={pdfSettlementDateTime}
                  onChange={(e) => setPdfSettlementDateTime(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Shown on confirmation line in PDF page 2.</p>
                <p className="text-xs text-muted-foreground">Example: 23-Feb-2026 17:30:00</p>
              </div>
            </div>
          </Section>
        )}

        {/*
          Ownership resolution for the settle order. There are three states:
          1. customerOrder.customerProfile is set → a Meradhan customer owns
             the order (existing flow).
          2. rfq.linkedRfqParticipantCode is set → an external NSE RFQ
             participant has been tagged (new flow; PDF actor resolver picks
             this up automatically).
          3. Neither → operator picks a type and an entity below to assign.
        */}
        {customerOrderLoading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Loading Customer...</p>
            </CardContent>
          </Card>
        ) : customerOrder?.customerProfile ? (
          <>
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
            {customerOrder?.orderNumber ? (
              <Section title="MeraDhan identifiers">
                <InfoRow label="MeraDhan Order ID" value={customerOrder.orderNumber} />
                <InfoRow
                  label="MeraDhan Deal ID"
                  value={
                    (customerOrder.metadata as { dealId?: string } | undefined)?.dealId ?? "—"
                  }
                />
              </Section>
            ) : null}
          </>
        ) : linkedParticipantCode ? (
          <>
            <Section title="NSE Participant (assigned counterparty)">
              <InfoRow
                label="Participant code"
                value={linkedParticipantCode}
              />
              <InfoRow
                label="Name"
                value={
                  linkedParticipant?.nameOverride?.trim() ??
                  linkedParticipantCode
                }
              />
              <InfoRow
                label="Contact"
                value={linkedParticipant?.contactPerson ?? null}
              />
              <InfoRow
                label="Email"
                value={
                  (linkedParticipant?.emailList ?? []).join(", ") || null
                }
              />
              <InfoRow
                label="Mobile"
                value={
                  (linkedParticipant?.mobileList ?? []).join(", ") || null
                }
              />
              <InfoRow
                label="Telephone"
                value={linkedParticipant?.telephone ?? null}
              />
              <InfoRow label="PAN" value={linkedParticipant?.panNo ?? null} />
              <InfoRow label="LEI" value={linkedParticipant?.leiCode ?? null} />
              <InfoRow
                label="Custodian"
                value={linkedParticipant?.custodian ?? null}
              />
              <InfoRow
                label="Banks / Demats"
                value={
                  linkedParticipant
                    ? `${linkedParticipant.bankAccountsCount} bank · ${linkedParticipant.dematAccountsCount} demat`
                    : null
                }
              />
              <div className="pt-3 flex flex-wrap gap-2">
                {!participantPrimaryEmail && (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={openParticipantInfoDialog}
                  >
                    <UserRound className="h-4 w-4 mr-1.5" />
                    Fill participant info
                  </Button>
                )}
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/dashboard/rfqs/nse/rfq-participants`}
                    target="_blank"
                  >
                    Open participant info
                  </Link>
                </Button>
              </div>
            </Section>
            {customerOrder?.orderNumber ? (
              <Section title="MeraDhan identifiers">
                <InfoRow
                  label="MeraDhan Order ID"
                  value={customerOrder.orderNumber}
                />
                <InfoRow
                  label="MeraDhan Deal ID"
                  value={
                    (
                      customerOrder.metadata as
                      | { dealId?: string }
                      | undefined
                    )?.dealId ?? "—"
                  }
                />
                <InfoRow
                  label="Counterparty type"
                  value="External NSE participant"
                />
              </Section>
            ) : null}
          </>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">No counterparty assigned</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                This settle order isn&apos;t tied to a Meradhan customer or
                NSE participant yet. Pick who should appear as the
                counterparty on the order receipt / deal sheet PDF.
              </p>

              {/*
                Owner-type selector — drives which picker is shown below.
                Default to "customer" because that's the existing flow; the
                operator switches to "rfqParticipant" only for external NSE
                counterparties enriched via /dashboard/rfqs/nse/rfq-participants.
              */}
              <div className="flex flex-col gap-2 max-w-md">
                <Label htmlFor="assign-kind">Counterparty type</Label>
                <Select
                  value={assignKind}
                  onValueChange={(v) => {
                    const next = v as "customer" | "rfqParticipant";
                    setAssignKind(next);
                    // Clear the opposite picker so a stale selection can't
                    // be submitted from the wrong branch.
                    if (next === "customer") {
                      setSelectedParticipantCode(null);
                    } else {
                      setSelectedCustomer(null);
                    }
                  }}
                >
                  <SelectTrigger id="assign-kind" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">
                      MeraDhan customer
                    </SelectItem>
                    <SelectItem value="rfqParticipant">
                      NSE participant (external)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {assignKind === "customer" && (
                <>
                  {isAutoFetchedCustomer && selectedCustomer && (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Auto-fetched from participant code</p>
                      <div className="grid gap-2 text-sm">
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="text-muted-foreground">Name</span>
                          <span className="font-medium">
                            {[selectedCustomer.firstName, selectedCustomer.middleName, selectedCustomer.lastName].filter(Boolean).join(" ").trim() || "—"}
                          </span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="text-muted-foreground">Pan No</span>
                          <span className="font-mono">
                            {maskPanLast4((selectedCustomer as { panCard?: { panCardNo?: string } }).panCard?.panCardNo)}
                          </span>
                        </div>
                        <div className="grid grid-cols-[100px_1fr] gap-2">
                          <span className="text-muted-foreground">UCCNO</span>
                          <span className="font-mono">{selectedCustomer.userName ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!participantCode && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/40 p-4 mt-2">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
                        Participant code not found.
                      </p>
                      <p className="text-sm text-amber-900/90 dark:text-amber-100/90">
                        Please verify the order before proceeding. You can still manually select a Customer
                        below and assign this order to them — only Customers with verified KYC can be assigned.
                      </p>
                    </div>
                  )}


                  <div className="flex flex-wrap items-end gap-4">
                    <p className="text-sm text-muted-foreground pb-2">
                      Order side:{" "}
                      <span className="font-medium text-foreground">
                        {orderSide === "SELL" ? "Sell" : "Buy"}
                      </span>
                      <span className="text-muted-foreground"> (from RFQ)</span>
                    </p>
                    <div className="min-w-[220px]">
                      <SelectCustomerUser
                        placeholder={
                          participantCode
                            ? "Search and select Customer..."
                            : "Optional — search and select a Customer to assign manually..."
                        }
                        value={selectedCustomer ?? undefined}
                        onSelect={(customer) => {
                          setSelectedCustomer(customer);
                          setIsAutoFetchedCustomer(false);
                        }}
                        disabled={isAutoFetchedCustomer}
                      />
                    </div>
                    <Button
                      size="sm"
                      disabled={
                        !selectedCustomer ||
                        assignOrderMutation.isPending ||
                        String(selectedCustomer?.kycStatus) !== "VERIFIED"
                      }
                      onClick={() => assignOrderMutation.mutate()}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {assignOrderMutation.isPending ? "Assigning..." : "Assign order to Customer"}
                    </Button>
                  </div>
                  {selectedCustomer && !isAutoFetchedCustomer && (
                    <div className="rounded-lg border bg-muted/30 p-4 mt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Selected customer</p>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarImage
                            src={(selectedCustomer as { avatar?: string | null }).avatar ? genMediaUrl((selectedCustomer as { avatar?: string | null }).avatar) : undefined}
                            alt={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim()}
                          />
                          <AvatarFallback className="text-base bg-muted">
                            {[selectedCustomer.firstName, selectedCustomer.lastName]
                              .map((n) => (n ?? "").charAt(0))
                              .filter(Boolean)
                              .join("")
                              .toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1 min-w-0 flex-1">
                          <p className="font-semibold">
                            {[selectedCustomer.firstName, selectedCustomer.middleName, selectedCustomer.lastName].filter(Boolean).join(" ").trim() || "—"}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedCustomer.emailAddress || "—"}</p>
                          {selectedCustomer.phoneNo && (
                            <p className="text-sm text-muted-foreground">{selectedCustomer.phoneNo}</p>
                          )}
                          {selectedCustomer.kycStatus != null && (
                            <Badge
                              variant={
                                String(selectedCustomer.kycStatus).toUpperCase() === "VERIFIED" || String(selectedCustomer.kycStatus).toUpperCase() === "APPROVED"
                                  ? "default"
                                  : String(selectedCustomer.kycStatus).toUpperCase() === "PENDING"
                                    ? "secondary"
                                    : String(selectedCustomer.kycStatus).toUpperCase() === "REJECTED"
                                      ? "destructive"
                                      : "outline"
                              }
                              className="mt-1 w-fit"
                            >
                              {selectedCustomer.kycStatus}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedCustomer && String(selectedCustomer.kycStatus) !== "VERIFIED" && (
                    <p className="text-destructive text-sm">Selected Customer KYC is not verified. Only VERIFIED Customers can be assigned.</p>
                  )}
                </>
              )}

              {assignKind === "rfqParticipant" && (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    NSE participant
                  </p>
                  {savedParticipantsQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading participants…
                    </p>
                  ) : savedParticipants.length === 0 ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/40 p-4">
                      <p className="text-sm text-amber-900 dark:text-amber-100">
                        No NSE participants with saved info yet. Add an
                        entry first via{" "}
                        <Link
                          href="/dashboard/rfqs/nse/rfq-participants"
                          className="font-medium underline underline-offset-2"
                          target="_blank"
                        >
                          /dashboard/rfqs/nse/rfq-participants
                        </Link>{" "}
                        — only enriched participants can be assigned so the
                        PDF has contact / bank / demat info to render.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="min-w-[260px] flex-1 max-w-md">
                          <Label htmlFor="participant-select">
                            Pick a participant
                          </Label>
                          <Select
                            value={selectedParticipantCode ?? undefined}
                            onValueChange={(v) =>
                              setSelectedParticipantCode(v)
                            }
                          >
                            <SelectTrigger
                              id="participant-select"
                              className="w-full"
                            >
                              <SelectValue placeholder="Search & select participant…" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px]">
                              {savedParticipants
                                .slice()
                                .sort((a, b) =>
                                  (a.nameOverride ?? a.code).localeCompare(
                                    b.nameOverride ?? b.code,
                                  ),
                                )
                                .map((p) => (
                                  <SelectItem key={p.code} value={p.code}>
                                    <span className="font-mono mr-2">
                                      {p.code}
                                    </span>
                                    {p.nameOverride
                                      ? `— ${p.nameOverride}`
                                      : null}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          size="sm"
                          disabled={
                            !selectedParticipantCode ||
                            assignRfqParticipantMutation.isPending
                          }
                          onClick={() =>
                            assignRfqParticipantMutation.mutate()
                          }
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {assignRfqParticipantMutation.isPending
                            ? "Assigning..."
                            : "Assign as NSE participant"}
                        </Button>
                      </div>
                      {selectedParticipantCode &&
                        (() => {
                          const p = savedParticipants.find(
                            (x) => x.code === selectedParticipantCode,
                          );
                          if (!p) return null;
                          return (
                            <div className="rounded-lg border bg-muted/30 p-4 grid gap-1 text-sm">
                              <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-muted-foreground">
                                  Code
                                </span>
                                <span className="font-mono">{p.code}</span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-muted-foreground">
                                  Name
                                </span>
                                <span className="font-medium">
                                  {p.nameOverride ?? p.code}
                                </span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-muted-foreground">
                                  Contact
                                </span>
                                <span>{p.contactPerson ?? "—"}</span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-muted-foreground">
                                  PAN
                                </span>
                                <span className="font-mono">
                                  {p.panNo ?? "—"}
                                </span>
                              </div>
                              <div className="grid grid-cols-[120px_1fr] gap-2">
                                <span className="text-muted-foreground">
                                  Banks · Demat
                                </span>
                                <span>
                                  {p.bankAccountsCount} ·{" "}
                                  {p.dematAccountsCount}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                    </>
                  )}
                </div>
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
            <InfoRow label="Buyer Client" value={rfq.buyParticipantLoginId} />
            <InfoRow label="Seller Client" value={rfq.sellParticipantLoginId} />
            <InfoRow label="Buyer Ref No" value={rfq.buyerRefNo} />
            <InfoRow label="Seller Ref No" value={rfq.sellerRefNo} />
            <InfoRow label="Buy Backoffice Login ID" value={rfq.buyBackofficeLoginId} />
            <InfoRow label="Sell Backoffice Login ID" value={rfq.sellBackofficeLoginId} />
            <InfoRow label="Buy Broker Login ID" value={rfq.buyBrokerLoginId} />
            <InfoRow label="Sell Broker Login ID" value={rfq.sellBrokerLoginId} />
          </Section>

          <Section title="Price & value">
            <InfoRow label="Price" value={formatCleanPriceDisplay(rfq.price)} />
            <InfoRow label="Yield Type" value={rfq.yieldType} />
            <InfoRow label="Yield" value={formatYtmDisplay(rfq.yield)} />
            <InfoRow
              label="Value"
              value={formatInrMoneyDisplay(rfq.value, { withRupee: false })}
            />
            <InfoRow label="Source" value={rfq.source} />
          </Section>

          <Section title="Modification (if any)">
            <InfoRow label="Mod Settle Date" value={rfq.modSettleDate} />
            <InfoRow label="Mod Quantity" value={rfq.modQuantity} />
            <InfoRow
              label="Mod Accrued Interest"
              value={formatInrMoneyDisplay(rfq.modAccrInt, { withRupee: false })}
            />
            <InfoRow
              label="Mod Consideration"
              value={formatInrMoneyDisplay(rfq.modConsideration, {
                withRupee: false,
              })}
            />
          </Section>

          <Section title="Settlement">
            <InfoRow label="Settlement No" value={rfq.settlementNo} />
            <InfoRow label="Settle Status" value={rfq.settleStatus} />
            <InfoRow
              label="Stamp Duty Amount"
              value={formatInrMoneyDisplay(rfq.stampDutyAmount, {
                withRupee: false,
              })}
            />
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
              Choose the PDF type, write your message, and send it as an attachment to the assigned client.
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

      <Dialog open={proposalEmailOpen} onOpenChange={setProposalEmailOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Send proposal email</DialogTitle>
            <DialogDescription>
              Sends the RFQ order confirmation-required proposal email to the client (from {senderEmail}).
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Client email</Label>
              <Input
                type="email"
                value={emailTo}
                placeholder="client@email.com"
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
              <div><span className="font-medium text-foreground">ISIN:</span> {rfq?.symbol ?? "—"}</div>
              <div><span className="font-medium text-foreground">Bond:</span> {securityName}</div>
              <div><span className="font-medium text-foreground">Side:</span> {effectiveOrderSide}</div>
              <div><span className="font-medium text-foreground">Settlement date:</span> {pdfAutofillSettlementDate || rfq?.modSettleDate || "—"}</div>
              {pdfResolvedDealDate ? (
                <div><span className="font-medium text-foreground">Deal date:</span> {pdfResolvedDealDate}</div>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setProposalEmailOpen(false)}
              disabled={sendingProposalEmail}
            >
              Cancel
            </Button>
            <Button onClick={() => void sendProposalEmail()} disabled={sendingProposalEmail}>
              {sendingProposalEmail ? "Sending..." : "Send proposal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {linkedParticipantCode ? (
        <RfqParticipantInfoDialog
          open={participantInfoDialogOpen}
          onOpenChange={handleParticipantInfoDialogOpenChange}
          code={linkedParticipantCode}
          nseName={
            linkedParticipant?.nameOverride?.trim() || linkedParticipantCode
          }
        />
      ) : null}
    </>
  );
}

export default GeneratePdfContent;