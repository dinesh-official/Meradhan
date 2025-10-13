import React from "react";
import NseRfqInformation from "./_components/NseRfqInformation";
import NseTradingOptions from "./_components/NseTradingOptions";
import NseRecordInformation from "./_components/NseRecordInformation";
import NseAdditionalInformation from "./_components/NseAdditionalInformation";

function NSEDealView() {
  return (
    <div className="flex flex-col m-auto gap-5 max-w-6xl">
      <div>
        <NseRfqInformation
          isin="INE001A01036"
          segment="Normal RFQ"
          buySell="Sell"
          quoteType="Both Price and Yield (B)"
          dealType="Direct"
          rfqSizeCrores="12.5"
          settlementDate="13-Oct-2025"
          yieldType="Yield to Maturity"
          yield="8.7500%"
          rfqNumber="NSE240919002"
          participantCode="ICICI0002"
          clientRegistrationType="Retail"
          status="Pending"
        />
      </div>
      <div className="flex flex-row gap-5 w-full ">
        <div className="w-1/2">
          <NseTradingOptions
            rfqValidTillMarketClose={false}
            rfqExpiredTime="16:00"
            quoteNegotiable={true}
            valueNegotiable={false}
            minimumValueCrores="2.5"
            valueStepSize="0.1000000000"
            accessType="OTO (One to One)"
            anonymous={true}
          />
        </div>
        <div className="w-1/2 flex flex-col gap-5">
          <NseAdditionalInformation
            sector="Corporate"
            rating="AA++"
            remarks="Private bank corporate bond with good ratings"
          />
          <NseRecordInformation
            created="Sep 19, 2025 19:33:35 IST"
            lastUpdated="Sep 19, 2025 19:33:35 IST"
          />
        </div>
      </div>
    </div>
  );
}

export default NSEDealView;
