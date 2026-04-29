"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiGateway, {
  type CreateRazorpayRouteAccountPayload,
  type RazorpayRouteAccountRecord,
  type UpdateRazorpayRouteAccountPayload,
} from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/core/utils/getErrorMessage";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BUSINESS_TYPES = [
  "llp",
  "ngo",
  "other",
  "individual",
  "partnership",
  "proprietorship",
  "public_limited",
  "private_limited",
  "trust",
  "society",
  "not_yet_registered",
  "educational_institutes",
] as const;

const CATEGORIES = [
  "financial_services",
  "education",
  "healthcare",
  "utilities",
  "government",
  "logistics",
  "tours_and_travel",
  "transport",
  "ecommerce",
  "food",
  "it_and_software",
  "gaming",
  "media_and_entertainment",
  "services",
  "housing",
  "not_for_profit",
  "social",
  "others",
] as const;

const SUBCATEGORIES_BY_CATEGORY: Partial<Record<(typeof CATEGORIES)[number], string[]>> = {
  financial_services: [
    "mutual_fund",
    "lending",
    "cryptocurrency",
    "insurance",
    "nbfc",
    "cooperatives",
    "pension_fund",
    "forex",
    "securities",
    "commodities",
    "accounting",
    "financial_advisor",
    "crowdfunding",
    "trading",
    "betting",
    "get_rich_schemes",
    "moneysend_funding",
    "wire_transfers_and_money_orders",
    "tax_preparation_services",
    "tax_payments",
    "digital_goods",
    "atms",
  ],
  education: ["college", "schools", "university", "professional_courses", "coaching", "elearning"],
  healthcare: ["pharmacy", "clinic", "hospital", "lab", "fitness", "health_products"],
  ecommerce: ["ecommerce_marketplace", "books", "electronics_and_furniture", "fashion_and_lifestyle", "grocery"],
  services: ["consulting", "legal", "repair_and_cleaning", "event_planning", "ad_and_marketing"],
  housing: ["developer", "facility_management", "rwa", "coworking", "space_rental"],
  food: ["restaurant", "catering", "online_food_ordering", "food_court"],
  it_and_software: ["saas", "paas", "iaas", "web_development", "technical_support", "data_processing"],
  others: ["others"],
};

const schema = z.object({
  razorpayAccountId: z.string().optional(),
  isDefault: z.boolean().optional(),
  email: z.string().email(),
  phone: z.string().min(8).max(15),
  reference_id: z.string().optional(),
  business_type: z.enum(BUSINESS_TYPES),
  legal_business_name: z.string().min(4),
  contact_name: z.string().min(2),
  profile: z.object({
    category: z.enum(CATEGORIES),
    subcategory: z.string().min(1),
    addresses: z.object({
      registered: z.object({
        street1: z.string().optional(),
        street2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        postal_code: z.string().optional(),
        country: z.string().optional(),
      }),
    }),
  }),
  legal_info: z.object({
    pan: z.string().optional(),
    gst: z.string().optional(),
  }),
});

type FormValues = z.infer<typeof schema>;
type UpdateValues = UpdateRazorpayRouteAccountPayload;

function mapRecordToForm(record: RazorpayRouteAccountRecord): Partial<FormValues> {
  const d = (record.data ?? {}) as Record<string, any>;
  const prof = (d.profile ?? {}) as Record<string, any>;
  const add = (prof.addresses ?? {}) as Record<string, any>;
  const reg = (add.registered ?? {}) as Record<string, any>;
  const legal = (d.legal_info ?? {}) as Record<string, any>;
  const postalCode =
    reg.postal_code === null || reg.postal_code === undefined
      ? ""
      : String(reg.postal_code).replace(/\D/g, "").slice(0, 6);

  return {
    razorpayAccountId: record.razorpayAccountId,
    isDefault: record.isDefault ?? false,
    email: d.email ?? "",
    phone: typeof d.phone === "string" ? d.phone.replace(/^\+?91/, "") : "",
    reference_id: d.reference_id ?? "",
    business_type: (d.business_type ?? "private_limited") as FormValues["business_type"],
    legal_business_name: d.legal_business_name ?? "",
    contact_name: d.contact_name ?? "",
    profile: {
      category: (prof.category ?? "financial_services") as FormValues["profile"]["category"],
      subcategory: prof.subcategory ?? "trading",
      addresses: {
        registered: {
          street1: reg.street1 ?? "",
          street2: reg.street2 ?? "",
          city: reg.city ?? "",
          state: reg.state ?? "",
          postal_code: postalCode,
          country: reg.country ?? "IN",
        },
      },
    },
    legal_info: {
      pan: legal.pan ?? "",
      gst: legal.gst ?? "",
    },
  };
}

export default function RazorpayRouteAccountForm(props: {
  mode: "create" | "update";
  razorpayAccountId?: string;
}) {
  const queryClient = useQueryClient();
  const routesApi = useMemo(
    () => new apiGateway.crm.crmRazorpayRoutesApi(apiClientCaller),
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      razorpayAccountId: "",
      isDefault: false,
      email: "",
      phone: "",
      reference_id: "",
      business_type: "private_limited",
      legal_business_name: "",
      contact_name: "",
      profile: {
        category: "financial_services",
        subcategory: "trading",
        addresses: { registered: { street1: "", street2: "", city: "", state: "", postal_code: "", country: "IN" } },
      },
      legal_info: { pan: "", gst: "" },
    },
  });

  const selectedCategory = form.watch("profile.category");
  const subcategoryOptions =
    SUBCATEGORIES_BY_CATEGORY[selectedCategory] ?? [];

  const recordQuery = useQuery({
    enabled: props.mode === "update" && !!props.razorpayAccountId,
    queryKey: ["crmRazorpayRouteAccountById", props.razorpayAccountId],
    queryFn: async () => routesApi.getRouteAccountById(props.razorpayAccountId!),
  });

  useEffect(() => {
    if (recordQuery.data?.responseData?.account) {
      form.reset(mapRecordToForm(recordQuery.data.responseData.account));
    }
  }, [recordQuery.data, form]);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateRazorpayRouteAccountPayload) =>
      routesApi.createRouteAccountDbOnly(payload as CreateRazorpayRouteAccountPayload & { razorpayAccountId: string }),
    onSuccess: async () => {
      toast.success("Linked account created");
      await queryClient.invalidateQueries({ queryKey: ["crmRazorpayRouteAccounts"] });
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Could not create linked account.");
      toast.error("Create failed", { description: message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateValues) =>
      routesApi.updateRouteAccountDbOnly(props.razorpayAccountId!, payload),
    onSuccess: async () => {
      toast.success("Linked account updated");
      await queryClient.invalidateQueries({ queryKey: ["crmRazorpayRouteAccounts"] });
      await queryClient.invalidateQueries({
        queryKey: ["crmRazorpayRouteAccountById", props.razorpayAccountId],
      });
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Could not update linked account.");
      toast.error("Update failed", { description: message });
    },
  });

  const isUpdate = props.mode === "update";
  const isBusy =
    createMutation.isPending || updateMutation.isPending || recordQuery.isLoading;

  const toUpdatePayload = (values: FormValues): UpdateValues => ({
    legal_business_name: values.legal_business_name,
    contact_name: values.contact_name,
    profile: values.profile,
    legal_info: values.legal_info,
    ...(typeof values.isDefault === "boolean" ? { isDefault: values.isDefault } : {}),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isUpdate ? "Update linked account" : "Create linked account"}</CardTitle>
        <CardDescription>
          {isUpdate
            ? "Updates the stored linked account payload in DB (no Razorpay call)."
            : "Stores a linked account record in DB only (no Razorpay call)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => {
              if (!isUpdate) {
                const id = String(values.razorpayAccountId ?? "").trim();
                if (!id) {
                  toast.error("Razorpay account id is required");
                  return;
                }
                createMutation.mutate({ ...values, razorpayAccountId: id });
                return;
              }
              updateMutation.mutate(toUpdatePayload(values));
            })}
          >
            {!isUpdate && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="razorpayAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razorpay account id</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} placeholder="acc_XXXXXXXXXXXX" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {isUpdate && (
              <div className="rounded-lg border p-4 text-sm">
                <span className="text-muted-foreground">Account id: </span>
                <span className="font-mono">{props.razorpayAccountId}</span>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={!!field.value}
                        onCheckedChange={(v) => field.onChange(!!v)}
                        disabled={isBusy}
                      />
                    </FormControl>
                    <div className="ml-3 space-y-1 leading-none">
                      <FormLabel>Make as default</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Default linked account will be used for Razorpay payment flows.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="legal_business_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal business name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy || isUpdate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy || isUpdate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isBusy || isUpdate}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map((v) => (
                            <SelectItem key={v} value={v}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reference_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference id (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isBusy || isUpdate} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>Business category, subcategory and registered address.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="profile.category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isBusy}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isBusy}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {(subcategoryOptions.length ? subcategoryOptions : ["others"]).map((v) => (
                              <SelectItem key={v} value={v}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.addresses.registered.street1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street 1</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile.addresses.registered.street2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street 2</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile.addresses.registered.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile.addresses.registered.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile.addresses.registered.postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          placeholder="560034"
                          onChange={(e) =>
                            field.onChange(
                              e.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                          disabled={isBusy}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profile.addresses.registered.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-base">Legal info</CardTitle>
                <CardDescription>PAN and GST (optional based on KYC requirements).</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="legal_info.pan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legal_info.gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isBusy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={isUpdate ? updateMutation.isPending : createMutation.isPending}>
                {isUpdate
                  ? (updateMutation.isPending ? "Updating..." : "Update account")
                  : (createMutation.isPending ? "Creating..." : "Create account")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

