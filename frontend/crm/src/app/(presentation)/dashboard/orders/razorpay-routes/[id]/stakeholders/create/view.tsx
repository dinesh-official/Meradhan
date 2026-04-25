"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiGateway, {
  type CreateRazorpayStakeholderPayload,
  type CrmUsersProfile,
} from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import OrdersSectionTabs from "../../../../_components/OrdersSectionTabs";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
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
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  addresses: z.object({
    residential: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(4),
      country: z.string().min(2),
    }),
  }),
  kyc: z.object({
    pan: z.string().min(10).max(10),
  }),
  notes: z
    .object({
      key: z.string().optional(),
      value: z.string().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export default function StakeholderCreateView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const razorpayAccountId = params?.id;
  const [selectedUser, setSelectedUser] = useState<CrmUsersProfile | undefined>();

  const stakeholdersApi = useMemo(
    () => new apiGateway.crm.crmRazorpayStakeholdersApi(apiClientCaller),
    []
  );

  const customerApi = useMemo(
    () => new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller),
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      addresses: {
        residential: {
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "IN",
        },
      },
      kyc: { pan: "" },
      notes: { key: "random_key", value: "random_value" },
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateRazorpayStakeholderPayload) =>
      stakeholdersApi.create(razorpayAccountId!, payload),
    onSuccess: async (res) => {
      toast.success("Stakeholder created");
      await queryClient.invalidateQueries({
        queryKey: ["crmRazorpayRouteStakeholders", razorpayAccountId],
      });
      const stakeholderId =
        res?.responseData?.record?.razorpayStakeholderId ??
        (res?.responseData?.stakeholder as any)?.id;
      if (stakeholderId) {
        router.push(
          `/dashboard/orders/razorpay-routes/${encodeURIComponent(razorpayAccountId!)}/stakeholders/${encodeURIComponent(stakeholderId)}`
        );
      } else {
        router.back();
      }
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Could not create stakeholder.");
      toast.error("Create failed", { description: message });
    },
  });

  const kycAutofillMutation = useMutation({
    mutationFn: async (user: CrmUsersProfile) => {
      const customersRes = await customerApi.getCustomer({
        page: "1",
        search: user.email,
      });

      const customer = customersRes.data?.responseData?.data?.[0];
      if (!customer) return null;

      // PAN can be present directly on the customer profile.
      const panFromProfile =
        (customer as any)?.panCard?.panCardNo ??
        (customer as any)?.panCardNo ??
        undefined;

      // Corporate KYC carries correspondence address + entity PAN.
      const corporateKycRes = await customerApi.getCorporateKyc(customer.id);
      const corporateKyc = corporateKycRes.data?.responseData ?? null;

      return {
        pan: (corporateKyc?.panNumber ?? panFromProfile) as string | undefined,
        correspondence: corporateKyc
          ? {
              line1: corporateKyc.correspondenceLine1 ?? "",
              line2: corporateKyc.correspondenceLine2 ?? "",
              city: corporateKyc.correspondenceCity ?? "",
              state: corporateKyc.correspondenceState ?? "",
              postalCode: corporateKyc.correspondencePinCode ?? "",
            }
          : null,
      };
    },
    onSuccess: (kyc) => {
      if (!kyc) return;

      if (kyc.pan && typeof kyc.pan === "string") {
        form.setValue("kyc.pan", kyc.pan.trim().toUpperCase(), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }

      if (kyc.correspondence) {
        const street = [kyc.correspondence.line1, kyc.correspondence.line2]
          .map((s) => s?.trim())
          .filter(Boolean)
          .join(" ");

        if (street) {
          form.setValue("addresses.residential.street", street, { shouldDirty: true });
        }
        if (kyc.correspondence.city) {
          form.setValue("addresses.residential.city", kyc.correspondence.city, {
            shouldDirty: true,
          });
        }
        if (kyc.correspondence.state) {
          form.setValue("addresses.residential.state", kyc.correspondence.state, {
            shouldDirty: true,
          });
        }
        if (kyc.correspondence.postalCode) {
          form.setValue("addresses.residential.postal_code", kyc.correspondence.postalCode, {
            shouldDirty: true,
          });
        }
        form.setValue("addresses.residential.country", "IN", { shouldDirty: true });
      }
    },
  });

  const toPayload = (values: FormValues): CreateRazorpayStakeholderPayload => {
    const notes =
      values.notes?.key && values.notes?.value
        ? { [values.notes.key]: values.notes.value }
        : undefined;

    return {
      ...(selectedUser?.id ? { userId: selectedUser.id } : {}),
      name: values.name,
      email: values.email,
      addresses: values.addresses,
      kyc: values.kyc,
      ...(notes ? { notes } : {}),
    };
  };

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Create stakeholder"
        description="Creates a stakeholder on Razorpay and stores it in your database."
      />

      <div className="mt-5 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stakeholder details</CardTitle>
            <CardDescription>Account: {razorpayAccountId}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit((values) =>
                  mutation.mutate(toPayload(values))
                )}
              >
                <div className="space-y-2">
                  <FormLabel>Search user (optional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <SelectRoleUser
                        placeholder="Search user..."
                        value={selectedUser}
                        onSelect={(user) => {
                          if (!user) return;
                          setSelectedUser(user);
                          form.setValue("name", user.name ?? "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          form.setValue("email", user.email ?? "", {
                            shouldDirty: true,
                            shouldTouch: true,
                            shouldValidate: true,
                          });
                          kycAutofillMutation.mutate(user);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setSelectedUser(undefined)}
                      disabled={!selectedUser || mutation.isPending || kycAutofillMutation.isPending}
                    >
                      Clear
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecting a user will auto-fill name/email and attempt to fill PAN + address from KYC (if available). You can still edit the fields below.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="kyc.pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN</FormLabel>
                        <FormControl>
                          <Input placeholder="FOZPB6904L" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Residential address</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="addresses.residential.street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addresses.residential.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addresses.residential.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addresses.residential.postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="addresses.residential.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">Notes (optional)</CardTitle>
                    <CardDescription>Stored as key/value in Razorpay.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="notes.key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notes.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.back()}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Creating..." : "Create stakeholder"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

