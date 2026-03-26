import { Link, Text, View } from "@react-pdf/renderer";
import type { CustomerByIdPayload } from "@root/apiGateway";
import { tw } from "../MdPdf";
import { CheckOnlyIcon } from "../elements/CheckIcon";
import TextList from "../elements/TextList";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function formatOrderDateForConfirmation(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${MONTHS[d.getMonth()]}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

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
    /** Settlement Date & Time shown in confirmation line */
    settlementDateTime?: string;
  };
}

function OrdersPageTwo({
  user,
  releasedOrder,
  orderData,
}: {
  user: CustomerByIdPayload;
  releasedOrder?: boolean;
  orderData?: OrdersPageTwoOrderData;
}) {
  const settlementBank = orderData?.metadata?.settlementBank;
  const settlementDemat = orderData?.metadata?.settlementDemat;
  const bank = settlementBank
    ? {
      bankName: settlementBank.bankName ?? "—",
      ifscCode: settlementBank.ifscCode ?? "—",
      accountNumber: settlementBank.accountNo ?? "—",
    }
    : user.bankAccounts?.find((e) => e.isPrimary);
  const demat = settlementDemat
    ? {
      depositoryName: settlementDemat.dpName ?? "—",
      dpId: settlementDemat.dpId ?? "—",
      clientId: settlementDemat.benId ?? "—",
    }
    : user.dematAccounts?.find((e) => e.isPrimary);
  const confirmationDateTime =
    orderData?.metadata?.settlementDateTime?.trim() ||
    formatOrderDateForConfirmation(orderData?.createdAt);

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

      <View style={tw(`flex flex-row border-b border-gray-300 `)}>
        <View style={tw(`text-[9px] flex w-[20%] flex-row gap-2`)}>
          <Text>Client Settlement Details (Buyer)</Text>
        </View>
        <View style={tw(`text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`)}>
          <Text>{`Bank Name: ${bank?.bankName}
IFSC Code: ${bank?.ifscCode}
Bank Account Number: ${bank?.accountNumber}`}</Text>
        </View>
        <View style={tw(`text-[9px] flex w-[40%] border-l border-gray-300 pl-2 flex-row gap-2`)}>
          <Text>{`DP Name: ${demat?.depositoryName}
DP ID: ${demat?.dpId}
Client ID: ${demat?.clientId}`}</Text>
        </View>
      </View>

      {/* Order Receipt notice */}
      <Text style={tw(`text-[6.5px] mt-3`)}>
        This {releasedOrder ? "" : "Draft "}Order Receipt is a system generated document and does not require any signatures.
      </Text>

      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Terms & Conditions</Text>
      <Text style={tw(`text-[6.5px] mt-1 mb-1 leading-5`)}>
        These terms and conditions (“Terms”) form an essential part of the Order Receipt issued by BondNest Capital India Securities Private Limited (“MeraDhan”) to the Buyer for the {releasedOrder ? "" : "proposed"} transaction(s) listed above:
      </Text>
      <View style={tw(`mt-1`)}>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="1.">
          MeraDhan has issued this Order Receipt as an Online Bond Platform Provider for the above transaction(s). We clearly state that we are not acting as your investment advisor, financial planner, or tax consultant.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="2.">
          All transactions carried out on are governed by the terms and conditions available on the website{" "}
          <Text style={{ color: "#1D4ED8", textDecoration: "underline" }}>https://www.meradhan.co</Text>.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="3.">
          The information in this Order Receipt is confidential and meant only for the buyer and/or seller to whom it has been issued.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="4.">
          This Order Receipt is not a deal confirmation. The deal will be settled only when the Clearing Corporation receives funds and securities within the required timelines on the settlement day. MeraDhan shall not be responsible for cancellation or non-settlement of any deal for any reason.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="5.">
          Please refer to the regulatory guidelines on deal cancellations:
        </TextList>
        <View style={tw(`ml-6 mb-1 flex flex-col gap-1`)}>
          <Text style={tw(`text-[6.5px] `)}>
            a. BSE:{" "}
            <Link
              src="https://www.bseindia.com/markets/MarketInfo/DispNewNoticesCirculars.aspx?page=20240401-34"
              style={tw(`text-[6.5px] underline text-[#1D4ED8]`)}
            >
              Penal action for failure to honour RFQ transactions.
            </Link>
          </Text>
          <Text style={tw(`text-[6.5px] `)}>
            b. NSE:{" "}
            <Link
              src="https://nsearchives.nseindia.com/web/sites/default/files/inline-files/Operating%20guidelines%20for%20Request%20for%20Quote%20%28RFQ%29%20platform.pdf"
              style={tw(`text-[6.5px] underline text-[#1D4ED8]`)}
            >
              Actions for failure to settle a deal on the RFQ platform – Individual Investors.
            </Link>
          </Text>
        </View>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="6.">
          Deal cancellation and refund of funds/securities will follow SEBI guidelines, Stock Exchange policies, Clearing Corporation rules, and payment-gateway procedures. If the deal does not get settled for any reason after funds are transferred, the Buyer will receive a refund directly from the Clearing Corporation.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="7.">
          The Buyer agrees—irrevocably and unconditionally—to transfer funds to the Clearing Corporation’s designated bank account before the cut-off time on the settlement day.
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="8.">
          MeraDhan is not responsible for any errors or missing information. For any queries or discrepancies, please write to: <Text style={tw(`text-[6.5px] underline text-[#1D4ED8]`)}>support@meradhan.co</Text>
        </TextList>
        <TextList countFontSize={7} countWidth={10} className="text-[6.5px]" count="9.">
          The Buyer confirms—irrevocably and unconditionally—that he/she has accepted the terms of the transaction (price, yield, etc.) by their own choice, without any influence from MeraDhan or the counter-party, and understands the risks involved.
        </TextList>
      </View>
      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Disclaimer</Text>
      <Text style={tw(`text-[6.5px] mt-1 leading-6`)}>
        Investments in debt securities/ municipal debt securities/ securitised debt instruments are subject to risks including delay and/ or default in payment. You are solely responsible for your investment decisions, and no claims of any kind can be made against any third party, including intermediaries or counterparties. MeraDhan shall not be responsible for any losses, liabilities, damages, costs, or expenses arising from such transactions or investments.
      </Text>
      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Important Note:</Text>
      <View style={tw(`mt-1 flex flex-col gap-2`)}>
        <Text style={tw(`text-[6.5px] leading-6`)}>a) The Order Date and Time reflects when the RFQ was initiated by the Online Bond Platform on behalf of its client (whether buy or sell)</Text>
        <Text style={tw(`text-[6.5px] leading-6`)}>b) The Clearing Corporation may credit funds/securities to the settlement Bank/Demat account given above or to the default Bank/Demat account registered with the Clearing Corporation.</Text>
      </View>
      <Text style={tw(`text-[6.5px] mt-3 font-semibold`)}>Confirmation:</Text>
      <View style={tw(`mt-1 flex flex-col`)}>
        <View style={tw(`flex flex-row items-center gap-2`)}>
          <CheckOnlyIcon size={8} />
          <Text style={tw(`text-[6.5px] leading-5`)}>
            I hereby confirm (Date: {confirmationDateTime} IST):
          </Text>
        </View>
        <Text style={tw(`text-[6.5px] mt-1 leading-5 ml-2`)}>a) I have read, understood, and accepted all terms & conditions provided on <Link src="https://www.meradhan.co" style={tw(`text-[6.5px] underline text-[#1D4ED8]`)}>https://www.meradhan.co</Link></Text>
        <Text style={tw(`text-[6.5px] leading-5 ml-2 mt-1`)}>b) I have reviewed the details in the Order Receipt and wish to proceed with the payment.</Text>
      </View>
      <Text style={tw(`text-[6.5px] mt-6 text-center font-bold`)}>The End</Text>
    </View>
  );
}

export default OrdersPageTwo;
