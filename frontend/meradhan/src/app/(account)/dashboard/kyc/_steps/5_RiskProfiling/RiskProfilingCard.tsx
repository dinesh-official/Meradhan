"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IoMdArrowDropright } from "react-icons/io";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycStepStore } from "../../_store/useKycStepStore";
import RiskProfilingSelector from "./RiskProfilingSelector";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

function RiskProfilingCard() {
  const { state, setStepIndex } = useKycDataStorage();
  const riskProfiling = state.step_5;

  const isAllowToContinue = () => {
    const defaltSelcted = riskProfiling.filter((item) => !item.ans);
    return defaltSelcted.length === 0;
  };

  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextStep } = useKycStepStore();
  const jumpNext = () => {
    addAuditLog({
      type: "RISK_PROFILING_STEP_COMPLETED",
      desc: "User completed the Risk Profiling step during KYC process.",
    });
    addActivityLog({
      action: "RISK_PROFILING_COMPLETED",
      details: {
        step: "Risk Profiling step",
        Reason: "User completed the Risk Profiling step during KYC process.",
      },
      entityType: "KYC",
    });
    pushUserKycState();
    setStepIndex(0);
    nextStep();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Investment Experience</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <RiskProfilingSelector />
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          disabled={!isAllowToContinue()}
          onClick={jumpNext}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          Save & Continue{" "}
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RiskProfilingCard;
