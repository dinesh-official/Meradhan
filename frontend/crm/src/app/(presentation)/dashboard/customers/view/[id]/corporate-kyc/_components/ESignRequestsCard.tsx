"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Clock,
  Download,
  ExternalLink,
  FileSignature,
  FileText,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
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

type StatusFilter = "ALL" | ESignRequestStatus;

const STATUS_THEME: Record<
  ESignRequestStatus,
  {
    label: string;
    /** Colored left bar on each request row. */
    leftBar: string;
    /** Pill / badge with bg + text. */
    pill: string;
    /** Avatar ring color. */
    ring: string;
    icon: React.ReactNode;
  }
> = {
  PENDING: {
    label: "Pending",
    leftBar: "bg-amber-500",
    pill: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
    ring: "ring-amber-400/60",
    icon: <Clock className="h-3 w-3" />,
  },
  COMPLETED: {
    label: "Completed",
    leftBar: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
    ring: "ring-emerald-400/60",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  REJECTED: {
    label: "Rejected",
    leftBar: "bg-rose-500",
    pill: "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200",
    ring: "ring-rose-400/60",
    icon: <XCircle className="h-3 w-3" />,
  },
};

function getNiceFilename(fileUrl: string | undefined | null) {
  if (!fileUrl) return "";
  const raw = decodeURIComponent(String(fileUrl));
  const last =
    raw.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? raw;
  return last.replace(/^\d+-/g, "").replace(/^upload-\d+-/g, "");
}

function getInitials(name: string | undefined | null): string {
  const parts = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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

/** Small reusable row for a single signable file (unsigned or signed). */
function FileRow({
  variant,
  fileUrl,
  requestId,
}: {
  variant: "unsigned" | "signed";
  fileUrl: string;
  requestId: number;
}) {
  const isSigned = variant === "signed";
  const Icon = isSigned ? CheckCircle2 : FileText;
  const accent = isSigned
    ? "text-emerald-700 dark:text-emerald-300"
    : "text-blue-700 dark:text-blue-300";
  const bg = isSigned
    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40"
    : "bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-900/40";
  const filename = getNiceFilename(fileUrl);
  const prefix = isSigned ? "signed" : "unsigned";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${bg}`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-white/70 dark:bg-black/30 ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-semibold ${accent}`}>
          {isSigned ? "Signed document" : "Document to sign"}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {filename || "—"}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          asChild
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          title="Open in new tab"
        >
          <a href={genMediaUrl(fileUrl)} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
          </a>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() =>
            downloadFile(fileUrl, `${prefix}-${requestId}-${filename || "document.pdf"}`)
          }
          title={isSigned ? "Download signed PDF" : "Download unsigned PDF"}
        >
          <Download className={`h-3.5 w-3.5 ${isSigned ? accent : ""}`} />
          <span className="hidden sm:inline">Download</span>
        </Button>
      </div>
    </div>
  );
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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

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

  const counts = useMemo(() => {
    const c: Record<StatusFilter, number> = {
      ALL: items.length,
      PENDING: 0,
      COMPLETED: 0,
      REJECTED: 0,
    };
    for (const it of items) c[it.status] = (c[it.status] ?? 0) + 1;
    return c;
  }, [items]);

  const filteredItems = useMemo(
    () =>
      statusFilter === "ALL"
        ? items
        : items.filter((i) => i.status === statusFilter),
    [items, statusFilter],
  );

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

  const openCreateDialog = () => {
    if (signatories.length === 0) {
      toast.error(
        "Add at least one authorised signatory in Corporate KYC before requesting an e-sign.",
      );
      return;
    }
    setCreateOpen(true);
  };

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

  const filterOptions: Array<{ id: StatusFilter; label: string }> = [
    { id: "ALL", label: "All" },
    { id: "PENDING", label: "Pending" },
    { id: "COMPLETED", label: "Completed" },
    { id: "REJECTED", label: "Rejected" },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                E-Sign Requests
                {items.length > 0 ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                ) : null}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Send documents to authorised signatories and track signed
                returns. Customers can also sign themselves via the Meradhan
                dashboard.
              </p>
            </div>
          </div>

          <AllowOnlyView permissions={["edit:customer"]}>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={openCreateDialog}
            >
              <Plus className="h-4 w-4" />
              Request E-Sign
            </Button>
          </AllowOnlyView>
        </div>

        {/* Status filter tabs (only when there's at least one request) */}
        {items.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {filterOptions.map((opt) => {
              const active = statusFilter === opt.id;
              const count = counts[opt.id];
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs " +
                    (active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground")
                  }
                >
                  {opt.label}
                  <span
                    className={
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium " +
                      (active
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {listQuery.isLoading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading e-sign requests…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/10 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <FileSignature className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">No e-sign requests yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload a PDF and pick an authorised signatory to start the
                workflow.
              </p>
            </div>
            <AllowOnlyView permissions={["edit:customer"]}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openCreateDialog}
              >
                <Plus className="h-4 w-4" />
                Request first e-sign
              </Button>
            </AllowOnlyView>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/10 p-6 text-center text-sm text-muted-foreground">
            No requests in this status.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const theme = STATUS_THEME[item.status];
              return (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-xl border bg-card"
                >
                  {/* Colored left status bar */}
                  <div
                    className={`absolute inset-y-0 left-0 w-1 ${theme.leftBar}`}
                  />

                  <div className="space-y-3 p-4 pl-5">
                    {/* Header row: avatar + identity + status + delete */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground ring-2 ${theme.ring}`}
                          aria-hidden
                        >
                          {getInitials(item.personName)}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold truncate">
                              {item.personName}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${theme.pill}`}
                            >
                              {theme.icon}
                              {theme.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            {item.signatoryEmail ? (
                              <span className="inline-flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" />
                                {item.signatoryEmail}
                              </span>
                            ) : null}
                            {item.signatoryPan ? (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <ShieldCheck className="h-3 w-3" />
                                {item.signatoryPan}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <AllowOnlyView permissions={["edit:customer"]}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive"
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AllowOnlyView>
                    </div>

                    {/* Timeline meta row */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Requested{" "}
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString("en-IN")
                          : "—"}
                      </span>
                      {item.submittedAt ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          Signed{" "}
                          {new Date(item.submittedAt).toLocaleString("en-IN")}
                        </span>
                      ) : null}
                      {item.digioRequestedAt ? (
                        <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                          <FileSignature className="h-3 w-3" />
                          Digio session started{" "}
                          {new Date(item.digioRequestedAt).toLocaleString("en-IN")}
                        </span>
                      ) : null}
                    </div>

                    {item.status === "COMPLETED" && item.digioDocumentId ? (
                      <p className="text-[11px] text-muted-foreground">
                        Signed via Digio · doc id{" "}
                        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                          {item.digioDocumentId}
                        </code>
                      </p>
                    ) : null}

                    {item.notes ? (
                      <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground italic">
                        “{item.notes}”
                      </div>
                    ) : null}

                    {/* File rows */}
                    <div className="space-y-2">
                      <FileRow
                        variant="unsigned"
                        fileUrl={item.eSignDocumentUrl}
                        requestId={item.id}
                      />
                      {item.signFileUrl ? (
                        <FileRow
                          variant="signed"
                          fileUrl={item.signFileUrl}
                          requestId={item.id}
                        />
                      ) : null}
                    </div>

                    {/* Footer actions */}
                    <AllowOnlyView permissions={["edit:customer"]}>
                      {item.status !== "COMPLETED" ? (
                        <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                          <Button
                            type="button"
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setUploadOpen(item);
                              setSignedPdfFile(null);
                            }}
                          >
                            <Upload className="h-3.5 w-3.5" />
                            Upload signed PDF
                          </Button>

                          {item.status === "PENDING" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={updateMutation.isPending}
                              onClick={() =>
                                handleSetStatus(item, "REJECTED")
                              }
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              Mark rejected
                            </Button>
                          ) : null}
                        </div>
                      ) : null}
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
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" />
              Request E-Sign
            </DialogTitle>
            <DialogDescription>
              Upload the PDF to be signed and pick an authorised signatory.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="esign-signatory">Authorised signatory *</Label>
              <Select
                value={signatoryId}
                onValueChange={setSignatoryId}
                disabled={isBusyCreate}
              >
                <SelectTrigger
                  id="esign-signatory"
                  className="h-auto w-full py-2"
                >
                  <SelectValue placeholder="Choose a signatory…" />
                </SelectTrigger>
                <SelectContent>
                  {signatories.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <div className="flex items-center gap-2.5 py-0.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                          {getInitials(s.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {s.fullName}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {s.designation ? `${s.designation} · ` : ""}
                            <span className="font-mono">{s.pan}</span>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pulled from the Authorised Signatories saved on Corporate KYC.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="esign-pdf">Document to sign (PDF) *</Label>
              <Input
                id="esign-pdf"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                disabled={isBusyCreate}
              />
              {pdfFile ? (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  {pdfFile.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
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
              ) : (
                <Plus className="mr-1 h-4 w-4" />
              )}
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
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" />
              Upload signed PDF
            </DialogTitle>
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
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
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
              ) : (
                <CheckCircle2 className="mr-1 h-4 w-4" />
              )}
              Upload &amp; mark Completed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
