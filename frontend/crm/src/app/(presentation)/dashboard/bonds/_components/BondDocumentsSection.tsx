"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCorporateKycFileUpload } from "@/app/(presentation)/dashboard/customers/[id]/corporate-kyc/_hooks/useCorporateKycFileUpload";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { FileUploadField } from "@/global/elements/inputs/FileUploadField";
import { genMediaUrl } from "@/global/utils/url.utils";
import apiGateway from "@root/apiGateway";
import type { BondDocumentItem } from "@root/apiGateway";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function displayFileName(doc: BondDocumentItem) {
  if (doc.fileName?.trim()) return doc.fileName.trim();
  const parts = doc.fileUrl.split("/");
  return parts[parts.length - 1] || doc.fileUrl;
}

type BondDocumentsSectionProps = {
  isin: string;
  bondName?: string | null;
  className?: string;
};

export function BondDocumentsSection({
  isin,
  bondName,
  className,
}: BondDocumentsSectionProps) {
  const queryClient = useQueryClient();
  const { uploadFile, uploading } = useCorporateKycFileUpload();

  const normalizedIsin = isin.trim().toUpperCase();

  const [docName, setDocName] = useState("");
  const [pendingFileUrl, setPendingFileUrl] = useState("");
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<BondDocumentItem | null>(null);
  const [editName, setEditName] = useState("");

  const documentsQueryKey = useMemo(
    () => ["bond-documents", normalizedIsin] as const,
    [normalizedIsin],
  );

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: documentsQueryKey,
    queryFn: async () => {
      const res = await bondsApi.listBondDocuments(normalizedIsin);
      return res.responseData?.documents ?? [];
    },
    enabled: Boolean(normalizedIsin),
    refetchOnWindowFocus: false,
  });

  const documentCount = documents?.length ?? 0;

  const createMutation = useMutation({
    mutationFn: async () => {
      const name = docName.trim();
      if (!name) throw new Error("Document name is required");
      if (!pendingFileUrl.trim()) throw new Error("Upload a file first");
      return bondsApi.createBondDocument(normalizedIsin, {
        name,
        fileUrl: pendingFileUrl.trim(),
        fileName: pendingFileName,
      });
    },
    onSuccess: () => {
      toast.success("Document saved");
      setDocName("");
      setPendingFileUrl("");
      setPendingFileName(null);
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "Failed to save document");
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editDoc) throw new Error("No document selected");
      const name = editName.trim();
      if (!name) throw new Error("Document name is required");
      return bondsApi.updateBondDocument(normalizedIsin, editDoc.id, { name });
    },
    onSuccess: () => {
      toast.success("Document updated");
      setEditOpen(false);
      setEditDoc(null);
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "Failed to update document");
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (doc: BondDocumentItem) =>
      bondsApi.deleteBondDocument(normalizedIsin, doc.id),
    onSuccess: () => {
      toast.success("Document deleted");
      void queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
        (err instanceof Error ? err.message : "Failed to delete document");
      toast.error(message);
    },
  });

  const handleUpload = async (file: File) => {
    setPendingFileName(file.name);
    return uploadFile(file, "bond-documents");
  };

  const openEdit = (doc: BondDocumentItem) => {
    setEditDoc(doc);
    setEditName(doc.name);
    setEditOpen(true);
  };

  if (!normalizedIsin) return null;

  return (
    <div className={cn("container mx-auto pb-6", className)}>
      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Documents
              </CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {normalizedIsin}
                </Badge>
                {bondName ? <span className="truncate">{bondName}</span> : null}
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit shrink-0 px-3 py-1.5 text-sm">
              {documentsLoading ? "…" : `${documentCount} document${documentCount === 1 ? "" : "s"}`}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <section className="rounded-lg border bg-muted/30 p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4 text-muted-foreground" />
              Upload document
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:items-start">
              <div className="space-y-1.5">
                <Label htmlFor={`doc-name-${normalizedIsin}`}>Document name</Label>
                <Input
                  id={`doc-name-${normalizedIsin}`}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Information Memorandum"
                />
                <p className="text-xs text-muted-foreground">
                  Use a name your team will recognize in the list below.
                </p>
              </div>

              <FileUploadField
                id={`bond-doc-file-${normalizedIsin}`}
                label="File"
                accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                value={pendingFileUrl}
                onChangeAction={setPendingFileUrl}
                onUpload={handleUpload}
                disabled={uploading || createMutation.isPending}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                PDF, Word, Excel, and image files are supported.
              </p>
              <Button
                type="button"
                disabled={
                  !docName.trim() ||
                  !pendingFileUrl.trim() ||
                  uploading ||
                  createMutation.isPending
                }
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save document"
                )}
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">Uploaded files</h3>
              {!documentsLoading && documentCount > 0 ? (
                <span className="text-xs text-muted-foreground">
                  {documentCount} total
                </span>
              ) : null}
            </div>

            <Separator />

            {documentsLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading documents…
              </div>
            ) : !documents?.length ? (
              <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/70" />
                <p className="text-sm font-medium">No documents yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a file using the form above.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-snug">{doc.name}</p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {displayFileName(doc)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Uploaded {formatWhen(doc.createdAt)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={genMediaUrl(doc.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Rename"
                        onClick={() => openEdit(doc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${doc.name}"? This cannot be undone.`,
                            )
                          ) {
                            deleteMutation.mutate(doc);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename document</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="edit-doc-name">Document name</Label>
            <Input
              id="edit-doc-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!editName.trim() || updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
