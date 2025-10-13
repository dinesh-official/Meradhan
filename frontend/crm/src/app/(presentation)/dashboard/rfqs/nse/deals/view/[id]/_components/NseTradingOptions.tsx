import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import { CheckCircle, XCircle } from "lucide-react";

export interface TradingOptionsDataProps {
  rfqValidTillMarketClose: boolean;
  rfqExpiredTime: string;
  quoteNegotiable: boolean;
  valueNegotiable: boolean;
  minimumValueCrores: string;
  valueStepSize: string;
  accessType: string;
  anonymous: boolean;
}

const NseTradingOptions = (tradingOptionsData:TradingOptionsDataProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Options</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div className="grid md:grid-cols-2 gap-7">
            <LabelView title="RFQ Valid Till Market Close">
              <div className="flex gap-2 items-center">
               {tradingOptionsData.rfqValidTillMarketClose ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="font-medium text-sm text-green-600">Yes</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <p className="font-medium text-sm text-red-600">No</p>
                  </>
                )}
              </div>
            </LabelView>

            <LabelView title="RFQ Expired Time">
              <p className="font-medium text-sm">{tradingOptionsData.rfqExpiredTime}</p>
            </LabelView>

            <LabelView title="Quote Negotiable">
              <div className="flex gap-2 items-center">
                {tradingOptionsData.quoteNegotiable ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="font-medium text-sm text-green-600">Yes</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <p className="font-medium text-sm text-red-600">No</p>
                  </>
                )}
              </div>
            </LabelView>

            <LabelView title="Value Negotiable">
              <div className="flex gap-2 items-center" >
                 {tradingOptionsData.valueNegotiable ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="font-medium text-sm text-green-600">Yes</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <p className="font-medium text-sm text-red-600">No</p>
                  </>
                )}
              </div>
            </LabelView>

            <LabelView title="Minimum Value (Crores)">
              <p className="font-medium text-sm">{tradingOptionsData.minimumValueCrores}</p>
            </LabelView>

            <LabelView title="Value Step Size">
              <p className="font-medium text-sm">{tradingOptionsData.valueStepSize}</p>
            </LabelView>

            <LabelView title="Access Type">
              <Badge variant="secondary">{tradingOptionsData.accessType}</Badge>
            </LabelView>

            <LabelView title="Anonymous">
              <div className="flex gap-2 items-center">
               {tradingOptionsData.anonymous ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <p className="font-medium text-sm text-green-600">Yes</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-red-500" />
                    <p className="font-medium text-sm text-red-600">No</p>
                  </>
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
