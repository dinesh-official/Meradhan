import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import YesNoIndicator from "@/global/elements/yesNoIndicator/YesNoIndicator";
import { RfqAccessBadge } from "../../../_components/bages/NseRfqBadges";

export interface TradingOptionsDataProps {
  rfqValidTillMarketClose: boolean;
  rfqExpiredTime: string;
  quoteNegotiable: boolean;
  valueNegotiable: boolean;
  minimumValueCrores: string;
  valueStepSize: string;
  accessType: number;
  anonymous: boolean;
}

const NseTradingOptions = (tradingOptionsData: TradingOptionsDataProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div className="gap-7 grid md:grid-cols-2">
            <LabelView title="RFQ Valid Till Market Close">
              <div className="flex items-center gap-2">
                {tradingOptionsData.rfqValidTillMarketClose ? (
                  <YesNoIndicator value={true} size={14} textSize="text-base" />
                ) : (
                  <YesNoIndicator
                    value={false}
                    size={14}
                    textSize="text-base"
                  />
                )}
              </div>
            </LabelView>

            <LabelView title="RFQ Expired Time">
              <p className="font-medium text-sm">
                {tradingOptionsData.rfqExpiredTime}
              </p>
            </LabelView>

            <LabelView title="Quote Negotiable">
              <div className="flex items-center gap-2">
                {tradingOptionsData.quoteNegotiable ? (
                  <YesNoIndicator value={true} size={14} textSize="text-base" />
                ) : (
                  <YesNoIndicator
                    value={false}
                    size={14}
                    textSize="text-base"
                  />
                )}
              </div>
            </LabelView>

            <LabelView title="Value Negotiable">
              <div className="flex items-center gap-2">
                {tradingOptionsData.valueNegotiable ? (
                  <YesNoIndicator value={true} size={14} textSize="text-base" />
                ) : (
                  <YesNoIndicator
                    value={false}
                    size={14}
                    textSize="text-base"
                  />
                )}
              </div>
            </LabelView>

            <LabelView title="Minimum Value (Crores)">
              <p className="font-medium text-sm">
                {Number(tradingOptionsData.minimumValueCrores).toFixed(2)}
              </p>
            </LabelView>

            <LabelView title="Value Step Size">
              <p className="font-medium text-sm">
                {tradingOptionsData.valueStepSize}
              </p>
            </LabelView>

            <LabelView title="Access Type">
              <RfqAccessBadge type={tradingOptionsData.accessType} />
            </LabelView>

            <LabelView title="Anonymous">
              <div className="flex items-center gap-2">
                {tradingOptionsData.anonymous ? (
                  <YesNoIndicator value={true} size={14} textSize="text-base" />
                ) : (
                  <YesNoIndicator
                    value={false}
                    size={14}
                    textSize="text-base"
                  />
                )}
              </div>
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NseTradingOptions;
