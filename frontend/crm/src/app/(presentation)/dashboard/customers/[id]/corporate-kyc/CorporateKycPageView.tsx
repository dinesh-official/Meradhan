"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { genMediaUrl } from "@/global/utils/url.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
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
import { RegisteredAddressSection } from "./_components/RegisteredAddressSection";
import { useCorporateKycFileUpload } from "./_hooks/useCorporateKycFileUpload";

export default function CorporateKycPageView({
  customerId,
}: {
  customerId: number;
}) {
  const router = useRouter();
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const queryClient = useQueryClient();
  const { uploadFile, uploading: attachmentUploading } = useCorporateKycFileUpload();

  const { data: corporateKyc, isLoading } = useQuery({
    queryKey: ["corporateKyc", customerId],
    queryFn: async () => {
      const res = await api.getCorporateKyc(customerId);
      return res.data.responseData;
    },
    refetchOnWindowFocus: false,
  });

  const { data: corporateAttachments, isLoading: attachmentsLoading } = useQuery({
    queryKey: ["CorporateKycAttachments", customerId],
    queryFn: async () => {
      const res = await api.listCorporateKycAttachments(customerId);
      return res.data.responseData ?? [];
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
  const [attachmentLabel, setAttachmentLabel] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const getNiceFilename = (fileUrl: string | undefined | null) => {
    if (!fileUrl) return "";
    const raw = decodeURIComponent(String(fileUrl));
    const last = raw.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? raw;
    let name = last;
    name = name.replace(/^\d+-/g, "");
    name = name.replace(/^upload-\d+-/g, "");
    return name;
  };

  const createAttachmentMutation = useMutation({
    mutationFn: async (payload: { label: string; fileUrl: string }) => {
      const res = await api.createCorporateKycAttachment(customerId, payload);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Attachment saved.");
      setAttachmentLabel("");
      setAttachmentFile(null);
      queryClient.invalidateQueries({ queryKey: ["CorporateKycAttachments", customerId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to save attachment");
      toast.error(message);
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: number) => {
      const res = await api.deleteCorporateKycAttachment(customerId, attachmentId);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Attachment deleted.");
      queryClient.invalidateQueries({ queryKey: ["CorporateKycAttachments", customerId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to delete attachment");
      toast.error(message);
    },
  });

  const handleSaveAttachment = async () => {
    if (!corporateKyc) {
      toast.error("Corporate KYC data does not exist. Please save corporate KYC first.");
      return;
    }
    const label = attachmentLabel.trim();
    if (!label) {
      toast.error("Attachment label is required.");
      return;
    }
    if (!attachmentFile) {
      toast.error("Please select a file.");
      return;
    }
    const url = await uploadFile(attachmentFile, "corporate-kyc/attachments");
    if (!url) return;
    createAttachmentMutation.mutate({ label, fileUrl: url });
  };

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
          <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={saving}
              className="h-9 text-xs"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="h-9 text-xs"
            >
              {saving ? "Saving…" : "Save Corporate KYC"}
            </Button>
          </div>
        }
      />
      <div className="w-full space-y-6">
        <EntityDetailsSection hook={hook} />
        <CorrespondenceAddressSection hook={hook} />
        <RegisteredAddressSection hook={hook} />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Attachments
              {Array.isArray(corporateAttachments) && corporateAttachments.length > 0 ? (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({corporateAttachments.length})
                </span>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attachmentsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading attachments…
              </div>
            ) : Array.isArray(corporateAttachments) && corporateAttachments.length > 0 ? (
              <div className="space-y-2">
                {corporateAttachments.map((a) => (
                  <div key={a.id} className="rounded-lg border bg-muted/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{a.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getNiceFilename(a.fileUrl)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN") : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={genMediaUrl(a.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline whitespace-nowrap"
                        >
                          Open
                        </a>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={deleteAttachmentMutation.isPending}
                          onClick={() => {
                            const ok = window.confirm("Delete this attachment?");
                            if (!ok) return;
                            deleteAttachmentMutation.mutate(a.id);
                          }}
                          title="Delete attachment"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No attachments yet.</div>
            )}

            <div className="rounded-lg border bg-background p-3 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="attachment-label">Label</Label>
                <Input
                  id="attachment-label"
                  value={attachmentLabel}
                  onChange={(e) => setAttachmentLabel(e.target.value)}
                  placeholder="e.g. Board resolution, Signed form..."
                  disabled={createAttachmentMutation.isPending || attachmentUploading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="attachment-file">File</Label>
                <Input
                  id="attachment-file"
                  type="file"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                  disabled={createAttachmentMutation.isPending || attachmentUploading}
                />
              </div>

              <Button
                type="button"
                className="w-full"
                onClick={handleSaveAttachment}
                disabled={createAttachmentMutation.isPending || attachmentUploading}
              >
                {createAttachmentMutation.isPending || attachmentUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save attachment
              </Button>
            </div>
          </CardContent>
        </Card>
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
