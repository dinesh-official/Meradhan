"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";
import RiskProfilingSelector from "./RiskProfilingSelector";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycStepStore } from "../../_store/useKycStepStore";

function RiskProfilingCard() {
  const { state, setStepIndex } = useKycDataStorage();
  const riskProfiling = state.step_5;

  const isAllowToContinue = () => {
    const defaltSelcted = riskProfiling.filter((item) => !item.ans);
    return defaltSelcted.length === 0;
  };

  const { pushUserKycState } = useKycDataProvider();
  const { nextStep } = useKycStepStore();
  const jumpNext = () => {
    pushUserKycState();
    setStepIndex(0);
    nextStep();
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Investment Experience</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <RiskProfilingSelector />
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          disabled={!isAllowToContinue()}
          onClick={jumpNext}
          className="w-full sm:w-auto"
        >
          Save & Continue <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default RiskProfilingCard;
