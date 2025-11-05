"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import NewRfqInfoForm from "./_components/nseRfqData/NewRfqInfoForm";
import { useRFQFormDataHook } from "./_components/nseRfqData/useNseFormDataHook";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import TradingOptionsForm from "./_components/tradingOptions/TradingOptionsForm";
import { useTradingOptionsFormDataHook } from "./_components/tradingOptions/useTradingOptionsFormDataHook";
import AdditionalInformationForm from "./_components/additionalInformationLogic/AdditionalInformationForm";
import { useAdditionalOptionsFormDataHook } from "./_components/additionalInformationLogic/useAdditionalFormDataHook";
import { Button } from "@/components/ui/button";

const NseCreateParticipant = () => {
  const manager = useRFQFormDataHook();
  const tradingOptionsManager = useTradingOptionsFormDataHook();
  const additionalInfoManager = useAdditionalOptionsFormDataHook();

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />

      <div className="flex flex-col gap-5">
        <Card>
          <CardContent>
            <NewRfqInfoForm manager={manager} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TradingOptionsForm manager={tradingOptionsManager} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <AdditionalInformationForm manager={additionalInfoManager} />
          </CardContent>
          <CardFooter className="gap-5 border-t">
            <Button variant={`secondary`}>Cancel</Button>
            <Button
              variant="default"
              onClick={() => {
                // Handle RFQ creation logic here
                manager.validateRFQData();
                tradingOptionsManager.validateTradingOptionsData();
                additionalInfoManager.validateAdditionalOptionsData();
              }}
            >
              Create RFQ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default NseCreateParticipant;
