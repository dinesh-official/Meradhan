import LabelView from "@/global/elements/wrapper/LabelView";
import { cn } from "@/lib/utils";
import { CreateNegotiationResponse } from "@root/apiGateway";

const DealSplitInformation = ({
  data,
  className,
}: {
  data: CreateNegotiationResponse;
  className?: string;
}) => {
  return (
    <div className={cn("gap-5 gap-y-6 grid md:grid-cols-5 my-3", className)}>
      <LabelView title="Trade No">
        <p className="font-medium text-sm">{data.tradeNumber}</p>
      </LabelView>

      <LabelView title="ISIN">
        <p className="font-medium text-sm">{data.isin}</p>
      </LabelView>

      <LabelView title="Price">
        <p className="font-medium text-sm">{Number(data.acceptedPrice).toFixed(2)}</p>
      </LabelView>

      <LabelView title="Accrued Interest">
        <p className="font-medium text-sm">{Number(data.acceptedAccruedInterest).toFixed(2)}</p>
      </LabelView>
      <div className="col-span-2">
        <LabelView title="Consideration without stamp duty">
          <p className="font-medium text-sm">{Number(data.acceptedConsideration).toFixed(2)}</p>
        </LabelView>
      </div>
      <LabelView title="Settlement Date">
        <p className="font-medium text-sm">{data.acceptedSettlementDate}</p>
      </LabelView>
    </div>
  );
};

export default DealSplitInformation;
