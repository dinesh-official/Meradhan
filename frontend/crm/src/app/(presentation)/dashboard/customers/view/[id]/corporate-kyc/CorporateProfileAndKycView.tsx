"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import LabelView from "@/global/elements/wrapper/LabelView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { encodeId, genMediaUrl } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, IdCardIcon, NotebookPen, Loader2, Paperclip, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  AddressSection,
  AuthorisedSignatoriesSection,
  BankAccountsSection,
  DematAccountsSection,
  DirectorsSection,
  DocumentUrlsSection,
  PromotersSection,
} from "./_components/CorporateKycSections";
import { useState } from "react";
import { toast } from "sonner";
import { KraLogsCard } from "../../../_components/KraLogsCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCorporateKycFileUpload } from "../../../[id]/corporate-kyc/_hooks/useCorporateKycFileUpload";

export default function CorporateProfileAndKycView({
  profileId,
}: {
  profileId: number;
}) {
  const getLastKraStatusText = (logs: Array<any> | undefined) => {
    if (!Array.isArray(logs) || logs.length === 0) return null;
    // Attempt to find the most recent log (by reqTime, fallback to id)
    const sorted = logs
      .slice()
      .sort((a, b) => {
        const at = a?.reqTime ? new Date(a.reqTime).getTime() : NaN;
        const bt = b?.reqTime ? new Date(b.reqTime).getTime() : NaN;
        if (!isNaN(at) && !isNaN(bt)) return bt - at;
        const aid = typeof a?.id === "number" ? a.id : 0;
        const bid = typeof b?.id === "number" ? b.id : 0;
        return bid - aid;
      });

    const last = sorted[0] ?? null;
    if (!last) return null;

    const stage = last?.stage ? String(last.stage) : "—";
    const ts = last?.reqTime ? new Date(last.reqTime) : null;
    const timeText = ts && !isNaN(ts.getTime()) ? ts.toLocaleString("en-IN") : null;

    const resp = last?.responseData;
    const deepStatus =
      resp?.APP_PAN_INQ?.APP_STATUS_DESC ??
      resp?.APP_PAN_INQ?.APP_STATUS ??
      resp?.APP_PAN_INQ?.APP_UPDT_STATUS ??
      resp?.APP_PAN_INQ?.APP_ERROR_DESC ??
      resp?.status ??
      resp?.message ??
      null;

    const statusText = deepStatus != null && String(deepStatus).trim() !== "" ? String(deepStatus) : null;

    return {
      stage,
      timeText,
      statusText,
    };
  };

  const getNiceFilename = (fileUrl: string | undefined | null) => {
    if (!fileUrl) return "";
    const raw = decodeURIComponent(String(fileUrl));
    const last = raw.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? raw;
    // putFileS3 prefixes: "<ts>-<originalname>"; and our upload flow double-prefixes with "upload-<ts>-"
    // Strip common prefixes while keeping original name readable.
    let name = last;
    name = name.replace(/^\d+-/g, "");
    name = name.replace(/^upload-\d+-/g, "");
    return name;
  };

  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);
  const queryClient = useQueryClient();

  const [customerQuery, corporateKycQuery, kraLogsQuery] = useQueries({
    queries: [
      {
        queryKey: ["fetchCustomer", profileId],
        queryFn: async () => {
          const res = await api.customerInfoById(profileId);
          return res.data.responseData;
        },
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["corporateKyc", profileId],
        queryFn: async () => {
          const res = await api.getCorporateKyc(profileId);
          return res.data.responseData;
        },
        refetchOnWindowFocus: false,
      },
      {
        queryKey: ["corporateKycKraLogs", profileId],
        queryFn: async () => {
          const res = await kycApi.getKycKraDataById(profileId);
          return res.responseData ?? [];
        },
        refetchOnWindowFocus: false,
      },
    ],
  });

  const customer = customerQuery.data;
  const corporateKyc = corporateKycQuery.data;
  const kraLogs = kraLogsQuery.data as Array<any> | undefined;
  const isLoading = customerQuery.isLoading;
  const encodedId = encodeId(profileId);
  const isCorporate = customer?.userType === "CORPORATE";
  const [kycPdfLoading, setKycPdfLoading] = useState(false);
  const [triggerKraOpen, setTriggerKraOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [attachmentLabel, setAttachmentLabel] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const { uploadFile, uploading: attachmentUploading } = useCorporateKycFileUpload();

  const { data: corporateKraStatus } = useQuery({
    queryKey: ["CorporateKraStatus", profileId],
    queryFn: async () => {
      const res = await api.corporateKraStatus(profileId);
      return res.data.responseData;
    },
    refetchInterval: (query) => (query.state.data?.isRunning ? 5000 : false),
    refetchOnWindowFocus: false,
    enabled: isCorporate,
  });

  const corpKraRunning = corporateKraStatus?.isRunning === true;
  const corpKycDataStoreId = corporateKraStatus?.kycDataStoreId ?? null;
  const lastKraStatus = getLastKraStatusText(kraLogs);

  const missingCorporateKraFields = (() => {
    if (!corporateKyc) return ["Corporate KYC data must be saved"];
    const missing: string[] = [];

    const pan = (corporateKyc as any).panNumber ?? (corporateKyc as any).pan ?? null;
    if (!pan) missing.push("PAN");

    const doi =
      (corporateKyc as any).dateOfIncorporation ??
      (corporateKyc as any).incorporationDate ??
      (corporateKyc as any).commencementDate ??
      null;
    if (!doi) missing.push("Date of incorporation/commencement");

    const authorisedSignatories = (corporateKyc as any).authorisedSignatories ?? [];
    if (!Array.isArray(authorisedSignatories) || authorisedSignatories.length === 0) {
      missing.push("At least 1 authorised signatory");
    } else {
      const first = authorisedSignatories[0] ?? {};
      if (!first?.email) missing.push("Authorised signatory email");
      if (!first?.mobile) missing.push("Authorised signatory mobile");
    }

    return missing;
  })();

  const canTriggerCorporateKra =
    isCorporate &&
    !corpKraRunning &&
    missingCorporateKraFields.length === 0 &&
    corpKycDataStoreId != null;

  const { data: corporateAttachments, isLoading: attachmentsLoading } = useQuery({
    queryKey: ["CorporateKycAttachments", profileId],
    queryFn: async () => {
      const res = await api.listCorporateKycAttachments(profileId);
      return res.data.responseData ?? [];
    },
    enabled: isCorporate,
    refetchOnWindowFocus: false,
  });

  const createAttachmentMutation = useMutation({
    mutationFn: async (payload: { label: string; fileUrl: string }) => {
      const res = await api.createCorporateKycAttachment(profileId, payload);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Attachment saved.");
      setAttachmentLabel("");
      setAttachmentFile(null);
      queryClient.invalidateQueries({ queryKey: ["CorporateKycAttachments", profileId] });
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
      const res = await api.deleteCorporateKycAttachment(profileId, attachmentId);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Attachment deleted.");
      queryClient.invalidateQueries({ queryKey: ["CorporateKycAttachments", profileId] });
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

  const AttachmentsCard = () => {
    if (!isCorporate) return null;
    if (!corporateKyc) return null;
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            Attachments
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAttachmentsOpen(true)}
          >
            View / Upload
            {Array.isArray(corporateAttachments) && corporateAttachments.length > 0 ? (
              <span className="ml-1 text-xs text-muted-foreground">
                ({corporateAttachments.length})
              </span>
            ) : null}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>
    );
  };

  const triggerCorporateKraMutation = useMutation({
    mutationFn: async () => {
      const res = await api.triggerCorporateKra(profileId);
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("KRA triggered successfully.");
      setTriggerKraOpen(false);
      queryClient.invalidateQueries({ queryKey: ["CorporateKraStatus", profileId] });
      queryClient.invalidateQueries({ queryKey: ["corporateKycKraLogs", profileId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to trigger KRA");
      toast.error(message);
    },
  });

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  // Print / download actions intentionally hidden for now.

  const printDate = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fmt = (v: string | undefined | null) =>
    v != null && v !== "" ? String(v) : "—";

  return (
    <div
      className="flex flex-col gap-6 corporate-kyc-print-view"
      id="corporate-kyc-print-content"
    >
      {/* Clean print-only header: logo + date */}
      <div className="hidden corporate-kyc-print-header print:block print:pb-4  print:border-gray-300">
        <Image
          src="/images/pdfheader.png"
          alt="MeraDhan"
          width={800}
          height={120}
          className="w-full max-w-full h-auto object-contain print:block"
        />
        <p className="print:block text-sm text-muted-foreground mt-2">Printed on: {printDate}</p>
      </div>

      <div className="print:hidden pt-3">
        {isCorporate && corpKraRunning ? (
          <div className="flex flex-col gap-0 overflow-hidden rounded-lg border border-blue-200 bg-blue-50/90 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-50">
            <Alert className="rounded-none border-0 bg-transparent py-3 text-inherit [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              <AlertTitle>KRA processing</AlertTitle>
              <AlertDescription>
                Corporate KRA verification is running. Status refreshes automatically; you can keep working on this page.
                {lastKraStatus ? (
                  <div className="mt-2 text-xs text-blue-900/90 dark:text-blue-100/90">
                    <span className="font-medium">Last status:</span>{" "}
                    <span className="font-medium">{lastKraStatus.stage}</span>
                    {lastKraStatus.statusText ? (
                      <>
                        {" "}
                        — <span className="text-blue-900/80 dark:text-blue-100/80">{lastKraStatus.statusText}</span>
                      </>
                    ) : null}
                    {lastKraStatus.timeText ? (
                      <>
                        {" "}
                        <span className="text-blue-900/70 dark:text-blue-100/70">({lastKraStatus.timeText})</span>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
            <div
              className="relative h-1 w-full overflow-hidden bg-blue-200/80 dark:bg-blue-900/60"
              role="progressbar"
              aria-label="KRA processing"
              aria-busy="true"
            >
              <div className="absolute top-0 left-0 h-full w-[38%] rounded-full bg-blue-600 dark:bg-blue-400 animate-kra-indeterminate" />
            </div>
          </div>
        ) : null}
        <br />
        <PageInfoBar
          showBack
          title="Corporate Customer"
          description="Profile and corporate KYC data"
          actions={
            <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto md:justify-end">
              {!isCorporate && (
                <AllowOnlyView permissions={["view:customerkyc"]}>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/customers/view/${encodedId}/kyc`}>
                      <IdCardIcon className="h-4 w-4" /> View KYC Data
                    </Link>
                  </Button>
                </AllowOnlyView>
              )}
              <Button variant="default" asChild>
                <Link href="/dashboard/rfqs/nse">
                  <NotebookPen className="h-4 w-4" /> View RFQs
                </Link>
              </Button>
              {isCorporate && (
                <AllowOnlyView permissions={["edit:customer"]}>
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                      <Pencil className="h-4 w-4" />
                      {corporateKyc ? "Edit Corporate KYC" : "Add Corporate KYC"}
                    </Link>
                  </Button>
                </AllowOnlyView>
              )}

              {isCorporate && (
                <AllowOnlyView permissions={["edit:customer"]}>
                  <Sheet open={attachmentsOpen} onOpenChange={setAttachmentsOpen}>
                    <SheetTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (!corporateKyc) {
                            toast.error("Corporate KYC data does not exist. Please save corporate KYC first.");
                            return;
                          }
                          setAttachmentsOpen(true);
                        }}
                      >
                        <Paperclip className="h-4 w-4" />
                        Attachments
                        {Array.isArray(corporateAttachments) && corporateAttachments.length > 0 ? (
                          <span className="ml-1 text-xs text-muted-foreground">
                            ({corporateAttachments.length})
                          </span>
                        ) : null}
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-md">
                      <SheetHeader>
                        <SheetTitle>Attachments</SheetTitle>
                        <SheetDescription>
                          Upload files with a label. These are saved per corporate customer.
                        </SheetDescription>
                      </SheetHeader>

                      <div className="flex flex-col gap-4 px-4 pb-4 flex-1 min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
                          {attachmentsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading attachments…
                            </div>
                          ) : Array.isArray(corporateAttachments) && corporateAttachments.length > 0 ? (
                            corporateAttachments.map((a) => (
                              <div key={a.id} className="rounded-lg border bg-muted/30 p-3">
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
                            ))
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No attachments yet.
                            </div>
                          )}
                        </div>

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
                      </div>
                    </SheetContent>
                  </Sheet>
                </AllowOnlyView>
              )}

              {isCorporate && (
                <AllowOnlyView permissions={["edit:customer"]}>
                  <AlertDialog open={triggerKraOpen} onOpenChange={setTriggerKraOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          triggerCorporateKraMutation.isPending ||
                          corpKraRunning ||
                          !corporateKyc ||
                          corpKycDataStoreId == null
                        }
                        title={
                          corpKraRunning
                            ? "KRA process is already running"
                            : !corporateKyc || corpKycDataStoreId == null
                              ? "Save corporate KYC first"
                              : undefined
                        }
                        onClick={() => {
                          if (!corporateKyc || corpKycDataStoreId == null) {
                            toast.error("Corporate KYC data does not exist. Please save corporate KYC first.");
                            return;
                          }
                          if (corpKraRunning) {
                            toast.error("KRA process is already running for this corporate customer.");
                            return;
                          }
                          setTriggerKraOpen(true);
                        }}
                      >
                        {triggerCorporateKraMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Loader2 className="h-4 w-4" />
                        )}
                        Trigger KRA
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Trigger corporate KRA?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will start the corporate KRA flow for this customer. If required corporate KYC fields are missing,
                          the trigger will fail with an error.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      {missingCorporateKraFields.length > 0 ? (
                        <div className="px-6 -mt-2">
                          <div className="rounded-lg border bg-muted/30 p-3">
                            <div className="text-sm font-semibold">Missing required fields</div>
                            <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                              {missingCorporateKraFields.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={triggerCorporateKraMutation.isPending}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => triggerCorporateKraMutation.mutate()}
                          disabled={triggerCorporateKraMutation.isPending || !canTriggerCorporateKra}
                        >
                          {triggerCorporateKraMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Trigger KRA
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </AllowOnlyView>
              )}
            </div>
          }
        />
      </div>

      {/* Screen: card-based layout (hidden when printing) */}
      <div className="print:hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 text-sm">
          {!isCorporate ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>
                  This customer is not a corporate user. Corporate KYC is only
                  available for user type &quot;CORPORATE&quot;.
                </p>
              </CardContent>
            </Card>
          ) : !corporateKycQuery.isLoading && !corporateKyc ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No corporate KYC data has been added for this customer yet.</p>
                <AllowOnlyView permissions={["edit:customer"]}>
                  <Button asChild variant="link" className="mt-2">
                    <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                      Add Corporate KYC
                    </Link>
                  </Button>
                </AllowOnlyView>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    Key details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <LabelView title="Name">
                      <p className="text-sm">
                        {[customer?.firstName, customer?.middleName, customer?.lastName]
                          .filter(Boolean)
                          .join(" ") || "—"}
                      </p>
                    </LabelView>
                    <LabelView title="Username">
                      <p className="text-sm">{customer?.userName ?? "—"}</p>
                    </LabelView>
                    <LabelView title="Email">
                      <p className="text-sm">{customer?.emailAddress ?? "—"}</p>
                    </LabelView>
                    <LabelView title="Phone">
                      <p className="text-sm">{customer?.phoneNo ?? "—"}</p>
                    </LabelView>
                    <LabelView title="Company">
                      <p className="text-sm">{corporateKyc?.entityName ?? "—"}</p>
                    </LabelView>
                    <LabelView title="PAN Number">
                      <p className="text-sm">{corporateKyc?.panNumber ?? "—"}</p>
                    </LabelView>
                  </div>
                </CardContent>
              </Card>

              {corporateKyc ? (
                <>
                  <AddressSection data={corporateKyc} />
                  <AttachmentsCard />
                  <DocumentUrlsSection data={corporateKyc} />
                  <BankAccountsSection data={corporateKyc} />
                  <DematAccountsSection data={corporateKyc} />
                  <DirectorsSection data={corporateKyc} />
                  <PromotersSection data={corporateKyc} />
                  <AuthorisedSignatoriesSection data={corporateKyc} />
                  <KraLogsCard logs={kraLogs} />
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Print only: table layout (hidden on screen) */}
      <div className="hidden print-table-only print:block">
        <table className="corporate-kyc-print-table">
          <tbody>
            <tr><td className="corporate-kyc-print-label">Name</td><td>{fmt([customer?.firstName, customer?.middleName, customer?.lastName].filter(Boolean).join(" "))}</td></tr>
            <tr><td className="corporate-kyc-print-label">Username</td><td>{fmt(customer?.userName)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(customer?.emailAddress)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Phone</td><td>{fmt(customer?.phoneNo)}</td></tr>
            <tr><td className="corporate-kyc-print-label">Company</td><td>{fmt(corporateKyc?.entityName)}</td></tr>
            <tr><td className="corporate-kyc-print-label">PAN Number</td><td>{fmt(corporateKyc?.panNumber)}</td></tr>
          </tbody>
        </table>

        {corporateKyc && (
          <>
            <h2 className="corporate-kyc-print-section-title">Correspondence address</h2>
            <table className="corporate-kyc-print-table">
              <tbody>
                <tr><td className="corporate-kyc-print-label">Full address</td><td>{fmt(corporateKyc.correspondenceFullAddress)}</td></tr>
                <tr><td className="corporate-kyc-print-label">Line 1</td><td>{fmt(corporateKyc.correspondenceLine1)}</td></tr>
                <tr><td className="corporate-kyc-print-label">Line 2</td><td>{fmt(corporateKyc.correspondenceLine2)}</td></tr>
                <tr><td className="corporate-kyc-print-label">City</td><td>{fmt(corporateKyc.correspondenceCity)}</td></tr>
                <tr><td className="corporate-kyc-print-label">District</td><td>{fmt(corporateKyc.correspondenceDistrict)}</td></tr>
                <tr><td className="corporate-kyc-print-label">State</td><td>{fmt(corporateKyc.correspondenceState)}</td></tr>
                <tr><td className="corporate-kyc-print-label">PIN code</td><td>{fmt(corporateKyc.correspondencePinCode)}</td></tr>
              </tbody>
            </table>

            {(corporateKyc.bankAccounts?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Bank accounts</h2>
                {corporateKyc.bankAccounts.map((acc, i) => (
                  <table key={acc.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Account holder name</td><td>{fmt(acc.accountHolderName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account number</td><td>{fmt(acc.accountNumber)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Bank name</td><td>{fmt(acc.bankName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">IFSC code</td><td>{fmt(acc.ifscCode)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Branch</td><td>{fmt(acc.branch)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Primary account</td><td>{acc.isPrimaryAccount ? "Yes" : "No"}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.dematAccounts?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Demat accounts</h2>
                {corporateKyc.dematAccounts.map((acc, i) => (
                  <table key={acc.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Depository</td><td>{fmt(acc.depository)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account holder name</td><td>{fmt(acc.accountHolderName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">DP ID</td><td>{fmt(acc.dpId)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Client ID</td><td>{fmt(acc.clientId)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Account type</td><td>{fmt(acc.accountType)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Primary</td><td>{acc.isPrimary ? "Yes" : "No"}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.directors?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Directors</h2>
                {corporateKyc.directors.map((dir, i) => (
                  <table key={dir.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(dir.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(dir.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(dir.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">DIN</td><td>{fmt(dir.din)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(dir.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(dir.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.promoters?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Promoters</h2>
                {corporateKyc.promoters.map((p, i) => (
                  <table key={p.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(p.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(p.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(p.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(p.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(p.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}

            {(corporateKyc.authorisedSignatories?.length ?? 0) > 0 && (
              <>
                <h2 className="corporate-kyc-print-section-title">Authorised signatories</h2>
                {corporateKyc.authorisedSignatories.map((s, i) => (
                  <table key={s.id ?? i} className="corporate-kyc-print-table">
                    <tbody>
                      <tr><td className="corporate-kyc-print-label">Full name</td><td>{fmt(s.fullName)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">PAN</td><td>{fmt(s.pan)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Designation</td><td>{fmt(s.designation)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Email</td><td>{fmt(s.email)}</td></tr>
                      <tr><td className="corporate-kyc-print-label">Mobile</td><td>{fmt(s.mobile)}</td></tr>
                    </tbody>
                  </table>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
