"use client";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { encodeId } from "@/global/utils/url.utils";
import apiGateway, {
  type CorporateKraPastExecution,
  type CorporateKraPreviewResponse,
  type TriggerCorporateKraPayload,
} from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Cloud,
  CloudDownload,
  Code2,
  Copy,
  FileWarning,
  Landmark,
  Loader2,
  OctagonX,
  Play,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { KraLogsCard, type KraLogRow } from "../../../../_components/KraLogsCard";

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusToneClass(status?: string | null): string {
  if (!status) return "bg-muted text-muted-foreground";
  const s = status.toUpperCase();
  if (s === "VERIFIED") return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("FAIL") || s.includes("REJ")) return "bg-red-100 text-red-800 border-red-200";
  if (s.includes("PENDING") || s.includes("WAITING") || s.includes("UNDERPROCESS")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  if (s.includes("MANUAL_FINISHED")) return "bg-zinc-100 text-zinc-800 border-zinc-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

function copyToClipboard(text: string, label: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    toast.error("Clipboard not available");
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success(`${label} copied to clipboard`))
    .catch(() => toast.error(`Failed to copy ${label.toLowerCase()}`));
}

function formatValue(v: unknown): string {
  if (v == null || v === "") return "—";
  if (typeof v === "string") {
    // Try to detect ISO dates and render the day part nicely.
    const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
    if (m) return `${m[3]}-${m[2]}-${m[1]}`;
    return v;
  }
  return String(v);
}

// ─── View ───────────────────────────────────────────────────────────────────

export default function CorporateKraView({ profileId }: { profileId: number }) {
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const queryClient = useQueryClient();
  const encodedId = encodeId(profileId);

  const [triggerOpen, setTriggerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [showFullDownload, setShowFullDownload] = useState(false);

  const pastExecutionOptions: CorporateKraPastExecution[] = [
    "MODIFY",
    "REGISTER",
    "NONE",
    "CBRICS_ONLY",
  ];
  const pastExecutionLabels: Record<CorporateKraPastExecution, string> = {
    MODIFY: "Modify KRA",
    REGISTER: "Fresh KRA (register)",
    NONE: "None",
    CBRICS_ONLY: "CBRICS only",
  };
  const [pastExecution, setPastExecution] =
    useState<CorporateKraPastExecution>("MODIFY");
  const [confirmValue, setConfirmValue] = useState("");
  const confirmationRequiredValue = "CONFIRM";
  const isConfirmValid =
    confirmValue.trim().toUpperCase() === confirmationRequiredValue;

  const previewQuery = useQuery({
    queryKey: ["corporateKraPreview", profileId],
    queryFn: async () => (await api.corporateKraPreview(profileId)).data.responseData,
    refetchOnWindowFocus: false,
    refetchInterval: (q) => {
      const data = q.state.data;
      if (data && "isRunning" in data && data.isRunning) return 5000;
      return false;
    },
  });

  const triggerMutation = useMutation({
    mutationFn: async (payload: TriggerCorporateKraPayload) =>
      (await api.triggerCorporateKra(profileId, payload)).data.responseData,
    onSuccess: () => {
      toast.success("Corporate KRA triggered.");
      setTriggerOpen(false);
      setConfirmValue("");
      void queryClient.invalidateQueries({
        queryKey: ["corporateKraPreview", profileId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["CorporateKraStatus", profileId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["corporateKycKraLogs", profileId],
      });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to trigger corporate KRA"),
      );
    },
  });

  const handleConfirmTriggerCorporateKra = () => {
    const preview = previewQuery.data;
    if (!preview || !("validation" in preview)) return;
    if (preview.isRunning) {
      toast.error("KRA process is already running.");
      return;
    }
    if (!preview.validation.canTrigger) {
      toast.error("Fix the highlighted validation errors first.");
      return;
    }
    if (!isConfirmValid) {
      toast.error("Please type CONFIRM to proceed.");
      return;
    }
    triggerMutation.mutate({ pastExecution });
  };

  const downloadMutation = useMutation({
    mutationFn: async () => (await api.downloadCorporateKra(profileId)).data.responseData,
    onSuccess: (res) => {
      toast.success(
        `KRA download complete${res?.summary?.status?.label ? ` — ${res.summary.status.label}` : ""}`,
      );
      setDownloadOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["corporateKraPreview", profileId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to download corporate KRA"),
      );
    },
  });

  const finishMutation = useMutation({
    mutationFn: async () => (await api.finishCorporateKra(profileId)).data.responseData,
    onSuccess: () => {
      toast.success("Corporate KRA process finished.");
      setFinishOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["corporateKraPreview", profileId] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to finish corporate KRA"),
      );
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async () => (await api.verifyCorporateCustomer(profileId)).data.responseData,
    onSuccess: (res) => {
      toast.success("Customer verified & activated.");
      setVerifyOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["corporateKraPreview", profileId] });
      void queryClient.invalidateQueries({ queryKey: ["customer", profileId] });
      void queryClient.invalidateQueries({ queryKey: ["CorporateKraStatus", profileId] });
      if (res?.warnings?.length) {
        // Surface non-blocking pre-flight warnings as a second toast so the
        // operator notices fields that were missing on the corporate KYC.
        toast.warning(`Verified with ${res.warnings.length} warning(s).`);
      }
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(
        err?.response?.data?.message ??
          (err instanceof Error ? err.message : "Failed to verify corporate customer"),
      );
    },
  });

  const data = previewQuery.data;
  const isLoading = previewQuery.isLoading;

  const groupedFields = useMemo(() => {
    if (!data || !("mapping" in data)) return {};
    return data.mapping.fields.reduce<Record<string, typeof data.mapping.fields>>(
      (acc, row) => {
        const g = row.group ?? "Other";
        if (!acc[g]) acc[g] = [];
        acc[g].push(row);
        return acc;
      },
      {},
    );
  }, [data]);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  // ── No corporate KYC yet ──
  if (data && data.hasCorporateKyc === false) {
    return (
      <div className="flex flex-col gap-6">
        <div className="pt-3">
          <PageInfoBar
            showBack
            title="Corporate KRA"
            description="Preview the exact NDML KRA payload that will be sent for this corporate customer."
          />
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 text-sm">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground space-y-3">
              <p>No corporate KYC has been added for this customer yet.</p>
              <Button asChild variant="link">
                <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                  Add corporate KYC
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data || !("mapping" in data)) {
    return null;
  }

  const errors = data.validation.errors;
  const warnings = data.validation.warnings;
  const canTrigger = data.validation.canTrigger && !data.isRunning;
  const kraStatus = data.kraStatus?.kraStatus ?? null;
  const kycStatusLabel = data.kraStatus?.kycStatus ?? null;
  const isAlreadyVerified =
    String(kycStatusLabel ?? "").trim().toUpperCase() === "VERIFIED";
  // Verify & Activate is only safe to run once KRA has come back VERIFIED
  // for this corporate — otherwise we would flip the customer's KYC/KRA
  // flags to VERIFIED without an upstream source of truth backing it.
  const isKraVerified =
    String(kraStatus ?? "").trim().toUpperCase() === "VERIFIED";

  return (
    <div className="flex flex-col gap-6">
      <div className="pt-3">
        {data.isRunning ? (
          <Alert className="bg-blue-50/90 text-blue-950 border-blue-200 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-50">
            <Loader2 className="size-4 animate-spin" />
            <AlertTitle>Corporate KRA is running</AlertTitle>
            <AlertDescription>
              The corporate KRA worker is processing this customer. Status refreshes every 5 seconds.
              {data.runnerStartedAt ? (
                <div className="text-xs mt-1 opacity-90">
                  Started at {new Date(data.runnerStartedAt).toLocaleString("en-IN")}
                </div>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}
        <br />
        <PageInfoBar
          showBack
          title="Corporate KRA"
          description="Source-of-truth preview for the NDML Non-Individual KRA payload built from this customer's corporate KYC."
          actions={
            <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto md:justify-end">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/customers/view/${encodedId}/corporate-kyc`}>
                  <ChevronLeft className="h-4 w-4" /> Back to Corporate KYC
                </Link>
              </Button>

              <Button
                variant="outline"
                onClick={() => previewQuery.refetch()}
                disabled={previewQuery.isFetching}
              >
                {previewQuery.isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>

              <AllowOnlyView permissions={["edit:customer"]}>
                <AlertDialog open={downloadOpen} onOpenChange={setDownloadOpen}>
                  <Button
                    variant="outline"
                    disabled={downloadMutation.isPending}
                    title="Fetch the latest KRA data NDML has on file for this corporate's PAN and save it to the database"
                    onClick={() => setDownloadOpen(true)}
                  >
                    {downloadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CloudDownload className="h-4 w-4" />
                    )}
                    Download from KRA
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Download KRA data for this corporate?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Calls NDML&rsquo;s <span className="font-mono">panDownloadDetailsComplete</span>
                        {" "}using this corporate&rsquo;s PAN and date of incorporation, then stores the
                        response in <span className="font-mono">kraDataLogs</span> with stage
                        {" "}<span className="font-mono">CORPORATE_MANUAL_DOWNLOAD</span>. This is a
                        read-only call &mdash; it will not change <span className="font-mono">kraStatus</span>
                        {" "}or enqueue the KRA worker.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={downloadMutation.isPending}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => downloadMutation.mutate()}
                        disabled={downloadMutation.isPending}
                      >
                        {downloadMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Download now
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="default"
                  disabled={!canTrigger || triggerMutation.isPending}
                  title={
                    data.isRunning
                      ? "KRA process is already running"
                      : !data.validation.canTrigger
                        ? "Fix validation errors first"
                        : undefined
                  }
                  onClick={() => {
                    if (data.isRunning) {
                      toast.error("KRA process is already running.");
                      return;
                    }
                    if (!data.validation.canTrigger) {
                      toast.error("Fix the highlighted validation errors first.");
                      return;
                    }
                    setPastExecution("MODIFY");
                    setConfirmValue("");
                    setTriggerOpen(true);
                  }}
                >
                  {triggerMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Trigger KRA
                </Button>
                <Dialog
                  open={triggerOpen}
                  onOpenChange={(open) => {
                    setTriggerOpen(open);
                    if (!open) setConfirmValue("");
                  }}
                >
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Trigger corporate KRA</DialogTitle>
                      <DialogDescription>
                        Select past execution (2×2), then type CONFIRM to
                        proceed. CBRICS only skips CVL KRA and runs NSE CBRICS
                        registration.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Past execution</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {pastExecutionOptions.map((opt) => {
                            const selected = pastExecution === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setPastExecution(opt)}
                                className={[
                                  "w-full text-left min-h-[52px] rounded-xl border px-4 py-3 transition-colors",
                                  selected
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-white hover:bg-gray-50",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between gap-3 h-full">
                                  <div className="font-semibold">
                                    {pastExecutionLabels[opt]}
                                  </div>
                                  {selected ? (
                                    <Check className="size-4 text-blue-700" />
                                  ) : (
                                    <span className="size-4 block" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {errors.length > 0 ? (
                        <div className="rounded-lg border bg-muted/30 p-3">
                          <div className="text-sm font-semibold">
                            Blocking issues
                          </div>
                          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                            {errors.map((e, i) => (
                              <li key={`${e.field}-${i}`}>
                                <span className="font-medium">{e.field}</span>:{" "}
                                {e.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="corp-kra-trigger-confirm">
                          Write confirm
                        </Label>
                        <Input
                          id="corp-kra-trigger-confirm"
                          placeholder="Type CONFIRM"
                          value={confirmValue}
                          onChange={(e) => setConfirmValue(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Type{" "}
                          <span className="font-semibold">CONFIRM</span> to
                          enable trigger.
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        variant="secondary"
                        onClick={() => setTriggerOpen(false)}
                        disabled={triggerMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirmTriggerCorporateKra}
                        disabled={
                          triggerMutation.isPending ||
                          !canTrigger ||
                          !isConfirmValid
                        }
                      >
                        {triggerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Trigger KRA
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/*
                 * Verify & activate is a "soft" confirm — copying KYC data
                 * into the customer satellites is additive (existing rows
                 * are never overwritten) and the KYC/KRA flip is
                 * reversible by the operator, so a standard AlertDialog
                 * confirm is the right friction level. We still render
                 * "what will be copied", any pre-flight warnings, and a
                 * KRA-status heads-up inside the dialog so the operator
                 * isn't clicking blind.
                 */}
                <AlertDialog open={verifyOpen} onOpenChange={setVerifyOpen}>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                      isAlreadyVerified ||
                      !isKraVerified ||
                      verifyMutation.isPending
                    }
                    title={
                      isAlreadyVerified
                        ? "Customer is already verified"
                        : !isKraVerified
                          ? `KRA must be VERIFIED before activating the customer (current: ${kraStatus ?? "—"})`
                          : "Copy corporate KYC into the customer profile and mark KYC/KRA verified"
                    }
                    onClick={() => {
                      if (isAlreadyVerified) {
                        toast.info("Customer is already verified.");
                        return;
                      }
                      if (!isKraVerified) {
                        toast.error(
                          `KRA must be VERIFIED before this customer can be activated. Current KRA status: ${kraStatus ?? "—"}.`,
                        );
                        return;
                      }
                      setVerifyOpen(true);
                    }}
                  >
                    {verifyMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="h-4 w-4" />
                    )}
                    Verify &amp; Activate Customer
                  </Button>
                  <AlertDialogContent className="sm:max-w-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Verify &amp; activate corporate customer?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Copies the corporate KYC into the customer&rsquo;s
                        profile (fill-missing-only) and flips both KYC &amp;
                        KRA status to <span className="font-mono">VERIFIED</span>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 text-sm">
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <div className="font-semibold">What will be copied</div>
                        <ul className="mt-2 list-disc pl-5 text-muted-foreground space-y-0.5">
                          <li>PAN card row (when none exists yet)</li>
                          <li>Current &amp; permanent address (from correspondence / registered blocks)</li>
                          <li>Bank accounts (dedup by account number + IFSC)</li>
                          <li>Demat accounts (dedup by DP id + client id)</li>
                          <li>Legal entity name, FATCA flag, annual income</li>
                        </ul>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Existing customer-side rows are <span className="font-medium">never overwritten</span>.
                        </div>
                      </div>

                      {warnings.length > 0 ? (
                        <div className="rounded-lg border bg-amber-50/60 p-3">
                          <div className="text-sm font-semibold text-amber-900">
                            Pre-flight warnings ({warnings.length})
                          </div>
                          <ul className="mt-2 list-disc pl-5 text-xs text-amber-900 space-y-1">
                            {warnings.slice(0, 6).map((w, i) => (
                              <li key={`${w.field}-${i}`}>
                                <span className="font-medium">{w.field}</span>: {w.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={verifyMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(event) => {
                          // Prevent the default auto-close so the dialog
                          // stays open while the mutation runs; we close
                          // it explicitly in the `onSuccess` handler.
                          event.preventDefault();
                          verifyMutation.mutate();
                        }}
                        disabled={verifyMutation.isPending}
                      >
                        {verifyMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <BadgeCheck className="mr-2 h-4 w-4" />
                        )}
                        Verify &amp; Activate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog open={finishOpen} onOpenChange={setFinishOpen}>
                  <Button
                    variant="outline"
                    disabled={!data.isRunning || finishMutation.isPending}
                    title={
                      !data.isRunning
                        ? "No KRA process is currently running"
                        : "Manually finish the running KRA process"
                    }
                    onClick={() => {
                      if (!data.isRunning) {
                        toast.error("No KRA process is currently running.");
                        return;
                      }
                      setFinishOpen(true);
                    }}
                  >
                    {finishMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <OctagonX className="h-4 w-4" />
                    )}
                    Finish KRA process
                  </Button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Finish corporate KRA process?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cancels pending retries, stops the persistent KRA loop, and re-enables the
                        Trigger button. A <span className="font-medium">MANUAL_FINISHED_BY_CRM</span>{" "}
                        entry will be added to the KRA logs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={finishMutation.isPending}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => finishMutation.mutate()}
                        disabled={finishMutation.isPending}
                      >
                        {finishMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Finish KRA
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </AllowOnlyView>
            </div>
          }
        />
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 text-sm flex flex-col gap-6">
        {/* ── Top status row ── */}
        <Card>
          <CardContent className="py-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">KRA status:</span>
              <Badge variant="outline" className={statusToneClass(kraStatus)}>
                {kraStatus ?? "—"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">KYC status:</span>
              <Badge variant="outline">{data.kraStatus?.kycStatus ?? "—"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">KYC store id:</span>
              <span className="font-mono text-xs">{data.kycDataStoreId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Errors:</span>
              <Badge variant={errors.length === 0 ? "outline" : "destructive"}>
                {errors.length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Warnings:</span>
              <Badge variant="outline" className={warnings.length === 0 ? "" : statusToneClass("PENDING")}>
                {warnings.length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* ── Validation errors ── */}
        {errors.length > 0 ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>{errors.length} blocking issue{errors.length === 1 ? "" : "s"}</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {errors.map((e, i) => (
                  <li key={`${e.field}-${i}`}>
                    <span className="font-medium">{e.field}</span>: {e.message}
                    {e.xmlTag ? (
                      <span className="ml-2 text-xs opacity-80">[{e.xmlTag}]</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-200 bg-green-50/80 text-green-900">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Required fields look good</AlertTitle>
            <AlertDescription>
              All NDML-required fields are present. You can trigger the corporate KRA flow.
            </AlertDescription>
          </Alert>
        )}

        {/* ── Validation warnings ── */}
        {warnings.length > 0 ? (
          <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{warnings.length} warning{warnings.length === 1 ? "" : "s"}</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {warnings.map((w, i) => (
                  <li key={`${w.field}-${i}`}>
                    <span className="font-medium">{w.field}</span>: {w.message}
                    {w.xmlTag ? (
                      <span className="ml-2 text-xs opacity-80">[{w.xmlTag}]</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* ── Mapping notes ── */}
        {data.mapping.notes.length > 0 ? (
          <Alert>
            <FileWarning className="h-4 w-4" />
            <AlertTitle>Mapping notes</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {data.mapping.notes.map((n, i) => (
                  <li key={`${n.xmlTag}-${i}`}>
                    <span className="font-mono text-xs">{n.xmlTag}</span>: {n.note}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {/* ── Tabs: Mapping / XML / Logs ── */}
        <Tabs defaultValue="mapping" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mapping">Field mapping</TabsTrigger>
            <TabsTrigger value="payload">Payload preview</TabsTrigger>
            <TabsTrigger value="xml">XML</TabsTrigger>
            <TabsTrigger value="cbrics" className="flex items-center gap-1">
              CBRICS payload
              {data.cbrics?.validation.errors.length ? (
                <Badge variant="destructive" className="ml-1">
                  {data.cbrics.validation.errors.length}
                </Badge>
              ) : data.cbrics?.validation.warnings.length ? (
                <Badge variant="outline" className={`ml-1 ${statusToneClass("PENDING")}`}>
                  {data.cbrics.validation.warnings.length}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="signatories">People &amp; FATCA</TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-1">
              KRA download
              {data.lastDownload ? (
                <Badge
                  variant="outline"
                  className={`ml-1 ${statusToneClass(data.lastDownload.summary.status.label ?? data.lastDownload.summary.status.code)}`}
                >
                  {data.lastDownload.summary.status.label ?? data.lastDownload.summary.status.code ?? "saved"}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="codes">NDML codes</TabsTrigger>
            <TabsTrigger value="logs">KRA logs</TabsTrigger>
          </TabsList>

          {/* ── Field mapping ── */}
          <TabsContent value="mapping" className="space-y-4">
            {Object.entries(groupedFields).map(([group, rows]) => (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    {group}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[230px]">CRM field</TableHead>
                        <TableHead className="w-[280px]">CRM value</TableHead>
                        <TableHead className="w-[210px]">NDML XML tag</TableHead>
                        <TableHead>Mapped value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => {
                        const missing =
                          row.sourceValue == null || row.sourceValue === "" || row.sourceValue === "undefined";
                        const mappedFallback =
                          row.mappedValue === "" || row.mappedValue == null;
                        return (
                          <TableRow key={`${group}-${row.xmlTag}-${row.label}`}>
                            <TableCell className="font-medium">
                              <div>{row.label}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {row.source}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={missing ? "text-amber-700" : ""}>
                                {formatValue(row.sourceValue)}
                              </span>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{row.xmlTag}</TableCell>
                            <TableCell className="font-mono text-xs">
                              <span className={mappedFallback ? "text-amber-700" : ""}>
                                {row.mappedValue === "" ? "—" : row.mappedValue}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* ── Payload preview (raw JSON of what we'd build into XML) ── */}
          <TabsContent value="payload">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-base">Built NDML payload</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(JSON.stringify(data.payload, null, 2), "Payload")}
                >
                  <Copy className="h-4 w-4" /> Copy JSON
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-[60vh] whitespace-pre">
                  {JSON.stringify(data.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── XML preview (inner + SOAP envelopes) ── */}
          <TabsContent value="xml">
            <XmlPreviewCard data={data} />
          </TabsContent>

          {/* ── CBRICS register + modify payload preview ── */}
          <TabsContent value="cbrics" className="space-y-4">
            <CbricsPayloadCard data={data} />
          </TabsContent>

          {/* ── People & FATCA ── */}
          <TabsContent value="signatories" className="space-y-4">
            <PeopleCard data={data} />
            <FatcaCard data={data} />
          </TabsContent>

          {/* ── Last KRA download ── */}
          <TabsContent value="download" className="space-y-4">
            <LastKraDownloadCard
              lastDownload={data.lastDownload}
              onDownload={() => setDownloadOpen(true)}
              isDownloading={downloadMutation.isPending}
              showFull={showFullDownload}
              onToggleFull={() => setShowFullDownload((s) => !s)}
            />
          </TabsContent>

          {/* ── NDML code lookup tables ── */}
          <TabsContent value="codes">
            <NdmlCodesTab codes={data.codeReference} />
          </TabsContent>

          {/* ── Logs ── */}
          <TabsContent value="logs" className="space-y-4">
            <DecodedLogsCard logs={data.recentLogs ?? []} />
            <KraLogsCard logs={(data.recentLogs as unknown as KraLogRow[]) ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

type LoadedPreview = Extract<CorporateKraPreviewResponse, { hasCorporateKyc: true }>;

type XmlVariantKey = "inner" | "soapRegister" | "soapModify";

const XML_VARIANTS: Array<{
  key: XmlVariantKey;
  label: string;
  description: string;
  filename: (panOrId: string) => string;
}> = [
  {
    key: "inner",
    label: "APP_REQ_ROOT",
    description:
      "The actual KRA document. Sent as the inner XML body of both register (byte stream) and modify (CDATA) calls.",
    filename: (id) => `corporate-kra-${id}-app-req-root.xml`,
  },
  {
    key: "soapRegister",
    label: "SOAP · registration",
    description:
      "Full SOAP envelope used by KraSDK.nonIndividualRegisterUploadKraXML. The inner XML is sent as a per-byte <input> stream under <com:registration>.",
    filename: (id) => `corporate-kra-${id}-soap-registration.xml`,
  },
  {
    key: "soapModify",
    label: "SOAP · processModification",
    description:
      "Full SOAP envelope used by KraSDK.nonIndividualModifyKraXML. The inner XML is sent inside CDATA under <ser:processModification>.",
    filename: (id) => `corporate-kra-${id}-soap-modify.xml`,
  },
];

function downloadXml(filename: string, contents: string, mime?: string) {
  if (typeof window === "undefined") return;
  // Default to XML for backward compatibility with the KRA XML preview
  // callers; JSON callers (CBRICS payload preview) pass `application/json`
  // so the blob's Content-Type matches the saved file extension.
  const blob = new Blob([contents], { type: mime ?? "application/xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── CBRICS payload card ────────────────────────────────────────────────────

type CbricsVariantKey = "register" | "modify";

const CBRICS_VARIANTS: Array<{
  key: CbricsVariantKey;
  label: string;
  description: string;
  filename: (stem: string) => string;
}> = [
  {
    key: "register",
    label: "Register (unreg)",
    description:
      "Body that `ParticipantManager.registerCorporateParticipantFromCorporateKyc` POSTs to NSE CBRICS the first time this corporate is onboarded.",
    filename: (s) => `cbrics-register-${s}.json`,
  },
  {
    key: "modify",
    label: "Modify (unreg/update)",
    description:
      "Body sent on subsequent field edits. Same shape as REGISTER minus `loginId`, with the NSE-assigned `id` and `actualStatus: 4` injected by the SDK.",
    filename: (s) => `cbrics-modify-${s}.json`,
  },
];

function CbricsPayloadCard({ data }: { data: LoadedPreview }) {
  const [variant, setVariant] = useState<CbricsVariantKey>("register");
  const cbrics = data.cbrics;
  const active = CBRICS_VARIANTS.find((v) => v.key === variant) ?? CBRICS_VARIANTS[0]!;
  const contents = useMemo(
    () => JSON.stringify(cbrics[variant], null, 2),
    [cbrics, variant],
  );
  const stem = String(data.kycDataStoreId ?? "preview");

  // The two payloads only differ in a couple of fields (loginId vs
  // id/actualStatus), so show a one-line summary up top so operators
  // don't have to diff JSON manually to spot the participant id.
  const summary = useMemo(() => {
    return [
      { label: "Endpoint", value: cbrics.endpoint[variant] },
      {
        label: "Participant id",
        value: cbrics.participantId == null ? "— (not registered yet)" : String(cbrics.participantId),
      },
      {
        label: "Bytes",
        value: new Blob([contents]).size.toLocaleString(),
      },
    ];
  }, [cbrics.endpoint, cbrics.participantId, variant, contents]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="h-4 w-4 text-muted-foreground" />
            CBRICS payload preview
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(contents, active.label)}
            >
              <Copy className="h-4 w-4" /> Copy JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                downloadXml(active.filename(stem), contents, "application/json")
              }
            >
              <FileWarning className="h-4 w-4" /> Download .json
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CBRICS_VARIANTS.map((v) => (
            <Button
              key={v.key}
              type="button"
              size="sm"
              variant={v.key === variant ? "default" : "outline"}
              onClick={() => setVariant(v.key)}
            >
              {v.label}
            </Button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">{active.description}</p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {summary.map((s) => (
            <span key={s.label}>
              <span className="font-medium">{s.label}:</span>{" "}
              <span className="font-mono">{s.value}</span>
            </span>
          ))}
        </div>

        {cbrics.validation.errors.length > 0 ? (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>
              {cbrics.validation.errors.length} blocking issue
              {cbrics.validation.errors.length === 1 ? "" : "s"}
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {cbrics.validation.errors.map((e, i) => (
                  <li key={`${e.field}-${i}`}>
                    <span className="font-medium">{e.field}</span>: {e.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}

        {cbrics.validation.warnings.length > 0 ? (
          <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {cbrics.validation.warnings.length} warning
              {cbrics.validation.warnings.length === 1 ? "" : "s"}
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {cbrics.validation.warnings.map((w, i) => (
                  <li key={`${w.field}-${i}`}>
                    <span className="font-medium">{w.field}</span>: {w.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ) : null}
      </CardHeader>
      <CardContent>
        <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-[60vh] whitespace-pre">
          {contents}
        </pre>
      </CardContent>
    </Card>
  );
}

function XmlPreviewCard({ data }: { data: LoadedPreview }) {
  const [variant, setVariant] = useState<XmlVariantKey>("inner");
  const xml = data.xml;
  const active = XML_VARIANTS.find((v) => v.key === variant) ?? XML_VARIANTS[0];
  const contents = xml[active.key];
  const stem = String(data.kycDataStoreId ?? "preview");

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            Wire-format XML preview
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(contents, active.label)}
            >
              <Copy className="h-4 w-4" /> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadXml(active.filename(stem), contents)}
            >
              <FileWarning className="h-4 w-4" /> Download .xml
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {XML_VARIANTS.map((v) => (
            <Button
              key={v.key}
              type="button"
              size="sm"
              variant={v.key === variant ? "default" : "outline"}
              onClick={() => setVariant(v.key)}
            >
              {v.label}
            </Button>
          ))}
        </div>

        {xml.credentialsMasked ? (
          <Alert className="border-amber-200 bg-amber-50/80 text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Credentials are masked</AlertTitle>
            <AlertDescription>
              The encrypted KRA password and pass key are replaced with{" "}
              <span className="font-mono">***</span>. The worker injects the real values at call
              time. Everything else here matches the wire payload byte‑for‑byte.
            </AlertDescription>
          </Alert>
        ) : null}

        <p className="text-xs text-muted-foreground">{active.description}</p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>
            <span className="font-medium">SOAPAction:</span>{" "}
            <span className="font-mono">
              {variant === "soapRegister"
                ? xml.soapAction.register
                : variant === "soapModify"
                  ? xml.soapAction.modify
                  : "—"}
            </span>
          </span>
          <span>
            <span className="font-medium">Bytes:</span>{" "}
            <span className="font-mono">{new Blob([contents]).size.toLocaleString()}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-[60vh] whitespace-pre">
          {contents}
        </pre>
      </CardContent>
    </Card>
  );
}

// ─── Last KRA download card ─────────────────────────────────────────────────

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeFromNow(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diffMs = Date.now() - d;
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day} day${day === 1 ? "" : "s"} ago`;
  const mon = Math.round(day / 30);
  if (mon < 12) return `${mon} mo ago`;
  return `${Math.round(mon / 12)} yr ago`;
}

function SummaryRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function LastKraDownloadCard({
  lastDownload,
  onDownload,
  isDownloading,
  showFull,
  onToggleFull,
}: {
  lastDownload: LoadedPreview["lastDownload"];
  onDownload: () => void;
  isDownloading: boolean;
  showFull: boolean;
  onToggleFull: () => void;
}) {
  if (!lastDownload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Cloud className="h-4 w-4 text-muted-foreground" />
            No KRA download saved yet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            We haven&rsquo;t fetched this corporate&rsquo;s KRA data from NDML yet. Click{" "}
            <span className="font-medium text-foreground">Download from KRA</span> in the action bar
            (or below) to call <span className="font-mono">panDownloadDetailsComplete</span> and
            persist the response in <span className="font-mono">kraDataLogs</span>.
          </p>
          <Button onClick={onDownload} disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CloudDownload className="h-4 w-4" />
            )}
            Download from KRA
          </Button>
        </CardContent>
      </Card>
    );
  }

  const s = lastDownload.summary;
  const statusBadge = (
    <Badge variant="outline" className={statusToneClass(s.status.label ?? s.status.code)}>
      {s.status.label ?? s.status.code ?? "—"}
      {s.status.label && s.status.code ? (
        <span className="ml-1 font-mono text-[10px] opacity-70">[{s.status.code}]</span>
      ) : null}
    </Badge>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Cloud className="h-4 w-4 text-muted-foreground" />
              Last KRA download
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                disabled={isDownloading}
                title="Run a fresh KRA download for this corporate"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Re-download
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Saved {formatDateTime(lastDownload.storedAt)}</span>
              <span className="opacity-70">({relativeFromNow(lastDownload.storedAt)})</span>
            </div>
            <span className="text-muted-foreground">
              Log&nbsp;#<span className="font-mono">{lastDownload.logId}</span>
            </span>
            {statusBadge}
            {s.errorDesc.code ? (
              <Badge variant="outline" className={statusToneClass("FAIL")}>
                {s.errorDesc.label ?? s.errorDesc.code}
              </Badge>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            <SummaryRow label="Entity name" value={s.entityName} />
            <SummaryRow label="PAN" value={s.pan} mono />
            <SummaryRow label="Registration no." value={s.registrationNo} />
            <SummaryRow label="Company status" value={s.compStatus} mono />
            <SummaryRow label="Date of incorporation" value={s.doi} />
            <SummaryRow label="Date of commencement" value={s.commencement} />
            <SummaryRow label="KRA download date" value={s.downloadDate} />
            <SummaryRow label="KRA info" value={s.kraInfo} />
            <SummaryRow label="FATCA applicable" value={s.fatcaApplicable} />
            <SummaryRow label="IPV flag" value={s.ipvFlag} />
            <SummaryRow label="IPV date" value={s.ipvDate} />
            <SummaryRow
              label="Additional records"
              value={`${s.additionalRecords} related, ${s.fatcaRecords} FATCA`}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <SummaryRow label="Registered address" value={s.registeredAddress} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <SummaryRow label="Correspondence address" value={s.correspondenceAddress} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Full NDML response</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onToggleFull}>
              {showFull ? "Hide JSON" : "Show JSON"}
            </Button>
            {showFull ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(lastDownload.response, null, 2),
                    "NDML download response",
                  )
                }
              >
                <Copy className="h-4 w-4" /> Copy
              </Button>
            ) : null}
          </div>
        </CardHeader>
        {showFull ? (
          <CardContent>
            <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-[60vh] whitespace-pre">
              {JSON.stringify(lastDownload.response, null, 2)}
            </pre>
          </CardContent>
        ) : (
          <CardContent className="text-xs text-muted-foreground">
            Click <span className="font-medium">Show JSON</span> to see the entire parsed NDML
            response that was stored in <span className="font-mono">kraDataLogs.responseData</span>.
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ─── NDML codes lookup ──────────────────────────────────────────────────────

const CODE_GROUPS: Array<{ key: keyof LoadedPreview["codeReference"]; title: string; description?: string }> = [
  { key: "companyStatus", title: "APP_COMP_STATUS — Company status (Non-Individual)", description: "Used for the entity itself." },
  { key: "annualIncome", title: "APP_INCOME — Annual income range (Non-Individual)", description: "Free-text values get mapped to these codes." },
  { key: "relationship", title: "APP_ADDLDATA_RELATIONSHIP — Relationship with applicant", description: "Director / Promoter / Signatory codes for APP_ADDL_DATA rows." },
  { key: "addressProof", title: "APP_COR_ADD_PROOF / APP_PER_ADD_PROOF — Proof of address" },
  { key: "states", title: "APP_COR_STATE / APP_PER_STATE — State / UT (India)", description: "Use the exact NDML label in the corporate KYC state dropdown." },
  { key: "idProof", title: "APP_EXMT_ID_PROOF — Proof of identity" },
  { key: "occupation", title: "APP_OCC — Occupation (used for individuals)" },
  { key: "politicalConnection", title: "APP_POL_CONN — Political connection (PEP)" },
  { key: "iopFlag", title: "APP_IOP_FLG — KYC update type", description: "Indicates whether the SOAP call is an inquiry, fetch, or modification." },
  { key: "addlUpdateFlag", title: "APP_ADDLDATA_UPDTFLG — Additional KYC update flag" },
  { key: "entityType", title: "APP_TYPE — Entity type" },
  { key: "yesNo", title: "Y/N flags — APP_PAN_COPY, APP_IPV_FLAG, APP_FATCA_APPLICABLE_FLAG…" },
  { key: "docProof", title: "APP_DOC_PROOF — Document submission type" },
  { key: "dumpType", title: "APP_DUMP_TYPE — Download dump type" },
  { key: "kycStatus", title: "APP_STATUS — KYC status (response)", description: "Returned by NDML in download / status responses." },
  { key: "tinType", title: "APP_FATCA_TAX_IDENTIFICATION_TYPE — FATCA TIN type" },
  { key: "tinExemptReason", title: "APP_FATCA_TAX_EXEMPT_REASON — FATCA TIN exempt reason" },
  { key: "fatcaOtherServices", title: "APP_FATCA_OTHER_SERVICES — FATCA other services" },
];

function NdmlCodesTab({ codes }: { codes: LoadedPreview["codeReference"] }) {
  return (
    <div className="space-y-4">
      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>NDML code masters</AlertTitle>
        <AlertDescription>
          Every code below is taken directly from NDML&rsquo;s{" "}
          <span className="font-mono">
            API Registration and Modification Individual Non-Individual file format
          </span>{" "}
          spec. Use this as a reference when filling out the corporate KYC form so the values map
          cleanly during the KRA call.
        </AlertDescription>
      </Alert>
      {CODE_GROUPS.map((g) => {
        const rows = codes[g.key];
        if (!rows?.length) return null;
        return (
          <Card key={g.key}>
            <CardHeader>
              <CardTitle className="text-base">{g.title}</CardTitle>
              {g.description ? (
                <p className="text-xs text-muted-foreground">{g.description}</p>
              ) : null}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Code</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Aliases recognised in CRM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${g.key}-${r.code}`}>
                      <TableCell className="font-mono text-xs">{r.code}</TableCell>
                      <TableCell>{r.label}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.aliases?.join(", ") ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Decoded NDML response codes pulled from recent logs ────────────────────

function DecodedLogsCard({ logs }: { logs: LoadedPreview["recentLogs"] }) {
  const rows = logs.flatMap((l) =>
    (l.decoded ?? []).map((d, i) => ({
      key: `${l.id}-${i}`,
      time: l.reqTime,
      stage: l.stage,
      field: d.field,
      code: d.code,
      label: d.label ?? "—",
    })),
  );

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decoded NDML response codes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No NDML status / rejection codes have been recorded yet. Once the KRA worker runs, this
          card will translate every <span className="font-mono">APP_STATUS</span> and{" "}
          <span className="font-mono">APP_ERROR_DESC</span> from the response into plain English
          using the official rejection-reason master.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Decoded NDML response codes</CardTitle>
        <p className="text-xs text-muted-foreground">
          NDML status / rejection codes extracted from the {logs.length} most recent log entries,
          mapped to the spec.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Time</TableHead>
              <TableHead className="w-[120px]">Stage</TableHead>
              <TableHead>NDML field</TableHead>
              <TableHead className="w-[120px]">Code</TableHead>
              <TableHead>Meaning</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key}>
                <TableCell className="text-xs">
                  {r.time ? new Date(r.time).toLocaleString("en-IN") : "—"}
                </TableCell>
                <TableCell className="text-xs font-medium">{r.stage}</TableCell>
                <TableCell className="font-mono text-xs">{r.field}</TableCell>
                <TableCell className="font-mono text-xs">{r.code}</TableCell>
                <TableCell className="text-sm">{r.label}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PeopleCard({ data }: { data: LoadedPreview }) {
  const addl = (data.payload as { APP_ADDL_DATA?: Array<Record<string, string>> }).APP_ADDL_DATA ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Related persons sent to NDML (APP_ADDL_DATA)</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {addl.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No directors / promoters / signatories captured for this corporate KYC.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>DIN</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>City</TableHead>
                <TableHead>PIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addl.map((p, i) => (
                <TableRow key={`${p.APP_ADDLDATA_PAN ?? "no-pan"}-${i}`}>
                  <TableCell>{p.APP_ADDLDATA_NAME || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.APP_ADDLDATA_PAN || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.APP_ADDLDATA_DIN || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.APP_ADDLDATA_RELATIONSHIP || "—"}</Badge>
                  </TableCell>
                  <TableCell>{p.APP_ADDLDATA_RESCITY || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.APP_ADDLDATA_RESPINCD || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function FatcaCard({ data }: { data: LoadedPreview }) {
  const fatca =
    (data.payload as { FATCA_ADDL_DTLS?: Array<Record<string, string>> }).FATCA_ADDL_DTLS ?? [];
  const flag =
    (data.payload as { APP_PAN_INQ?: { APP_FATCA_APPLICABLE_FLAG?: string } }).APP_PAN_INQ
      ?.APP_FATCA_APPLICABLE_FLAG ?? "N";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          FATCA
          <Badge variant="outline">{flag === "Y" ? "Applicable" : "Not applicable"}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {fatca.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No FATCA additional records will be sent.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity PAN</TableHead>
                <TableHead>Country of residency</TableHead>
                <TableHead>TIN type</TableHead>
                <TableHead>TIN</TableHead>
                <TableHead>Exempt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fatca.map((row, i) => (
                <TableRow key={`fatca-${i}`}>
                  <TableCell className="font-mono text-xs">
                    {row.APP_FATCA_ENTITY_PAN || "—"}
                  </TableCell>
                  <TableCell>{row.APP_FATCA_COUNTRY_RESIDENCY || "—"}</TableCell>
                  <TableCell>{row.APP_FATCA_TAX_IDENTIFICATION_TYPE || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.APP_FATCA_TAX_IDENTIFICATION_NO || "—"}
                  </TableCell>
                  <TableCell>{row.APP_FATCA_TAX_EXEMPT_FLAG || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

