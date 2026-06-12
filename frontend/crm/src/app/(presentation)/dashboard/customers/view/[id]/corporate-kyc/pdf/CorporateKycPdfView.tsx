"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { encodeId, genMediaUrl } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  Cloud,
  CloudUpload,
  Eye,
  FileDown,
  History,
  Loader2,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { useCorporateKycFileUpload } from "@/app/(presentation)/dashboard/customers/[id]/corporate-kyc/_hooks/useCorporateKycFileUpload";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import AdditionalInfoTab from "./_components/AdditionalInfoTab";
import DocumentsTab from "./_components/DocumentsTab";
import {
  FatcaTab,
  NclTab,
  NfeTab,
  PromotersTab,
  UboTab,
} from "./_components/AnnexureTabs";
import { BankTab, DematTab } from "./_components/BankDematTabs";
import RelatedPersonTab from "./_components/RelatedPersonTab";
import { ApplicationTab, Page2Tab } from "./_components/Sections";
import {
  mapCorporateKycToPdfPayload,
  type CorporateKycData,
} from "./_utils/mapToPdfPayload";

const DEFAULT_PDF_SERVICE_URL =
  process.env.NEXT_PUBLIC_CORPORATE_PDF_SERVICE_URL ??
  "https://pdf-service.meradhan.co/api/corporate/pdf";

function buildFilename(entityName: string | undefined, customerId: number): string {
  const base = (entityName ?? "corporate")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return `corporate-kyc-${customerId}-${base || "entity"}.pdf`;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text);
      return parsed?.message ?? parsed?.error ?? text ?? `HTTP ${res.status}`;
    } catch {
      return text || `HTTP ${res.status}`;
    }
  } catch {
    return `HTTP ${res.status}`;
  }
}

const TABS = [
  { id: "application", label: "Application" },
  { id: "page2", label: "Page 2" },
  { id: "related", label: "Related Person" },
  { id: "additional", label: "Additional Info" },
  { id: "bank", label: "Bank" },
  { id: "demat", label: "Demat" },
  { id: "promoters", label: "Promoters" },
  { id: "fatca", label: "FATCA" },
  { id: "nfe", label: "NFE" },
  { id: "ubo", label: "UBO" },
  { id: "ncl", label: "NCL" },
  { id: "docs", label: "Docs" },
  { id: "json", label: "JSON" },
] as const;
type TabId = (typeof TABS)[number]["id"];

function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function CorporateKycPdfView({
  profileId,
}: {
  profileId: number;
}) {
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const encodedId = encodeId(profileId);
  const queryClient = useQueryClient();
  const { uploadFile } = useCorporateKycFileUpload();

  const [customerQuery, corporateKycQuery, attachmentsQuery] = useQueries({
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
        queryKey: ["CorporateKycAttachments", profileId],
        queryFn: async () => {
          const res = await api.listCorporateKycAttachments(profileId);
          return res.data.responseData ?? [];
        },
        refetchOnWindowFocus: false,
      },
    ],
  });

  const customer = customerQuery.data;
  const corporateKyc = corporateKycQuery.data;
  const attachments = useMemo(() => attachmentsQuery.data ?? [], [attachmentsQuery.data]);
  const isLoading = customerQuery.isLoading || corporateKycQuery.isLoading;
  const isCorporate = customer?.userType === "CORPORATE";

  const [serviceUrl, setServiceUrl] = useState<string>(DEFAULT_PDF_SERVICE_URL);
  const [showServiceConfig, setShowServiceConfig] = useState(false);
  const [tab, setTab] = useState<TabId>("application");
  const [payload, setPayload] = useState<CorporateKycData | null>(null);
  const [jsonText, setJsonText] = useState<string>("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  // "Saving to S3" inflight indicator. Decoupled from `generating` because
  // the S3 upload happens *after* we hand the file to the browser, so we
  // can show "Saved last PDF" success without blocking the download button.
  const [savingLastPdf, setSavingLastPdf] = useState(false);
  // "Downloading last PDF" inflight indicator. We refetch the S3 file via
  // `fetch` + Blob so the download uses a clean filename instead of the
  // S3 key.
  const [downloadingLast, setDownloadingLast] = useState(false);
  const initialized = useRef(false);

  const initialPayload = useMemo<CorporateKycData | null>(() => {
    if (!corporateKyc) return null;
    return mapCorporateKycToPdfPayload(corporateKyc, customer ?? null);
  }, [corporateKyc, customer]);

  useEffect(() => {
    if (initialized.current) return;
    if (!initialPayload) return;
    setPayload(initialPayload);
    setJsonText(JSON.stringify(initialPayload, null, 2));
    initialized.current = true;
  }, [initialPayload]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updatePayload = (next: CorporateKycData) => {
    setPayload(next);
    setJsonText(JSON.stringify(next, null, 2));
    if (jsonError) setJsonError(null);
  };

  const onJsonChange = (text: string) => {
    setJsonText(text);
    if (!text.trim()) {
      setPayload(null);
      setJsonError(null);
      return;
    }
    try {
      const parsed = JSON.parse(text) as CorporateKycData;
      setPayload(parsed);
      setJsonError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid JSON";
      setJsonError(msg);
    }
  };

  const resetFromData = () => {
    if (!initialPayload) return;
    setPayload(initialPayload);
    setJsonText(JSON.stringify(initialPayload, null, 2));
    setJsonError(null);
    toast.success("Form reset from CRM data.");
  };

  /**
   * Uploads the freshly generated PDF blob to S3 and records the location
   * on the corporate KYC row so the "Download last PDF" button on this
   * page (and any future visit) can fetch it. Runs as a fire-and-forget
   * side-effect after the user already has their local download — failures
   * surface as toasts but don't block the primary download flow.
   */
  const persistLastPdf = async (blob: Blob, filename: string) => {
    setSavingLastPdf(true);
    try {
      const file = new File([blob], filename, { type: "application/pdf" });
      const location = await uploadFile(file, "corporate-kyc/pdf");
      if (!location) {
        // useCorporateKycFileUpload already toasts the underlying error.
        return;
      }
      await api.setCorporateKycLastPdf(profileId, { fileUrl: location });
      await queryClient.invalidateQueries({ queryKey: ["corporateKyc", profileId] });
      toast.success("Saved as latest PDF on S3.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save last PDF on S3";
      toast.error(message);
    } finally {
      setSavingLastPdf(false);
    }
  };

  const generate = async (mode: "download" | "preview") => {
    if (!payload) {
      toast.error(jsonError ?? "Payload is empty or invalid JSON.");
      return;
    }
    setGenerating(true);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setPreviewOpen(false);
    }
    try {
      const url = `${serviceUrl}${mode === "download" ? "?download=1" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const message = await readErrorMessage(res);
        throw new Error(message);
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = buildFilename(corporateKyc?.entityName, profileId);
      if (mode === "download") {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        toast.success("Corporate KYC PDF downloaded.");
        // Side-effect: persist to S3 + record as the latest PDF so other
        // operators (and a later visit) can pull the exact same artifact.
        // Fire-and-forget — we already gave the file to the user above.
        void persistLastPdf(blob, filename);
      } else {
        setPreviewUrl(blobUrl);
        setPreviewOpen(true);
        toast.success("Corporate KYC PDF generated.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate PDF";
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Downloads the most recently saved PDF from S3. Uses `fetch` + Blob so
   * the browser's "Save As" picks up our chosen filename instead of the
   * raw S3 key (which is unfriendly to humans). Falls back to opening the
   * URL in a new tab if the fetch fails (e.g. CORS quirks).
   */
  const downloadLastPdf = async () => {
    const url = corporateKyc?.lastGeneratedPdfUrl;
    if (!url) {
      toast.error("No saved PDF yet. Generate one first.");
      return;
    }
    setDownloadingLast(true);
    try {
      const absoluteUrl = genMediaUrl(url);
      const res = await fetch(absoluteUrl, { credentials: "omit" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const filename = buildFilename(corporateKyc?.entityName, profileId);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      toast.success("Last saved PDF downloaded.");
    } catch (err) {
      // Fallback for any browser/CORS edge case: open in a new tab so the
      // operator can save it manually.
      const absoluteUrl = genMediaUrl(url);
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
      const message =
        err instanceof Error ? err.message : "Failed to download last PDF";
      toast.message("Opened last PDF in a new tab.", { description: message });
    } finally {
      setDownloadingLast(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!isCorporate) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6">
        <PageInfoBar
          showBack
          title="Corporate KYC PDF"
          description="Generate the 19-page corporate KYC PDF via the external service"
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>
              This customer is not a corporate user. Corporate KYC PDF
              generation is only available for user type &quot;CORPORATE&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!corporateKyc) {
    return (
      <div className="flex flex-col gap-6 px-4 py-6">
        <PageInfoBar
          showBack
          title="Corporate KYC PDF"
          description="Generate the 19-page corporate KYC PDF via the external service"
        />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No corporate KYC data has been added for this customer yet.</p>
            <Button asChild variant="link" className="mt-2">
              <Link href={`/dashboard/customers/${encodedId}/corporate-kyc`}>
                Add Corporate KYC
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <PageInfoBar
        showBack
        title="Corporate KYC PDF"
        description={`Edit, review and generate the 19-page corporate KYC PDF for ${corporateKyc.entityName ?? "this entity"}`}
        actions={
          <div className="flex w-full flex-wrap items-center justify-start gap-2 md:w-auto md:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={resetFromData}
              disabled={generating}
              title="Rebuild form from latest CRM data"
            >
              <RotateCcw className="h-4 w-4" />
              Reset from CRM data
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void generate("preview")}
              disabled={generating || !!jsonError || !payload}
              title="Generate the PDF and open the full-screen preview"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview
            </Button>
            {previewUrl && !previewOpen ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPreviewOpen(true)}
                disabled={generating}
                title="Reopen the latest preview without regenerating"
              >
                <Eye className="h-4 w-4" />
                View preview
              </Button>
            ) : null}
            {/*
             * Download the most recent PDF previously saved to S3. Hidden
             * when there's nothing saved yet (cleaner first-run UX).
             */}
            {corporateKyc?.lastGeneratedPdfUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => void downloadLastPdf()}
                disabled={downloadingLast || generating}
                title={
                  corporateKyc?.lastGeneratedPdfAt
                    ? `Last saved ${formatRelativeTime(corporateKyc.lastGeneratedPdfAt)} — fetched from S3.`
                    : "Download the most recently saved PDF from S3."
                }
              >
                {downloadingLast ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <History className="h-4 w-4" />
                )}
                Download last PDF
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={() => void generate("download")}
              disabled={generating || !!jsonError || !payload}
              title="Generate, download, and save the PDF on S3 as the latest snapshot"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Generate &amp; download
            </Button>
          </div>
        }
      />

      {/*
       * Status line showing when the last PDF was saved to S3 (and a live
       * indicator while a new save is in flight). Kept light-weight so it
       * doesn't dominate the layout — sits right under PageInfoBar.
       */}
      {(corporateKyc?.lastGeneratedPdfAt || savingLastPdf) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {savingLastPdf ? (
            <>
              <CloudUpload className="h-3.5 w-3.5 animate-pulse" />
              <span>Saving latest PDF on S3…</span>
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5" />
              <span>
                Last saved on S3:{" "}
                {new Date(corporateKyc!.lastGeneratedPdfAt!).toLocaleString()}{" "}
                ({formatRelativeTime(corporateKyc!.lastGeneratedPdfAt!)})
              </span>
            </>
          )}
        </div>
      )}

      <Card>
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 text-left"
          onClick={() => setShowServiceConfig((v) => !v)}
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" />
            PDF service configuration
            {serviceUrl !== DEFAULT_PDF_SERVICE_URL && (
              <span className="text-[10px] text-muted-foreground">(custom)</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
              showServiceConfig && "rotate-180",
            )}
          />
        </button>
        {showServiceConfig && (
          <CardContent className="grid gap-3 pb-4 pt-0">
            <div className="space-y-1">
              <Label htmlFor="service-url" className="text-xs font-medium text-muted-foreground">
                PDF service URL
              </Label>
              <Input
                id="service-url"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                placeholder="http://localhost:5003/api/corporate/pdf"
                disabled={generating}
              />
              <p className="text-xs text-muted-foreground">
                Defaults to{" "}
                <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_CORPORATE_PDF_SERVICE_URL</code>
                , falling back to{" "}
                <code className="rounded bg-muted px-1 py-0.5">http://localhost:5003/api/corporate/pdf</code>.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {jsonError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid payload JSON</AlertTitle>
          <AlertDescription>{jsonError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <div className="sticky top-0 z-10 -mx-4 border-b bg-background/98 px-4 pb-2 pt-1">
          <TabsList className="flex h-auto flex-wrap gap-1">
            {TABS.map((t) => {
              const count =
                t.id === "bank" ? (payload?.bankAnnexure?.accounts?.length ?? 0)
                  : t.id === "demat" ? (payload?.dematAnnexure?.accounts?.length ?? 0)
                    : t.id === "promoters" ? (payload?.annexure1?.promoters?.length ?? 0)
                      : t.id === "ubo" ? (payload?.annexure12?.ubos?.length ?? 0)
                        : t.id === "fatca" ? (payload?.annexure11?.taxResidencies?.length ?? 0)
                          : t.id === "docs" ? (payload?.pdfDocumentsUrls?.length ?? 0)
                            : 0;
              return (
                <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs">
                  {t.label}
                  {count > 0 && (
                    <span className="text-[10px] text-muted-foreground">({count})</span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {payload ? (
          <>
            <TabsContent value="application" className="mt-3">
              <ApplicationTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="page2" className="mt-3">
              <Page2Tab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="related" className="mt-3">
              <RelatedPersonTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="additional" className="mt-3">
              <AdditionalInfoTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="bank" className="mt-3">
              <BankTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="demat" className="mt-3">
              <DematTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="promoters" className="mt-3">
              <PromotersTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="fatca" className="mt-3">
              <FatcaTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="nfe" className="mt-3">
              <NfeTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="ubo" className="mt-3">
              <UboTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="ncl" className="mt-3">
              <NclTab value={payload} onChange={updatePayload} disabled={generating} />
            </TabsContent>
            <TabsContent value="docs" className="mt-3">
              <DocumentsTab
                value={payload}
                onChange={updatePayload}
                disabled={generating}
                attachments={attachments}
              />
            </TabsContent>
          </>
        ) : null}

        <TabsContent value="json" className="mt-3">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-sm">
                Full payload (JSON) — escape hatch
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                The form tabs and this JSON are kept in sync. Edit either side; the
                last one wins.
              </p>
            </CardHeader>
            <CardContent className="px-4 py-4">
              <Textarea
                value={jsonText}
                onChange={(e) => onJsonChange(e.target.value)}
                className="min-h-[600px] font-mono text-xs"
                spellCheck={false}
                disabled={generating}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="flex h-screen w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-none p-0 left-0 top-0 sm:max-w-none"
          style={{ maxHeight: "100vh" }}
        >
          <div className="flex items-center justify-between border-b bg-background px-4 py-2">
            <DialogTitle className="text-sm font-medium">
              PDF preview — {corporateKyc.entityName ?? "Corporate KYC"}
            </DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void generate("download")}
              disabled={generating || !!jsonError || !payload}
              title="Download the generated PDF"
              className="mr-8"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              Download
            </Button>
          </div>
          {previewUrl ? (
            <iframe
              title="Corporate KYC PDF preview"
              src={previewUrl}
              className="h-full w-full flex-1 border-0"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
