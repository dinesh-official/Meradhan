import React from "react";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { cn } from "@/lib/utils";

function RiskProfilingSelector() {
  const { state, selectStep5RiskProfileAnswer } = useKycDataStorage();
  const riskProfiling = state.step_5;
  return (
    <div className="flex flex-col gap-5">
      {riskProfiling.map((question, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          <p className="font-medium text-sm">{question.qus}</p>
          <div className="gap-5 grid lg:grid-cols-4">
            {question.opt.map((option, n_idx) => (
              <div
                key={n_idx}
                className={cn(
                  "p-2.5 border border-gray-200 rounded-lg text-center cursor-pointer",
                  option === riskProfiling[idx].ans &&
                    "bg-secondary border-0 text-white"
                )}
                onClick={() => selectStep5RiskProfileAnswer(idx, option)}
              >
                <p>{option}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RiskProfilingSelector;
