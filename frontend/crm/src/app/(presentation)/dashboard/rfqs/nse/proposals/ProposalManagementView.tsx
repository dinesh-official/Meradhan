"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  FileText,
  History,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  UserRound,
  Zap,
} from "lucide-react";
import type { AxiosError } from "axios";
import apiGateway, {
  type BondDetailsResponse,
  type CustomerProfile,
  type NseRfqParticipantInfoSummary,
} from "@root/apiGateway";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { SelectCustomerUser } from "@/global/elements/autocomplete/SelectCustomerUser";
import {
  RfqParticipantInfoCard,
  SelectRfqParticipantWithInfo,
} from "@/global/elements/autocomplete/SelectRfqParticipantWithInfo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProposalFetcher, type ProposalFetchResult } from "./useProposalFetcher";
import { useRouter } from "nextjs-toploader/app";

function formatCurrency(value: number | string | null | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(numeric);
}

function formatNumber(value: number | string | null | undefined, digits = 2) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(numeric);
}

function formatInteger(value: number | string | null | undefined) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "—";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(numeric);
}

function formatDisplayDate(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

/** Match proposal email subject: DD-MMM-YYYY (full year, hyphenated). */
function formatDealDateForEmailSubject(value: string | null | undefined) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = String(parsed.getDate()).padStart(2, "0");
  const m = months[parsed.getMonth()] ?? "—";
  const y = parsed.getFullYear();
  return `${d}-${m}-${y}`;
}

function toNumber(value: number | string | null | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function safeNumber(value: number | string | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || axiosError.message || fallback;
}

function customerFullName(customer: CustomerProfile | null) {
  if (!customer) return "—";
  return [customer.firstName, customer.middleName, customer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

type SendProposalEmailPayload = {
  toEmail: string;
  customerName: string;
  gender?: string | null;
  side: "BUY" | "SELL";
  bondName: string;
  isin: string;
  dealDate?: string;
  settlementDate?: string;
  quantum?: number;
  quantity: number;
  rate?: number;
  ytmAnn?: number | null;
  lastIpDate?: string | null;
  noOfDays?: number | null;
  principalAmount?: number | null;
  accruedInterest?: number | null;
  totalConsideration?: number | null;
  stampDuty?: number | null;
  settlementAmount?: number | null;
  maturityDate?: string | null;
  faceValue?: number | null;
  cleanPrice?: number | null;
  couponRate?: number | null;
};

function formatEmailSubject(isin: string, dealDate: string | undefined) {
  const formatted = dealDate ? formatDealDateForEmailSubject(dealDate) : "—";
  return `RFQ Order Confirmation Required – ${isin} Deal Date ${formatted}`;
}

function getEmailSalutationFromGender(gender: unknown): "Mr." | "Ms." | "Mr. / Ms." {
  const g = String(gender ?? "").trim().toUpperCase();
  if (g === "FEMALE") return "Ms.";
  if (g === "MALE") return "Mr.";
  return "Mr. / Ms.";
}

function buildEmailPreviewHtml(params: SendProposalEmailPayload) {
  const salutation = getEmailSalutationFromGender(params.gender);
  const orderSideWord = params.side === "SELL" ? "sell" : "buy";
  const cleanPx = params.cleanPrice ?? params.rate;
  const cleanPriceDisplay =
    cleanPx != null && Number.isFinite(Number(cleanPx))
      ? `INR ${formatNumber(Number(cleanPx), 4)}`
      : "—";
  const couponDisplay =
    params.couponRate != null && Number.isFinite(Number(params.couponRate))
      ? `${formatNumber(Number(params.couponRate), 2)}%`
      : "—";
  const accruedDisplay =
    params.accruedInterest != null && Number.isFinite(Number(params.accruedInterest))
      ? `${formatCurrency(params.accruedInterest)}${params.noOfDays != null ? ` (No. of Days: ${params.noOfDays})` : ""
      }`
      : "—";
  const faceVal =
    params.faceValue != null && Number.isFinite(params.faceValue)
      ? formatCurrency(params.faceValue)
      : "—";

  const rows: Array<[string, string]> = [
    ["Security Name", params.bondName],
    ["ISIN", params.isin],
    ["Deal Date", formatDealDateForEmailSubject(params.dealDate)],
    ["Settlement Date", formatDealDateForEmailSubject(params.settlementDate)],
    ["Maturity", formatDealDateForEmailSubject(params.maturityDate ?? undefined)],
    ["Coupon Rate", couponDisplay],
    ["Face Value", faceVal],
    ["Quantity", formatInteger(params.quantity)],
    ["Quantum", formatCurrency(params.quantum)],
    ["Clean Price", cleanPx != null ? `${formatNumber(cleanPx, 4)}` : "—"],
    ["YTM Ann", params.ytmAnn != null ? `${formatNumber(params.ytmAnn, 2)}%` : "—"],
    ["Last IP Date", formatDealDateForEmailSubject(params.lastIpDate ?? undefined)],
    ["Principal Amount", formatCurrency(params.principalAmount)],
    ["Accrued / Ex Interest", accruedDisplay],
    ["Total Consideration", formatCurrency(params.totalConsideration)],
    ["Stamp Duty", formatCurrency(params.stampDuty)],
    ["Settlement Amount", formatCurrency(params.settlementAmount)],
  ];

  const confirmationQuote =
    "I confirm the above order details and authorize BondNest Capital India Securities Private Limited (MeraDhan) to proceed with the order placement on the RFQ Platform.";

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 8px;border:1px solid #e5e7eb;"><strong>${k}</strong></td><td style="padding:6px 8px;border:1px solid #e5e7eb;">${v}</td></tr>`,
    )
    .join("");

  return `
    <p>Dear ${salutation} ${params.customerName},</p>
    <p>Thank you for placing your ${orderSideWord} order on BondNest Capital India Securities Private Limited (MeraDhan). Your order request has been recorded successfully and is currently pending confirmation.</p>
    <p>To proceed with the order placement, kindly reply to this email with the following confirmation text:</p>
    <p style="margin:10px 0;padding:10px 14px;border-left:4px solid #2563eb;background:#f8fafc;font-style:italic;">&ldquo;${confirmationQuote}&rdquo;</p>
    <p>The transaction details are provided below for your review:</p>
    <table style="border-collapse:collapse;width:100%;margin:12px 0;">${tableRows}</table>
    <p style="margin-top:12px;font-size:12px;color:#64748b;">Preview only. Sent email includes full legal notes, disclaimer, and SEBI / exchange member IDs.</p>
    <p style="margin-top:12px;">Best regards,<br/>MeraDhan Team</p>
  `;
}

type ProposalDraft = {
  id: string;
  /** When this draft was created by editing an earlier saved proposal. */
  editOfId?: string | null;
  /** DB status: PENDING | PROCESSING | WAITING_FOR_APPROVAL | FAILED | REJECTED | CONVERTED */
  status?: string;
  failedNote?: string | null;
  isin: string;
  quantity: number;
  notes: string;
  side: "BUY" | "SELL";
  settlementType: "T+0" | "T+1";
  manualYieldEnabled: boolean;
  manualYield: string;
  customer: CustomerProfile | null;
  /** CRM-enriched NSE RFQ participant from /rfq-participants. */
  rfqParticipant?: NseRfqParticipantInfoSummary | null;
  /** DB column when saved without a Meradhan customer. */
  linkedRfqParticipantCode?: string | null;
  fetched: ProposalFetchResult;
  createdAt: string;
};

function rfqParticipantDisplayName(
  participant: NseRfqParticipantInfoSummary | null | undefined,
) {
  if (!participant) return "—";
  return participant.nameOverride?.trim() || participant.code;
}

function rfqParticipantPrimaryEmail(
  participant: NseRfqParticipantInfoSummary | null | undefined,
) {
  const email = participant?.emailList?.find((e) => e?.trim());
  return email?.trim() || "";
}

function proposalRecipientName(draft: {
  customer: CustomerProfile | null;
  rfqParticipant?: NseRfqParticipantInfoSummary | null;
}) {
  if (draft.rfqParticipant) return rfqParticipantDisplayName(draft.rfqParticipant);
  return customerFullName(draft.customer);
}

function proposalRecipientEmail(draft: {
  customer: CustomerProfile | null;
  rfqParticipant?: NseRfqParticipantInfoSummary | null;
}) {
  return (
    draft.customer?.emailAddress?.trim() ||
    rfqParticipantPrimaryEmail(draft.rfqParticipant) ||
    ""
  );
}

function proposalRecipientGender(draft: {
  customer: CustomerProfile | null;
}) {
  return draft.customer?.gender ?? null;
}

/** Saved proposal targeted at an enriched NSE RFQ participant (not a Meradhan customer). */
function isNseParticipantProposal(draft: {
  rfqParticipant?: NseRfqParticipantInfoSummary | null;
  linkedRfqParticipantCode?: string | null;
}) {
  return Boolean(
    draft.rfqParticipant?.code?.trim() || draft.linkedRfqParticipantCode?.trim(),
  );
}

function bondLabel(bond: Pick<BondDetailsResponse, "isin" | "bondName" | "instrumentName">) {
  return `${bond.isin} - ${bond.bondName || bond.instrumentName || "Unnamed Bond"}`;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium tabular-nums">{value}</span>
    </div>
  );
}

function ProposalManagementView() {
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
  const ordersApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);
  const savedProposalsApi = new apiGateway.crm.crmSavedProposalsApi(apiClientCaller);
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isin, setIsin] = useState("");
  const [isinOpen, setIsinOpen] = useState(false);
  const [isinSearch, setIsinSearch] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [settlementType, setSettlementType] = useState<"T+0" | "T+1">("T+0");
  const [manualYieldEnabled, setManualYieldEnabled] = useState(false);
  const [manualYield, setManualYield] = useState("");
  const [notes, setNotes] = useState("");
  const [recipientMode, setRecipientMode] = useState<"RFQ_PARTICIPANT" | "CUSTOMER">(
    "RFQ_PARTICIPANT",
  );
  const [selectedRfqParticipant, setSelectedRfqParticipant] =
    useState<NseRfqParticipantInfoSummary | null>(null);
  const [isResolvingParticipantCustomer, setIsResolvingParticipantCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [proposalDraft, setProposalDraft] = useState<ProposalDraft | null>(null);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreview, setEmailPreview] = useState<{
    toEmail: string;
    subject: string;
    html: string;
    payload: SendProposalEmailPayload;
  } | null>(null);
  const [savedSearch, setSavedSearch] = useState("");
  const [savedCustomerFilter, setSavedCustomerFilter] = useState<CustomerProfile | null>(null);
  const [savedScope, setSavedScope] = useState<"MINE" | "ALL">("MINE");
  const [savedProposals, setSavedProposals] = useState<ProposalDraft[]>([]);
  const [editSourceId, setEditSourceId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRootId, setHistoryRootId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Inline edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDialogSource, setEditDialogSource] = useState<ProposalDraft | null>(null);
  const [editQty, setEditQty] = useState("1");
  const [editSide, setEditSide] = useState<"BUY" | "SELL">("BUY");
  const [editSettlement, setEditSettlement] = useState<"T+0" | "T+1">("T+0");
  const [editManualYieldEnabled, setEditManualYieldEnabled] = useState(false);
  const [editManualYield, setEditManualYield] = useState("");
  const [editCustomer, setEditCustomer] = useState<CustomerProfile | null>(null);
  const [editNotes, setEditNotes] = useState("");

  const { fetchProposalMutation } = useProposalFetcher();

  const Pill = ({
    label,
    variant = "secondary",
  }: {
    label: string;
    variant?: "default" | "secondary" | "outline" | "destructive";
  }) => (
    <Badge variant={variant} className="rounded-full px-2 py-0.5 text-xs">
      {label}
    </Badge>
  );

  function ProposalStatusBadge({ status }: { status?: string }) {
    const s = (status ?? "PENDING").toUpperCase();
    const cls =
      s === "CONVERTED"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : s === "WAITING_FOR_APPROVAL"
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : s === "REJECTED" || s === "FAILED"
            ? "bg-red-100 text-red-600 border-red-200"
            : "bg-amber-100 text-amber-700 border-amber-200";
    const label =
      s === "WAITING_FOR_APPROVAL" ? "Awaiting" :
        s.charAt(0) + s.slice(1).toLowerCase();
    return (
      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", cls)}>
        {label}
      </span>
    );
  }
  const [emailDraftId, setEmailDraftId] = useState<string | null>(null);

  const sendProposalEmailMutation = useMutation({
    mutationFn: async (payload: SendProposalEmailPayload) => ordersApi.sendProposalEmail(payload),
    onSuccess: () => {
      toast.success("Proposal email sent successfully");
      const idNum = Number(emailDraftId);
      if (Number.isFinite(idNum) && idNum > 0) {
        markWaitingMutation.mutate(idNum);
      }
      setEmailDraftId(null);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to send proposal email"));
      setEmailDraftId(null);
    },
  });

  const quantityValue = useMemo(() => Number(quantity), [quantity]);

  const isinQuery = useQuery({
    queryKey: ["proposal-isin-search", isinSearch],
    queryFn: async () => {
      const response = await bondsApi.getListedBonds({
        filters: { search: isinSearch || undefined },
        params: {
          page: 1,
          limit: 20,
          all: "YES",
          category: "all",
        },
      });
      return response.responseData.data ?? [];
    },
    enabled: isinOpen,
    staleTime: 60_000,
  });

  const isinOptions = isinQuery.data ?? [];
  const selectedBondLabel = useMemo(() => {
    const bond = isinOptions.find((item) => item.isin === isin);
    return bond ? bondLabel(bond) : isin || "Search and select ISIN...";
  }, [isin, isinOptions]);

  const savedQuery = useQuery({
    queryKey: ["crm-saved-proposals", savedScope],
    queryFn: async () => {
      const res = savedScope === "ALL"
        ? await savedProposalsApi.listAll()
        : await savedProposalsApi.listMine();
      return res.responseData.proposals ?? [];
    },
  });

  const savedFromDb = savedQuery.data ?? [];
  const savedDrafts = useMemo<ProposalDraft[]>(() => {
    return savedFromDb
      .map((row) => {
        const data = (row.data ?? null) as ProposalDraft | null;
        if (!data || typeof data !== "object") return null;
        return {
          ...data,
          id: String(row.id),
          createdAt: row.createdAt,
          status: row.status ?? "PENDING",
          failedNote: row.failedNote ?? null,
          linkedRfqParticipantCode:
            row.linkedRfqParticipantCode ?? data.linkedRfqParticipantCode ?? null,
        } as ProposalDraft;
      })
      .filter((x): x is ProposalDraft => Boolean(x));
  }, [savedFromDb]);

  const savedDraftById = useMemo(() => {
    const m = new Map<string, ProposalDraft>();
    for (const d of savedDrafts) m.set(String(d.id), d);
    return m;
  }, [savedDrafts]);

  const getHistoryRootId = (startId: string): string => {
    let current = String(startId);
    const seen = new Set<string>();
    while (!seen.has(current)) {
      seen.add(current);
      const row = savedDraftById.get(current);
      const parent = row?.editOfId ?? null;
      if (!parent) return current;
      current = String(parent);
    }
    return String(startId);
  };

  const getHistoryItems = (rootId: string): ProposalDraft[] => {
    const memo = new Map<string, string>();
    const rootOf = (id: string) => {
      const cached = memo.get(id);
      if (cached) return cached;
      const r = getHistoryRootId(id);
      memo.set(id, r);
      return r;
    };
    return savedDrafts
      .filter((d) => rootOf(String(d.id)) === String(rootId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const openHistory = (item: ProposalDraft) => {
    const root = getHistoryRootId(String(item.id));
    setHistoryRootId(root);
    setHistoryOpen(true);
  };
  const savedProposalsToRender = useMemo(() => {
    const q = savedSearch.trim().toLowerCase();
    const customerId = savedCustomerFilter?.id ?? null;

    return savedDrafts.filter((item) => {
      if (customerId != null && item.customer?.id !== customerId) return false;
      if (!q) return true;

      const bondName =
        item.fetched?.bond?.bondName || item.fetched?.bond?.instrumentName || "";
      const customerName = proposalRecipientName(item).toLowerCase();
      const email = proposalRecipientEmail(item).toLowerCase();
      const isin = (item.isin || "").toLowerCase();

      return (
        isin.includes(q) ||
        bondName.toLowerCase().includes(q) ||
        customerName.includes(q) ||
        email.includes(q)
      );
    });
  }, [savedCustomerFilter?.id, savedDrafts, savedSearch]);

  // Groups proposals by their edit chain root. Each group is sorted latest-first.
  const proposalGroups = useMemo(() => {
    const memo = new Map<string, string>();
    const rootOf = (id: string): string => {
      if (memo.has(id)) return memo.get(id)!;
      const row = savedDraftById.get(id);
      const parent = row?.editOfId ? String(row.editOfId) : null;
      const root = parent ? rootOf(parent) : id;
      memo.set(id, root);
      return root;
    };
    const groups = new Map<string, ProposalDraft[]>();
    for (const item of savedProposalsToRender) {
      const root = rootOf(String(item.id));
      const existing = groups.get(root) ?? [];
      existing.push(item);
      groups.set(root, existing);
    }
    // Sort each group latest-first
    for (const [, list] of groups) {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // Return as array of [rootId, items] sorted by latest item's date
    return [...groups.entries()].sort(
      ([, a], [, b]) => new Date(b[0]!.createdAt).getTime() - new Date(a[0]!.createdAt).getTime()
    );
  }, [savedDraftById, savedProposalsToRender]);

  const toggleGroup = (rootId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  };

  const resolveParticipantCustomer = async (participantCode: string) => {
    try {
      const response = await customerApi.getCustomerByParticipantCode(participantCode);
      const customer = response.data.responseData;
      if (!customer?.id) {
        return null;
      }
      return customer;
    } catch {
      return null;
    }
  };

  const handleRfqParticipantSelect = async (
    participant: NseRfqParticipantInfoSummary | null,
  ) => {
    setSelectedRfqParticipant(participant);
    if (!participant) {
      setSelectedCustomer(null);
      return;
    }

    setIsResolvingParticipantCustomer(true);
    try {
      const customer = await resolveParticipantCustomer(participant.code);
      setSelectedCustomer(customer);
      if (customer) {
        toast.success(`Linked customer: ${customerFullName(customer)}`);
      }
    } finally {
      setIsResolvingParticipantCustomer(false);
    }
  };

  const handleRecipientModeChange = (mode: "RFQ_PARTICIPANT" | "CUSTOMER") => {
    setRecipientMode(mode);
    setSelectedCustomer(null);
    setSelectedRfqParticipant(null);
  };

  const handleReset = () => {
    setIsin("");
    setIsinSearch("");
    setSide("BUY");
    setSettlementType("T+0");
    setManualYieldEnabled(false);
    setManualYield("");
    setQuantity("1");
    setNotes("");
    setRecipientMode("RFQ_PARTICIPANT");
    setSelectedRfqParticipant(null);
    setSelectedCustomer(null);
    setProposalDraft(null);
    setEditSourceId(null);
    setIsSheetOpen(false);
  };

  const handleCreateProposal = async () => {
    const normalizedIsin = isin.trim().toUpperCase();
    if (!normalizedIsin) {
      toast.error("ISIN is required");
      return;
    }
    if (recipientMode === "RFQ_PARTICIPANT") {
      if (!selectedRfqParticipant) {
        toast.error("Please select an RFQ participant with saved info");
        return;
      }
    } else if (!selectedCustomer) {
      toast.error("Please select a customer");
      return;
    }
    if (!Number.isFinite(quantityValue) || quantityValue <= 0 || !Number.isInteger(quantityValue)) {
      toast.error("Quantity must be a positive whole number");
      return;
    }

    const manualYieldNumber = manualYieldEnabled ? Number(manualYield) : null;
    if (manualYieldEnabled) {
      if (manualYieldNumber == null || !Number.isFinite(manualYieldNumber) || manualYieldNumber <= 0) {
        toast.error("Enter a valid YTM (%) to use manual yield pricing");
        return;
      }
    }

    try {
      const fetched = await fetchProposalMutation.mutateAsync({
        isin: normalizedIsin,
        quantity: quantityValue,
        side,
        settlementType,
        pricingYield:
          manualYieldEnabled ? manualYieldNumber! : null,
      });

      setProposalDraft({
        id: crypto.randomUUID(),
        isin: normalizedIsin,
        quantity: quantityValue,
        notes: notes.trim(),
        side,
        settlementType,
        manualYieldEnabled,
        manualYield,
        customer: selectedCustomer,
        rfqParticipant: selectedRfqParticipant,
        fetched,
        createdAt: new Date().toISOString(),
      });
      setIsSheetOpen(true);
      toast.success("Proposal data loaded");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to fetch proposal data"));
    }
  };

  const handleSaveProposal = () => {
    if (!proposalDraft) {
      toast.error("Create a proposal first");
      return;
    }
    const rfqCode =
      selectedRfqParticipant?.code ?? proposalDraft.rfqParticipant?.code ?? null;
    if (!proposalDraft.customer?.id && !rfqCode) {
      toast.error("Select a customer or RFQ participant before saving");
      return;
    }
    if (saveMutation.isPending) return;

    // Sync latest form values into the draft before saving so edits to
    // notes or customer made after "Create Proposal" are captured.
    const updatedDraft: ProposalDraft = {
      ...proposalDraft,
      notes: notes.trim(),
      customer: selectedCustomer ?? proposalDraft.customer,
      rfqParticipant: selectedRfqParticipant ?? proposalDraft.rfqParticipant ?? null,
      manualYieldEnabled,
      manualYield,
    };
    setProposalDraft(updatedDraft);
    void saveMutation.mutateAsync(updatedDraft);
  };

  const handleOpenSavedProposal = (item: ProposalDraft) => {
    setProposalDraft(item);
    setIsin(item.isin);
    setIsinSearch(item.isin);
    setQuantity(String(item.quantity));
    setSide(item.side);
    setSettlementType(item.settlementType ?? "T+0");
    setManualYieldEnabled(Boolean(item.manualYieldEnabled));
    setManualYield(item.manualYield ?? "");
    setNotes(item.notes);
    setSelectedCustomer(item.customer);
    setSelectedRfqParticipant(item.rfqParticipant ?? null);
    setRecipientMode(item.rfqParticipant ? "RFQ_PARTICIPANT" : "CUSTOMER");
    setEditSourceId(null);
    setIsSheetOpen(true);
  };

  const handleEditSavedProposal = (item: ProposalDraft) => {
    // Load the proposal into the form, but do NOT overwrite the existing saved row.
    // Next "Save Proposal" will create a new version linked via `editOfId`.
    setProposalDraft({
      ...item,
      id: crypto.randomUUID(),
      editOfId: item.id,
      createdAt: new Date().toISOString(),
    });
    setIsin(item.isin);
    setIsinSearch(item.isin);
    setQuantity(String(item.quantity));
    setSide(item.side);
    setSettlementType(item.settlementType ?? "T+0");
    setManualYieldEnabled(Boolean(item.manualYieldEnabled));
    setManualYield(item.manualYield ?? "");
    setNotes(item.notes);
    setSelectedCustomer(item.customer);
    setSelectedRfqParticipant(item.rfqParticipant ?? null);
    setRecipientMode(item.rfqParticipant ? "RFQ_PARTICIPANT" : "CUSTOMER");
    setEditSourceId(item.id);
    setIsSheetOpen(true);
    toast.success(`Editing proposal (will save as new version)`);
  };

  const saveMutation = useMutation({
    mutationFn: async (draft: ProposalDraft) => {
      const bondName = draft.fetched?.bond?.bondName || draft.fetched?.bond?.instrumentName || "Bond";
      const customerId = draft.customer?.id ?? null;
      const rfqCode = draft.rfqParticipant?.code?.trim() || null;
      const res = await savedProposalsApi.create({
        customerProfileId: customerId,
        linkedRfqParticipantCode: customerId ? null : rfqCode,
        isin: draft.isin,
        bondName,
        side: draft.side,
        quantity: draft.quantity,
        notes: draft.notes || null,
        data: {
          ...draft,
          editOfId: editSourceId,
        },
      });
      return res.responseData.proposal;
    },
    onSuccess: async (row) => {
      toast.success("Proposal saved");
      if (proposalDraft) {
        setProposalDraft((prev) => (prev ? { ...prev, id: String(row.id) } : prev));
      }
      setEditSourceId(null);
      await queryClient.invalidateQueries({ queryKey: ["crm-saved-proposals"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to save proposal"));
    },
  });

  const autoCreateRfqMutation = useMutation({
    mutationFn: async (proposalId: number) => savedProposalsApi.autoCreateRfq(proposalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm-saved-proposals"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to create ISIN RFQ"));
    },
  });

  const queueProcessingMutation = useMutation({
    mutationFn: async (proposalId: number) => savedProposalsApi.queueProcessing(proposalId),
    onSuccess: () => {
      toast.success("Proposal queued for processing");
      void queryClient.invalidateQueries({ queryKey: ["crm-saved-proposals"] });
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to queue proposal processing"));
    },
  });

  const markWaitingMutation = useMutation({
    mutationFn: async (proposalId: number) => savedProposalsApi.markWaitingForApproval(proposalId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["crm-saved-proposals"] });
    },
    onError: () => undefined,
  });

  // Confirmation dialog for queueing RFQ processing
  const [confirmProcessOpen, setConfirmProcessOpen] = useState(false);
  const [confirmProcessItem, setConfirmProcessItem] = useState<ProposalDraft | null>(null);

  const handleAutoCreateRfqAndGoDealbook = async () => {
    if (!proposalDraft) {
      toast.error("Create a proposal first");
      return;
    }
    const idNum = Number(proposalDraft.id);
    if (!Number.isFinite(idNum)) {
      toast.error("Please save proposal to database first");
      return;
    }
    const res = await autoCreateRfqMutation.mutateAsync(idNum);
    const redirectTo = res?.responseData?.redirectTo || "/dashboard/rfqs/nse";
    router.push(redirectTo);
  };

  const openEmailPreviewForDraft = (draft: ProposalDraft) => {
    setEmailDraftId(Number.isFinite(Number(draft.id)) ? draft.id : null);
    const recipientEmail = proposalRecipientEmail(draft);
    if (!recipientEmail) {
      toast.error("No email on file for this recipient — add email on RFQ Participants or customer profile");
      return;
    }

    const currentProposal = draft.fetched;
    const currentBond = currentProposal.bond;
    const currentPricing = currentProposal.pricing;
    const currentDealAutofill = currentProposal.dealAutofill;

    const faceValue = toNumber(
      currentPricing?.faceValue ??
      currentDealAutofill?.suggested.faceValue ??
      currentBond?.faceValue
    );
    const principalAmount = toNumber(
      currentPricing?.principalAmount ?? currentDealAutofill?.pricing.principalAmount
    );
    const accruedInterest = toNumber(
      currentPricing?.accruedInterest ?? currentDealAutofill?.pricing.totalAccruedInterest
    );
    const totalConsideration = toNumber(
      currentDealAutofill?.pricing.totalConsideration ??
      (principalAmount != null && accruedInterest != null
        ? principalAmount + accruedInterest
        : null)
    );
    const stampDuty = toNumber(currentPricing?.stampDuty);
    const settlementAmount = toNumber(
      currentDealAutofill?.pricing.settlementAmount ?? currentPricing?.settlementAmount
    );
    const rate = toNumber(
      currentDealAutofill?.pricing.finalPrice ??
      currentPricing?.cleanPrice ??
      currentBond?.sellPrice
    );
    const ytmAnn = toNumber(
      currentDealAutofill?.pricing.finalYieldRaw ??
      currentDealAutofill?.suggested.buyYield ??
      currentBond?.buyYield
    );
    const noOfDays = toNumber(
      currentDealAutofill?.pricing.calc?.accrued_days ?? currentPricing?.noOfAccrualDays
    );

    const dealDate =
      currentDealAutofill?.pricing.calc?.settle_dt ??
      currentPricing?.dealDate ??
      draft.createdAt;
    const settlementDate =
      currentDealAutofill?.pricing.calc?.settle_dt ??
      currentPricing?.settlementDate ??
      draft.createdAt;
    const lastIpDate =
      currentPricing?.lastCouponDate ?? currentDealAutofill?.suggested.lastCouponDate ?? null;
    const quantum = faceValue != null ? faceValue * draft.quantity : undefined;

    const payload: SendProposalEmailPayload = {
      toEmail: proposalRecipientEmail(draft),
      customerName: proposalRecipientName(draft),
      gender: proposalRecipientGender(draft),
      side: draft.side,
      bondName: currentBond?.bondName || currentBond?.instrumentName || "Bond",
      isin: draft.isin,
      dealDate,
      settlementDate,
      quantum,
      quantity: draft.quantity,
      rate: rate ?? undefined,
      ytmAnn,
      lastIpDate,
      noOfDays,
      principalAmount,
      accruedInterest,
      totalConsideration,
      stampDuty,
      settlementAmount,
      maturityDate: currentBond?.maturityDate ?? undefined,
      faceValue: faceValue ?? undefined,
      cleanPrice: rate ?? undefined,
      couponRate: toNumber(currentBond?.couponRate),
    };

    setEmailPreview({
      toEmail: payload.toEmail,
      subject: formatEmailSubject(payload.isin, payload.dealDate),
      html: buildEmailPreviewHtml(payload),
      payload,
    });
    setIsEmailPreviewOpen(true);
  };

  const handleSendProposalEmail = async () => {
    if (!proposalDraft) {
      toast.error("Create a proposal first");
      return;
    }
    openEmailPreviewForDraft(proposalDraft);
  };

  const sendEmailForDraft = async (draft: ProposalDraft) => {
    openEmailPreviewForDraft(draft);
  };

  const handleAutoCreateRfqFromSaved = async (draft: ProposalDraft) => {
    const idNum = Number(draft.id);
    if (!Number.isFinite(idNum)) {
      toast.error("Invalid saved proposal id");
      return;
    }
    const res = await autoCreateRfqMutation.mutateAsync(idNum);
    const redirectTo = res?.responseData?.redirectTo || "/dashboard/rfqs/nse";
    toast.success("ISIN RFQ created on NSE");
    router.push(redirectTo);
  };

  const handleConfirmRfqProcessing = async (draft: ProposalDraft) => {
    const idNum = Number(draft.id);
    if (!Number.isFinite(idNum)) return;

    if (isNseParticipantProposal(draft)) {
      await handleAutoCreateRfqFromSaved(draft);
      return;
    }

    await queueProcessingMutation.mutateAsync(idNum);
  };

  const openEditDialog = (item: ProposalDraft) => {
    setEditDialogSource(item);
    setEditQty(String(item.quantity));
    setEditSide(item.side);
    setEditSettlement(item.settlementType ?? "T+0");
    setEditManualYieldEnabled(Boolean(item.manualYieldEnabled));
    setEditManualYield(item.manualYield ?? "");
    setEditCustomer(item.customer);
    setEditNotes(item.notes ?? "");
    setEditDialogOpen(true);
  };

  const handleEditDialogSave = async () => {
    if (!editDialogSource) return;
    const qtyNum = Number(editQty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0 || !Number.isInteger(qtyNum)) {
      toast.error("Quantity must be a positive whole number");
      return;
    }
    if (editManualYieldEnabled) {
      const y = Number(editManualYield);
      if (!Number.isFinite(y) || y <= 0) {
        toast.error("Enter a valid YTM %");
        return;
      }
    }
    try {
      const fetched = await fetchProposalMutation.mutateAsync({
        isin: editDialogSource.isin,
        quantity: qtyNum,
        side: editSide,
        settlementType: editSettlement,
        pricingYield: editManualYieldEnabled ? Number(editManualYield) : null,
      });
      const updatedDraft: ProposalDraft = {
        ...editDialogSource,
        id: crypto.randomUUID(),
        editOfId: editDialogSource.id,
        quantity: qtyNum,
        side: editSide,
        settlementType: editSettlement,
        manualYieldEnabled: editManualYieldEnabled,
        manualYield: editManualYield,
        customer: editCustomer ?? editDialogSource.customer,
        notes: editNotes.trim(),
        fetched,
        createdAt: new Date().toISOString(),
      };
      setEditSourceId(editDialogSource.id);
      await saveMutation.mutateAsync(updatedDraft);
      setEditDialogOpen(false);
      toast.success("Saved as new version");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save edited proposal"));
    }
  };

  const handleCreateRfqFromProposal = () => {
    if (!proposalDraft) {
      toast.error("Create a proposal first");
      return;
    }

    const currentProposal = proposalDraft.fetched;
    const currentBond = currentProposal.bond;
    const currentPricing = currentProposal.pricing;
    const currentDealAutofill = currentProposal.dealAutofill;

    const faceValue = toNumber(
      currentPricing?.faceValue ??
      currentDealAutofill?.suggested.faceValue ??
      currentBond?.faceValue
    );
    const quantum = faceValue != null ? faceValue * proposalDraft.quantity : null;
    const valueInCrores =
      quantum != null && Number.isFinite(quantum) && quantum > 0
        ? quantum / 10_000_000
        : null;
    const yieldValue = toNumber(
      currentDealAutofill?.pricing.finalYieldRaw ??
      currentDealAutofill?.suggested.buyYield ??
      currentBond?.buyYield
    );
    const buySell = proposalDraft.side === "SELL" ? "S" : "B";

    const params = new URLSearchParams({
      isin: proposalDraft.isin,
      buySell,
      quantity: String(proposalDraft.quantity),
    });
    if (valueInCrores != null) {
      params.set("value", String(valueInCrores));
    }
    if (yieldValue != null) {
      params.set("yield", String(yieldValue));
    }

    router.push(`/dashboard/rfqs/nse/create?${params.toString()}`);
  };

  const proposal = proposalDraft?.fetched;
  const bond = proposal?.bond;
  const pricing = proposal?.pricing;
  const dealAutofill = proposal?.dealAutofill;
  const pricingError = proposal?.pricingError;
  const calc = dealAutofill?.pricing?.calc as
    | undefined
    | {
      settle_dt?: string;
      accrued_days?: number;
      final_price?: string;
      final_yield?: string;
      cf_rows?: Array<{
        date: string;
        interest: string;
        principal: string;
        total: string;
      }>;
    };

  const calcAmounts = proposalDraft?.manualYieldEnabled
    ? {
      cleanPrice: safeNumber(dealAutofill?.pricing?.finalPrice),
      principalAmount: safeNumber(dealAutofill?.pricing?.principalAmount),
      accruedInterest: safeNumber(dealAutofill?.pricing?.totalAccruedInterest),
      totalConsideration: safeNumber(dealAutofill?.pricing?.totalConsideration),
      settlementAmount: safeNumber(dealAutofill?.pricing?.settlementAmount),
    }
    : null;

  return (
    <>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Generate Proposal ── */}
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold text-foreground">Generate Proposal</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Fill in the details below to fetch live pricing and generate a proposal.
            </p>
          </div>

          <div className="divide-y divide-border">
            {/* Bond + params row */}
            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Bond Details</p>
              <div className="grid gap-4 sm:grid-cols-[1fr_120px_140px_140px]">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">ISIN</label>
                  <Popover open={isinOpen} onOpenChange={setIsinOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={isinOpen}
                        className="w-full justify-between font-normal shadow-none"
                      >
                        <span className="truncate text-left">{selectedBondLabel}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[420px] p-0" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search by ISIN or bond name..."
                          value={isinSearch}
                          onValueChange={setIsinSearch}
                        />
                        <CommandList>
                          {isinQuery.isLoading ? (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Searching bonds...
                            </div>
                          ) : null}
                          {!isinQuery.isLoading && isinOptions.length === 0 ? (
                            <CommandEmpty>No bonds found.</CommandEmpty>
                          ) : null}
                          {!isinQuery.isLoading && isinOptions.length > 0 ? (
                            <CommandGroup>
                              {isinOptions.map((bondOption) => (
                                <CommandItem
                                  key={bondOption.id}
                                  value={bondOption.isin}
                                  onSelect={() => {
                                    setIsin(bondOption.isin);
                                    setIsinSearch(bondOption.isin);
                                    setIsinOpen(false);
                                  }}
                                  className="items-start py-3"
                                >
                                  <div className="flex min-w-0 flex-1 flex-col">
                                    <span className="font-medium">{bondOption.isin}</span>
                                    <span className="truncate text-xs text-muted-foreground">
                                      {bondOption.bondName || bondOption.instrumentName || "Unnamed Bond"}
                                    </span>
                                  </div>
                                  <Check className={cn("ml-auto h-4 w-4 shrink-0", isin === bondOption.isin ? "opacity-100" : "opacity-0")} />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : null}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Quantity</label>
                  <Input type="number" min="1" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="1" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Side</label>
                  <Select value={side} onValueChange={(value) => setSide(value as "BUY" | "SELL")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL" disabled className="text-muted-foreground">
                        SELL
                        <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium">Coming soon</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Settlement</label>
                  <Select value={settlementType} onValueChange={(value) => setSettlementType(value as "T+0" | "T+1")}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Settlement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T+0">T+0</SelectItem>
                      <SelectItem value="T+1">T+1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Recipient: RFQ participant or customer */}
            <div className="px-6 py-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recipient
                </p>
                <Tabs
                  value={recipientMode}
                  onValueChange={(value) =>
                    handleRecipientModeChange(value as "RFQ_PARTICIPANT" | "CUSTOMER")
                  }
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="RFQ_PARTICIPANT" className="text-xs">
                      RFQ Participant
                    </TabsTrigger>
                    <TabsTrigger value="CUSTOMER" className="text-xs">
                      Customer
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {recipientMode === "RFQ_PARTICIPANT" ? (
                <div className="space-y-3">
                  <SelectRfqParticipantWithInfo
                    value={selectedRfqParticipant}
                    onSelect={(participant) => {
                      void handleRfqParticipantSelect(participant);
                    }}
                    placeholder="Select RFQ participant with saved info…"
                    disabled={isResolvingParticipantCustomer}
                  />
                  {selectedRfqParticipant ? (
                    <>
                      <RfqParticipantInfoCard participant={selectedRfqParticipant} />
                      {selectedCustomer ? (
                        <p className="text-xs text-emerald-700">
                          Linked Meradhan customer: {customerFullName(selectedCustomer)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Saving uses this RFQ participant directly — no Meradhan customer
                          link required. Add email on RFQ Participants for proposal emails.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Only participants enriched on{" "}
                      <span className="font-medium">RFQ Participants</span> appear here. Add
                      contact, bank and demat details there first.
                    </p>
                  )}
                </div>
              ) : (
                <SelectCustomerUser
                  value={selectedCustomer ?? undefined}
                  onSelect={setSelectedCustomer}
                  placeholder="Search and select customer..."
                />
              )}
            </div>

            {/* Manual yield */}
            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Pricing</p>
              <label className="flex cursor-pointer items-start gap-3">
                <Checkbox
                  checked={manualYieldEnabled}
                  onCheckedChange={(value) => setManualYieldEnabled(Boolean(value))}
                  className="mt-0.5"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-700">Use manual YTM for pricing</p>
                  <p className="text-xs text-muted-foreground">Override auto-pricing with a specific YTM %</p>
                </div>
                {manualYieldEnabled && (
                  <Input
                    type="number"
                    step="0.0001"
                    value={manualYield}
                    onChange={(e) => setManualYield(e.target.value)}
                    placeholder="e.g. 13.7500"
                    className="w-36"
                  />
                )}
              </label>
            </div>

            {/* Notes */}
            <div className="px-6 py-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Internal Notes</p>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional context visible only to your team…"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-50 px-6 py-4">
              <Button onClick={handleCreateProposal} disabled={fetchProposalMutation.isPending} className="gap-2">
                {fetchProposalMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Fetching…</>
                  : <><FileText className="h-4 w-4" />Generate Proposal</>}
              </Button>
              <Button
                variant="secondary"
                onClick={handleSaveProposal}
                disabled={!proposalDraft || fetchProposalMutation.isPending || saveMutation.isPending}
                className="gap-2"
              >
                {saveMutation.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                  : <><FileText className="h-4 w-4" />Save Proposal</>}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={fetchProposalMutation.isPending} className="ml-auto text-muted-foreground">
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Reset
              </Button>
            </div>
          </div>
        </div>

        {/* ── Proposal Preview ── */}
        <div className={cn(
          "overflow-hidden rounded-xl border bg-white",
          proposalDraft ? "border-border" : "border-dashed border-border",
        )}>
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold text-foreground">Proposal Preview</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Summary of the latest generated proposal.</p>
          </div>

          {proposalDraft ? (
            <div className="divide-y divide-border">
              {/* Customer chip */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {proposalRecipientName(proposalDraft)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {proposalRecipientEmail(proposalDraft) || "—"}
                    </p>
                    {proposalDraft.rfqParticipant ? (
                      <p className="truncate text-xs text-slate-500">
                        RFQ: {proposalDraft.rfqParticipant.code}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Bond info */}
              <div className="px-5 py-4 space-y-1">
                <p className="truncate text-sm font-semibold text-slate-800">{bond?.bondName || "—"}</p>
                <p className="font-mono text-xs text-slate-400">{proposalDraft.isin}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">{proposalDraft.side}</span>
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">{proposalDraft.settlementType}</span>
                  <span className="text-xs text-slate-500">× {proposalDraft.quantity}</span>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 divide-x divide-border">
                <div className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clean Price</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-slate-800">
                    {formatNumber(dealAutofill?.pricing.finalPrice ?? pricing?.cleanPrice, 4)}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">YTM</p>
                  <p className="mt-1 text-base font-semibold tabular-nums text-slate-800">
                    {dealAutofill?.pricing.finalYieldRaw != null ? `${formatNumber(dealAutofill.pricing.finalYieldRaw, 4)}%` : "—"}
                  </p>
                </div>
              </div>

              {/* Settlement amount hero */}
              <div className="px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Settlement Amount</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
                  {formatCurrency(dealAutofill?.pricing.settlementAmount ?? pricing?.settlementAmount)}
                </p>
                {pricingError ? (
                  <p className="mt-1.5 text-xs text-amber-600">{pricingError}</p>
                ) : null}
              </div>

              {/* Footer */}
              <div className="px-5 py-4">
                <p className="mb-3 text-[11px] text-slate-400">Created {formatDisplayDate(proposalDraft.createdAt)}</p>
                <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(true)}>
                  View full details
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm text-muted-foreground">Generate a proposal to see the pricing summary here.</p>
            </div>
          )}
        </div>
      </div>

      <Card className="mt-5 border-gray-200">
        <CardHeader>
          <CardTitle>Saved Proposals</CardTitle>
          <CardDescription>
            Reopen proposals saved in database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                value={savedSearch}
                onChange={(e) => setSavedSearch(e.target.value)}
                placeholder="Search by ISIN, bond, customer, email..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <SelectCustomerUser
                value={savedCustomerFilter ?? undefined}
                onSelect={setSavedCustomerFilter}
                placeholder="Filter by customer (optional)..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Scope</label>
              <Select value={savedScope} onValueChange={(v) => setSavedScope(v as "MINE" | "ALL")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MINE">My proposals</SelectItem>
                  <SelectItem value="ALL">All proposals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSavedSearch("");
                setSavedCustomerFilter(null);
              }}
              disabled={!savedSearch && !savedCustomerFilter}
            >
              Clear filters
            </Button>
          </div>

          {savedQuery.isLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 p-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading proposals…
            </div>
          ) : proposalGroups.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center text-sm text-muted-foreground">
              No saved proposals yet. Generate and save a proposal above.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-slate-50">
                      <th className="w-9 px-3 py-3" />
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bond / ISIN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Recipient</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Side</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Clean Px</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Settle Amt</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">YTM</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Saved</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposalGroups.map(([rootId, items]) => {
                      const primary = items[0]!;
                      const hasChildren = items.length > 1;
                      const isExpanded = expandedGroups.has(rootId);

                      const renderItemCells = (item: ProposalDraft, isChild = false) => {
                        const deal = item.fetched?.dealAutofill;
                        const manual = item.manualYieldEnabled && item.manualYield?.trim() ? Number(item.manualYield) : null;
                        const calcYtm = deal?.pricing?.finalYieldRaw;
                        const fallbackYtm = deal?.suggested?.yield ?? deal?.suggested?.buyYield ?? (item.fetched?.bond?.buyYield as unknown as number | null | undefined);
                        const ytm =
                          manual != null && Number.isFinite(manual) && manual > 0 ? manual
                            : calcYtm != null && Number.isFinite(Number(calcYtm)) && Number(calcYtm) > 0 ? Number(calcYtm)
                              : fallbackYtm != null && Number.isFinite(Number(fallbackYtm)) && Number(fallbackYtm) > 0 ? Number(fallbackYtm)
                                : null;
                        const bondName = item.fetched?.bond?.bondName || item.fetched?.bond?.instrumentName || "—";
                        const settleAmt = item.fetched?.dealAutofill?.pricing?.settlementAmount ?? item.fetched?.pricing?.settlementAmount;
                        const calcPx = item.fetched?.dealAutofill?.pricing?.finalPrice ?? item.fetched?.pricing?.cleanPrice;

                        return (
                          <>
                            {/* Expand toggle */}
                            <td className="w-9 px-3 py-3.5">
                              {!isChild && hasChildren ? (
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleGroup(rootId); }}
                                  className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-white text-slate-400 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-600"
                                >
                                  {isExpanded
                                    ? <ChevronDown className="h-3.5 w-3.5" />
                                    : <ChevronRight className="h-3.5 w-3.5" />}
                                </button>
                              ) : isChild ? (
                                <span className="pl-2 text-slate-300">└</span>
                              ) : null}
                            </td>

                            {/* Bond / ISIN */}
                            <td className={cn("max-w-[240px] px-4 py-3.5", isChild && "pl-6")}>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">{bondName}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                  <span className="font-mono text-[11px] text-slate-400">{item.isin}</span>
                                  {!isChild && hasChildren && (
                                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                                      {items.length} versions
                                    </span>
                                  )}
                                  {isChild && item.editOfId && (
                                    <span className="font-mono text-[10px] text-slate-400">edit of #{item.editOfId}</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Recipient */}
                            <td className="max-w-[200px] px-4 py-3.5">
                              <p className="truncate text-sm font-medium text-slate-700">
                                {proposalRecipientName(item)}
                              </p>
                              {item.rfqParticipant ? (
                                <p className="truncate font-mono text-[11px] text-slate-400">
                                  {item.rfqParticipant.code}
                                </p>
                              ) : proposalRecipientEmail(item) ? (
                                <p className="truncate text-[11px] text-slate-400">
                                  {proposalRecipientEmail(item)}
                                </p>
                              ) : null}
                            </td>

                            {/* Side */}
                            <td className="px-4 py-3.5">
                              <span className={cn(
                                "text-sm font-semibold",
                                item.side === "SELL" ? "text-red-600" : "text-blue-600",
                              )}>
                                {item.side}
                              </span>
                              <span className="text-slate-400"> · </span>
                              <span className="text-sm text-slate-500">{item.settlementType ?? "T+0"}</span>
                              {item.manualYieldEnabled && (
                                <>
                                  <span className="text-slate-400"> · </span>
                                  <span className="text-sm text-violet-600">{item.manualYield || "—"}%</span>
                                </>
                              )}
                            </td>

                            {/* Qty */}
                            <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-slate-700">
                              {formatInteger(item.quantity)}
                            </td>

                            {/* Clean Price */}
                            <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-slate-700">
                              {formatNumber(calcPx, 4)}
                            </td>

                            {/* Settle Amount */}
                            <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-slate-800 font-medium">
                              {formatCurrency(settleAmt)}
                            </td>

                            {/* YTM */}
                            <td className="px-4 py-3.5 text-right font-mono text-sm tabular-nums text-slate-700">
                              {ytm != null ? `${formatNumber(ytm, 4)}%` : "—"}
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              {item.status === "FAILED" && item.failedNote ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="cursor-help space-y-0.5">
                                      <ProposalStatusBadge status={item.status} />
                                      <p className="max-w-[160px] truncate text-[10px] text-red-500">
                                        {item.failedNote}
                                      </p>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs whitespace-pre-wrap text-xs">
                                    {item.failedNote}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <ProposalStatusBadge status={item.status} />
                              )}
                            </td>

                            {/* Saved date */}
                            <td className="whitespace-nowrap px-4 py-3.5 text-[11px] text-slate-400">
                              {formatDisplayDate(item.createdAt)}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); openEditDialog(item); }}
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit (new version)</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); void sendEmailForDraft(item); }}
                                      disabled={sendProposalEmailMutation.isPending}
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 shadow-sm transition-colors hover:bg-blue-100 disabled:opacity-50"
                                    >
                                      <Mail className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Send proposal email</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmProcessItem(item);
                                        setConfirmProcessOpen(true);
                                      }}
                                      disabled={item.status === "PROCESSING" || item.status === "CONVERTED"}
                                      className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 shadow-sm transition-colors hover:bg-amber-100 disabled:opacity-40"
                                    >
                                      <Zap className="h-3.5 w-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isNseParticipantProposal(item)
                                      ? "Create ISIN RFQ on NSE (step 1 only)"
                                      : "Trigger full RFQ processing"}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          </>
                        );
                      };

                      return (
                        <>
                          <tr
                            key={`group-${rootId}`}
                            onClick={() => handleOpenSavedProposal(primary)}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-slate-50/80",
                              isExpanded && "bg-slate-50/60",
                              primary.status === "CONVERTED" && "bg-emerald-50/30 hover:bg-emerald-50/60",
                              primary.status === "PROCESSING" && "bg-amber-50/30 hover:bg-amber-50/60",
                              primary.status === "FAILED" && "bg-red-50/20 hover:bg-red-50/40",
                            )}
                          >
                            {renderItemCells(primary, false)}
                          </tr>
                          {isExpanded && items.slice(1).map((child) => (
                            <tr
                              key={`child-${child.id}`}
                              onClick={() => handleOpenSavedProposal(child)}
                              className="cursor-pointer bg-indigo-50/40 transition-colors hover:bg-indigo-50/70"
                            >
                              {renderItemCells(child, true)}
                            </tr>
                          ))}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Proposal Sidebar</SheetTitle>
            <SheetDescription>
              Review the fetched order pricing and customer details before using this proposal.
            </SheetDescription>
          </SheetHeader>

          {proposalDraft && bond ? (
            <div className="px-4 pb-6 space-y-6">
              <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">
                      {proposalDraft.isin} • {proposalDraft.side} • {proposalDraft.settlementType}
                    </p>
                    <p className="text-sm font-semibold truncate">
                      {bond.bondName || bond.instrumentName || "—"}
                    </p>
                    {editSourceId ? (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        Editing saved #{editSourceId} (saving creates a new version)
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const source =
                          Number.isFinite(Number(proposalDraft.id))
                            ? proposalDraft.id
                            : editSourceId ?? proposalDraft.editOfId ?? null;
                        if (!source) {
                          toast.error("No history found (save proposal first).");
                          return;
                        }
                        const row = savedDraftById.get(String(source));
                        if (!row) {
                          toast.error("History source not found in list.");
                          return;
                        }
                        openHistory(row);
                      }}
                    >
                      <History className="h-4 w-4" />
                      View history
                    </Button>
                    {editSourceId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditSourceId(null);
                          toast.message("Edit mode cleared");
                        }}
                      >
                        Clear edit
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => void sendEmailForDraft(proposalDraft)}
                      disabled={sendProposalEmailMutation.isPending}
                    >
                      <Mail className="h-4 w-4" />
                      Send Email
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        if (isNseParticipantProposal(proposalDraft)) {
                          setConfirmProcessItem(proposalDraft);
                          setConfirmProcessOpen(true);
                        } else {
                          void handleAutoCreateRfqFromSaved(proposalDraft);
                        }
                      }}
                      disabled={autoCreateRfqMutation.isPending || !Number.isFinite(Number(proposalDraft.id))}
                    >
                      <Zap className="h-4 w-4" />
                      Auto RFQ
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Recipient
                  </p>
                  <h3 className="text-base font-semibold">
                    {proposalRecipientName(proposalDraft)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {proposalRecipientEmail(proposalDraft) || "—"}
                  </p>
                  {proposalDraft.rfqParticipant ? (
                    <div className="mt-3">
                      <RfqParticipantInfoCard participant={proposalDraft.rfqParticipant} />
                    </div>
                  ) : proposalDraft.customer?.phoneNo ? (
                    <p className="text-sm text-muted-foreground">
                      {proposalDraft.customer.phoneNo}
                    </p>
                  ) : null}
                  {proposalDraft.customer ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Linked customer: {customerFullName(proposalDraft.customer)}
                    </p>
                  ) : null}
                </div>

                <Separator />

                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Bond
                  </p>
                  <h3 className="text-base font-semibold">{bond.bondName || "—"}</h3>
                  <p className="text-sm text-muted-foreground">
                    ISIN: {proposalDraft.isin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Side: {proposalDraft.side}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <h4 className="font-semibold">Pricing Summary</h4>
                {pricingError ? (
                  <p className="text-xs text-amber-600">
                    {pricingError}
                  </p>
                ) : null}
                <InfoRow
                  label="Settlement Type"
                  value={proposalDraft.settlementType}
                />
                <InfoRow
                  label="Calc Input Type"
                  value={proposalDraft.manualYieldEnabled ? "Calculate from Yield" : "Auto"}
                />
                <InfoRow
                  label="Pricing Input (YTM %)"
                  value={
                    proposalDraft.manualYieldEnabled
                      ? proposalDraft.manualYield || "—"
                      : calc?.final_yield || "—"
                  }
                />
                <InfoRow
                  label="Face Value"
                  value={formatCurrency(pricing?.faceValue ?? dealAutofill?.suggested.faceValue)}
                />
                <InfoRow
                  label="Clean Price"
                  value={formatNumber(
                    dealAutofill?.pricing.finalPrice ??
                    calcAmounts?.cleanPrice ??
                    pricing?.cleanPrice,
                    4,
                  )}
                />
                <InfoRow
                  label="YTM (Ann)"
                  value={
                    dealAutofill?.pricing.finalYieldRaw != null
                      ? `${formatNumber(dealAutofill.pricing.finalYieldRaw, 4)}%`
                      : "—"
                  }
                />
                <InfoRow
                  label="Coupon Rate"
                  value={`${formatNumber(pricing?.couponRate ?? dealAutofill?.suggested.couponRate, 2)}%`}
                />
                <InfoRow
                  label="Principal Amount"
                  value={formatCurrency(

                    dealAutofill?.pricing.principalAmount,
                  )}
                />
                <InfoRow
                  label="Accrued Interest"
                  value={formatCurrency(
                    dealAutofill?.pricing.totalAccruedInterest ?? calcAmounts?.accruedInterest ??
                    pricing?.accruedInterest
                  )}
                />
                <InfoRow
                  label="Total Consideration"
                  value={formatCurrency(
                    dealAutofill?.pricing.totalConsideration ?? calcAmounts?.totalConsideration
                  )}
                />
                <InfoRow
                  label="Stamp Duty"
                  value={formatCurrency(pricing?.stampDuty)}
                />
                <InfoRow
                  label="Settlement Amount"
                  value={formatCurrency(
                    dealAutofill?.pricing.settlementAmount ??
                    calcAmounts?.settlementAmount ??
                    pricing?.settlementAmount,
                  )}
                />
              </div>

              {calc ? (
                <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                  <h4 className="font-semibold">YTM Calc</h4>
                  <InfoRow label="Settle dt (calc)" value={formatDisplayDate(calc.settle_dt)} />
                  <InfoRow label="Accrued days (calc)" value={formatInteger(calc.accrued_days)} />
                  <InfoRow label="Final price (calc)" value={formatNumber(calc.final_price, 4)} />
                  <InfoRow
                    label="Final yield (calc)"
                    value={calc.final_yield ? `${calc.final_yield}%` : "—"}
                  />

                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-4 bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                      <div>Date</div>
                      <div className="text-right">Interest</div>
                      <div className="text-right">Principal</div>
                      <div className="text-right">Total</div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {(calc.cf_rows ?? []).map((row, idx) => (
                        <div
                          key={`${row.date}-${idx}`}
                          className="grid grid-cols-4 gap-2 px-3 py-2 text-xs border-t border-gray-100"
                        >
                          <div className="truncate">{row.date}</div>
                          <div className="text-right">{formatNumber(row.interest, 2)}</div>
                          <div className="text-right">{formatNumber(row.principal, 2)}</div>
                          <div className="text-right">{formatNumber(row.total, 2)}</div>
                        </div>
                      ))}
                      {(calc.cf_rows ?? []).length === 0 ? (
                        <div className="px-3 py-3 text-xs text-muted-foreground">
                          No cashflow rows returned by calc service.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <h4 className="font-semibold">Deal Timeline</h4>
                <InfoRow
                  label="Deal Date"
                  value={formatDisplayDate(
                    calc?.settle_dt ?? pricing?.dealDate,
                  )}
                />
                <InfoRow
                  label="Settlement Date"
                  value={formatDisplayDate(
                    calc?.settle_dt ??
                    pricing?.settlementDate ??
                    dealAutofill?.pricing.calc.settle_dt,
                  )}
                />
                <InfoRow
                  label="Last Coupon Date"
                  value={formatDisplayDate(pricing?.lastCouponDate ?? dealAutofill?.suggested.lastCouponDate)}
                />
                <InfoRow
                  label="Next Coupon Date"
                  value={formatDisplayDate(
                    dealAutofill?.suggested.nextCouponDate ??
                    (bond.nextCouponDate != null ? String(bond.nextCouponDate) : null),
                  )}
                />
                <InfoRow
                  label="Record Date"
                  value={formatDisplayDate(pricing?.recordDate ?? dealAutofill?.suggested.recordDate)}
                />
                <InfoRow
                  label="Accrual Days"
                  value={String(
                    calc?.accrued_days ?? pricing?.noOfAccrualDays ?? "—",
                  )}
                />
                {pricing?.noOfAccrualDays != null && calc?.accrued_days != null ? (
                  <InfoRow
                    label="Accrual Days (Order Pricing)"
                    value={String(pricing.noOfAccrualDays)}
                  />
                ) : null}
                <InfoRow label="Trade Window" value={pricing?.allowTrade ? "Open" : "—"} />
              </div>

              <div className="rounded-xl border border-gray-200 p-4 space-y-3">
                <h4 className="font-semibold">Instrument Details</h4>
                <InfoRow label="Instrument Name" value={bond.instrumentName || "—"} />
                <InfoRow label="Issuer" value={bond.description || "—"} />
                <InfoRow label="Interest Frequency" value={bond.interestPaymentFrequency || "—"} />
                <InfoRow label="Maturity Date" value={formatDisplayDate(bond.maturityDate)} />
                <InfoRow label="Tax Status" value={bond.taxStatus || "—"} />
                <InfoRow label="Credit Rating" value={bond.creditRating || "—"} />
              </div>

              {proposalDraft.notes ? (
                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <h4 className="font-semibold">Internal Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {proposalDraft.notes}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="px-4 pb-6 text-sm text-muted-foreground">
              No proposal data available yet.
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Review the email content before sending it to the customer.
            </DialogDescription>
          </DialogHeader>

          {emailPreview ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-3 text-sm">
                <div className="flex flex-col gap-1">
                  <div>
                    <span className="text-muted-foreground">To:</span>{" "}
                    <span className="font-medium">{emailPreview.toEmail}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>{" "}
                    <span className="font-medium">{emailPreview.subject}</span>
                  </div>
                </div>
              </div>

              <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-gray-200 p-4">
                <div
                  className="prose prose-xs max-w-none text-xs"
                  dangerouslySetInnerHTML={{ __html: emailPreview.html }}
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No email preview available.</div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsEmailPreviewOpen(false)}
              disabled={sendProposalEmailMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!emailPreview) return;

                // Auto-save the proposal if it hasn't been saved to DB yet
                // (UUID id = unsaved; numeric id = already in DB)
                if (proposalDraft && !Number.isFinite(Number(proposalDraft.id))) {
                  try {
                    const updatedDraft: ProposalDraft = {
                      ...proposalDraft,
                      notes: notes.trim(),
                      customer: selectedCustomer ?? proposalDraft.customer,
                      manualYieldEnabled,
                      manualYield,
                    };
                    setProposalDraft(updatedDraft);
                    await saveMutation.mutateAsync(updatedDraft);
                  } catch {
                    // save failed — still attempt to send the email
                  }
                }

                await sendProposalEmailMutation.mutateAsync(emailPreview.payload);
                setIsEmailPreviewOpen(false);
              }}
              disabled={!emailPreview || sendProposalEmailMutation.isPending || saveMutation.isPending}
            >
              {sendProposalEmailMutation.isPending || saveMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {saveMutation.isPending ? "Saving…" : "Sending…"}
                </>
              ) : (
                "Send Email"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Proposal history</DialogTitle>
            <DialogDescription>
              All versions for this proposal chain (latest first).
            </DialogDescription>
          </DialogHeader>

          {historyRootId ? (
            <div className="rounded-xl border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>ISIN</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Settlement</TableHead>
                    <TableHead>Manual YTM</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getHistoryItems(historyRootId).map((v) => (
                    <TableRow key={`hist-${v.id}`}>
                      <TableCell className="font-mono text-xs">#{v.id}</TableCell>
                      <TableCell className="font-mono text-xs">{v.isin}</TableCell>
                      <TableCell>
                        <Pill
                          label={v.side}
                          variant={v.side === "SELL" ? "destructive" : "secondary"}
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatInteger(v.quantity)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {v.settlementType ?? "T+0"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {v.manualYieldEnabled ? `${v.manualYield || "—"}%` : "—"}
                      </TableCell>
                      <TableCell className="tabular-nums">{formatDisplayDate(v.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              handleOpenSavedProposal(v);
                              setHistoryOpen(false);
                            }}
                          >
                            Open
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleEditSavedProposal(v);
                              setHistoryOpen(false);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-muted-foreground">
              No history found.
            </div>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setHistoryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Inline Edit Dialog ── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Proposal</DialogTitle>
            <DialogDescription>
              Adjust the parameters and save — this creates a new version linked to the original.
            </DialogDescription>
          </DialogHeader>

          {editDialogSource && (
            <div className="space-y-4 py-1">
              {/* Bond info (read-only) */}
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">
                  {editDialogSource.fetched?.bond?.bondName || editDialogSource.fetched?.bond?.instrumentName || "—"}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">{editDialogSource.isin}</p>
              </div>

              {/* Quantity · Side · Settlement in one row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Quantity</label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Side</label>
                  <Select value={editSide} onValueChange={(v) => setEditSide(v as "BUY" | "SELL")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL" disabled className="text-muted-foreground">
                        SELL <span className="ml-1 text-[10px]">Coming soon</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settlement</label>
                  <Select value={editSettlement} onValueChange={(v) => setEditSettlement(v as "T+0" | "T+1")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="T+0">T+0</SelectItem>
                      <SelectItem value="T+1">T+1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Manual yield */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3">
                <Checkbox
                  checked={editManualYieldEnabled}
                  onCheckedChange={(v) => setEditManualYieldEnabled(Boolean(v))}
                />
                <span className="flex-1 text-sm font-medium">Manual YTM pricing</span>
                {editManualYieldEnabled && (
                  <Input
                    type="number"
                    step="0.0001"
                    value={editManualYield}
                    onChange={(e) => setEditManualYield(e.target.value)}
                    placeholder="e.g. 13.7500"
                    className="w-32"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </label>

              {/* Customer */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</label>
                <SelectCustomerUser
                  value={editCustomer ?? undefined}
                  onSelect={setEditCustomer}
                  placeholder="Search customer..."
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Internal Notes</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional notes…"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={fetchProposalMutation.isPending || saveMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleEditDialogSave} disabled={fetchProposalMutation.isPending || saveMutation.isPending}>
              {fetchProposalMutation.isPending || saveMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" />{saveMutation.isPending ? "Saving…" : "Fetching…"}</>
                : "Save new version"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirm RFQ Processing Dialog ── */}
      <Dialog open={confirmProcessOpen} onOpenChange={setConfirmProcessOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              {confirmProcessItem && isNseParticipantProposal(confirmProcessItem)
                ? "Confirm Create ISIN RFQ"
                : "Confirm RFQ Processing"}
            </DialogTitle>
            <DialogDescription>
              {confirmProcessItem && isNseParticipantProposal(confirmProcessItem)
                ? "Review the proposal below. Confirming will post the add-ISIN RFQ to NSE for this participant (first step only). Negotiation and deal steps are done separately on the RFQ manage screen."
                : "Review the proposal details below. Confirming will queue this proposal for automated NSE RFQ execution."}
            </DialogDescription>
          </DialogHeader>

          {confirmProcessItem && (() => {
            const item = confirmProcessItem;
            const participantProposal = isNseParticipantProposal(item);
            const bond = item.fetched?.bond;
            const pricing = item.fetched?.pricing;
            const deal = item.fetched?.dealAutofill;
            const calcPx = deal?.pricing?.finalPrice ?? calcAmounts?.cleanPrice ?? pricing?.cleanPrice;
            const settleAmt = deal?.pricing?.settlementAmount ?? pricing?.settlementAmount;
            const ytmRaw = deal?.pricing?.finalYieldRaw;
            const idNum = Number(item.id);

            return (
              <div className="space-y-4 py-1">
                {/* Bond block */}
                <div className="rounded-lg bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {bond?.bondName || bond?.instrumentName || "—"}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">{item.isin}</p>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="text-muted-foreground">
                    {participantProposal ? "RFQ participant" : "Customer"}
                  </div>
                  <div className="font-medium text-slate-800">
                    {proposalRecipientName(item)}
                  </div>

                  <div className="text-muted-foreground">Email</div>
                  <div className="truncate text-slate-600">
                    {proposalRecipientEmail(item) || "—"}
                  </div>

                  <div className="text-muted-foreground">Side</div>
                  <div className={cn("font-semibold", item.side === "SELL" ? "text-red-600" : "text-blue-600")}>
                    {item.side}
                  </div>

                  <div className="text-muted-foreground">Settlement</div>
                  <div className="text-slate-700">{item.settlementType ?? "T+0"}</div>

                  <div className="text-muted-foreground">Quantity</div>
                  <div className="tabular-nums text-slate-700">{formatInteger(item.quantity)}</div>

                  <div className="text-muted-foreground">Clean Price</div>
                  <div className="tabular-nums text-slate-700">{formatNumber(calcPx, 4)}</div>

                  <div className="text-muted-foreground">YTM</div>
                  <div className="tabular-nums text-slate-700">
                    {ytmRaw != null ? `${formatNumber(ytmRaw, 4)}%` : item.manualYieldEnabled ? `${item.manualYield}% (manual)` : "—"}
                  </div>

                  <div className="text-muted-foreground">Settlement Amt</div>
                  <div className="font-semibold tabular-nums text-slate-900">{formatCurrency(settleAmt)}</div>

                  <div className="text-muted-foreground">Status</div>
                  <div><ProposalStatusBadge status={item.status} /></div>

                  <div className="text-muted-foreground">Saved</div>
                  <div className="text-slate-600">{formatDisplayDate(item.createdAt)}</div>
                </div>

                {!Number.isFinite(idNum) && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    This proposal has not been saved to the database yet. Please save it first.
                  </p>
                )}
              </div>
            );
          })()}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmProcessOpen(false)}
              disabled={
                queueProcessingMutation.isPending || autoCreateRfqMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={
                queueProcessingMutation.isPending ||
                autoCreateRfqMutation.isPending ||
                !Number.isFinite(Number(confirmProcessItem?.id))
              }
              onClick={async () => {
                if (!confirmProcessItem) return;
                const idNum = Number(confirmProcessItem.id);
                if (!Number.isFinite(idNum)) return;
                await handleConfirmRfqProcessing(confirmProcessItem);
                setConfirmProcessOpen(false);
              }}
            >
              {queueProcessingMutation.isPending || autoCreateRfqMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {confirmProcessItem && isNseParticipantProposal(confirmProcessItem)
                    ? "Creating ISIN RFQ…"
                    : "Queuing…"}
                </>
              ) : confirmProcessItem && isNseParticipantProposal(confirmProcessItem) ? (
                <>
                  <Zap className="h-4 w-4" />
                  Confirm & Create ISIN
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Confirm & Queue
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ProposalManagementView;
