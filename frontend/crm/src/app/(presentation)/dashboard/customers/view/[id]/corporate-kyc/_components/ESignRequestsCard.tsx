"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { genMediaUrl } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import type {
  CorporateESignRequest,
  CorporateKycResponse,
  CreateCorporateESignRequestPayload,
  ESignRequestStatus,
  UpdateCorporateESignRequestPayload,
} from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  FileSignature,
  Loader2,
  Plus,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useCorporateKycFileUpload } from "../../../../[id]/corporate-kyc/_hooks/useCorporateKycFileUpload";

type Props = {
  customerId: number;
  corporateKyc: CorporateKycResponse | null | undefined;
};

const STATUS_BADGE: Record<
  ESignRequestStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    className:
      "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
  },
};

function getNiceFilename(fileUrl: string | undefined | null) {
  if (!fileUrl) return "";
  const raw = decodeURIComponent(String(fileUrl));
  const last =
    raw.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? raw;
  return last.replace(/^\d+-/g, "").replace(/^upload-\d+-/g, "");
}

/**
 * Trigger a real browser download for a (typically cross-origin S3) file URL.
 * `<a download>` is ignored on cross-origin responses, so we fetch the blob
 * ourselves and write it to an object-URL anchor before revoking it.
 */
async function downloadFile(fileUrl: string, suggestedName?: string) {
  try {
    const res = await fetch(genMediaUrl(fileUrl));
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = suggestedName || getNiceFilename(fileUrl) || "document.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : "Failed to download file",
    );
  }
}

export default function ESignRequestsCard({ customerId, corporateKyc }: Props) {
  const api = useMemo(
    () => new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller),
    [],
  );
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useCorporateKycFileUpload();

  const [createOpen, setCreateOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [signatoryId, setSignatoryId] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [uploadOpen, setUploadOpen] = useState<CorporateESignRequest | null>(
    null,
  );
  const [signedPdfFile, setSignedPdfFile] = useState<File | null>(null);

  const signatories = corporateKyc?.authorisedSignatories ?? [];
  const corporateKycExists = Boolean(corporateKyc);

  const listQuery = useQuery({
    queryKey: ["CorporateESignRequests", customerId],
    queryFn: async () => {
      const res = await api.listCorporateESignRequests(customerId);
      return res.data.responseData ?? [];
    },
    enabled: corporateKycExists,
    refetchOnWindowFocus: false,
  });

  const items: CorporateESignRequest[] = listQuery.data ?? [];

  const createMutation = useMutation({
    mutationFn: async (payload: CreateCorporateESignRequestPayload) => {
      const res = await api.createCorporateESignRequest(customerId, payload);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("E-Sign request created.");
      setCreateOpen(false);
      setPdfFile(null);
      setSignatoryId("");
      setNotes("");
      queryClient.invalidateQueries({
        queryKey: ["CorporateESignRequests", customerId],
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to create request"),
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: {
      requestId: number;
      payload: UpdateCorporateESignRequestPayload;
    }) => {
      const res = await api.updateCorporateESignRequest(
        customerId,
        vars.requestId,
        vars.payload,
      );
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("E-Sign request updated.");
      setUploadOpen(null);
      setSignedPdfFile(null);
      queryClient.invalidateQueries({
        queryKey: ["CorporateESignRequests", customerId],
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to update request"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const res = await api.deleteCorporateESignRequest(customerId, requestId);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("E-Sign request deleted.");
      queryClient.invalidateQueries({
        queryKey: ["CorporateESignRequests", customerId],
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to delete request"),
      );
    },
  });

  const isBusyCreate = createMutation.isPending || uploading;
  const isBusyUpload = updateMutation.isPending || uploading;

  const handleCreate = async () => {
    if (!corporateKyc) {
      toast.error(
        "Corporate KYC data does not exist. Please save corporate KYC first.",
      );
      return;
    }
    if (!pdfFile) {
      toast.error("Please upload the document to be signed.");
      return;
    }
    if (!signatoryId) {
      toast.error("Please select an authorised signatory.");
      return;
    }
    const chosen = signatories.find((s) => String(s.id) === signatoryId);
    if (!chosen) {
      toast.error("Selected signatory not found.");
      return;
    }
    const url = await uploadFile(pdfFile, "corporate-kyc/e-sign");
    if (!url) return;
    createMutation.mutate({
      eSignDocumentUrl: url,
      personName: chosen.fullName,
      authorisedSignatoryId: chosen.id,
      signatoryEmail: chosen.email || undefined,
      signatoryPan: chosen.pan || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleUploadSigned = async () => {
    if (!uploadOpen) return;
    if (!signedPdfFile) {
      toast.error("Please choose the signed PDF file.");
      return;
    }
    const url = await uploadFile(signedPdfFile, "corporate-kyc/e-sign/signed");
    if (!url) return;
    updateMutation.mutate({
      requestId: uploadOpen.id,
      payload: { signFileUrl: url, status: "COMPLETED" },
    });
  };

  const handleSetStatus = (item: CorporateESignRequest, status: ESignRequestStatus) => {
    if (item.status === status) return;
    updateMutation.mutate({
      requestId: item.id,
      payload: { status },
    });
  };

  if (!corporateKycExists) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileSignature className="h-4 w-4 text-muted-foreground" />
          E-Sign Requests
          {items.length > 0 ? (
            <span className="text-xs font-normal text-muted-foreground">
              ({items.length})
            </span>
          ) : null}
        </CardTitle>
        <AllowOnlyView permissions={["edit:customer"]}>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              if (signatories.length === 0) {
                toast.error(
                  "Add at least one authorised signatory in Corporate KYC before requesting an e-sign.",
                );
                return;
              }
              setCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Request E-Sign
          </Button>
        </AllowOnlyView>
      </CardHeader>

      <CardContent className="space-y-3">
        {listQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading e-sign requests…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            No e-sign requests yet. Upload a PDF and pick an authorised
            signatory to start the workflow.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const badge = STATUS_BADGE[item.status];
              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-muted/20 p-3 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium truncate">
                          {item.personName}
                        </span>
                        <Badge variant="outline" className={badge.className}>
                          {badge.label}
                        </Badge>
                        {item.signatoryPan ? (
                          <span className="text-xs text-muted-foreground font-mono">
                            {item.signatoryPan}
                          </span>
                        ) : null}
                      </div>
                      {item.signatoryEmail ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.signatoryEmail}
                        </div>
                      ) : null}
                      <div className="text-xs text-muted-foreground">
                        Created{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("en-IN")
                          : "—"}
                        {item.submittedAt
                          ? ` · Signed ${new Date(item.submittedAt).toLocaleString("en-IN")}`
                          : ""}
                      </div>
                      {item.notes ? (
                        <div className="text-xs text-muted-foreground italic">
                          {item.notes}
                        </div>
                      ) : null}
                    </div>

                    <AllowOnlyView permissions={["edit:customer"]}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          const ok = window.confirm(
                            "Delete this e-sign request? This cannot be undone.",
                          );
                          if (!ok) return;
                          deleteMutation.mutate(item.id);
                        }}
                        title="Delete request"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AllowOnlyView>
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Unsigned source PDF */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <Upload className="h-3 w-3 rotate-180 text-primary" />
                        <span className="font-medium text-primary">
                          Document to sign
                        </span>
                        <span className="text-muted-foreground truncate max-w-[260px]">
                          {getNiceFilename(item.eSignDocumentUrl)}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <a
                          href={genMediaUrl(item.eSignDocumentUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Open
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            downloadFile(
                              item.eSignDocumentUrl,
                              `unsigned-${item.id}-${getNiceFilename(item.eSignDocumentUrl)}`,
                            )
                          }
                          title="Download unsigned PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Signed PDF (only when uploaded) */}
                    {item.signFileUrl ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 text-xs">
                          <CheckCircle2 className="h-3 w-3 text-emerald-700 dark:text-emerald-300" />
                          <span className="font-medium text-emerald-700 dark:text-emerald-300">
                            Signed file
                          </span>
                          <span className="text-muted-foreground truncate max-w-[260px]">
                            {getNiceFilename(item.signFileUrl)}
                          </span>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <a
                            href={genMediaUrl(item.signFileUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline"
                          >
                            Open
                          </a>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              downloadFile(
                                item.signFileUrl!,
                                `signed-${item.id}-${getNiceFilename(item.signFileUrl)}`,
                              )
                            }
                            title="Download signed PDF"
                          >
                            <Download className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <AllowOnlyView permissions={["edit:customer"]}>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.status !== "COMPLETED" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUploadOpen(item);
                              setSignedPdfFile(null);
                            }}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload signed PDF
                          </Button>
                        ) : null}

                        {item.status === "PENDING" ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={updateMutation.isPending}
                            onClick={() => handleSetStatus(item, "REJECTED")}
                          >
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            Mark rejected
                          </Button>
                        ) : null}
                      </div>
                    </AllowOnlyView>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create request dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(o) => {
          if (isBusyCreate) return;
          setCreateOpen(o);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request E-Sign</DialogTitle>
            <DialogDescription>
              Upload the PDF to be signed and pick an authorised signatory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="esign-signatory">Authorised signatory *</Label>
              <Select
                value={signatoryId}
                onValueChange={setSignatoryId}
                disabled={isBusyCreate}
              >
                <SelectTrigger id="esign-signatory">
                  <SelectValue placeholder="Choose a signatory…" />
                </SelectTrigger>
                <SelectContent>
                  {signatories.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <span className="font-medium">{s.fullName}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {s.designation ? `${s.designation} · ` : ""}
                        {s.pan}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pulled from the Authorised Signatories saved on Corporate KYC.
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="esign-pdf">Document to sign (PDF) *</Label>
              <Input
                id="esign-pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={isBusyCreate}
              />
              {pdfFile ? (
                <p className="text-xs text-muted-foreground">{pdfFile.name}</p>
              ) : null}
            </div>

            <div className="space-y-1">
              <Label htmlFor="esign-notes">Notes (optional)</Label>
              <Textarea
                id="esign-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any context for the signatory…"
                rows={3}
                disabled={isBusyCreate}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isBusyCreate}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreate} disabled={isBusyCreate}>
              {isBusyCreate ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Request E-Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload signed PDF dialog */}
      <Dialog
        open={Boolean(uploadOpen)}
        onOpenChange={(o) => {
          if (isBusyUpload) return;
          if (!o) {
            setUploadOpen(null);
            setSignedPdfFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload signed PDF</DialogTitle>
            <DialogDescription>
              {uploadOpen
                ? `Attach the signed copy returned by ${uploadOpen.personName}. The request will be marked Completed.`
                : null}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="esign-signed-pdf">Signed PDF *</Label>
            <Input
              id="esign-signed-pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setSignedPdfFile(e.target.files?.[0] ?? null)}
              disabled={isBusyUpload}
            />
            {signedPdfFile ? (
              <p className="text-xs text-muted-foreground">
                {signedPdfFile.name}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (isBusyUpload) return;
                setUploadOpen(null);
                setSignedPdfFile(null);
              }}
              disabled={isBusyUpload}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUploadSigned}
              disabled={isBusyUpload}
            >
              {isBusyUpload ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Upload &amp; mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
