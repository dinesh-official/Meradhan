"use client";

/**
 * Step 2 of the corporate KYC e-sign flow — Digio iframe sign.
 *
 * Closely mirrors the individual KYC e-sign hook
 * (`kyc/_steps/6_E_Signature/_hooks/useHandelEsignKyc.ts`):
 *
 *   1. POSTs `/digio-request` → backend downloads the operator-uploaded
 *      PDF and hands it to Digio, returning the iframe handoff payload
 *      (entity id + access-token id + signing parties).
 *   2. Mounts the Digio iframe via `useDigioSDK`.
 *   3. In the callback, on success POSTs `/digio-verify` so the backend
 *      pulls the signed PDF from Digio, persists it to S3, and flips the
 *      request to COMPLETED.
 *   4. On full success, routes the customer back to `/dashboard` (the
 *      banner there refreshes server-side, so it'll be gone).
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoMdArrowDropright } from "react-icons/io";
import { useDigioSDK } from "../../../../kyc/_providers/useDigioSDK";
import { useCorporateESign } from "../_hooks/useCorporateESign";

export function DigioSignStep({
  requestId,
  personName,
}: {
  requestId: number;
  personName: string;
}) {
  const router = useRouter();
  const digio = useDigioSDK();
  const { kickOffDigio, verifyDigio } = useCorporateESign(requestId);
  const [agreed, setAgreed] = useState(false);

  const isPending = kickOffDigio.isPending || verifyDigio.isPending;

  const onProceed = () => {
    if (!agreed) {
      toast.error("Please agree to the terms to proceed.");
      return;
    }
    if (!digio.isReady) {
      toast.error("E-sign service is still loading. Please try again.");
      return;
    }

    kickOffDigio.mutate(undefined, {
      onSuccess: (data) => {
        // Without an access-token id the iframe cannot mount — surface
        // a clean error instead of a cryptic SDK failure later on.
        if (!data.accessToken.id) {
          toast.error(
            "Could not initiate e-sign session. Please retry in a moment.",
          );
          return;
        }
        const signerIdentifier =
          data.signingParties?.[0]?.identifier ?? "";
        const digioWindow = digio.createInstance({
          callback: (response) => {
            if (response.error_code) {
              toast.error(response.message || "Signing cancelled.");
              return;
            }
            if (response.digio_doc_id) {
              verifyDigio.mutate(response.digio_doc_id, {
                onSuccess: () => {
                  toast.success("Document signed successfully");
                  // Use `router.refresh()` before `push` so the
                  // dashboard banner (server component) re-fetches and
                  // drops the now-completed row.
                  router.refresh();
                  router.push("/dashboard");
                },
                onError: (err) => {
                  toast.error(
                    err?.message ||
                      "Could not finalise the signed document. Please retry.",
                  );
                },
              });
            } else {
              toast.error(response.message || "Signing did not complete.");
            }
          },
        });
        digioWindow.init();
        digioWindow.submit(
          data.accessToken.entityId,
          signerIdentifier,
          data.accessToken.id,
        );
      },
      onError: (err) => {
        toast.error(
          err?.message ||
            "Could not start the e-sign session. Please retry shortly.",
        );
      },
    });
  };

  return (
    <Card accountMode className="gap-0 text-black">
      <CardHeader accountMode className="gap-0 p-0">
        <CardTitle className="font-normal">
          Step 2 — Sign Corporate KYC Document
        </CardTitle>
      </CardHeader>
      <CardContent accountMode className="pt-6">
        <p className="text-sm text-muted-foreground">
          You&apos;re signing on behalf of{" "}
          <span className="font-medium text-foreground">{personName}</span>.
          Signing is via Digio Aadhaar e-sign — please keep your registered
          mobile handy for the OTP.
        </p>

        <div className="flex flex-col gap-4 mt-6 text-sm">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={agreed}
              onCheckedChange={(c) => {
                if (isPending) {
                  toast.error("Please wait for the e-sign process to complete");
                  return;
                }
                setAgreed(Boolean(c));
              }}
            />
            By continuing, I agree to the following terms:
          </label>
          <ul className="flex flex-col gap-3 ml-10 list-disc text-muted-foreground">
            <li>
              I am an authorised signatory of the entity and I hereby authorise
              MeraDhan to use my Aadhaar / Virtual ID details (as applicable)
              solely for the purpose of e-Signing this corporate KYC document.
            </li>
            <li>
              I confirm the contents of the document have been reviewed and are
              accurate to the best of my knowledge.
            </li>
          </ul>
        </div>

        <div className="mt-8">
          <Button
            type="button"
            onClick={onProceed}
            disabled={!agreed || isPending}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Preparing e-sign…
              </>
            ) : (
              <>
                Proceed to e-Sign
                <IoMdArrowDropright className="text-2xl" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
