import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page23() {
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
        <Text style={tw(`font-bold uppercase text-xs`)}>
          LAW AND JURISDICTION
        </Text>
        <TextList count="43.">
          In addition to the specific rights set out in this document, the stock
          broker, sub-broker and the client shall be entitled to exercise any
          other rights which the stock broker or the client may have under the
          Rules, Bye-laws and Regulations of the Exchanges in which the client
          chooses to trade and circulars/notices issued thereunder or Rules and
          Regulations of SEBI.
        </TextList>
        <TextList count="44.">
          The provisions of this document shall always be subject to Government
          notifications, any rules, regulations, guidelines and
          circulars/notices issued by SEBI and Rules, Regulations and Bye laws
          of the relevant stock exchanges, where the trade is executed, that may
          be in force from time to time.
        </TextList>
        <TextList count="45.">
          The stock broker and the client shall abide by any award passed by the
          Arbitrator(s) under the Arbitration and Conciliation Act, 1996.
          However, there is also a provision of appeal within the stock
          exchanges, if either party is not satisfied with the arbitration
          award.
        </TextList>
        <TextList count="46.">
          Words and expressions which are used in this document but which are
          not defined herein shall, unless the context otherwise requires, have
          the same meaning as assigned thereto in the Rules, Byelaws and
          Regulations and circulars/notices issued thereunder of the
          Exchanges/SEBI.
        </TextList>

        <TextList count="47.">
          All additional voluntary clauses/document added by the stock broker
          should not be in contravention with
          rules/regulations/notices/circulars of Exchanges/SEBI. Any changes in
          such voluntary clauses/document(s) need to be preceded by a notice of
          15 days. Any changes in the rights and obligations which are specified
          by Exchanges/SEBI shall also be brought to the notice of the clients.
        </TextList>
        <TextList count="48.">
          If the rights and obligations of the parties hereto are altered by
          virtue of change in Rules and regulations of SEBI or Bye-laws, Rules
          and Regulations of the relevant stock Exchanges where the trade is
          executed, such changes shall be deemed to have been incorporated
          herein in modification of the rights and obligations of the parties
          mentioned in this document.
        </TextList>
      </View>
      <View style={tw(`border-t border-gray-200 w-full my-6`)} />
      <Text style={tw(`font-bold uppercase text-xs text-center `)}>
        INTERNET & WIRELESS TECHNOLOGY BASED TRADING FACILITY PROVIDED BY STOCK
        BROKERS TO CLIENT
      </Text>
      <Text style={tw(`text-center mx-auto text-xs w-[80%] font-[500] mt-3`)}>
        (All the clauses mentioned in the ‘Rights and Obligations’ document(s)
        shall be applicable. Additionally, the clauses mentioned herein shall
        also be applicable.)
      </Text>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 10,
          marginTop: 15,
        }}
      >
        <TextList count="1.">
          Stock broker is eligible for providing Internet based trading (IBT)
          and securities trading through the use of wireless technology that
          shall include the use of devices such as mobile phone, laptop with
          data card, etc. which use Internet Protocol (IP). The stock broker
          shall comply with all requirements applicable to internet based
          trading/securities trading using wireless technology as may be
          specified by SEBI & the Exchanges from time to time.
        </TextList>
        <TextList count="2.">
          The client is desirous of investing/trading in securities and for this
          purpose, the client is desirous of using either the internet based
          trading facility or the facility for securities trading through use of
          wireless technology. The Stock broker shall provide the Stock broker’s
          IBT Service to the Client, and the Client shall avail of the Stock
          broker’s IBT Service, on and subject to SEBI/Exchanges Provisions and
          the terms and conditions specified on the Stock broker’s IBT Web Site
          provided that they are in line with the norms prescribed by
          Exchanges/SEBI.
        </TextList>
      </View>
    </View>
  );
}

export default Page23;
