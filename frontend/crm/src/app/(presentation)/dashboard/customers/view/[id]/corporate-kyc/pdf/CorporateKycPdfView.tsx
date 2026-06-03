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
import { encodeId } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import { useQueries } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  Eye,
  FileDown,
  Loader2,
  RotateCcw,
  Settings2,
} from "lucide-react";
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

export default function CorporateKycPdfView({
  profileId,
}: {
  profileId: number;
}) {
  const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const encodedId = encodeId(profileId);

  const [customerQuery, corporateKycQuery] = useQueries({
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
    ],
  });

  const customer = customerQuery.data;
  const corporateKyc = corporateKycQuery.data;
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
      if (mode === "download") {
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = buildFilename(corporateKyc?.entityName, profileId);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blobUrl);
        toast.success("Corporate KYC PDF downloaded.");
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
            <Button
              type="button"
              onClick={() => void generate("download")}
              disabled={generating || !!jsonError || !payload}
              title="Generate and download the PDF"
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
              <DocumentsTab value={payload} onChange={updatePayload} disabled={generating} />
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
