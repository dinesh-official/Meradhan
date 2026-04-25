"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiGateway, { type UpdateRazorpayStakeholderPayload } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import OrdersSectionTabs from "../../../../../_components/OrdersSectionTabs";
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

const schema = z.object({
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
});

type FormValues = z.infer<typeof schema>;

export default function StakeholderUpdateView() {
  const params = useParams<{ id: string; stakeholderId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const accountId = params?.id;
  const stakeholderId = params?.stakeholderId;

  const stakeholdersApi = useMemo(
    () => new apiGateway.crm.crmRazorpayStakeholdersApi(apiClientCaller),
    []
  );

  const listQuery = useQuery({
    enabled: !!accountId,
    queryKey: ["crmRazorpayRouteStakeholders", accountId],
    queryFn: async () => stakeholdersApi.listByAccount(accountId!),
  });

  const stakeholder =
    listQuery.data?.responseData.stakeholders.find(
      (s) => s.razorpayStakeholderId === stakeholderId
    ) ?? null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: stakeholder
      ? {
          addresses:
            ((stakeholder.addresses ?? (stakeholder.data as any)?.addresses) as any) ?? {
              residential: {
                street: "",
                city: "",
                state: "",
                postal_code: "",
                country: "IN",
              },
            },
          kyc:
            ((stakeholder.kyc ?? (stakeholder.data as any)?.kyc) as any) ?? {
              pan: stakeholder.kycPan ?? "",
            },
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: async (payload: UpdateRazorpayStakeholderPayload) =>
      stakeholdersApi.update(accountId!, stakeholderId!, payload),
    onSuccess: async () => {
      toast.success("Stakeholder updated");
      await queryClient.invalidateQueries({
        queryKey: ["crmRazorpayRouteStakeholders", accountId],
      });
      router.push(
        `/dashboard/orders/razorpay-routes/${encodeURIComponent(accountId!)}/stakeholders/${encodeURIComponent(stakeholderId!)}`
      );
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Could not update stakeholder.");
      toast.error("Update failed", { description: message });
    },
  });

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar title="Update stakeholder" description={`Account: ${accountId}`} />

      <div className="mt-5 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stakeholder update</CardTitle>
            <CardDescription>{stakeholderId}</CardDescription>
          </CardHeader>
          <CardContent>
            {!stakeholder ? (
              <div className="text-sm text-muted-foreground">
                {listQuery.isLoading ? "Loading…" : "Stakeholder not found."}
              </div>
            ) : (
              <Form {...form}>
                <form
                  className="space-y-6"
                  onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                >
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="kyc.pan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PAN</FormLabel>
                          <FormControl>
                            <Input placeholder="AVOPB1111J" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                      {mutation.isPending ? "Updating..." : "Update stakeholder"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

