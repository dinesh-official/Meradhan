import LabelView from "@/global/elements/wrapper/LabelView";

const DealSplitInformation = () => {
  return (

        <div className="grid md:grid-cols-5 gap-5 gap-y-6 my-3">
          <LabelView title="Initiator">
            <p className="font-medium text-sm">BCISPL</p>
          </LabelView>

          <LabelView title="client Code">
            <p className="font-medium text-sm">BCIS001</p>
          </LabelView>

          <LabelView title="Deal Type">
            <p className="font-medium text-sm">Direct</p>
          </LabelView>

          <LabelView title="RFQ Number">
            <p className="font-medium text-sm">RFQ-001-2025</p>
          </LabelView>

          <LabelView title="ISIN">
            <p className="font-medium text-sm">INE020B07536</p>
          </LabelView>

          <LabelView title="Face Value">
            <p className="font-medium text-sm">100,000.00</p>
          </LabelView>

          <LabelView title="Buy/Sell">
            <p className="font-medium text-sm">Buy</p>
          </LabelView>

          <LabelView title="Quote Type">
            <p className="font-medium text-sm">Both Price and Yield</p>
          </LabelView>

          <LabelView title="value (Crores)">
            <p className="font-medium text-sm">10.5</p>
          </LabelView>

          <LabelView title="Value Remaining">
            <p className="font-medium text-sm">25.00</p>
          </LabelView>
        </div>
      
  );
};

export default DealSplitInformation;
