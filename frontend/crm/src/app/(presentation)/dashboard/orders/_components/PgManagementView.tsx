"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import usePermissions from "@/hooks/usePermissions.hook";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import OrdersSectionTabs from "./OrdersSectionTabs";
import { getErrorMessage } from "@/core/utils/getErrorMessage";

export default function PgManagementView() {
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const canEdit = can("orders.edit");
  const orderApi = new apiGateway.crm.crmOrdersApi(apiClientCaller);

  const settingsQuery = useQuery({
    queryKey: ["crmPaymentGatewaySettings"],
    queryFn: async () => orderApi.getPaymentGatewaySettings(),
  });

  const updateMutation = useMutation({
    mutationFn: async (paymentGatewayMode: "PAYMENT" | "INQUIRY") =>
      orderApi.updatePaymentGatewaySettings({ paymentGatewayMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crmPaymentGatewaySettings"] });
      toast.success("Settings saved");
    },
    onError: (err: unknown) => {
      const message = getErrorMessage(err, "Could not update payment mode.");
      toast.error("Update failed", { description: message });
    },
  });

  const mode = settingsQuery.data?.responseData.paymentGatewayMode ?? "INQUIRY";
  const isPayment = mode === "PAYMENT";

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="PG Management"
        description="Choose whether customers complete bond orders via Razorpay or submit inquiries only."
      />
      <Card className="mt-5 max-w-xl">
        <CardHeader>
          <CardTitle>Payment gateway mode</CardTitle>
          <CardDescription>
            When enabled, the website uses Razorpay checkout. When disabled, customers submit order
            inquiries (email / lead flow) without online payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="pg-mode" className="text-base">
                Razorpay payment gateway
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPayment
                  ? "Customers pay online through Razorpay."
                  : "Inquiry mode: no online payment; order request is captured as an inquiry."}
              </p>
            </div>
            <Switch
              id="pg-mode"
              checked={isPayment}
              disabled={
                !canEdit || settingsQuery.isLoading || updateMutation.isPending
              }
              onCheckedChange={(checked) =>
                updateMutation.mutate(checked ? "PAYMENT" : "INQUIRY")
              }
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
