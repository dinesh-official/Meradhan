import LabelView from "@/global/elements/wrapper/LabelView";
import { formatNumberTS } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import { CreateNegotiationResponse } from "@root/apiGateway";
import {
  DealTypeBadge,
  TradeTypeBadge,
} from "../../../_components/bages/NseRfqBadges";

const DealSplitInformation = ({
  data,
  className,
}: {
  data: CreateNegotiationResponse;
  className?: string;
}) => {
  return (
    <div className={cn("gap-5 gap-y-6 grid md:grid-cols-5 my-3", className)}>
      <LabelView title="Participant Code ">
        <p className="font-medium text-sm">{data.initAeCode}</p>
      </LabelView>

      <LabelView title="Client Code">
        <p className="font-medium text-sm">{data.initClientCode}</p>
      </LabelView>

      <LabelView title="Deal Type">
        <DealTypeBadge type={`${data.initDealType}`} />
      </LabelView>

      <LabelView title="RFQ Number">
        <p className="font-medium text-sm">{data.rfqNumber}</p>
      </LabelView>

      <LabelView title="ISIN">
        <p className="font-medium text-sm">{data.isin}</p>
      </LabelView>

      <LabelView title="Face Value">
        <p className="font-medium text-sm">
          {formatNumberTS(Number(data.initValue) * 10000000)}
        </p>
      </LabelView>

      <LabelView title="Buy/Sell">
        <TradeTypeBadge type={`${data.buySell == "S" ? "B" : "S"}`} />
      </LabelView>

      <LabelView title="Quantity">
        <p className="font-medium text-sm">{data.initQuantity}</p>
      </LabelView>

      <LabelView title="value (Crores)">
        <p className="font-medium text-sm">
          {formatNumberTS(Number(data.initValue) * 10000000)}
        </p>
      </LabelView>

      <LabelView title="Value Remaining">
        <p className="font-medium text-sm">
          {formatNumberTS(
            Number(data.initValue) * 10000000 -
              Number(data.initValue) * 10000000
          )}
        </p>
      </LabelView>
    </div>
  );
};

export default DealSplitInformation;
