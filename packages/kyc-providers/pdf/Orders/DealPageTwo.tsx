import { Text, View } from "@react-pdf/renderer";
import type { CustomerByIdPayload } from "@root/apiGateway";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

interface SettlementBank {
  bankName?: string;
  ifscCode?: string;
  accountNo?: string;
}

interface SettlementDemat {
  dpName?: string;
  dpId?: string;
  benId?: string;
}

interface OrdersPageTwoOrderData {
  createdAt?: string;
  metadata?: {
    settlementBank?: SettlementBank;
    settlementDemat?: SettlementDemat;
    /** Settlement No. e.g. 2602020 */
    settlementNumber?: string;
  };
}

function DealPageTwo({
  user,
  orderData,
}: {
  user: CustomerByIdPayload;
  releasedOrder?: boolean;
  orderData?: OrdersPageTwoOrderData;
}) {
  return (
    <View
      style={{
        paddingTop: 1,
        paddingRight: 35,
        paddingLeft: 35,
        fontFamily: "Poppins",
      }}
    >
      <View
        style={tw(`flex flex-row border-b border-gray-300 border-t mt-3`)}
      >
        <View style={tw(`text-[9px] flex w-[20%] flex-row gap-2`)}>
          <Text>Settlement Mode</Text>
        </View>
        <View style={tw(`text-[9px] flex w-[80%] border-l border-gray-300 pl-2 flex-row gap-2`)}>
          <Text>NSE CLEARING LIMITED</Text>
        </View>
      </View>
      <View style={tw(`flex flex-row border-b border-gray-300`)}>
        <View style={tw(`text-[9px] flex w-[20%] flex-row gap-2`)}>
          <Text>Settlement Details</Text>
        </View>
        <View style={tw(`text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`)}>
          <Text>
            {`Bank Name: HDFC Bank Ltd.
Beneficiary Name: NSE Clearing Limited
Bank IFSC Code: HDFC0000060
Bank A/c No. CBRIC1${user.panCard?.panCardNo ?? "—"}
Mode of Pay: RTGS / NEFT / Bank Transfer`}
          </Text>
        </View>
        <View style={tw(`text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`)}>
          <Text>
            {`CM Name: NSE Clearing Ltd.
CM-BP ID: IN568177
Market Type: Corporate Bond (T + 0)
Settlement No.: ${orderData?.metadata?.settlementNumber ?? "—"}`}
          </Text>
        </View>
      </View>



      {/* Order Receipt notice */}
      <Text style={tw(`text-[6.5px] mt-3`)}>
        This Deal Sheet is a system generated document and does not require any signatures.
      </Text>

      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Terms & Conditions</Text>
      <Text style={tw(`text-[6.5px] mt-1 mb-1 leading-5`)}>
        These terms and conditions (“Terms”) form an essential part of the Deal Sheet issued by BondNest Capital India Securities Private Limited (“MeraDhan”) to the Buyer for the executed transaction(s) listed above:
      </Text>
      <View style={tw(`mt-1`)}>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="1.">
          BondNest Capital India Securities Private Limited (MeraDhan) has issued this Deal Sheet in its capacity as an Online Bond Platform Provider for the above transaction(s). We clearly state that we are not acting as your investment advisor, financial planner, or tax consultant.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="2.">
          All transactions carried out on are governed by the terms and conditions available on the website{" "}
          <Text style={{ color: "#1D4ED8", textDecoration: "underline" }}>https://www.meradhan.co</Text>.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="3.">
          The information in this Deal Sheet is confidential and meant only for the buyer and/or seller to whom it has been issued. It may not be disclosed to any third party without the prior written consent of MeraDhan.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="4.">
          The buyer acknowledges the receipt of securities, and the seller acknowledges the receipt of funds as per the terms of transactions. If the buyer receives excess securities, or the seller receives excess funds, he/she shall arrange for the re-transfer of the surplus amount/securities to the respective source account of clearing corporation.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="5.">
          MeraDhan shall make reasonable efforts to ensure the accuracy and completeness of the information provided on the Deal Sheet. However, MeraDhan shall not be liable for any inaccuracies or omissions in the information provided. In case of any queries/discrepancies, you may write to us on{" "}
          <Text style={{ color: "#1D4ED8", textDecoration: "underline" }}>backoffice@meradhan.co</Text>.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="6.">
          The parties irrevocably and unconditionally acknowledge and agree that they have agreed to the terms of deal/transaction (price, yield etc.) at their own will and choice without influence from MeraDhan/counterparty and are liable for risks arising from the same.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="7.">
          The Securities/ISIN as quoted in the Deal Sheet, if is in Shut Period accordingly Deal Sheet will be Issued on Ex-Interest Basis. In that case due to change in record date if Issuer, for any reason pays Interest amount Directly to Buyer on the IP Date, Buyer Shall Refund Entire Gross Interest Amount to Seller.
        </TextList>
      </View>

      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Disclaimer</Text>
      <Text style={tw(`text-[6.5px] mt-1 leading-6`)}>
        Investments in debt securities/ municipal debt securities/ securitised debt instruments are subject to risks including delay and/ or default in payment. You shall be solely responsible for your investment decisions without any recourse or claims of whatsoever nature, against any third party(ies) including but not limited to the intermediary/counterparty to the transaction etc.. MeraDhan shall not be responsible for losses, liabilities, damages, cost, and expenses suffered/accrued as a result of the transactions/investments.
      </Text>

      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Important Note:</Text>
      <View style={tw(`mt-1 flex flex-col gap-1`)}>
        <Text style={tw(`text-[6.5px] leading-6`)}>a) The Order Date and Time reflects when the RFQ was initiated by the Online Bond Platform on behalf of its client (whether buy or sell).</Text>
        <Text style={tw(`text-[6.5px] leading-6`)}>b) Settlement Date and Time reflects the Date and Time of settlement as provided by the Stock Exchanges/ Clearing Corporation.</Text>
      </View>

      <Text style={tw(`text-[6.5px] mt-6 text-center font-bold`)}>The End</Text>
    </View>
  );
}

export default DealPageTwo;
