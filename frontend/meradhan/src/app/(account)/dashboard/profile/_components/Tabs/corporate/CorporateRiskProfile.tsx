"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import apiGateway, {
  ApiError,
  type CorporateRiskProfileQuestion,
  GetCustomerResponseById,
} from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdOutlineArrowRight } from "react-icons/md";

type Answer = CorporateRiskProfileQuestion & { ans: string };

export default function CorporateRiskProfile({
  profile,
  allowSave = true,
}: {
  profile: GetCustomerResponseById["responseData"];
  allowSave?: boolean;
}) {
  const corporateKycApi = useMemo(
    () =>
      new apiGateway.meradhan.customerCorporateKycApi.CorporateKycApi(
        apiClientCaller,
      ),
    [],
  );

  const priorAnswers = profile?.riskProfile?.data ?? [];

  const questionsQuery = useQuery({
    queryKey: ["corporate-profile", "risk-profile-questions"],
    queryFn: async () => {
      const res = await corporateKycApi.getRiskProfileQuestions();
      return res.responseData.questions;
    },
  });

  const [answers, setAnswers] = useState<Answer[] | null>(null);

  useEffect(() => {
    if (!questionsQuery.data) return;
    const priorByQus = new Map(
      priorAnswers.map((a) => [a.qus.trim().toLowerCase(), a.ans]),
    );
    setAnswers(
      questionsQuery.data.map((q) => ({
        ...q,
        ans: priorByQus.get(q.qus.trim().toLowerCase()) ?? "",
      })),
    );
  }, [questionsQuery.data, priorAnswers]);

  const saveRiskProfileMutation = useMutation({
    mutationKey: ["save-corporate-risk-profile", profile.id],
    mutationFn: async (payload: Answer[]) => {
      const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
        apiClientCaller,
      );
      return await apiModel.setRiskProfile(payload);
    },
    onSuccess: () => {
      toast.success("Risk profile saved successfully");
      queryClient.invalidateQueries({ queryKey: ["profile-page"] });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiError) {
        toast.error(
          error.response?.data.message ||
            "An error occurred while saving the risk profile.",
        );
      } else {
        toast.error("An unexpected error occurred. Please try again later.");
      }
    },
  });

  const updateAnswer = (idx: number, ans: string) => {
    setAnswers((prev) =>
      prev?.map((a, i) => (i === idx ? { ...a, ans } : a)) ?? null,
    );
  };

  if (questionsQuery.isPending) {
    return (
      <div className="flex items-center gap-3 mt-5 text-sm">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        <span>Loading questions…</span>
      </div>
    );
  }

  if (questionsQuery.isError || !answers) {
    return (
      <p className="mt-5 text-destructive text-sm">
        Could not load risk-profile questions. Please refresh and try again.
      </p>
    );
  }

  return (
    <Card className="px-0 border-none">
      <CardHeader className="px-0">
        <CardTitle className="font-normal">Corporate Investment Experience</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="flex flex-col gap-5">
          {answers.map((question, idx) => (
            <div key={idx} className="flex flex-col gap-2">
              <p className="font-medium text-sm">
                {idx + 1}. {question.qus}
              </p>
              <div className="gap-5 grid lg:grid-cols-4 text-sm">
                {question.opt.map((option) => (
                  <div
                    key={option}
                    className={cn(
                      "p-2.5 border border-gray-200 rounded-md text-center cursor-pointer",
                      option === question.ans &&
                        "bg-secondary border-secondary text-white",
                    )}
                    onClick={() => updateAnswer(idx, option)}
                  >
                    <p>{option}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <div>
        {allowSave && (
          <Button
            disabled={saveRiskProfileMutation.isPending}
            onClick={() => saveRiskProfileMutation.mutate(answers)}
            className="flex items-center gap-1 w-full sm:w-auto"
          >
            {saveRiskProfileMutation.isPending ? (
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
        )}
      </div>
    </Card>
  );
}
