"use client";

/**
 * Step 1 of the corporate KYC e-sign flow — risk profile capture.
 *
 * Fetches the corporate question set from the backend (`/risk-profile/questions`)
 * so the question text stays in sync with the CRM-side constant. Any prior
 * answers (matched by question text) are pre-filled so a customer who has
 * already filled out an overlapping question doesn't have to redo it.
 *
 * On submit, posts through the existing `/api/auth/customer/profile/risk-profile`
 * endpoint and advances the parent stepper to Step 2 (Digio sign).
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import apiGateway, {
  ApiError,
  type CorporateRiskProfileQuestion,
} from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineArrowRight } from "react-icons/md";
import { useCorporateESign } from "../_hooks/useCorporateESign";

type Answer = CorporateRiskProfileQuestion & { ans: string };

export function RiskProfileStep({
  requestId,
  priorAnswers,
  onContinue,
}: {
  requestId: number;
  priorAnswers: Array<{ qus: string; ans: string }>;
  onContinue: () => void;
}) {
  const { saveRiskProfile } = useCorporateESign(requestId);

  const corporateKycApi = useMemo(
    () =>
      new apiGateway.meradhan.customerCorporateKycApi.CorporateKycApi(
        apiClientCaller,
      ),
    [],
  );

  // Fetch question text from backend so we never drift from the CRM
  // constant. Pre-fill answers by matching question text — exact-string
  // match is enough since the constant on both sides is the same file.
  const questionsQuery = useQuery({
    queryKey: ["corporate-esign", "risk-profile-questions"],
    queryFn: async () => {
      const res = await corporateKycApi.getRiskProfileQuestions();
      return res.responseData.questions;
    },
  });

  const [answers, setAnswers] = useState<Answer[] | null>(null);

  // Hydrate `answers` once the questions arrive. Re-run when prior
  // answers change too (e.g., session refresh).
  if (questionsQuery.data && answers === null) {
    const priorByQus = new Map(
      priorAnswers.map((a) => [a.qus.trim().toLowerCase(), a.ans]),
    );
    setAnswers(
      questionsQuery.data.map((q) => ({
        ...q,
        ans: priorByQus.get(q.qus.trim().toLowerCase()) ?? "",
      })),
    );
  }

  const allAnswered = (answers ?? []).every((a) => Boolean(a.ans));

  const updateAnswer = (idx: number, ans: string) => {
    setAnswers((prev) =>
      prev?.map((a, i) => (i === idx ? { ...a, ans } : a)) ?? null,
    );
  };

  const onSubmit = () => {
    if (!answers) return;
    if (!allAnswered) {
      toast.error("Please answer every question to continue.");
      return;
    }
    saveRiskProfile.mutate(answers, {
      onSuccess: () => {
        toast.success("Risk profile saved");
        onContinue();
      },
      onError: (err: unknown) => {
        if (err instanceof ApiError) {
          toast.error(
            err.response?.data?.message ?? "Could not save risk profile.",
          );
        } else {
          toast.error("Could not save risk profile. Please try again.");
        }
      },
    });
  };

  if (questionsQuery.isPending) {
    return (
      <Card accountMode className="gap-0 text-black">
        <CardContent accountMode className="flex items-center gap-3 pt-6">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          <span>Loading questions…</span>
        </CardContent>
      </Card>
    );
  }

  if (questionsQuery.isError || !answers) {
    return (
      <Card accountMode className="gap-0 text-black">
        <CardContent accountMode className="pt-6">
          <p className="text-sm text-destructive">
            Could not load risk-profile questions. Please refresh and try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card accountMode className="gap-0 text-black">
      <CardHeader accountMode className="gap-0 p-0">
        <CardTitle className="font-normal">
          Step 1 — Corporate Risk Profile
        </CardTitle>
      </CardHeader>
      <CardContent accountMode className="pt-6">
        <p className="text-sm text-muted-foreground mb-6">
          Help us understand how the entity prefers to invest. We use these
          answers to tailor the products we show you.
        </p>
        <div className="flex flex-col gap-5">
          {answers.map((q, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <p className="font-medium text-sm">
                {idx + 1}. {q.qus}
              </p>
              <div className="gap-3 grid sm:grid-cols-2 lg:grid-cols-4 text-sm">
                {q.opt.map((option) => (
                  <button
                    type="button"
                    key={option}
                    onClick={() => updateAnswer(idx, option)}
                    className={cn(
                      "p-2.5 border border-gray-200 rounded-md text-center cursor-pointer transition-colors",
                      option === q.ans &&
                        "bg-secondary border-secondary text-white",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!allAnswered || saveRiskProfile.isPending}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            {saveRiskProfile.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                Save & Continue <MdOutlineArrowRight />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
