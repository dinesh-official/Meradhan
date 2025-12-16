import { Text, View } from "@react-pdf/renderer";
import type { CustomerByIdPayload } from "@root/apiGateway";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function OrdersPageTwo({
  user,
  releasedOrder,
}: {
  user: CustomerByIdPayload;
  releasedOrder?: boolean;
}) {
  const bank = user.bankAccounts.find((e) => e.isPrimary);
  const demat = user.dematAccounts.find((e) => e.isPrimary);

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
        style={tw(`flex flex-row py-2 border-b border-gray-300 border-t mt-3`)}
      >
        <View style={tw(`text-[8px] flex w-[20%] flex-row gap-2`)}>
          <Text>Settlement Mode</Text>
        </View>
        <View style={tw(`text-[8px] flex w-[50%] flex-row gap-2`)}>
          <Text>Indian Clearing Corporate Limited</Text>
        </View>
        <View style={tw(`text-[8px] flex w-[30%] flex-row gap-2`)}>
          <Text>Settlement Mode</Text>
        </View>
      </View>
      <View style={tw(`flex flex-row py-2 border-b border-gray-300`)}>
        <View style={tw(`text-[8px] flex w-[20%] flex-row gap-2`)}>
          <Text>Settlement Details</Text>
        </View>
        <View style={tw(`text-[8px] flex w-[50%] flex-row gap-2`)}>
          <Text>
            {`Beneficiary Name: Indian Clearing Corporate Limited 
Bank Name: HDFC Bank Ltd.
A/c No. 57500001086245 
IFSC Code: HDFC0000060 
Mode of Pay: RTGS / NEFT / Bank Transfer 
Branch Name: Mumbai`}
          </Text>
        </View>
        <View style={tw(`text-[8px] flex w-[30%] flex-row gap-2`)}>
          <Text>
            {`DP Name: Indian Clearing Corporate Limited
DP ID: IN619994
Market Type: ICDM (T + 1)
Settlement No.: 2526161
`}
          </Text>
        </View>
      </View>

      <View style={tw(`flex flex-row py-2 border-b border-gray-300 `)}>
        <View style={tw(`text-[8px] flex w-[20%] flex-row gap-2`)}>
          <Text>Client Settlement Details (Buyer)</Text>
        </View>
        <View style={tw(`text-[8px] flex w-[50%] flex-row gap-2`)}>
          <Text>{`Bank Name: ${bank?.bankName}
IFSC Code: ${bank?.ifscCode}
Bank Account Number: ${bank?.accountNumber}`}</Text>
        </View>
        <View style={tw(`text-[8px] flex w-[30%] flex-row gap-2`)}>
          <Text>{`DP Name: ${demat?.depositoryName}
DP ID: ${demat?.dpId}
Client ID: ${demat?.clientId}`}</Text>
        </View>
      </View>

      {/* // Seller Client Settlement Details */}
      <Text style={tw(`text-[8px] mt-1`)}>
        This {releasedOrder ? "" : "Draft"} Order Receipt is a system generated
        document and does not require any signatures.
      </Text>
      <Text style={tw(`text-[8px] mt-3 font-semibold`)}>
        Terms & Conditions
      </Text>
      <View style={tw(`mt-1`)}>
        <Text style={tw(`text-[8px] mt-1 mb-1`)}>
          These terms and conditions (“Terms”) form an essential part of the
          Order Receipt issued by BondNest Capital India Securities Private
          Limited (“MeraDhan”) to the Buyer for the transaction(s) listed above:
        </Text>
        <TextList className="text-[8px]" count="1.">
          MeraDhan has issued this Order Receipt as an Online Bond Platform
          Provider for the above transaction(s). We clearly state that we are
          not acting as your investment advisor, financial planner, or tax
          consultant.
        </TextList>
        <TextList className="text-[8px]" count="2.">
          All transactions carried out on https://www.meradhan.com are governed
          by the terms and conditions available on the website.
        </TextList>
        <TextList className="text-[8px]" count="3.">
          The information in this Order Receipt is confidential and meant only
          for the buyer and/or seller to whom it has been issued.
        </TextList>
        <TextList className="text-[8px]" count="4.">
          This Order Receipt is not a deal confirmation. The deal will be
          settled only when the Clearing Corporation receives funds and
          securities within the required timelines on the settlement day.
          MeraDhan shall not be responsible for cancellation or non-settlement
          of any deal for any reason.
        </TextList>
        <View style={tw(`ml-2 flex flex-col `)}>
          <TextList className="text-[8px]" count="5.">
            Please refer to the regulatory guidelines on deal cancellations:
          </TextList>
          <View style={tw(`ml-8  mb-1 flex flex-col `)}>
            <Text style={tw(`text-[8px]`)}>
              BSE: Penal action for failure to honour RFQ transactions.
            </Text>
            <Text style={tw(`text-[8px]`)}>
              NSE: Actions for failure to settle a deal on the RFQ platform –
              Individual Investors.
            </Text>
          </View>
        </View>
        <TextList className="text-[8px]" count="6.">
          Deal cancellation and refund of funds/securities will follow SEBI
          guidelines, Stock Exchange policies, Clearing Corporation rules, and
          payment-gateway procedures. If the deal does not get settled for any
          reason after funds are transferred, the Buyer will receive a refund
          directly from the Clearing Corporation.
        </TextList>
        <TextList className="text-[8px]" count="7.">
          The Buyer agrees—irrevocably and unconditionally—to transfer funds to
          the Clearing Corporation’s designated bank account before the cut-off
          time on the settlement day.
        </TextList>
        <TextList className="text-[8px]" count="8.">
          MeraDhan is not responsible for any errors or missing information. For
          any queries or discrepancies, please write to: support@meradhan.com
        </TextList>
        <TextList className="text-[8px]" count="9.">
          The Buyer confirms—irrevocably and unconditionally—that he/she has
          accepted the terms of the transaction (price, yield, etc.) by their
          own choice, without any influence from MeraDhan or the counter-party,
          and understands the risks involved.
        </TextList>
      </View>
      <Text style={tw(`text-[8px] mt-3 font-semibold`)}>
        Terms & Conditions
      </Text>
      <Text style={tw(`text-[8px] mt-1 leading-5`)}>
        Investments in debt securities/ municipal debt securities/ securitised
        debt instruments are subject to risks including delay and/ or default in
        payment. You are solely responsible for your investment decisions, and
        no claims of any kind can be made against any third party, including
        intermediaries or counterparties. MeraDhan shall not be responsible for
        any losses, liabilities, damages, costs, or expenses arising from such
        transactions or investments.
      </Text>
      <Text style={tw(`text-[8px] mt-3 font-semibold`)}>Important Note:</Text>
      <Text style={tw(`text-[8px] mt-1 leading-5`)}>
        Investments in debt securities/ municipal debt securities/ securitised
        debt instruments are subject to risks including delay and/ or default in
        payment. You are solely responsible for your investment decisions, and
        no claims of any kind can be made against any third party, including
        intermediaries or counterparties. MeraDhan shall not be responsible for
        any losses, liabilities, damages, costs, or expenses arising from such
        transactions or investments.
      </Text>
      <View>
        <Text style={tw(`text-[8px] mt-3 font-semibold`)}>Confirmation</Text>
        <Text style={tw(`text-[8px] mt-1 leading-6`)}>
          {`[✔] I hereby confirm (Date: ${new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Kolkata",
          })} IST):
a) I have read, understood, and accepted all terms & conditions provided on https://www.meradhan.com
b) I have reviewed the details in the Order Receipt and wish to proceed with the payment.`}
        </Text>
      </View>
    </View>
  );
}

export default OrdersPageTwo;
