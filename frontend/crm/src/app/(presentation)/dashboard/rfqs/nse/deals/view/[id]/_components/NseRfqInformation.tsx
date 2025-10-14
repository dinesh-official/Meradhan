import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";

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
          <div className="grid md:grid-cols-3 gap-5">
            <LabelView title="ISIN">
              <p className="font-medium text-sm">{RfqInformationData.isin}</p>
            </LabelView>

            <LabelView title="segment">
              <StatusBadge value={`${RfqInformationData.segment}`} />

            </LabelView>
            <LabelView title="Buy/Sell">
              <StatusBadge value={`${RfqInformationData.buySell}`} />
            </LabelView>

            <LabelView title="Quote Type">
              <p className="font-medium text-sm">
                {RfqInformationData.quoteType}
              </p>
            </LabelView>

            <LabelView title="Deal Type">
              <StatusBadge value={`${RfqInformationData.dealType}`} />
            </LabelView>

            <LabelView title="RFQ Size (Value in Crores)">
              <p className="font-medium text-sm">
                {RfqInformationData.rfqSizeCrores}
              </p>
            </LabelView>
            <LabelView title="Settlement Date">
              <p className="font-medium text-sm">
                {RfqInformationData.settlementDate}
              </p>
            </LabelView>
            <LabelView title="Yield Type">
              <p className="font-medium text-sm">
                {RfqInformationData.yieldType}
              </p>
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
              <p className="font-medium text-sm">
                {RfqInformationData.clientRegistrationType}
              </p>
            </LabelView>
            <LabelView title="Status">
              <p className="font-medium text-sm">{RfqInformationData.status}</p>
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NseRfqInformation;
