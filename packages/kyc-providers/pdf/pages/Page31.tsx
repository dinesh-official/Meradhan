import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page31() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-6 text-xs flex flex-col gap-3`)}>
      <View style={tw("bg-main py-2 rounded ")}>
        <Text style={tw("text-white font-[600] text-sm text-center uppercase")}>
          Guidance Note
        </Text>
      </View>
      <Text style={tw(`font-[600] text-center`)}>
        GUIDANCE NOTE - DO's and DON'TS FOR TRADING ON THE EXCHANGE(S) FOR
        INVESTORS
      </Text>
      <Text style={tw(`font-[600] mt-3`)}>BEFORE YOU BEGIN TO TRADE</Text>
      <TextList count="1.">
        Ensure that you deal with and through only SEBI registered
        intermediaries. You may check their SEBI registration certificate number
        from the list available on the Stock exchanges websites
        www.nseindia.com, www.bseindia.com, www.msei.in and SEBI website
        www.sebi.gov.in.
      </TextList>
      <TextList count="2.">
        Ensure that you fill the KYC form completely and strikeoff the blank
        fields in the KYC form.
      </TextList>
      <TextList count="3.">
        Ensure that you have read all the mandatory documents viz. Rights and
        Obligations, Risk Disclosure Document, Policy and Procedure document of
        the stock broker.
      </TextList>
      <TextList count="4.">
        Ensure to read, understand and then sign the voluntary clauses, if any,
        agreed between you and the stock broker. Note that the clauses as agreed
        between you and the stock broker cannot be changed without your consent.
      </TextList>
      <TextList count="5.">
        Get a clear idea about all brokerage, commissions, fees and other
        charges levied by the broker on you for trading and the relevant
        provisions/ guidelines specified by SEBI/Stock exchanges.
      </TextList>
      <TextList count="6.">
        Obtain a copy of all the documents executed by you from the stock broker
        free of charge.
      </TextList>
      <TextList count="7.">
        In case you wish to execute Power of Attorney (POA) in favour of the
        Stock broker, authorizing it to operate your bank and demat account,
        please refer to the guidelines issued by SEBI/Exchanges in this regard.
      </TextList>
      <Text style={tw(`font-[600]`)}>TRANSACTIONS AND SETTLEMENTS</Text>
      <TextList count="8.">
        The stock broker may issue electronic contract notes (ECN) if
        specifically authorized by you in writing. You should provide your email
        id to the stock broker for the same. Don’t opt for ECN if you are not
        familiar with computers.
      </TextList>
      <TextList count="9.">
        Don’t share your internet trading account’s password with anyone.
      </TextList>
      <TextList count="10.">
        Don’t make any payment in cash to the stock broker.
      </TextList>
      <TextList count="11.">
        Make the payments by account payee cheque in favour of the stock broker.
        Don’t issue cheques in the name of sub-broker. Ensure that you have a
        documentary proof of your payment/deposit of securities with the stock
        broker, stating date, scrip, quantity, towards which bank/ demat account
        such money or securities deposited and from which bank/ demat account.
      </TextList>
      <TextList count="12.">
        Note that facility of Trade Verification is available on stock
        exchanges’ websites, where details of trade as mentioned in the contract
        note may be verified. Where trade details on the website do not tally
        with the details mentioned in the contract note, immediately get in
        touch with the Investors Grievance Cell of the relevant Stock exchange.
      </TextList>
    </View>
  );
}

export default Page31;
