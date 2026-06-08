"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import type { CorporateKycAutofillFormPatch } from "@root/apiGateway";
import { genMediaUrl } from "@/global/utils/url.utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Paperclip, Trash2, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { CreateCorporateKycPayload } from "@root/schema";
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
    const next = getInitialForm();
    hook.reset(next);
    setAutofillPan((prev) => (prev ? prev : next.panNumber ?? ""));
    setAutofillDoi((prev) => (prev ? prev : next.dateOfIncorporation ?? ""));
    // Sync form when API data loads or changes; do not depend on hook (new ref each render → infinite loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, corporateKyc]);

  const [saving, setSaving] = useState(false);
  const [attachmentLabel, setAttachmentLabel] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  /** Operator-supplied identifiers for the "Autofill from KRA" action. */
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [autofillPan, setAutofillPan] = useState("");
  const [autofillDoi, setAutofillDoi] = useState("");

  /**
   * Merge a KRA-derived form patch into the live form state.
   *
   *   - Scalars only overwrite when the patch supplies a truthy value, so
   *     fields the operator already typed are never wiped.
   *   - Arrays (directors, authorisedSignatories) only overwrite when the
   *     form currently has none — matching by PAN would be safer once the
   *     user has typed people, so we err on the side of preserving local
   *     edits when both sides have rows.
   */
  const mergeAutofillPatch = useCallback(
    (patch: CorporateKycAutofillFormPatch) => {
      const current = hook.form;

      const scalarPick = <K extends keyof CreateCorporateKycPayload>(
        key: K,
        next: CreateCorporateKycPayload[K] | undefined,
      ): CreateCorporateKycPayload[K] => {
        if (next === undefined || next === null || next === "") return current[key];
        return next as CreateCorporateKycPayload[K];
      };

      const merged: CreateCorporateKycPayload = {
        ...current,
        entityName: scalarPick("entityName", patch.entityName),
        panNumber: scalarPick("panNumber", patch.panNumber),
        cinOrRegistrationNumber: scalarPick(
          "cinOrRegistrationNumber",
          patch.cinOrRegistrationNumber,
        ),
        dateOfIncorporation: scalarPick("dateOfIncorporation", patch.dateOfIncorporation),
        dateOfCommencementOfBusiness: scalarPick(
          "dateOfCommencementOfBusiness",
          patch.dateOfCommencementOfBusiness,
        ),
        placeOfIncorporation: scalarPick("placeOfIncorporation", patch.placeOfIncorporation),
        countryOfIncorporation: scalarPick(
          "countryOfIncorporation",
          patch.countryOfIncorporation,
        ),
        entityConstitutionType: patch.entityConstitutionType ?? current.entityConstitutionType,
        annualIncome: scalarPick("annualIncome", patch.annualIncome),

        correspondenceLine1: scalarPick("correspondenceLine1", patch.correspondenceLine1),
        correspondenceLine2: scalarPick("correspondenceLine2", patch.correspondenceLine2),
        correspondenceLine3: scalarPick("correspondenceLine3", patch.correspondenceLine3),
        correspondenceCity: scalarPick("correspondenceCity", patch.correspondenceCity),
        correspondencePinCode: scalarPick("correspondencePinCode", patch.correspondencePinCode),
        correspondenceState: scalarPick("correspondenceState", patch.correspondenceState),
        correspondenceAddressProofType: scalarPick(
          "correspondenceAddressProofType",
          patch.correspondenceAddressProofType,
        ),

        registeredLine1: scalarPick("registeredLine1", patch.registeredLine1),
        registeredLine2: scalarPick("registeredLine2", patch.registeredLine2),
        registeredLine3: scalarPick("registeredLine3", patch.registeredLine3),
        registeredCity: scalarPick("registeredCity", patch.registeredCity),
        registeredPinCode: scalarPick("registeredPinCode", patch.registeredPinCode),
        registeredState: scalarPick("registeredState", patch.registeredState),
        registeredAddressProofType: scalarPick(
          "registeredAddressProofType",
          patch.registeredAddressProofType,
        ),

        fatcaApplicable:
          patch.fatcaApplicable === undefined ? current.fatcaApplicable : patch.fatcaApplicable,
      };

      // Only replace directors when the form has none yet; NDML doesn't ship
      // contact info (email, mobile) so the operator still needs to fill the
      // gaps — preserving local edits if any.
      if ((!current.directors || current.directors.length === 0) && patch.directors?.length) {
        merged.directors = patch.directors.map((d) => ({
          fullName: d.fullName,
          pan: d.pan,
          designation: d.designation ?? "",
          din: d.din ?? "",
          email: "",
          mobile: "",
          panCopyFileUrl: "",
          aadharCopyFileUrl: "",
          passportPhotoFileUrl: "",
        }));
      }
      if (
        (!current.authorisedSignatories || current.authorisedSignatories.length === 0) &&
        patch.authorisedSignatories?.length
      ) {
        merged.authorisedSignatories = patch.authorisedSignatories.map((s) => ({
          fullName: s.fullName,
          pan: s.pan,
          designation: s.designation ?? "",
          din: s.din ?? "",
          email: "",
          mobile: "",
          signatureFileUrl: "",
          panCopyFileUrl: "",
          aadharCopyFileUrl: "",
          passportPhotoFileUrl: "",
        }));
      }

      hook.reset(merged);
    },
    [hook],
  );

  const autofillMutation = useMutation({
    mutationFn: async () => {
      const pan = autofillPan.trim().toUpperCase();
      const doi = autofillDoi.trim();
      if (!pan) throw new Error("Enter the corporate PAN");
      if (!doi) throw new Error("Enter the date of incorporation");
      const res = await api.autofillCorporateKra(customerId, {
        pan,
        dateOfIncorporation: doi,
      });
      return res.data.responseData;
    },
    onSuccess: (data) => {
      if (!data) {
        toast.error("No data returned from KRA.");
        return;
      }
      const statusLabel = data.summary?.status?.label ?? data.summary?.status?.code ?? "";
      // NDML returns status "001"/"SUCCESS" when the record exists, "104" /
      // "PAN NOT AVAILABLE" otherwise. Surface either way — the operator
      // wants to know what came back.
      const fieldsFilled = Object.keys(data.formPatch ?? {}).length;
      if (fieldsFilled === 0) {
        toast.warning(
          statusLabel
            ? `KRA returned no usable data (${statusLabel}).`
            : "KRA returned no usable data for this PAN.",
        );
        return;
      }
      mergeAutofillPatch(data.formPatch);
      toast.success(`Form autofilled from KRA (${fieldsFilled} field(s) updated).`, {
        description: statusLabel ? `KRA status: ${statusLabel}` : undefined,
      });
      setAutofillOpen(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to autofill from KRA");
      toast.error(message);
    },
  });

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
              onClick={() => setAutofillOpen(true)}
              disabled={saving}
              className="h-9 text-xs"
            >
              <Wand2 className="mr-1.5 h-4 w-4" />
              Autofill from KRA
            </Button>
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

      <Dialog
        open={autofillOpen}
        onOpenChange={(open) => {
          // Block close while the mutation is in flight so the user can't
          // dismiss the loader mid-call.
          if (autofillMutation.isPending) return;
          setAutofillOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-primary" />
              Autofill from KRA
            </DialogTitle>
            <DialogDescription>
              Enter the company PAN and Date of Incorporation. We&apos;ll pull
              the entity&apos;s latest KRA record from NDML and pre-fill the
              form. Already-typed values are preserved.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="autofill-pan" className="text-xs">
                PAN <span className="text-destructive">*</span>
              </Label>
              <Input
                id="autofill-pan"
                placeholder="e.g. AABCM1234B"
                value={autofillPan}
                onChange={(e) => setAutofillPan(e.target.value.toUpperCase())}
                disabled={autofillMutation.isPending}
                maxLength={10}
                className="h-9 uppercase"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="autofill-doi" className="text-xs">
                Date of incorporation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="autofill-doi"
                type="date"
                value={autofillDoi}
                onChange={(e) => setAutofillDoi(e.target.value)}
                disabled={autofillMutation.isPending}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAutofillOpen(false)}
              disabled={autofillMutation.isPending}
              className="h-9"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => autofillMutation.mutate()}
              disabled={
                autofillMutation.isPending ||
                !autofillPan.trim() ||
                !autofillDoi.trim()
              }
              className="h-9"
            >
              {autofillMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching from KRA…
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Autofill
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
