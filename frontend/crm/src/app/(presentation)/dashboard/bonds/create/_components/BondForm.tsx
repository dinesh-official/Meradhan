"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DecimalInput } from "@/components/ui/decimal-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "@/components/ui/rich-text-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodResolver } from "@hookform/resolvers/zod";
import { appSchema } from "@root/schema";
import apiGateway from "@root/apiGateway";
import type { BondDealAutofillResponse } from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import {
  formatDateForDateInput,
  parseApiDateStringToLocalDate,
} from "../../_utils/bondCalendarDates";
import { BondLogoField } from "../../_components/BondLogoField";

const OPTIONAL_ENUM_NONE = "__none__" as const;

/** Buy yield must exist before deal autofill — margin/yield chain needs it on the bond row. */
function hasBondBuyYield(v: unknown): boolean {
  if (v == null || v === "") return false;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n);
}

type BondFormData = z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>;
const bondSchema = appSchema.bonds
  .bondCreateUpdateSchema as unknown as z.ZodType<BondFormData>;
const bondResolver = (
  zodResolver as unknown as (schema: z.ZodTypeAny) => Resolver<BondFormData>
)(bondSchema as z.ZodTypeAny);
type BondDetailsResponse = {
  id: number;
  isin: string;
  bondName: string;
  instrumentName: string;
  description: string;
  issuerDescription?: string | null;
  issuePrice: number;
  faceValue: number;
  stampDutyPercentage: number | null;
  allowForPurchase: boolean | null;
  couponRate: number;
  interestPaymentFrequency: string;
  putCallOptionDetails: string | null;
  certificateNumbers: string | null;
  totalIssueSize: number | null;
  registrarDetails: string | null;
  physicalSecurityAddress: string | null;
  defaultedInRedemption: string | null;
  debentureTrustee: string | null;
  creditRatingInfo: string | null;
  remarks: string | null;
  taxStatus: string;
  creditRating: string;
  interestPaymentMode: string;
  isListed: string;
  ratingAgencyName: string | null;
  ratingDate: string | null;
  categories: string[];
  sectorName: string | null;
  dateOfAllotment: string | null;
  redemptionDate: string | null;
  maturityDate: string | null;
  sortedAt: number;
  isConvertedDeal: boolean | null;
  yield: number | null;
  lastTradePrice: number | null;
  lastTradeYield: number | null;
  nextCouponDate: string | null;
  modeOfIssuance: string | null;
  couponType: string | null;
  buyYield: number | null;
  providerName: string | null;
  providerInterestDate: string | null;
  providerQuantity: number | null;
  isOngoingDeal: boolean | null;
  providerPrice: number | null;
  ignoreAutoUpdate: boolean | null;
  allCouponDates?: string[] | Date[];
  dayConvention?: string | null;
  recordDate?: string | null;
  recordDays?: number | null;
  imDocumentLink?: string | null;
  logoUrl?: string | null;
  exchangeListedOn?: string | null;
  lastCouponDate?: string | null;
  isPerpetual?: boolean | null;
  bondType?: string | null;
  seniority?: string | null;
  natureOfInstrument?: string | null;
  buyPrice?: number | null;
  sellPrice?: number | null;
  redemptionType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

interface BondFormProps {
  initialData?: BondDetailsResponse | null;
  isin?: string;
}

const TAX_TYPE_OPTIONS = [
  { value: "TAX_FREE", label: "Tax Free" },
  { value: "TAXABLE", label: "Taxable" },
  { value: "TAX_SAVING", label: "Tax Saving" },
  { value: "TAX_EXEMPTION", label: "Tax Exemption" },
  { value: "UNKNOWN", label: "Unknown" },
];

const IS_LISTED_OPTIONS = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "UNKNOWN", label: "Unknown" },
];

const INTEREST_MODE_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "ON_MATURITY", label: "On Maturity" },
  { value: "UNKNOWN", label: "Unknown" },
];

const BOND_TYPE_OPTIONS = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "TAX_FREE", label: "Tax Free" },
  { value: "SOVEREIGN_GOLD_BOND", label: "Sovereign Gold Bond" },
  { value: "PSU", label: "PSU" },
  { value: "OTHER", label: "Other" },
];

const BOND_SENIORITY_OPTIONS = [
  { value: "SENIOR", label: "Senior" },
  { value: "TIER_2_SUBORDINATED", label: "Tier 2 Subordinated" },
  {
    value: "LOWER_TIER_II_SUBORDINATED",
    label: "Lower Tier II Subordinated",
  },
  { value: "UNKNOWN", label: "Unknown" },
];

const NATURE_OF_INSTRUMENT_OPTIONS = [
  { value: "SECURED", label: "Secured" },
  { value: "UNSECURED", label: "Unsecured" },
  { value: "UNKNOWN", label: "Unknown" },
];

const STOCK_EXCHANGE_OPTIONS = [
  { value: "BSE", label: "BSE" },
  { value: "NSE", label: "NSE" },
  { value: "BOTH", label: "BSE & NSE" },
  { value: "UNKNOWN", label: "Unknown" },
];

/** Slugs must match MeraDhan `/bonds/...` filters and `bond.service` `categories.has` */
const BOND_LISTING_CATEGORY_OPTIONS = [
  { value: "corporate", label: "Corporate" },
  { value: "banks", label: "Bank bonds" },
  { value: "nbfc", label: "NBFC" },
  { value: "psu", label: "PSU" },
  { value: "tax-free", label: "Tax free" },
  { value: "zero-coupon", label: "Zero coupon" },
  { value: "perpetual", label: "Perpetual" },
  { value: "latest-release", label: "Latest release" },
] as const;

function BondForm({ initialData, isin }: BondFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const apiCaller = new apiGateway.bondsApi.BondsApi(apiClientCaller);
  const isUpdateMode = !!isin && !!initialData;

  const form = useForm<BondFormData>({
    resolver: bondResolver,
    defaultValues: initialData
      ? {
        isin: initialData.isin,
        bondName: initialData.bondName,
        instrumentName: initialData.instrumentName,
        description: initialData.description,
        issuerDescription: initialData.issuerDescription || undefined,
        issuePrice: initialData.issuePrice,
        faceValue: initialData.faceValue,
        stampDutyPercentage: initialData.stampDutyPercentage ?? 0,
        allowForPurchase: initialData.allowForPurchase ?? false,
        couponRate: initialData.couponRate,
        interestPaymentFrequency: initialData.interestPaymentFrequency,
        putCallOptionDetails: initialData.putCallOptionDetails || undefined,
        certificateNumbers: initialData.certificateNumbers || undefined,
        totalIssueSize: initialData.totalIssueSize || undefined,
        registrarDetails: initialData.registrarDetails || undefined,
        physicalSecurityAddress:
          initialData.physicalSecurityAddress || undefined,
        defaultedInRedemption: initialData.defaultedInRedemption || undefined,
        debentureTrustee: initialData.debentureTrustee || undefined,
        creditRatingInfo: initialData.creditRatingInfo || undefined,
        remarks: initialData.remarks || undefined,
        taxStatus: initialData.taxStatus as
          | "TAX_FREE"
          | "TAXABLE"
          | "TAX_SAVING"
          | "TAX_EXEMPTION"
          | "UNKNOWN",
        creditRating: initialData.creditRating,
        interestPaymentMode: initialData.interestPaymentMode as
          | "MONTHLY"
          | "QUARTERLY"
          | "HALF_YEARLY"
          | "YEARLY"
          | "ON_MATURITY"
          | "UNKNOWN",
        isListed: initialData.isListed as "YES" | "NO" | "UNKNOWN",
        ratingAgencyName: initialData.ratingAgencyName || undefined,
        ratingDate: initialData.ratingDate
          ? parseApiDateStringToLocalDate(String(initialData.ratingDate))
          : undefined,
        categories: initialData.categories || [],
        sectorName: initialData.sectorName || undefined,
        dateOfAllotment: initialData.dateOfAllotment
          ? parseApiDateStringToLocalDate(String(initialData.dateOfAllotment))
          : undefined,
        redemptionDate: initialData.redemptionDate
          ? parseApiDateStringToLocalDate(String(initialData.redemptionDate))
          : undefined,
        maturityDate: initialData.maturityDate
          ? parseApiDateStringToLocalDate(String(initialData.maturityDate))
          : undefined,
        sortedAt: initialData.sortedAt || 0,
        isConvertedDeal: initialData.isConvertedDeal || undefined,
        yield: initialData.yield || undefined,
        lastTradePrice: initialData.lastTradePrice || undefined,
        lastTradeYield: initialData.lastTradeYield || undefined,
        nextCouponDate: initialData.nextCouponDate
          ? parseApiDateStringToLocalDate(String(initialData.nextCouponDate))
          : undefined,
        modeOfIssuance: initialData.modeOfIssuance || undefined,
        couponType: initialData.couponType || undefined,
        buyYield: initialData.buyYield || undefined,
        providerName: initialData.providerName || undefined,
        providerInterestDate: initialData.providerInterestDate
          ? parseApiDateStringToLocalDate(String(initialData.providerInterestDate))
          : undefined,
        providerQuantity: initialData.providerQuantity || undefined,
        isOngoingDeal: initialData.isOngoingDeal ?? false,
        providerPrice: initialData.providerPrice || undefined,
        ignoreAutoUpdate: initialData.ignoreAutoUpdate ?? false,
        allCouponDates: (initialData.allCouponDates ?? []).map((d) =>
          typeof d === "string"
            ? parseApiDateStringToLocalDate(d)
            : d instanceof Date
              ? d
              : parseApiDateStringToLocalDate(String(d)),
        ),
        dayConvention: initialData.dayConvention || undefined,
        recordDate: initialData.recordDate
          ? parseApiDateStringToLocalDate(String(initialData.recordDate))
          : undefined,
        recordDays:
          initialData.recordDays != null && Number.isFinite(initialData.recordDays)
            ? Math.round(Number(initialData.recordDays))
            : 0,
        imDocumentLink: initialData.imDocumentLink || undefined,
        exchangeListedOn:
          (initialData.exchangeListedOn as BondFormData["exchangeListedOn"]) ||
          undefined,
        lastCouponDate: initialData.lastCouponDate
          ? parseApiDateStringToLocalDate(String(initialData.lastCouponDate))
          : undefined,
        isPerpetual: initialData.isPerpetual ?? undefined,
        bondType:
          (initialData.bondType as BondFormData["bondType"]) || undefined,
        seniority:
          (initialData.seniority as BondFormData["seniority"]) || undefined,
        natureOfInstrument:
          (initialData.natureOfInstrument as BondFormData["natureOfInstrument"]) ||
          undefined,
        buyPrice: initialData.buyPrice ?? undefined,
        sellPrice: initialData.sellPrice ?? undefined,
        redemptionType: initialData.redemptionType || undefined,
        startDate: initialData.startDate
          ? parseApiDateStringToLocalDate(String(initialData.startDate))
          : undefined,
        endDate: initialData.endDate
          ? parseApiDateStringToLocalDate(String(initialData.endDate))
          : undefined,
      }
      : {
        isin: "",
        bondName: "",
        instrumentName: "",
        description: "",
        issuerDescription: "",
        issuePrice: 0,
        faceValue: 0,
        stampDutyPercentage: 0,
        allowForPurchase: false,
        couponRate: 0,
        interestPaymentFrequency: "",
        taxStatus: "UNKNOWN",
        creditRating: "UnRated",
        interestPaymentMode: "UNKNOWN",
        isListed: "UNKNOWN",
        categories: [],
        sortedAt: 0,
        isOngoingDeal: false,
        ignoreAutoUpdate: false,
        allCouponDates: [],
        recordDays: 0,
      },
  });

  const createMutation = useMutation({
    mutationFn: (data: BondFormData) => apiCaller.createBond(data),
    onSuccess: () => {
      toast.success("Bond created successfully");
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as { message: string })?.message ||
        error?.message ||
        "Failed to create bond"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: BondFormData) => apiCaller.updateBond(isin!, data),
    onSuccess: () => {
      toast.success("Bond updated successfully");
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["bond", isin] });
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as { message: string })?.message ||
        error?.message ||
        "Failed to update bond"
      );
    },
  });

  const [buyYieldPromptOpen, setBuyYieldPromptOpen] = useState(false);
  const [buyYieldDraft, setBuyYieldDraft] = useState("");
  const [buyYieldError, setBuyYieldError] = useState<string | null>(null);

  const parseCalcAmount = (s: string | null | undefined): number | null => {
    if (s == null || !String(s).trim()) return null;
    const n = Number(String(s).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  };

  const formatInr = (n: number | null | undefined) =>
    n != null && Number.isFinite(n)
      ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
      : "—";

  const buildDealAutofillParams = (opts?: { pricingYield?: number }) => {
    const v = form.getValues();
    const providerQuantity =
      v.providerQuantity != null && Number(v.providerQuantity) > 0
        ? Number(v.providerQuantity)
        : undefined;
    const providerPrice =
      v.providerPrice != null && Number(v.providerPrice) > 0
        ? Number(v.providerPrice)
        : undefined;

    return {
      quantity: providerQuantity ?? 1,
      automatedSettlement: true as const,
      ...(providerPrice != null ? { providerPrice } : {}),
      ...(providerQuantity != null ? { providerQuantity } : {}),
      ...(opts?.pricingYield != null && Number.isFinite(opts.pricingYield)
        ? { pricingYield: opts.pricingYield }
        : {}),
    };
  };

  const calcResultToast = (
    data: BondDealAutofillResponse,
    prefix: string,
    s: BondDealAutofillResponse["suggested"],
  ) => {
    const sale =
      s.sellPrice != null
        ? `₹${s.sellPrice.toLocaleString("en-IN", { maximumFractionDigits: 4 })}`
        : "—";
    const dueHint = s.dueDate ? ` Due ${s.dueDate}.` : "";
    const settlementAmt =
      data.pricing.settlementAmount ??
      parseCalcAmount(data.pricing.calc?.settlement_amount);
    const accruedAmt =
      data.pricing.totalAccruedInterest ??
      parseCalcAmount(data.pricing.calc?.total_ai);
    const providerHints: string[] = [];
    if (data.sources.usedProviderPrice) providerHints.push("provider price");
    if (data.sources.usedProviderQuantity) providerHints.push("provider qty");
    if (data.sources.usedProviderSettlementDate) providerHints.push("provider date");
    const providerHint =
      providerHints.length > 0 ? ` Used ${providerHints.join(", ")}.` : "";
    toast.success(
      `${prefix} sale price (clean) ${sale}, yield ${Number.isFinite(s.yield) ? `${s.yield}%` : "—"}.${dueHint} Settlement ${formatInr(settlementAmt)}, accrued ${formatInr(accruedAmt)} (${data.sources.yieldSource} yield).${providerHint}`,
    );
  };

  const applyDealAutofillResult = (data: BondDealAutofillResponse) => {
    const s = data.suggested;
    if (s.bondName?.trim()) form.setValue("bondName", s.bondName.trim());
    if (s.creditRating?.trim()) form.setValue("creditRating", s.creditRating.trim());
    if (s.allCouponDates?.length) {
      const dates = s.allCouponDates
        .map((ymd) => {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd.trim())) return null;
          const [y, m, d] = ymd.trim().split("-").map(Number);
          const dt = new Date(y, m - 1, d);
          return Number.isNaN(dt.getTime()) ? null : dt;
        })
        .filter((d): d is Date => d != null);
      if (dates.length) form.setValue("allCouponDates", dates);
    }
    if (s.natureOfInstrument) {
      form.setValue(
        "natureOfInstrument",
        s.natureOfInstrument as BondFormData["natureOfInstrument"],
      );
    }
    /** Parse `YYYY-MM-DD` as local calendar date (avoids UTC off-by-one in some timezones). */
    const toDate = (ymd: string | null | undefined) => {
      if (!ymd?.trim()) return undefined;
      const s = ymd.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? undefined : dt;
      }
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };
    const md = toDate(s.maturityDate);
    if (md) form.setValue("maturityDate", md);
    const allot = toDate(s.dateOfAllotment);
    if (allot) form.setValue("dateOfAllotment", allot);
    const lc = toDate(s.lastCouponDate);
    if (lc) form.setValue("lastCouponDate", lc);
    const nc = toDate(s.nextCouponDate);
    if (nc) form.setValue("nextCouponDate", nc);
    const rec = toDate(s.recordDate ?? undefined);
    if (rec) form.setValue("recordDate", rec);
    if (s.recordDays != null && Number.isFinite(s.recordDays)) {
      form.setValue("recordDays", s.recordDays);
    }
    if (s.dayConvention != null) form.setValue("dayConvention", s.dayConvention);
    if (s.interestPaymentFrequency) {
      form.setValue(
        "interestPaymentFrequency",
        s.interestPaymentFrequency as BondFormData["interestPaymentFrequency"],
      );
    }
    if (s.interestPaymentMode) {
      form.setValue(
        "interestPaymentMode",
        s.interestPaymentMode as BondFormData["interestPaymentMode"],
      );
    }
    if (Number.isFinite(s.faceValue)) form.setValue("faceValue", s.faceValue);
    if (Number.isFinite(s.couponRate)) form.setValue("couponRate", s.couponRate);
    if (s.buyYield != null && Number.isFinite(s.buyYield)) {
      form.setValue("buyYield", s.buyYield);
    }
    if (Number.isFinite(s.yield)) form.setValue("yield", s.yield);
    if (s.sellPrice != null && Number.isFinite(s.sellPrice)) {
      form.setValue("sellPrice", s.sellPrice);
    }
    calcResultToast(data, "Filled:", s);
  };

  const autofillErrorToast = (error: AxiosError) => {
    toast.error(
      (error?.response?.data as { message: string })?.message ||
      error?.message ||
      "Could not auto-fill from calculator",
    );
  };

  const dealAutofillMutation = useMutation({
    mutationFn: async (opts?: { pricingYield?: number }) => {
      const res = await apiCaller.getBondDealAutofillCalc(
        isin!,
        buildDealAutofillParams({ pricingYield: opts?.pricingYield }),
      );
      return res.responseData;
    },
    onSuccess: (data) => {
      if (data) applyDealAutofillResult(data);
    },
    onError: autofillErrorToast,
  });

  const saveBuyYieldAndAutofillMutation = useMutation({
    mutationFn: async (buyYield: number) => {
      await apiCaller.updateBond(isin!, { ...form.getValues(), buyYield });
      form.setValue("buyYield", buyYield);
      await queryClient.invalidateQueries({ queryKey: ["bond", isin] });
      await queryClient.invalidateQueries({ queryKey: ["bonds"] });
      const res = await apiCaller.getBondDealAutofillCalc(
        isin!,
        buildDealAutofillParams(),
      );
      return res.responseData;
    },
    onSuccess: (data) => {
      if (data) {
        applyDealAutofillResult(data);
        setBuyYieldPromptOpen(false);
        setBuyYieldDraft("");
        setBuyYieldError(null);
      }
    },
    onError: (error: AxiosError) => {
      setBuyYieldError(
        (error?.response?.data as { message?: string })?.message ||
        error?.message ||
        "Could not save buy yield or auto-fill",
      );
      toast.error(
        (error?.response?.data as { message: string })?.message ||
        error?.message ||
        "Could not save buy yield or auto-fill",
      );
    },
  });

  const parseYieldPercent = (v: unknown): number | undefined => {
    if (v == null || v === "") return undefined;
    const n = typeof v === "number" ? v : Number(String(v).trim().replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };

  const onCalcBySellYieldClick = () => {
    if (!isin) return;
    if (!hasBondBuyYield(form.getValues("buyYield"))) {
      setBuyYieldDraft("");
      setBuyYieldError(null);
      setBuyYieldPromptOpen(true);
      return;
    }
    const py = parseYieldPercent(form.getValues("yield"));
    if (py == null) {
      toast.error("Enter a valid sell yield (%) first.");
      return;
    }
    dealAutofillMutation.mutate({ pricingYield: py });
  };

  const submitBuyYieldThenAutofill = () => {
    const raw = buyYieldDraft.trim().replace(/,/g, "");
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) {
      setBuyYieldError("Enter a valid buy yield (%).");
      return;
    }
    setBuyYieldError(null);
    saveBuyYieldAndAutofillMutation.mutate(n);
  };

  const onSubmit = (data: BondFormData) => {
    if (isUpdateMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    dealAutofillMutation.isPending ||
    saveBuyYieldAndAutofillMutation.isPending;

  const dealAutofillBusy =
    dealAutofillMutation.isPending || saveBuyYieldAndAutofillMutation.isPending;

  return (
    <div className="container mx-auto py-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the bond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {isUpdateMode && isin ? (
                  <BondLogoField
                    isin={isin}
                    initialLogoUrl={initialData?.logoUrl}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="isin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISIN *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter ISIN"
                          disabled={isUpdateMode}
                        />
                      </FormControl>
                      <FormDescription>
                        International Securities Identification Number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bondName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bond Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter bond name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuerDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Issuer Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value || ""}
                          onChange={field.onChange}
                          placeholder="About the issuer — shown under the Issuer tab on the bond detail page"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instrumentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrument Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter instrument name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sectorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter sector name"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Listing categories</FormLabel>
                      <FormDescription>
                        Controls which MeraDhan bond listing filters include this
                        ISIN (stored as <code className="text-xs">categories</code>{" "}
                        in the database). Use the same slugs as the public site
                        (e.g. tax-free, banks).
                      </FormDescription>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {BOND_LISTING_CATEGORY_OPTIONS.map((opt) => {
                          const list = field.value ?? [];
                          const checked = list.includes(opt.value);
                          return (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(v) => {
                                  const on = v === true;
                                  if (on && !list.includes(opt.value)) {
                                    field.onChange([...list, opt.value]);
                                  } else if (!on) {
                                    field.onChange(
                                      list.filter((c) => c !== opt.value),
                                    );
                                  }
                                }}
                              />
                              {opt.label}
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-muted-foreground text-xs pt-2">
                        Other values already saved on this bond are kept on
                        submit even if not listed above.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter bond description"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              <CardDescription>
                Enter pricing and financial information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="issuePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Price *</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          emptyAsZero
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="faceValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Face Value *</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          emptyAsZero
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stampDutyPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stamp Duty Percentage (%)</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          emptyAsZero
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="couponRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Rate (%) *</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          emptyAsZero
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalIssueSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Issue Size</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowForPurchase"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4  md:col-span-3 transition-colors hover:bg-primary/10 hover:border-primary/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold text-primary">
                          Allow For Purchase
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Enable this bond to be available for purchase
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-5 w-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interest & Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Interest & Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interestPaymentFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Payment Frequency *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Monthly, Quarterly"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interestPaymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Payment Mode *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INTEREST_MODE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tax & Listing Status */}
          <Card>
            <CardHeader>
              <CardTitle>Tax & Listing Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="taxStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Status *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tax status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TAX_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isListed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Is Listed *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select listing status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {IS_LISTED_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Rating</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., AAA, AA+"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfAllotment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Allotment</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseApiDateStringToLocalDate(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redemptionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Redemption Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseApiDateStringToLocalDate(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maturityDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maturity Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseApiDateStringToLocalDate(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Coupon schedule & instrument */}
          <Card>
            <CardHeader>
              <CardTitle>Coupon schedule &amp; instrument</CardTitle>
              <CardDescription>
                Coupon dates, listing, pricing, and instrument classification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="allCouponDates"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>All coupon dates</FormLabel>
                      <FormDescription>
                        One date per line (YYYY-MM-DD), or comma-separated
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder={"2026-06-15\n2026-12-15"}
                          value={(field.value ?? [])
                            .filter((d) => {
                              const x =
                                d instanceof Date
                                  ? d
                                  : parseApiDateStringToLocalDate(String(d));
                              return !Number.isNaN(x.getTime());
                            })
                            .map((d) =>
                              formatDateForDateInput(
                                d instanceof Date
                                  ? d
                                  : parseApiDateStringToLocalDate(String(d)),
                              ),
                            )
                            .join("\n")}
                          onChange={(e) => {
                            const lines = e.target.value
                              .split(/[\n,]+/)
                              .map((s) => s.trim())
                              .filter(Boolean);
                            const dates: Date[] = [];
                            for (const line of lines) {
                              const dt = parseApiDateStringToLocalDate(line);
                              if (!Number.isNaN(dt.getTime())) dates.push(dt);
                            }
                            field.onChange(dates);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dayConvention"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day convention</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 30/360, ACT/365"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record date (shut period)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseApiDateStringToLocalDate(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record days *</FormLabel>
                      <FormDescription>
                        Whole calendar days relative to record date (may be negative)
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          step={1}
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseInt(e.target.value, 10),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imDocumentLink"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>IM document link</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://…"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="exchangeListedOn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange listed on</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(
                            v === OPTIONAL_ENUM_NONE ? null : v,
                          )
                        }
                        value={field.value ?? OPTIONAL_ENUM_NONE}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select exchange" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OPTIONAL_ENUM_NONE}>
                            Not set
                          </SelectItem>
                          {STOCK_EXCHANGE_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastCouponDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last coupon date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseApiDateStringToLocalDate(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPerpetual"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 md:col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel>Is perpetual</FormLabel>
                        <FormDescription>
                          Yes if the bond has no fixed maturity
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-5 w-5 rounded border-2 cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bondType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bond type</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(
                            v === OPTIONAL_ENUM_NONE ? null : v,
                          )
                        }
                        value={field.value ?? OPTIONAL_ENUM_NONE}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select bond type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OPTIONAL_ENUM_NONE}>
                            Not set
                          </SelectItem>
                          {BOND_TYPE_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seniority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seniority</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(
                            v === OPTIONAL_ENUM_NONE ? null : v,
                          )
                        }
                        value={field.value ?? OPTIONAL_ENUM_NONE}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select seniority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OPTIONAL_ENUM_NONE}>
                            Not set
                          </SelectItem>
                          {BOND_SENIORITY_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="natureOfInstrument"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nature of instrument</FormLabel>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(
                            v === OPTIONAL_ENUM_NONE ? null : v,
                          )
                        }
                        value={field.value ?? OPTIONAL_ENUM_NONE}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Secured / Unsecured" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={OPTIONAL_ENUM_NONE}>
                            Not set
                          </SelectItem>
                          {NATURE_OF_INSTRUMENT_OPTIONS.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy price</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sellPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sell price</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="redemptionType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Redemption type</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Call, Put, Bullet"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseApiDateStringToLocalDate(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseApiDateStringToLocalDate(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Optional details and remarks about the bond
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="putCallOptionDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Put/Call Option Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter put/call option details"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="certificateNumbers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certificate Numbers</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter certificate numbers"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="registrarDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registrar Details</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter registrar details"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="physicalSecurityAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Security Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter physical security address"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="debentureTrustee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debenture Trustee</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter debenture trustee"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultedInRedemption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Defaulted in Redemption</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter defaulted redemption details"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creditRatingInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit Rating Info</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter credit rating information"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ratingAgencyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating Agency Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter rating agency name"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ratingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseApiDateStringToLocalDate(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter any additional remarks"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Bond Details */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Bond Details</CardTitle>
              <CardDescription>
                Additional fields for bond trading and provider information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="yield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yield - Offered / Sell (%)</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                      {isUpdateMode && isin ? (
                        <button
                          type="button"
                          className="text-primary hover:underline text-left text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
                          disabled={dealAutofillBusy}
                          onClick={onCalcBySellYieldClick}
                        >
                          Calc by my sell yield
                        </button>
                      ) : null}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastTradePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Trade Price</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastTradeYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Trade Yield (%)</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Yield (%)</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextCouponDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Coupon Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseApiDateStringToLocalDate(e.target.value) : null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modeOfIssuance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode of Issuance</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter mode of issuance"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="couponType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Type</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter coupon type"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider Information */}
          <Card>
            <CardHeader>
              <CardTitle>Provider Information</CardTitle>
              <CardDescription>
                Provider details and ongoing deal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="providerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter provider name"
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Price</FormLabel>
                      <FormControl>
                        <DecimalInput
                          {...field}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseInt(e.target.value, 10)
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="providerInterestDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider interest date (reference)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? formatDateForDateInput(field.value as Date)
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseApiDateStringToLocalDate(e.target.value)
                                : null,
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Stored on the bond for reference.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isOngoingDeal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4 md:col-span-2 transition-colors hover:bg-primary/10 hover:border-primary/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold text-primary">
                          Is Ongoing Deal
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Mark this bond as an ongoing deal
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-5 w-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ignoreAutoUpdate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4 md:col-span-3 transition-colors hover:bg-primary/10 hover:border-primary/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-semibold text-primary">
                          Ignore Auto Update
                        </FormLabel>
                        <FormDescription className="text-sm">
                          Prevent automatic updates to this bond
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-5 w-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdateMode ? "Update Bond" : "Create Bond"}
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={buyYieldPromptOpen} onOpenChange={setBuyYieldPromptOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Enter buy yield</DialogTitle>
            <DialogDescription>
              Buy yield is required before we can run pricing calc. It will be saved on this bond, then sale price and dates will load.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <label htmlFor="buy-yield-autofill" className="text-sm font-medium leading-none">
              Buy yield (%)
            </label>
            <Input
              id="buy-yield-autofill"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="e.g. 7.25"
              value={buyYieldDraft}
              aria-invalid={Boolean(buyYieldError)}
              onChange={(e) => {
                setBuyYieldDraft(e.target.value);
                if (buyYieldError) setBuyYieldError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitBuyYieldThenAutofill();
                }
              }}
              disabled={saveBuyYieldAndAutofillMutation.isPending}
            />
            {buyYieldError ? (
              <p className="text-destructive text-xs">{buyYieldError}</p>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setBuyYieldPromptOpen(false)}
              disabled={saveBuyYieldAndAutofillMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitBuyYieldThenAutofill}
              disabled={saveBuyYieldAndAutofillMutation.isPending}
              className="gap-2"
            >
              {saveBuyYieldAndAutofillMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Save &amp; fill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BondForm;
