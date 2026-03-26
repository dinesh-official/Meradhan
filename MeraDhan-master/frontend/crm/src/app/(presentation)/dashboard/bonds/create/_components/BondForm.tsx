"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodResolver } from "@hookform/resolvers/zod";
import { appSchema } from "@root/schema";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useForm, type Resolver } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";

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
          ? new Date(initialData.ratingDate)
          : undefined,
        categories: initialData.categories || [],
        sectorName: initialData.sectorName || undefined,
        dateOfAllotment: initialData.dateOfAllotment
          ? new Date(initialData.dateOfAllotment)
          : undefined,
        redemptionDate: initialData.redemptionDate
          ? new Date(initialData.redemptionDate)
          : undefined,
        maturityDate: initialData.maturityDate
          ? new Date(initialData.maturityDate)
          : undefined,
        sortedAt: initialData.sortedAt || 0,
        isConvertedDeal: initialData.isConvertedDeal || undefined,
        yield: initialData.yield || undefined,
        lastTradePrice: initialData.lastTradePrice || undefined,
        lastTradeYield: initialData.lastTradeYield || undefined,
        nextCouponDate: initialData.nextCouponDate
          ? new Date(initialData.nextCouponDate)
          : undefined,
        modeOfIssuance: initialData.modeOfIssuance || undefined,
        couponType: initialData.couponType || undefined,
        buyYield: initialData.buyYield || undefined,
        providerName: initialData.providerName || undefined,
        providerInterestDate: initialData.providerInterestDate
          ? new Date(initialData.providerInterestDate)
          : undefined,
        providerQuantity: initialData.providerQuantity || undefined,
        isOngoingDeal: initialData.isOngoingDeal ?? false,
        providerPrice: initialData.providerPrice || undefined,
        ignoreAutoUpdate: initialData.ignoreAutoUpdate ?? false,
      }
      : {
        isin: "",
        bondName: "",
        instrumentName: "",
        description: "",
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
      },
  });

  const createMutation = useMutation({
    mutationFn: (data: BondFormData) => apiCaller.createBond(data),
    onSuccess: () => {
      toast.success("Bond created successfully");
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      router.push("/dashboard/bonds");
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
      router.push("/dashboard/bonds");
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as { message: string })?.message ||
        error?.message ||
        "Failed to update bond"
      );
    },
  });

  const onSubmit = (data: BondFormData) => {
    if (isUpdateMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseFloat(e.target.value) : 0
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
                  name="couponRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coupon Rate (%) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                  name="lastTradePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Trade Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                  name="lastTradeYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Trade Yield (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                  name="buyYield"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buy Yield (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                  name="nextCouponDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Coupon Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
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
                                : undefined
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
                      <FormLabel>Provider Interest Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(field.value as unknown as string)
                                .toISOString()
                                .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? new Date(e.target.value) : null
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
    </div>
  );
}

export default BondForm;
