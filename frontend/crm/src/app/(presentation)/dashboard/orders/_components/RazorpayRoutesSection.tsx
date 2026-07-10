"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiGateway, {
  type CreateRazorpayRouteSettlementAccountPayload,
  type RazorpayRouteSettlementAccountRecord,
} from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RazorpayRoutesSection() {
  const queryClient = useQueryClient();
  const routesApi = useMemo(
    () => new apiGateway.crm.crmRazorpayRoutesApi(apiClientCaller),
    []
  );

  const accountsQuery = useQuery({
    queryKey: ["crmRazorpayRouteAccounts"],
    queryFn: async () => routesApi.getRouteAccounts(),
  });

  const accounts = accountsQuery.data?.responseData.accounts ?? [];
  const defaultAccountId = accounts.find((a) => a.isDefault)?.razorpayAccountId;

  const settlementQuery = useQuery({
    enabled: !!defaultAccountId,
    queryKey: ["crmRazorpayRouteSettlementAccounts", defaultAccountId],
    queryFn: async () => routesApi.listSettlementAccounts(defaultAccountId!),
  });

  const settlementAccounts = settlementQuery.data?.responseData.records ?? [];

  const [form, setForm] = useState<CreateRazorpayRouteSettlementAccountPayload>({
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: "",
    isDefault: true,
  });

  const createSettlementMutation = useMutation({
    mutationFn: async (payload: CreateRazorpayRouteSettlementAccountPayload) =>
      routesApi.createSettlementAccount(defaultAccountId!, payload),
    onSuccess: async () => {
      toast.success("Settlement account saved");
      await queryClient.invalidateQueries({
        queryKey: ["crmRazorpayRouteSettlementAccounts", defaultAccountId],
      });
      setForm((p) => ({ ...p, accountNumber: "", ifscCode: "", beneficiaryName: "", isDefault: true }));
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as any).message)
          : "Could not save settlement account.";
      toast.error("Save failed", { description: message });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (record: RazorpayRouteSettlementAccountRecord) =>
      routesApi.updateSettlementAccount(defaultAccountId!, record.id, { isDefault: true }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["crmRazorpayRouteSettlementAccounts", defaultAccountId],
      });
      toast.success("Default settlement account updated");
    },
  });

  return (
    <>
      <Card className="mt-5">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Razorpay Routes</CardTitle>
            <CardDescription>
              Connected accounts created via Razorpay Route. Click an account to view full details.
            </CardDescription>
          </div>
          <Button variant="secondary" asChild>
            <Link href="/dashboard/orders/razorpay-routes/create">
              Create linked account
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {accountsQuery.isLoading ? (
            <div className="text-sm text-muted-foreground">Loading accounts…</div>
          ) : accountsQuery.isError ? (
            <div className="text-sm text-destructive">
              Could not load Razorpay Route accounts.
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No accounts found yet. Once accounts are stored in DB, they will appear here.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {accounts.map((a) => {
                const data = (a.data ?? {}) as Record<string, unknown>;
                const title =
                  (data["legal_business_name"] as string | undefined) ||
                  (data["customer_facing_business_name"] as string | undefined) ||
                  (data["contact_name"] as string | undefined) ||
                  a.razorpayAccountId;
                const status = (data["status"] as string | undefined) ?? "unknown";
                const email = (data["email"] as string | undefined) ?? undefined;
                const phone = (data["phone"] as string | undefined) ?? undefined;

                return (
                  <Card key={a.id} className="w-full">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="line-clamp-2 text-base">
                          {title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          {a.isDefault ? (
                            <Badge className="shrink-0">Default</Badge>
                          ) : null}
                          <Badge variant="outline" className="shrink-0">
                            {status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="space-y-1">
                        <div className="truncate">
                          <span className="font-medium">Account:</span>{" "}
                          {a.razorpayAccountId}
                        </div>
                        {email ? (
                          <div className="truncate">
                            <span className="font-medium">Email:</span> {email}
                          </div>
                        ) : null}
                        {phone ? (
                          <div className="truncate">
                            <span className="font-medium">Phone:</span> {phone}
                          </div>
                        ) : null}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" asChild>
                          <Link href={`/dashboard/orders/razorpay-routes/${a.razorpayAccountId}/details`}>
                            Details
                          </Link>
                        </Button>
                        <Button variant="secondary" asChild>
                          <Link
                            href={`/dashboard/orders/razorpay-routes/${a.razorpayAccountId}/details#stakeholders`}
                          >
                            Stakeholders
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href={`/dashboard/orders/razorpay-routes/${a.razorpayAccountId}/update`}>
                            Update
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Settlement bank accounts</CardTitle>
          <CardDescription>
            CRM-managed settlement bank details used for Route payouts. These are stored in our database (not Razorpay).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!defaultAccountId ? (
            <div className="text-sm text-muted-foreground">
              Set a default Razorpay Route account first to manage its settlement accounts.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account number</Label>
                  <Input
                    value={form.accountNumber}
                    onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                    placeholder="1234567890"
                    disabled={createSettlementMutation.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC code</Label>
                  <Input
                    value={form.ifscCode}
                    onChange={(e) => setForm((p) => ({ ...p, ifscCode: e.target.value }))}
                    placeholder="HDFC0000317"
                    disabled={createSettlementMutation.isPending}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Beneficiary name</Label>
                  <Input
                    value={form.beneficiaryName}
                    onChange={(e) => setForm((p) => ({ ...p, beneficiaryName: e.target.value }))}
                    placeholder="Gaurav Kumar"
                    disabled={createSettlementMutation.isPending}
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Checkbox
                    checked={!!form.isDefault}
                    onCheckedChange={(v) => setForm((p) => ({ ...p, isDefault: !!v }))}
                    disabled={createSettlementMutation.isPending}
                  />
                  <span className="text-sm">Make this the default settlement account</span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => createSettlementMutation.mutate(form)}
                  disabled={
                    createSettlementMutation.isPending ||
                    !form.accountNumber.trim() ||
                    !form.ifscCode.trim() ||
                    !form.beneficiaryName.trim()
                  }
                >
                  {createSettlementMutation.isPending ? "Saving..." : "Save settlement account"}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Saved accounts</div>
                {settlementQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading settlement accounts…</div>
                ) : settlementAccounts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No settlement accounts saved yet.</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {settlementAccounts.map((r) => (
                      <Card key={r.id}>
                        <CardContent className="flex items-start justify-between gap-4 pt-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{r.beneficiaryName}</span>
                              {r.isDefault ? <Badge>Default</Badge> : null}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {r.ifscCode} • {r.accountNumber}
                            </div>
                          </div>
                          {!r.isDefault ? (
                            <Button
                              variant="secondary"
                              onClick={() => setDefaultMutation.mutate(r)}
                              disabled={setDefaultMutation.isPending}
                            >
                              Make default
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

