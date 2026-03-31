"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { useState } from "react";
import { useKraInfoStep } from "./_hooks/useKraInfoStep";
import { KraInfoView } from "./KraInfoView";
import { Button } from "@/components/ui/button";

export default function KraInfoStep() {
  const { state } = useKycDataStorage();
  const kra = state.step_1.kraResponse;
  const { handleUseExisting, handleStartFresh, isPending } = useKraInfoStep();
  const { prevLocalStep } = useKycDataStorage();
  const [kraConfirmed, setKraConfirmed] = useState(true);

  if (!kra) {
    return (
      <Card accountMode>
        <CardContent accountMode className="py-8">
          <p className="text-muted-foreground text-center">
            No KRA data available. Please go back and try again.
          </p>
        <div className="flex justify-center items-center gap-2 mt-4">
        <Button onClick={() => {
            prevLocalStep();
          }}>Retry Verification</Button>
        </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <KraInfoView
      kra={kra}
      confirmed={kraConfirmed}
      onConfirmedChange={setKraConfirmed}
      onUseExisting={handleUseExisting}
      onStartFresh={handleStartFresh}
      isPending={isPending}
    />
  );
}
