"use client";

/**
 * Parent client component for the 2-step corporate KYC e-sign flow.
 * Renders Step 1 (risk profile) or Step 2 (Digio iframe) based on local
 * state. The page (`page.tsx`) does ownership / status checks server-side
 * before this component ever mounts.
 *
 * The "view document" link in the header lets the customer download the
 * operator-uploaded PDF for review before signing — handy when the row
 * was created without an inline summary.
 */

import { cn } from "@/lib/utils";
import type { CorporateESignRequest } from "@root/apiGateway";
import { Check } from "lucide-react";
import { useState } from "react";
import { DigioSignStep } from "../_steps/DigioSignStep";
import { RiskProfileStep } from "../_steps/RiskProfileStep";

type Step = "RISK" | "SIGN";

export function CorporateESignFlowView({
  request,
  priorAnswers,
}: {
  request: CorporateESignRequest;
  priorAnswers: Array<{ qus: string; ans: string }>;
}) {
  const [step, setStep] = useState<Step>("RISK");

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border bg-muted/40 p-4 px-5">
        <p className="text-sm text-muted-foreground">
          Signing document for{" "}
          <span className="font-medium text-foreground">
            {request.personName}
          </span>
          .
          {request.eSignDocumentUrl ? (
            <>
              {" "}
              <a
                href={request.eSignDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline-offset-2 hover:underline"
              >
                View document
              </a>
              {" — "}please review before signing.
            </>
          ) : (
            <>
              {" "}
              Complete the risk profile below — your document will be prepared
              when you proceed to sign.
            </>
          )}
        </p>
      </div>

      <ol className="flex items-center gap-4 text-sm">
        <StepIndicator label="Risk Profile" index={1} active={step === "RISK"} done={step !== "RISK"} />
        <div
          className={cn(
            "h-px flex-1",
            step === "RISK" ? "bg-border" : "bg-secondary",
          )}
        />
        <StepIndicator label="Sign" index={2} active={step === "SIGN"} done={false} />
      </ol>

      {step === "RISK" ? (
        <RiskProfileStep
          requestId={request.id}
          priorAnswers={priorAnswers}
          onContinue={() => setStep("SIGN")}
        />
      ) : (
        <DigioSignStep
          requestId={request.id}
          personName={request.personName}
        />
      )}
    </div>
  );
}

function StepIndicator({
  index,
  label,
  active,
  done,
}: {
  index: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
          active && "border-secondary bg-secondary text-white",
          done && !active && "border-secondary bg-secondary/10 text-secondary",
          !active && !done && "border-border bg-background text-muted-foreground",
        )}
      >
        {done && !active ? <Check className="h-3.5 w-3.5" /> : index}
      </span>
      <span
        className={cn(
          "font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
