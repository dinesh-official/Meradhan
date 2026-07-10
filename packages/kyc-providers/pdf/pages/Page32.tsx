import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page32() {
  return (
    <View
      style={tw(`w-[90%]  px-4  mx-auto mt-5  text-xs flex flex-col gap-3 `)}
    >
      <TextList count="13.">
        In case you have given specific authorization for maintaining running
        account, payout of funds or delivery of securities (as the case may be),
        may not be made to you within one working day from the receipt of payout
        from the Exchange. Thus, the stock broker shall maintain running account
        for you subject to the following conditions:
      </TextList>
      <View style={tw(`pl-7 flex flex-col gap-2 `)}>
        <TextList count="a)">
          Such authorization from you shall be dated, signed by you only and
          contains the clause that you may revoke the same at any time.
        </TextList>
        <TextList count="b)">
          The actual settlement of funds and securities shall be done by the
          stock broker, at least once in a calendar quarter or month, depending
          on your preference. While settling the account, the stock broker shall
          send to you a ‘statement of accounts’ containing an extract from the
          client ledger for funds and an extract from the register of securities
          displaying all the receipts/deliveries of funds and securities. The
          statement shall also explain the retention of funds and securities and
          the details of the pledged shares, if any.
        </TextList>
        <TextList count="c)">
          On the date of settlement, the stock broker may retain the requisite
          securities/funds towards outstanding obligations and may also retain
          the funds expected to be required to meet derivatives margin
          obligations for next 5 trading days, calculated in the manner
          specified by the exchanges. In respect of cash market transactions,
          the stock broker may retain entire pay-in obligation of funds and
          securities due from clients as on date of settlement and for next
          day’s business, he may retain funds/securities/margin to the extent of
          value of transactions executed on the day of such settlement in the
          cash market.
        </TextList>
        <TextList count="d)">
          You need to bring any dispute arising from the statement of account or
          settlement so made to the notice of the stock broker in writing
          preferably within 7 (seven) working days from the date of receipt of
          funds/securities or statement, as the case may be. In case of dispute,
          refer the matter in writing to the Investors Grievance Cell of the
          relevant Stock exchanges without delay.
        </TextList>
      </View>
      <TextList count="14.">
        In case you have not opted for maintaining running account and pay-out
        of funds/securities is not received on the next working day of the
        receipt of payout from the exchanges, please refer the matter to the
        stock broker. In case there is dispute, ensure that you lodge a
        complaint in writing immediately with the Investors Grievance Cell of
        the relevant Stock exchange.
      </TextList>
      <TextList count="15.">
        Please register your mobile number and email id with the stock broker,
        to receive trade confirmation alerts/details of the transactions through
        SMS or email, by the end of the trading day, from the stock exchanges
      </TextList>
      <Text style={tw(`font-[600]`)}>
        IN CASE OF TERMINATION OF TRADING MEMBERSHIP
      </Text>
      <TextList count="16.">
        In case, a stock broker surrenders his membership, is expelled from
        membership or declared a defaulter; Stock exchanges gives a public
        notice inviting claims relating to only the "transactions executed on
        the trading system" of Stock exchange, from the investors. Ensure that
        you lodge a claim with the relevant Stock exchanges within the
        stipulated period and with the supporting documents.
      </TextList>
      <TextList count="17.">
        Familiarize yourself with the protection accorded to the money and/or
        securities you may deposit with your stock broker, particularly in the
        event of a default or the stock broker’s insolvency or bankruptcy and
        the extent to which you may recover such money and/or securities may be
        governed by the Bye-laws and Regulations of the relevant Stock exchange
        where the trade was executed and the scheme of the Investors’ Protection
        Fund in force from time to time.
      </TextList>
    </View>
  );
}

export default Page32;
