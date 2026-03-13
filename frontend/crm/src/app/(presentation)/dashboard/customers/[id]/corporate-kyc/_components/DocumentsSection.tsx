"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { InputField } from "@/global/elements/inputs/InputField";
import { useCorporateKycFileUpload } from "../_hooks/useCorporateKycFileUpload";
import type { CorporateKycFormHook } from "../_hooks/useCorporateKycForm";
import { FileText, ExternalLink } from "lucide-react";

const DOCUMENT_FIELDS: {
  key: keyof NonNullable<CorporateKycFormHook["form"]>;
  label: string;
}[] = [
    { key: "panCopyFileUrl", label: "PAN copy" },
    { key: "balanceSheetCopyUrl", label: "Balance sheet copy" },
    { key: "certificateOfIncorporationUrl", label: "Certificate of incorporation" },
    { key: "memorandumCopyUrl", label: "Memorandum copy" },
    { key: "boardResolutionCopyUrl", label: "Board resolution copy" },
    { key: "gstCopyUrl", label: "GST copy" },
    { key: "clientMasterHoldingCopyUrl", label: "Client master holding copy" },
    { key: "shareHoldingPatternCopyUrl", label: "Share holding pattern copy" },
    {
      key: "certificateOfCommencementOfBizUrl",
      label: "Certificate of commencement of business",
    },
    { key: "articlesOfAssociationUrl", label: "Articles of association" },
    { key: "directorsListCopyUrl", label: "Directors list copy" },
    { key: "powerOfAttorneyCopyUrl", label: "Power of attorney copy" },
  ];

export function DocumentsSection({ hook }: { hook: CorporateKycFormHook }) {
  const { form, setField } = hook;
  const { uploadFile } = useCorporateKycFileUpload();

  const uploadedList = DOCUMENT_FIELDS.filter((f) => {
    const v = form[f.key];
    return typeof v === "string" && v.trim() !== "";
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {DOCUMENT_FIELDS.map(({ key, label }) => (
            <FileUploadField
              key={key}
              label={label}
              value={(form[key] as string) ?? ""}
              onChangeAction={(v) => setField(key, v)}
              onUpload={(file) => uploadFile(file, "corporate-kyc")}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              placeholder="Select file or paste URL"
            />
          ))}
        </div>

        <InputField
          label="GST number"
          value={form.gstNumber ?? ""}
          onChangeAction={(v) => setField("gstNumber", v)}
        />
        <InputField
          label="Annual income"
          value={form.annualIncome ?? ""}
          onChangeAction={(v) => setField("annualIncome", v)}
        />
        <InputField
          label="Documents type"
          value={form.documentsType ?? ""}
          onChangeAction={(v) => setField("documentsType", v)}
        />

        {/* Uploaded files list at bottom */}
        {uploadedList.length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4" />
              Uploaded documents ({uploadedList.length})
            </h3>
            <ul className="space-y-2">
              {uploadedList.map(({ key, label }) => {
                const url = form[key] as string;
                const displayUrl =
                  url.length > 60 ? url.slice(0, 57) + "…" : url;
                return (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-2 py-2 px-3 rounded-md bg-muted/60 text-sm"
                  >
                    <span className="font-medium text-muted-foreground shrink-0">
                      {label}
                    </span>
                    <a
                      href={"/assets/media/files" + url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-primary hover:underline flex items-center gap-1 min-w-0"
                      title={url}
                    >
                      <span className="truncate">{displayUrl}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
