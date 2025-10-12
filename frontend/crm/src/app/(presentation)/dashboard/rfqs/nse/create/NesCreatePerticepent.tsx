"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";
import NewRfqInfoForm from "./_components/nseRfqData/NewRfqInfoForm";
import TradingOptionsForm from "./_components/tradingOptions/TradingOptionsForm";
import AdditionalInformationForm from "./_components/additionalInformationLogic/AdditionalInformationForm";
import { useAdditionalOptionsFormDataHook } from "./_components/additionalInformationLogic/useAdditionalFormDataHook";
import { useRFQFormDataHook } from "./_components/nseRfqData/useNseFormDataHook";
import { useTradingOptionsFormDataHook } from "./_components/tradingOptions/useTradingOptionsFormDataHook";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

const NseCreateParticipant = () => {
  const additionOptions = useAdditionalOptionsFormDataHook();
  const rfqUserFormData = useRFQFormDataHook();
  const tradingOptionsFormData = useTradingOptionsFormDataHook();
  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />
      <div className="w-[80%] mt-6 mx-auto flex flex-col gap-5">
        <Card>
          <CardContent>
            <NewRfqInfoForm manager={rfqUserFormData} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TradingOptionsForm manager={tradingOptionsFormData} />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <AdditionalInformationForm manager={additionOptions} />
          </CardContent>
          <CardFooter>
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  additionOptions.validateAdditionalOptionsData();
                  rfqUserFormData.validateRFQData();
                  tradingOptionsFormData.validateTradingOptionsData();
                }}
              >
                Create New RFQ
              </Button>
              <Button variant={`secondary`}>Cancel</Button>
            </div>
          </CardFooter>
        </Card>

        {/* <Card>
        <CardContent></CardContent>
        <CardFooter className="flex gap-2">
          <Button className="bg-white border text-black">Cancel</Button>
          <Button
            onClick={() => {
              additionOptions.validateAdditionalOptionsData();
              rfqUserFormData.validateRFQData();
              tradingOptionsFormData.validateTradingOptionsData();
            }}
            className=" w-full"
          >
            Create RFQ
          </Button>
        </CardFooter>
      </Card> */}
      </div>
    </div>
  );
};

export default NseCreateParticipant;
