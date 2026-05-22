"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
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
import apiGateway, { type BondDetailsResponse, type CustomerProfile } from "@root/apiGateway";
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
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
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

function buildEmailPreviewHtml(params: SendProposalEmailPayload) {
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
    ["Clean Price", cleanPriceDisplay],
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
    <p>Dear Mr. / Ms. ${params.customerName},</p>
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
  isin: string;
  quantity: number;
  notes: string;
  side: "BUY" | "SELL";
  settlementType: "T+0" | "T+1";
  manualYieldEnabled: boolean;
  manualYield: string;
  customer: CustomerProfile;
  fetched: ProposalFetchResult;
  createdAt: string;
};

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
  const sendProposalEmailMutation = useMutation({
    mutationFn: async (payload: SendProposalEmailPayload) => ordersApi.sendProposalEmail(payload),
    onSuccess: () => {
      toast.success("Proposal email sent successfully");
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to send proposal email"));
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
      const customerName = customerFullName(item.customer).toLowerCase();
      const email = (item.customer?.emailAddress || "").toLowerCase();
      const isin = (item.isin || "").toLowerCase();

      return (
        isin.includes(q) ||
        bondName.toLowerCase().includes(q) ||
        customerName.includes(q) ||
        email.includes(q)
      );
    });
  }, [savedCustomerFilter?.id, savedDrafts, savedSearch]);

  const handleReset = () => {
    setIsin("");
    setIsinSearch("");
    setSide("BUY");
    setSettlementType("T+0");
    setManualYieldEnabled(false);
    setManualYield("");
    setQuantity("1");
    setNotes("");
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
    if (!selectedCustomer) {
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
    if (saveMutation.isPending) return;

    // Sync latest form values into the draft before saving so edits to
    // notes or customer made after "Create Proposal" are captured.
    const updatedDraft: ProposalDraft = {
      ...proposalDraft,
      notes: notes.trim(),
      customer: selectedCustomer ?? proposalDraft.customer,
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
    setEditSourceId(item.id);
    setIsSheetOpen(true);
    toast.success(`Editing proposal (will save as new version)`);
  };

  const saveMutation = useMutation({
    mutationFn: async (draft: ProposalDraft) => {
      const bondName = draft.fetched?.bond?.bondName || draft.fetched?.bond?.instrumentName || "Bond";
      const res = await savedProposalsApi.create({
        customerProfileId: draft.customer.id,
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
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, "Failed to auto create RFQ"));
    },
  });

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
    const redirectTo = res?.responseData?.redirectTo || "/dashboard/rfqs/nse/deals";
    router.push(redirectTo);
  };

  const openEmailPreviewForDraft = (draft: ProposalDraft) => {
    if (!draft.customer.emailAddress) {
      toast.error("Selected customer does not have an email address");
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
      toEmail: draft.customer.emailAddress,
      customerName: customerFullName(draft.customer),
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
    const redirectTo = res?.responseData?.redirectTo || "/dashboard/rfqs/nse/deals";
    router.push(redirectTo);
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
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>Generate Proposal</CardTitle>
            <CardDescription>
              Enter the ISIN, customer, and quantity to fetch pricing and proposal-ready bond data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ISIN</label>
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
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4 shrink-0",
                                    isin === bondOption.isin ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ) : null}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Proposal Side</label>
                <Select value={side} onValueChange={(value) => setSide(value as "BUY" | "SELL")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select side" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Settlement Date</label>
                <Select
                  value={settlementType}
                  onValueChange={(value) => setSettlementType(value as "T+0" | "T+1")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select settlement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T+0">T+0</SelectItem>
                    <SelectItem value="T+1">T+1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Manual yield based pricing</label>
              <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
                <Checkbox
                  checked={manualYieldEnabled}
                  onCheckedChange={(value) => setManualYieldEnabled(Boolean(value))}
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">Use manual YTM for calc</p>
                  <p className="text-xs text-muted-foreground">
                    Optional. If enabled and YTM is provided, pricing is calculated using this yield.
                  </p>
                </div>
              </div>
              {manualYieldEnabled ? (
                <div className="flex flex-col gap-2 md:max-w-[240px]">
                  <Input
                    type="number"
                    step="0.0001"
                    value={manualYield}
                    onChange={(e) => setManualYield(e.target.value)}
                    placeholder="Enter YTM % (e.g. 13.7500)"
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <SelectCustomerUser
                value={selectedCustomer ?? undefined}
                onSelect={setSelectedCustomer}
                placeholder="Search and select customer..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Internal Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional context for the proposal..."
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCreateProposal}
                disabled={fetchProposalMutation.isPending}
              >
                {fetchProposalMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching proposal
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate Proposal
                  </>
                )}
              </Button>
              <Button
                variant="secondary"
                onClick={handleSaveProposal}
                disabled={!proposalDraft || fetchProposalMutation.isPending || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Save Proposal
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={fetchProposalMutation.isPending}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-dashed border-gray-200">
          <CardHeader>
            <CardTitle>Proposal Preview</CardTitle>
            <CardDescription>
              The latest fetched proposal summary appears here and opens in the right sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposalDraft ? (
              <>
                <div className="rounded-lg bg-muted/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <UserRound className="h-4 w-4" />
                    {customerFullName(proposalDraft.customer)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {proposalDraft.customer.emailAddress || "No email available"}
                  </p>
                </div>

                <InfoRow label="ISIN" value={proposalDraft.isin} />
                <InfoRow label="Side" value={proposalDraft.side} />
                <InfoRow label="Settlement" value={proposalDraft.settlementType} />
                <InfoRow label="Bond" value={bond?.bondName || "—"} />
                <InfoRow label="Quantity" value={String(proposalDraft.quantity)} />
                <InfoRow
                  label="Calc Price"
                  value={
                    formatCurrency(
                      dealAutofill?.pricing.finalPrice ??
                      pricing?.cleanPrice ??
                      dealAutofill?.suggested.sellPrice,
                    )
                  }
                />
                <InfoRow
                  label="Calc Settlement Amount"
                  value={formatCurrency(dealAutofill?.pricing.settlementAmount ?? pricing?.settlementAmount)}
                />
                {pricingError ? (
                  <p className="text-xs text-amber-600">
                    {pricingError}
                  </p>
                ) : null}
                <InfoRow label="Created" value={formatDisplayDate(proposalDraft.createdAt)} />

                <Button variant="outline" className="w-full" onClick={() => setIsSheetOpen(true)}>
                  Open sidebar preview
                </Button>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-muted-foreground">
                Create a proposal to preview the fetched pricing, customer information, and bond details.
              </div>
            )}
          </CardContent>
        </Card>
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
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-muted-foreground">
              Loading saved proposals...
            </div>
          ) : savedProposalsToRender.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-muted-foreground">
              No saved proposals yet.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ISIN</TableHead>
                    <TableHead>Bond</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead>Settle</TableHead>
                    <TableHead className="text-right">Calc Px</TableHead>
                    <TableHead className="text-right">Settle Amt</TableHead>
                    <TableHead className="text-right">YTM</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Saved</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedProposalsToRender.map((item) => {
                    const deal = item.fetched?.dealAutofill;
                    const manual =
                      item.manualYieldEnabled && item.manualYield?.trim()
                        ? Number(item.manualYield)
                        : null;
                    const calcYtm = deal?.pricing?.finalYieldRaw;
                    const fallbackYtm =
                      deal?.suggested?.yield ??
                      deal?.suggested?.buyYield ??
                      (item.fetched?.bond?.buyYield as unknown as number | null | undefined);
                    const ytm =
                      manual != null && Number.isFinite(manual) && manual > 0
                        ? manual
                        : calcYtm != null && Number.isFinite(Number(calcYtm)) && Number(calcYtm) > 0
                          ? Number(calcYtm)
                          : fallbackYtm != null && Number.isFinite(Number(fallbackYtm)) && Number(fallbackYtm) > 0
                            ? Number(fallbackYtm)
                            : null;

                    const bondName =
                      item.fetched?.bond?.bondName ||
                      item.fetched?.bond?.instrumentName ||
                      "—";

                    const settleAmt =
                      item.fetched?.dealAutofill?.pricing?.settlementAmount ??
                      item.fetched?.pricing?.settlementAmount;

                    const calcPx =
                      item.fetched?.dealAutofill?.pricing?.finalPrice ??
                      item.fetched?.pricing?.cleanPrice;

                    return (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() => handleOpenSavedProposal(item)}
                      >
                        <TableCell className="font-mono text-xs">{item.isin}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{bondName}</TableCell>
                        <TableCell className="max-w-[220px] truncate">
                          <div className="min-w-0">
                            <div className="truncate">{customerFullName(item.customer)}</div>
                            {item.customer?.emailAddress ? (
                              <div className="truncate text-xs text-muted-foreground">
                                {item.customer.emailAddress}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Pill
                              label={item.side}
                              variant={item.side === "SELL" ? "destructive" : "secondary"}
                            />
                            <Pill label={item.settlementType ?? "T+0"} variant="outline" />
                            {item.manualYieldEnabled ? (
                              <Pill label={`Manual ${item.manualYield || "—"}%`} />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatInteger(item.quantity)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-full">
                            {item.settlementType ?? "T+0"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(calcPx, 4)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(settleAmt)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {ytm != null ? `${formatNumber(ytm, 4)}%` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {(item as ProposalDraft).editOfId ? (
                            <span className="font-mono">edit of #{(item as ProposalDraft).editOfId}</span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="tabular-nums">{formatDisplayDate(item.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSavedProposal(item);
                              }}
                            >
                              Open
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditSavedProposal(item);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openHistory(item);
                              }}
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void sendEmailForDraft(item);
                              }}
                              disabled={sendProposalEmailMutation.isPending}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void handleAutoCreateRfqFromSaved(item);
                              }}
                              disabled={autoCreateRfqMutation.isPending}
                            >
                              <Zap className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
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
                      onClick={() => void handleAutoCreateRfqFromSaved(proposalDraft)}
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
                    Customer
                  </p>
                  <h3 className="text-base font-semibold">
                    {customerFullName(proposalDraft.customer)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {proposalDraft.customer.emailAddress || "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {proposalDraft.customer.phoneNo || "—"}
                  </p>
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
                    calcAmounts?.cleanPrice ??
                    pricing?.cleanPrice ??
                    dealAutofill?.pricing.finalPrice,
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
                    calcAmounts?.principalAmount ??
                    pricing?.principalAmount ??
                    dealAutofill?.pricing.principalAmount,
                  )}
                />
                <InfoRow
                  label="Accrued Interest"
                  value={formatCurrency(
                    calcAmounts?.accruedInterest ??
                    pricing?.accruedInterest ??
                    dealAutofill?.pricing.totalAccruedInterest,
                  )}
                />
                <InfoRow
                  label="Total Consideration"
                  value={formatCurrency(
                    calcAmounts?.totalConsideration ?? dealAutofill?.pricing.totalConsideration,
                  )}
                />
                <InfoRow
                  label="Stamp Duty"
                  value={formatCurrency(pricing?.stampDuty)}
                />
                <InfoRow
                  label="Settlement Amount"
                  value={formatCurrency(
                    calcAmounts?.settlementAmount ??
                    dealAutofill?.pricing.settlementAmount ??
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
    </>
  );
}

export default ProposalManagementView;
