import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page19() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 10,
          marginTop: 20,
        }}
      >
        <Text style={tw(`font-bold uppercase text-xs`)}>MARGINS</Text>
        <TextList count="11.">
          The client shall pay applicable initial margins, withholding margins,
          special margins or such other margins as are considered necessary by
          the stock broker or the Exchange or as may be directed by SEBI from
          time to time as applicable to the segment(s) in which the client
          trades. The stock broker is permitted in its sole and absolute
          discretion to collect additional margins (even though not required by
          the Exchange, Clearing House/Clearing Corporation or SEBI) and the
          client shall be obliged to pay such margins within the stipulated
          time.
        </TextList>
        <TextList count="12.">
          The client understands that payment of margins by the client does not
          necessarily imply complete satisfaction of all dues. In spite of
          consistently having paid margins, the client may, on the settlement of
          its trade, be obliged to pay (or entitled to receive) such further
          sums as the contract may dictate/require
        </TextList>

        <Text style={tw(`font-bold uppercase text-xs`)}>
          TRANSACTIONS AND SETTLEMENTS
        </Text>
        <TextList count="13.">
          The client shall give any order for buy or sell of a
          security/derivatives contract in writing or in such form or manner, as
          may be mutually agreed between the client and the stock broker. The
          stock broker shall ensure to place orders and execute the trades of
          the client, only in the Unique Client Code assigned to that client.
        </TextList>
        <TextList count="14.">
          The stock broker shall inform the client and keep him apprised about
          trading/settlement cycles, delivery/payment schedules, any changes
          therein from time to time, and it shall be the responsibility in turn
          of the client to comply with such schedules/procedures of the relevant
          stock exchange where the trade is executed.
        </TextList>
        <TextList count="15.">
          The stock broker shall ensure that the money/securities deposited by
          the client shall be kept in a separate account, distinct from his/its
          own account or account of any other client and shall not be used by
          the stock broker for himself/itself or for any other client or for any
          purpose other than the purposes mentioned in Rules, Regulations,
          circulars, notices, guidelines of SEBI and/or Rules, Regulations,
          Bye-laws, circulars and notices of Exchange.
        </TextList>
        <TextList count="16.">
          Where the Exchange(s) cancels trade(s) suo moto all such trades
          including the trade/s done on behalf of the client shall ipso facto
          stand cancelled, stock broker shall be entitled to cancel the
          respective contract(s) with client(s).
        </TextList>
        <TextList count="17.">
          The transactions executed on the Exchange are subject to Rules,
          Byelaws and Regulations and circulars/notices issued thereunder of the
          Exchanges where the trade is executed and all parties to such trade
          shall have submitted to the jurisdiction of such court as may be
          specified by the Byelaws and Regulations of the Exchanges where the
          trade is executed for the purpose of giving effect to the provisions
          of the Rules, Byelaws and Regulations of the Exchanges and the
          circulars/notices issued thereunder.
        </TextList>
        <Text style={tw(`font-bold uppercase text-xs`)}>BROKERAGE</Text>
        <TextList count="18.">
          The Client shall pay to the stock broker brokerage and statutory
          levies as are prevailing from time to time and as they apply to the
          Client’s account, transactions and to the services that stock broker
          renders to the Client. The stock broker shall not charge brokerage
          more than the maximum brokerage permissible as per the rules,
          regulations and bye-laws of the relevant stock exchanges and/or rules
          and regulations of SEBI.
        </TextList>
      </View>
    </View>
  );
}

export default Page19;
