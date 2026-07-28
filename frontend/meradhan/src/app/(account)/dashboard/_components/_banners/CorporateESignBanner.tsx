/**
 * Dashboard banner shown above the stat grid when the meradhan customer has
 * one or more PENDING corporate KYC e-sign requests. Replaces the static
 * gray "Explore your portfolio…" strip when relevant.
 *
 * Server component — fetches the list with `apiServerCaller`, so the banner
 * is always in sync with the latest backend state on each request. Renders
 * `null` (no banner) when there's nothing pending, which is the common case
 * for individual customers.
 *
 * Each pending request gets its own "Sign Now" link that deep-links into the
 * 2-step sign page at `/dashboard/corporate-kyc/e-sign/[requestId]`.
 */

import { Button } from "@/components/ui/button";
import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { FileSignature } from "lucide-react";
import Link from "next/link";

export async function CorporateESignBanner() {
  // The banner is best-effort: if the request fails or the user has no
  // corporate KYC at all, we simply render nothing — the dashboard still
  // works and the customer can pick this up next visit.
  let pendingCount = 0;
  let firstRequestId: number | null = null;
  let firstPersonName = "";
  try {
    const corporateKycApi =
      new apiGateway.meradhan.customerCorporateKycApi.CorporateKycApi(
        apiServerCaller,
      );
    const res = await corporateKycApi.listPendingESignRequests();
    const requests = res.responseData?.requests ?? [];
    pendingCount = requests.length;
    if (requests.length > 0) {
      const first = requests[0]!;
      firstRequestId = first.id;
      firstPersonName = first.personName;
    }
  } catch {
    /* Banner is non-critical; swallow and skip. */
  }

  if (pendingCount === 0 || firstRequestId == null) {
    return null;
  }

  // Single pending request → "Sign Now" CTA inline. Multiple → CTA points
  // at the latest one and we annotate the count so the customer knows
  // there are more to follow. The sign page itself handles ownership
  // checks and redirects on completion.
  const isPlural = pendingCount > 1;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-secondary/40 bg-secondary/10 p-4 px-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <FileSignature
          aria-hidden
          className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
        />
        <div>
          <p className="font-medium">
            {isPlural
              ? `You have ${pendingCount} corporate KYC documents awaiting your e-signature`
              : `Your corporate KYC document${firstPersonName ? ` for ${firstPersonName}` : ""} is awaiting your e-signature`}
          </p>
          <p className="text-sm text-muted-foreground">
            Sign securely via Digio Aadhaar e-sign — takes under a minute.
          </p>
        </div>
      </div>
      <Link href={`/dashboard/corporate-kyc/e-sign/${firstRequestId}`} title="Sign Now" aria-label="Sign Now">
        <Button variant="secondary" size="sm" className="w-full sm:w-auto">
          Sign Now
        </Button>
      </Link>
    </div>
  );
}

export default CorporateESignBanner;
