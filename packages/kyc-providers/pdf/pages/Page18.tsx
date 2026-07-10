import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page18() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View style={tw("bg-main py-2 rounded mt-4")}>
        <Text
          style={tw(
            "text-sm text-white font-[600] leading-[1px] text-center uppercase"
          )}
        >
          Rights and Obligations
        </Text>
      </View>

      <Text style={tw(`font-[500] uppercase text-xs text-center pt-3`)}>
        RIGHTS AND OBLIGATIONS OF STOCK BROKERS, SUB-BROKERS AND CLIENTS
      </Text>
      <Text style={tw(`text-xs text-center mt-2`)}>
        as prescribed by SEBI and Stock Exchanges
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
          The client shall invest/trade in those securities/contracts/other
          instruments admitted to dealings on the Exchanges as defined in the
          Rules, Byelaws and Regulations of Exchanges/ Securities and Exchange
          Board of India (SEBI) and circulars/notices issued there under from
          time to time.
        </TextList>
        <TextList count="2.">
          The stock broker, sub-broker and the client shall be bound by all the
          Rules, Byelaws and Regulations of the Exchange and circulars/notices
          issued there under and Rules and Regulations of SEBI and relevant
          notifications of Government authorities as may be in force from time
          to time.
        </TextList>
        <TextList count="3.">
          The client shall satisfy itself of the capacity of the stock broker to
          deal in securities and/or deal in derivatives contracts and wishes to
          execute its orders through the stock broker and the client shall from
          time to time continue to satisfy itself of such capability of the
          stock broker before executing orders through the stock broker.
        </TextList>
        <TextList count="4.">
          The stock broker shall continuously satisfy itself about the
          genuineness and financial soundness of the client and investment
          objectives relevant to the services to be provided.
        </TextList>
        <TextList count="5.">
          The stock broker shall take steps to make the client aware of the
          precise nature of the Stock broker’s liability for business to be
          conducted, including any limitations, the liability and the capacity
          in which the stock broker acts.
        </TextList>
        <TextList count="6.">
          The sub-broker shall provide necessary assistance and co-operate with
          the stock broker in all its dealings with the client(s).
        </TextList>
        <Text style={tw(`font-bold uppercase text-xs mt-3 mb-2`)}>
          CLIENT INFORMATION
        </Text>
        <TextList count="7.">
          The client shall furnish all such details in full as are required by
          the stock broker in "Account Opening Form” with supporting details,
          made mandatory by stock exchanges/SEBI from time to time.
        </TextList>
        <TextList count="8.">
          The client shall familiarize himself with all the mandatory provisions
          in the Account Opening documents. Any additional clauses or documents
          specified by the stock broker shall be non-mandatory, as per terms &
          conditions accepted by the client.
        </TextList>
        <TextList count="9.">
          The client shall immediately notify the stock broker in writing if
          there is any change in the information in the ‘account opening form’
          as provided at the time of account opening and thereafter; including
          the information on winding up petition/insolvency petition or any
          litigation which may have material bearing on his capacity. The client
          shall provide/update the financial information to the stock broker on
          a periodic basis.
        </TextList>
        <TextList count="10.">
          The stock broker and sub-broker shall maintain all the details of the
          client as mentioned in the account opening form or any other
          information pertaining to the client, confidentially and that they
          shall not disclose the same to any person/authority except as required
          under any law/regulatory requirements. Provided however that the stock
          broker may so disclose information about his client to any person or
          authority with the express permission of the client.
        </TextList>
      </View>
    </View>
  );
}

export default Page18;
