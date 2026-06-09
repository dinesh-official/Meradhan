"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { genMediaUrl } from "@/global/utils/url.utils";
import { ExternalLink, FileText, Paperclip, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { CorporateKycData } from "../_utils/mapToPdfPayload";

type Attachment = {
  id: number;
  corporateKycModelId: number;
  label: string;
  fileUrl: string;
  createdByCrmUserId?: number | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  value: CorporateKycData;
  onChange: (next: CorporateKycData) => void;
  disabled?: boolean;
  attachments?: Attachment[];
};

/**
 * Trim and lowercase a URL just enough to compare two strings that *might*
 * differ in trailing whitespace / case while still being the same file.
 */
function normalizeUrl(url: string | undefined | null): string {
  return (url ?? "").trim();
}

function getNiceFilename(fileUrl: string | undefined | null): string {
  if (!fileUrl) return "";
  const raw = decodeURIComponent(String(fileUrl));
  const last =
    raw.split("?")[0].split("#")[0].split("/").filter(Boolean).pop() ?? raw;
  return last.replace(/^\d+-/g, "").replace(/^upload-\d+-/g, "");
}

export default function DocumentsTab({
  value,
  onChange,
  disabled,
  attachments = [],
}: Props) {
  const urls = value.pdfDocumentsUrls ?? [];
  const update = (next: string[]) =>
    onChange({ ...value, pdfDocumentsUrls: next });

  /**
   * Locally-tracked URLs the operator unchecked — kept in component state
   * so the URL stays visible in the list (just deselected) instead of
   * disappearing. When ticked again, the URL moves back into
   * `pdfDocumentsUrls`. Trash removes from BOTH lists permanently.
   */
  const [excludedUrls, setExcludedUrls] = useState<string[]>([]);

  /** All URLs the operator can see: currently-active + currently-excluded. */
  const allListedUrls = [...urls.map((u) => (u ?? "").trim()), ...excludedUrls]
    .filter(Boolean)
    // Dedupe while preserving order (active first, then excluded).
    .filter((u, i, arr) => arr.indexOf(u) === i);

  const isUrlActive = (url: string) => urls.some((u) => (u ?? "").trim() === url);

  const toggleUrl = (url: string, checked: boolean) => {
    if (checked) {
      // Move from excluded → active.
      setExcludedUrls((prev) => prev.filter((u) => u !== url));
      if (!isUrlActive(url)) update([...urls, url]);
    } else {
      // Move from active → excluded.
      if (isUrlActive(url)) update(urls.filter((u) => (u ?? "").trim() !== url));
      setExcludedUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
    }
  };

  const removeUrl = (url: string) => {
    update(urls.filter((u) => (u ?? "").trim() !== url));
    setExcludedUrls((prev) => prev.filter((u) => u !== url));
  };

  // Inline "add a custom URL" field — kept separate so the list above stays
  // a clean read-only display of already-saved file URLs (operators can't
  // accidentally corrupt a saved URL by typing in it).
  const [newUrl, setNewUrl] = useState("");
  const addCustomUrl = () => {
    const next = newUrl.trim();
    if (!next) return;
    if (allListedUrls.includes(next)) {
      // Already listed — if it's currently excluded, re-activate it.
      if (excludedUrls.includes(next)) toggleUrl(next, true);
      setNewUrl("");
      return;
    }
    update([...urls, next]);
    setNewUrl("");
  };

  const activeCount = allListedUrls.filter(isUrlActive).length;

  const urlSet = new Set(urls.map(normalizeUrl).filter(Boolean));
  const isAttachmentChecked = (a: Attachment) =>
    urlSet.has(normalizeUrl(a.fileUrl));

  const toggleAttachment = (a: Attachment, checked: boolean) => {
    const target = normalizeUrl(a.fileUrl);
    if (!target) return;
    if (checked) {
      // Avoid duplicates if the URL is already present.
      if (urlSet.has(target)) return;
      update([...urls, target]);
    } else {
      update(urls.filter((u) => normalizeUrl(u) !== target));
    }
  };

  const checkedAttachmentCount = attachments.filter(isAttachmentChecked).length;

  const selectAllAttachments = () => {
    const additions = attachments
      .map((a) => normalizeUrl(a.fileUrl))
      .filter((u) => u && !urlSet.has(u));
    if (additions.length === 0) return;
    update([...urls, ...additions]);
  };

  const clearAttachmentSelection = () => {
    const attachmentUrls = new Set(
      attachments.map((a) => normalizeUrl(a.fileUrl)),
    );
    update(urls.filter((u) => !attachmentUrls.has(normalizeUrl(u))));
  };

  return (
    <div className="space-y-4">
      {/* --- Attachments (uploaded via the corporate KYC form's Attachments card) --- */}
      <Card className="gap-0 py-0">
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              Attachments
              <span className="text-xs font-normal text-muted-foreground">
                ({checkedAttachmentCount}/{attachments.length} selected)
              </span>
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tick the attachments to include in the generated PDF. Click the
              filename to open the file in a new tab.
            </p>
          </div>
          {attachments.length > 0 ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAllAttachments}
                disabled={
                  disabled || checkedAttachmentCount === attachments.length
                }
              >
                Select all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAttachmentSelection}
                disabled={disabled || checkedAttachmentCount === 0}
              >
                Clear
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="px-4 py-3">
          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No attachments uploaded for this corporate KYC yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {attachments.map((a) => {
                const checked = isAttachmentChecked(a);
                const filename = getNiceFilename(a.fileUrl);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <Checkbox
                      id={`attachment-${a.id}`}
                      checked={checked}
                      onCheckedChange={(v) =>
                        toggleAttachment(a, Boolean(v))
                      }
                      disabled={disabled}
                    />
                    <label
                      htmlFor={`attachment-${a.id}`}
                      className="min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="text-sm font-medium truncate">
                        {a.label}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {filename || a.fileUrl}
                      </div>
                    </label>
                    <a
                      href={genMediaUrl(a.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      title="Open file in a new tab"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* --- Attached document URLs (per-URL include toggle) --- */}
      <Card className="gap-0 py-0">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            Attached document URLs
            <span className="text-xs font-normal text-muted-foreground">
              ({activeCount}/{allListedUrls.length} included)
            </span>
          </CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Tick a row to include the file in the generated PDF, untick to
            skip it (the URL stays visible). Files included are sent to the
            service as{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              pdfDocumentsUrls
            </code>
            .
          </p>
        </CardHeader>
        <CardContent className="px-4 py-3">
          {allListedUrls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No document URLs yet.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {allListedUrls.map((url, idx) => {
                const active = isUrlActive(url);
                const filename = getNiceFilename(url);
                return (
                  <li
                    key={url}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <Checkbox
                      id={`pdfurl-${idx}`}
                      checked={active}
                      onCheckedChange={(v) => toggleUrl(url, Boolean(v))}
                      disabled={disabled}
                    />
                    <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <label
                      htmlFor={`pdfurl-${idx}`}
                      className={
                        "min-w-0 flex-1 cursor-pointer " +
                        (active ? "" : "opacity-50")
                      }
                    >
                      <div className="text-sm font-medium truncate">
                        {filename || "(empty URL)"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono">
                        {url}
                      </div>
                    </label>
                    <a
                      href={genMediaUrl(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      title="Open file in a new tab"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeUrl(url)}
                      disabled={disabled}
                      title="Remove URL permanently"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Add a one-off custom URL */}
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomUrl();
                }
              }}
              placeholder="Paste an extra file URL to include…"
              disabled={disabled}
              className="font-mono text-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomUrl}
              disabled={disabled || !newUrl.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              Add URL
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
