"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { queryClient } from "@/core/config/reactQuery";
import { ProfileSectionCard } from "./CustomerAccountSummary";
import apiGateway, { type CrmRiskProfile } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { Gauge, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const RISK_OPTIONS: { value: CrmRiskProfile; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export function CustomerCrmRiskProfileSection({
  profileId,
  crmRiskProfile,
  crmRiskProfileRemarks,
  canEdit,
}: {
  profileId: number;
  crmRiskProfile: CrmRiskProfile | null;
  crmRiskProfileRemarks: string | null;
  canEdit: boolean;
}) {
  const [value, setValue] = useState<CrmRiskProfile | "">(crmRiskProfile ?? "");
  const [remarks, setRemarks] = useState(crmRiskProfileRemarks ?? "");

  useEffect(() => {
    setValue(crmRiskProfile ?? "");
    setRemarks(crmRiskProfileRemarks ?? "");
  }, [crmRiskProfile, crmRiskProfileRemarks]);

  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const saveMutation = useMutation({
    mutationFn: async ({
      crmRiskProfile,
      crmRiskProfileRemarks,
    }: {
      crmRiskProfile: CrmRiskProfile | null;
      crmRiskProfileRemarks: string | null;
    }) => {
      const res = await customerApi.updateCustomer(
        { crmRiskProfile, crmRiskProfileRemarks },
        String(profileId),
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fetchCustomer", profileId] });
      toast.success("Risk profile updated");
    },
    onError: () => {
      toast.error("Failed to update risk profile");
    },
  });

  const normalizedRemarks = remarks.trim();
  const isDirty =
    (value || null) !== (crmRiskProfile ?? null) ||
    normalizedRemarks !== (crmRiskProfileRemarks ?? "");
  const canSave = canEdit && isDirty && !saveMutation.isPending;

  return (
    <ProfileSectionCard title="Risk profile" icon={Gauge}>
      <p className="mb-4 text-xs text-muted-foreground">
        CRM-assigned investment risk level for this customer. Independent of KYC
        risk questionnaire answers.
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Risk level
          </label>
          <Select
            value={value || undefined}
            onValueChange={(next) => setValue(next as CrmRiskProfile)}
            disabled={!canEdit || saveMutation.isPending}
          >
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select risk profile" />
            </SelectTrigger>
            <SelectContent>
              {RISK_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label
            htmlFor="crm-risk-profile-remarks"
            className="text-xs font-medium text-muted-foreground"
          >
            Remarks
          </label>
          <Textarea
            id="crm-risk-profile-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add remarks for this risk profile"
            disabled={!canEdit || saveMutation.isPending}
            className="min-h-24"
            maxLength={1000}
          />
        </div>
        {canEdit && (
          <Button
            type="button"
            size="sm"
            className="self-start"
            disabled={!canSave}
            onClick={() => {
              saveMutation.mutate({
                crmRiskProfile: value || null,
                crmRiskProfileRemarks: normalizedRemarks || null,
              });
            }}
          >
            {saveMutation.isPending ? (
              <Spinner className="size-4" />
            ) : (
              <Save className="size-4" />
            )}
            Save
          </Button>
        )}
      </div>
      {!canEdit && !crmRiskProfile && !crmRiskProfileRemarks && (
        <p className="mt-3 text-sm text-muted-foreground">Not set</p>
      )}
    </ProfileSectionCard>
  );
}
