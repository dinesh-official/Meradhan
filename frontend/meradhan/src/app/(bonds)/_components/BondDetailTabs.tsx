"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BondDetailResponse, ISessionResponse } from "@root/apiGateway";
import BondOverview from "./BondOverview";
import BondCashflowTab from "./BondCashflowTab";
import BondDocumentsTab from "./BondDocumentsTab";
import { sanitizeStrapiHTML } from "@/global/utils/html-sanitizer";

type Bond = BondDetailResponse["responseData"];

function hasText(v: string | null | undefined): boolean {
  if (!v) return false;
  const t = v.trim();
  if (!t) return false;
  return !/^(n\/?a|none|-+|null|undefined)$/i.test(t);
}

// New issuer descriptions are HTML (from the CRM rich-text editor); legacy
// rows are plain text. Detect HTML so legacy text keeps its line breaks.
function looksLikeHtml(v: string): boolean {
  return /<[a-z][\s\S]*>/i.test(v);
}

export default function BondDetailTabs({
  bond,
  session,
}: {
  bond: Bond;
  session?: ISessionResponse["responseData"] | null;
}) {
  return (
    <Tabs defaultValue="overview" className="pt-10 pb-4">
      <TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1.5 sm:grid-cols-4">
        <TabsTrigger value="overview" className="py-2.5 text-base md:text-lg font-semibold">
          Overview
        </TabsTrigger>
        <TabsTrigger value="issuer" className="py-2.5 text-base md:text-lg font-semibold">
          Issuer
        </TabsTrigger>
        <TabsTrigger value="cashflow" className="py-2.5 text-base md:text-lg font-semibold">
          Cash Flow
        </TabsTrigger>
        <TabsTrigger value="documents" className="py-2.5 text-base md:text-lg font-semibold">
          Documents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <BondOverview bond={bond} session={session} />
      </TabsContent>

      <TabsContent value="issuer">
        {hasText(bond.issuerDescription) ? (
          <div className="py-8">
            {hasText(bond.bondName) && (
              <h3 className="text-xl font-semibold mb-4">
                About {bond.bondName}
              </h3>
            )}
            {looksLikeHtml(bond.issuerDescription!) ? (
              <div
                className="article text-base text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeStrapiHTML(bond.issuerDescription),
                }}
              />
            ) : (
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {bond.issuerDescription}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            No issuer information available yet.
          </div>
        )}
      </TabsContent>

      <TabsContent value="cashflow">
        <BondCashflowTab isin={bond.isin} />
      </TabsContent>

      <TabsContent value="documents">
        <BondDocumentsTab
          isin={bond.isin}
          isLoggedIn={Boolean(session?.id)}
        />
      </TabsContent>
    </Tabs>
  );
}
