"use client";

import { useState } from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { genMediaUrl } from "@/global/utils/url.utils";
import apiGateway, { type BondDocumentItem } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BondDocumentsTabShimmer } from "./BondDetailTabShimmers";
import { BondTabErrorState } from "./BondTabErrorState";
import { BondTabEmptyState } from "./BondTabEmptyState";

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function BondDocumentCard({
  doc,
  onDownload,
}: {
  doc: BondDocumentItem;
  onDownload: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-none transition-colors hover:bg-slate-50">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <FileText className="size-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
          {doc.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="size-3.5 shrink-0" aria-hidden />
          Uploaded {formatWhen(doc.createdAt)}
        </p>
      </div>

      <button
        type="button"
        onClick={onDownload}
        className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
      >
        <Download className="size-4" aria-hidden />
        Download
      </button>
    </div>
  );
}

export default function BondDocumentsTab({
  isin,
  isLoggedIn,
}: {
  isin: string;
  isLoggedIn: boolean;
}) {
  const normalizedIsin = isin.trim().toUpperCase();
  const loginHref = `/login?redirect=${encodeURIComponent(`/bonds/detail/${normalizedIsin}`)}`;
  const [loginOpen, setLoginOpen] = useState(false);

  const query = useQuery<BondDocumentItem[]>({
    queryKey: ["bond-documents-public", normalizedIsin, isLoggedIn],
    queryFn: async (): Promise<BondDocumentItem[]> => {
      const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
      const res = await bondsApi.listBondDocumentsByIsin(normalizedIsin);
      return res.responseData?.documents ?? [];
    },
    enabled: Boolean(normalizedIsin),
    staleTime: 60_000,
  });

  const handleDownload = (doc: BondDocumentItem) => {
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }

    const href =
      doc.canDownload && doc.fileUrl ? genMediaUrl(doc.fileUrl) : null;
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  if (query.isLoading) {
    return <BondDocumentsTabShimmer />;
  }

  if (query.isError) {
    return (
      <BondTabErrorState
        title="Couldn't load documents"
        description="We couldn't fetch the document list for this bond."
        error={query.error}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  const documents = query.data ?? [];

  if (documents.length === 0) {
    return (
      <BondTabEmptyState
        icon={FileText}
        title="No documents yet"
        description="Prospectus, term sheets, and other bond documents will show up here once they're added for this issue."
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 py-6">
        {documents.map((doc) => (
          <BondDocumentCard
            key={doc.id}
            doc={doc}
            onDownload={() => handleDownload(doc)}
          />
        ))}
      </div>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login required</DialogTitle>
            <DialogDescription>
              Sign in to download bond documents for this issue.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLoginOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => {
                window.location.href = loginHref;
              }}
            >
              Login now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
