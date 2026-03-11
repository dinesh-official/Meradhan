"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { defaultCorporateKycForm } from "./_utils/defaultForm";
import { mapCorporateKycResponseToForm } from "./_utils/mapResponseToForm";
import { useCorporateKycForm } from "./_hooks/useCorporateKycForm";
import { AuthorisedSignatoriesSection } from "./_components/AuthorisedSignatoriesSection";
import { BankAccountsSection } from "./_components/BankAccountsSection";
import { CorrespondenceAddressSection } from "./_components/CorrespondenceAddressSection";
import { DematAccountsSection } from "./_components/DematAccountsSection";
import { DirectorsSection } from "./_components/DirectorsSection";
import { DocumentsSection } from "./_components/DocumentsSection";
import { EntityDetailsSection } from "./_components/EntityDetailsSection";
import { FatcaSection } from "./_components/FatcaSection";
import { PromotersSection } from "./_components/PromotersSection";

export default function CorporateKycPageView({
  customerId,
}: {
  customerId: number;
}) {
  const router = useRouter();
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const { data: corporateKyc, isLoading } = useQuery({
    queryKey: ["corporateKyc", customerId],
    queryFn: async () => {
      const res = await api.getCorporateKyc(customerId);
      return res.data.responseData;
    },
    refetchOnWindowFocus: false,
  });

  const getInitialForm = useCallback(() => {
    if (corporateKyc) return mapCorporateKycResponseToForm(corporateKyc);
    return defaultCorporateKycForm;
  }, [corporateKyc]);

  const initial = isLoading ? defaultCorporateKycForm : getInitialForm();
  const hook = useCorporateKycForm(initial);

  useEffect(() => {
    if (isLoading) return;
    hook.reset(getInitialForm());
    // Sync form when API data loads or changes; do not depend on hook (new ref each render → infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, corporateKyc]);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!hook.validate()) {
      const messages = hook.getAllErrorMessages();
      const text =
        messages.length > 0
          ? messages.slice(0, 15).join("\n") +
          (messages.length > 15 ? `\n… and ${messages.length - 15} more` : "")
          : "Please fix the errors in the form.";
      toast.error("Validation failed", { description: text });
      return;
    }
    setSaving(true);
    try {
      const payload = hook.getPayload();
      await api.saveCorporateKyc(customerId, payload);
      toast.success("Corporate KYC saved successfully.");
      router.refresh();
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data
            ?.message
          : "Failed to save corporate KYC.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    hook.reset(getInitialForm());
    toast.info("Form reset to last saved data.");
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageInfoBar
        showBack
        title="Corporate KYC"
        description="Manage corporate KYC details for this customer"
        actions={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Corporate KYC"}
            </Button>
          </div>
        }
      />
      <div className="flex flex-col gap-6">
        <EntityDetailsSection hook={hook} />
        <CorrespondenceAddressSection hook={hook} />
        <DocumentsSection hook={hook} />
        <FatcaSection hook={hook} />
        <BankAccountsSection hook={hook} />
        <DematAccountsSection hook={hook} />
        <DirectorsSection hook={hook} />
        <PromotersSection hook={hook} />
        <AuthorisedSignatoriesSection hook={hook} />
      </div>
    </div>
  );
}
