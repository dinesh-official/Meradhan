import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import {
  DealTypeBadge,
  NseRfqSegmentBadge,
  PriceYieldTypeBadge,
  RfqStatusBadge,
  TradeTypeBadge,
  YieldTypeBadge
} from "../../../_components/bages/NseRfqBadges";
import RefqRegType from "../../../participants/_components/RefqRegType";

export interface RfqInformationDataProps {
  isin: string;
  segment?: string;
  buySell?: string;
  quoteType?: string;
  dealType?: string;
  rfqSizeCrores?: string;
  settlementDate?: string;
  yieldType?: string;
  yield?: string;
  rfqNumber?: string;
  participantCode?: string;
  clientRegistrationType?: string;
  status?: string;
}

const NseRfqInformation = (RfqInformationData: RfqInformationDataProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>RFQ Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          <div className="gap-5 grid md:grid-cols-3">
            <LabelView title="ISIN">
              <p className="font-medium text-sm">{RfqInformationData.isin}</p>
            </LabelView>

            <LabelView title="segment">
              <NseRfqSegmentBadge type={`${RfqInformationData.segment}`} />
            </LabelView>
            <LabelView title="Buy/Sell">
              <TradeTypeBadge type={`${RfqInformationData.buySell}`} />
            </LabelView>

            <LabelView title="Quote Type">
              <PriceYieldTypeBadge type={`${RfqInformationData.quoteType}`} />
            </LabelView>

            <LabelView title="Deal Type">
              <DealTypeBadge type={`${RfqInformationData.dealType}`} />
            </LabelView>

            <LabelView title="RFQ Size (Value in Crores)">
              <p className="font-medium text-sm">
                {(Number(RfqInformationData.rfqSizeCrores) * 10000000).toFixed(2)}
              </p>
            </LabelView>
            <LabelView title="Settlement Date">
              <p className="font-medium text-sm">
                {RfqInformationData.settlementDate}
              </p>
            </LabelView>
            <LabelView title="Yield Type">
              <YieldTypeBadge type={RfqInformationData.yieldType} />
            </LabelView>
            <LabelView title="Yield">
              <p className="font-medium text-sm">{RfqInformationData.yield}</p>
            </LabelView>
            <LabelView title="RFQ Number">
              <p className="font-medium text-sm">
                {RfqInformationData.rfqNumber}
              </p>
            </LabelView>
            <LabelView title="Participant Code">
              <p className="font-medium text-sm">
                {RfqInformationData.participantCode}
              </p>
            </LabelView>
            <LabelView title="Client Registration Type">
              <RefqRegType type={RfqInformationData.clientRegistrationType} />

            </LabelView>
            <LabelView title="Status">
              <RfqStatusBadge status={`${RfqInformationData.status}`} />
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NseRfqInformation;
