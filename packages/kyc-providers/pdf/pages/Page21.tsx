import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page21() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 10,
          marginTop: 15,
        }}
      >
        <TextList count="28.">
          The stock broker, sub-broker and the client shall be entitled to
          terminate the relationship between them without giving any reasons to
          the other party, after giving notice in writing of not less than one
          month to the other parties. Notwithstanding any such termination, all
          rights, liabilities and obligations of the parties arising out of or
          in respect of transactions entered into prior to the termination of
          this relationship shall continue to subsist and vest in/be binding on
          the respective parties or his/its respective heirs, executors,
          administrators, legal representatives or successors, as the case may
          be.
        </TextList>
        <TextList count="29.">
          In the event of demise/insolvency of the sub-broker or the
          cancellation of his/its registration with the Board or/withdrawal of
          recognition of the sub-broker by the stock exchange and/or termination
          of the agreement with the sub broker by the stock broker, for any
          reason whatsoever, the client shall be informed of such termination
          and the client shall be deemed to be the direct client of the stock
          broker and all clauses in the ‘Rights and Obligations’ document(s)
          governing the stock broker, sub-broker and client shall continue to be
          in force as it is, unless the client intimates to the stock broker
          his/its intention to terminate their relationship by giving a notice
          in writing of not less than one month.
        </TextList>
        <Text style={tw(`font-bold uppercase text-xs`)}>
          ADDITIONAL RIGHTS AND OBLIGATIONS
        </Text>
        <TextList count="30.">
          The stock broker shall ensure due protection to the client regarding
          client’s rights to dividends, rights or bonus shares, etc. in respect
          of transactions routed through it and it shall not do anything which
          is likely to harm the interest of the client with whom and for whom
          they may have had transactions in securities.
        </TextList>
        <TextList count="31.">
          The stock broker and client shall reconcile and settle their accounts
          from time to time as per the Rules, Regulations, Bye Laws, Circulars,
          Notices and Guidelines issued by SEBI and the relevant Exchanges where
          the trade is executed.
        </TextList>
        <TextList count="32.">
          The stock broker shall issue a contract note to his constituents for
          trades executed in such format as may be prescribed by the Exchange
          from time to time containing records of all transactions including
          details of order number, trade number, trade time, trade price, trade
          quantity, details of the derivatives contract, client code, brokerage,
          all charges levied etc. and with all other relevant details as
          required therein to be filled in and issued in such manner and within
          such time as prescribed by the Exchange. The stock broker shall send
          contract notes to the investors within one working day of the
          execution of the trades in hard copy and/or in electronic form using
          digital signature.
        </TextList>
        <TextList count="33.">
          The stock broker shall make pay out of funds or delivery of
          securities, as the case may be, to the Client within one working day
          of receipt of the payout from the relevant Exchange where the trade is
          executed unless otherwise specified by the client and subject to such
          terms and conditions as may be prescribed by the relevant Exchange
          from time to time where the trade is executed.
        </TextList>
        <TextList count="34.">
          The stock broker shall send a complete `Statement of Accounts’ for
          both funds and securities in respect of each of its clients in such
          periodicity and format within such time, as may be prescribed by the
          relevant Exchange, from time to time, where the trade is executed. The
          Statement shall also state that the client shall report errors, if
          any, in the Statement within such time as may be prescribed by the
          relevant Exchange from time to time where the trade was executed, from
          the receipt thereof to the Stock broker.
        </TextList>
      </View>
    </View>
  );
}

export default Page21;
