"use client";

import { SelectField } from "@/global/elements/inputs/SelectField";
import { useManualKycFormHook } from "../../_hooks/useManualKycFormHook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Step7RiskProfileProps {
  formHook: ReturnType<typeof useManualKycFormHook>;
}

interface RiskQuestion {
  qus: string;
  ans: string;
  index: number;
  opt: string[];
}

const RISK_PROFILE_QUESTIONS: RiskQuestion[] = [
  {
    qus: "How many years of investment experience do you have?",
    ans: "",
    index: 0,
    opt: ["None", "Up to 1 year", "1 – 5 years", "More than 5 years"],
  },
  {
    qus: "What is your investment goal?",
    ans: "",
    index: 1,
    opt: [
      "Steady Income",
      "Capital Gains",
      "Short-term Parking",
      "Risk Diversification",
    ],
  },
  {
    qus: "What is your risk appetite?",
    ans: "",
    index: 2,
    opt: [
      "Low Risk & Low Returns",
      "Moderate Risk & Moderate Returns",
      "High Risk & High Returns",
    ],
  },
  {
    qus: "What is your investment time horizon?",
    ans: "",
    index: 3,
    opt: ["Up to 1 year", "1 – 3 years", "3 – 5 years", "More than 5 years"],
  },
];

export function Step7RiskProfile({ formHook }: Step7RiskProfileProps) {
  const { formData, updateStepData, getFieldError } = formHook;

  // Get current responses or initialize with questions
  const getResponses = (): RiskQuestion[] => {
    const responses = formData.step7.riskQuestionnaireResponses;

    // If responses is an array, use it
    if (Array.isArray(responses) && responses.length > 0) {
      return responses as RiskQuestion[];
    }

    // If responses is an object with question keys, convert to array
    if (typeof responses === "object" && responses !== null && !Array.isArray(responses)) {
      const questionMap: Record<number, RiskQuestion> = {};
      RISK_PROFILE_QUESTIONS.forEach((q) => {
        const key = `question_${q.index}`;
        const response = (responses as Record<string, { answer?: string } | string | undefined>)[key];
        const ansStr = typeof response === "string" ? response : (response as { answer?: string } | undefined)?.answer ?? "";
        questionMap[q.index] = {
          ...q,
          ans: ansStr,
        };
      });
      return RISK_PROFILE_QUESTIONS.map((q) => questionMap[q.index] || q);
    }

    // Default: return questions with empty answers
    return RISK_PROFILE_QUESTIONS;
  };

  const responses = getResponses();

  const handleAnswerChange = (index: number, answer: string) => {
    const updated = responses.map((r) =>
      r.index === index ? { ...r, ans: answer } : r
    );

    // Update form data in the expected format (array)
    updateStepData("step7", { riskQuestionnaireResponses: updated });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Risk Profile Questionnaire</CardTitle>
          <p className="text-sm text-muted-foreground">
            Please answer all questions to complete your risk profile assessment.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {responses.map((question) => (
            <SelectField
              key={question.index}
              label={`${question.index + 1}. ${question.qus}`}
              placeholder="Select an answer"
              required
              value={question.ans}
              onChangeAction={(e) => handleAnswerChange(question.index, e)}
              options={question.opt.map((option) => ({
                label: option,
                value: option,
              }))}
              error={getFieldError(7, `riskQuestionnaireResponses[${question.index}].ans`)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

