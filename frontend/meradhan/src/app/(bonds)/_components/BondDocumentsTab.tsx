"use client";

import Link from "next/link";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { genMediaUrl } from "@/global/utils/url.utils";
import apiGateway, { type BondDocumentItem } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
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

function displayFileName(doc: BondDocumentItem) {
  if (doc.fileName?.trim()) return doc.fileName.trim();
  if (doc.fileUrl) {
    const parts = doc.fileUrl.split("/");
    return parts[parts.length - 1] || doc.fileUrl;
  }
  return "Document";
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

  const query = useQuery({
    queryKey: ["bond-documents-public", normalizedIsin, isLoggedIn],
    queryFn: async () => {
      const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
      const res = await bondsApi.listBondDocumentsByIsin(normalizedIsin);
      return res.responseData?.documents ?? [];
    },
    enabled: Boolean(normalizedIsin),
    staleTime: 60_000,
  });

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
    <div className="space-y-3 py-6">
      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground">
          Sign in to download bond documents.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">File</th>
              <th className="px-4 py-3">Uploaded</th>
              <th className="px-4 py-3 text-right">Download</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, index) => {
              const href =
                doc.canDownload && doc.fileUrl
                  ? genMediaUrl(doc.fileUrl)
                  : null;

              return (
                <tr
                  key={doc.id}
                  className={
                    index % 2 === 0
                      ? "border-t border-slate-100 bg-sky-50/60"
                      : "border-t border-slate-100 bg-white"
                  }
                >
                  <td className="px-4 py-3 font-medium">{doc.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {displayFileName(doc)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatWhen(doc.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {href ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={href} target="_blank" rel="noreferrer">
                          <Download className="mr-1.5 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={loginHref}>
                          <LogIn className="mr-1.5 h-4 w-4" />
                          Login to download
                        </Link>
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
