import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page20() {
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
          LIQUIDATION AND CLOSE OUT OF POSITION
        </Text>
        <TextList count="19.">
          Without prejudice to the stock broker's other rights (including the
          right to refer a matter to arbitration), the client understands that
          the stock broker shall be entitled to liquidate/close out all or any
          of the client's positions for non-payment of margins or other amounts,
          outstanding debts, etc. and adjust the proceeds of such
          liquidation/close out, if any, against the client's
          liabilities/obligations. Any and all losses and financial charges on
          account of such liquidation/closing-out shall be charged to and borne
          by the client.
        </TextList>
        <TextList count="20.">
          In the event of death or insolvency of the client or his/its otherwise
          becoming incapable of receiving and paying for or delivering or
          transferring securities which the client has ordered to be bought or
          sold, stock broker may close out the transaction of the client and
          claim losses, if any, against the estate of the client. The client or
          his nominees, successors, heirs and assignee shall be entitled to any
          surplus which may result there from. The client shall note that
          transfer of funds/securities in favor of a Nominee shall be valid
          discharge by the stock broker against the legal heir.
        </TextList>
        <TextList count="21.">
          The stock broker shall bring to the notice of the relevant Exchange
          the information about default in payment/delivery and related aspects
          by a client. In case where defaulting client is a corporate
          entity/partnership/proprietary firm or any other artificial legal
          entity, then the name(s) of
          Director(s)/Promoter(s)/Partner(s)/Proprietor as the case may be,
          shall also be communicated by the stock broker to the relevant
          Exchange(s).
        </TextList>
        <Text style={tw(`font-bold uppercase text-xs`)}>
          DISPUTE RESOLUTION
        </Text>
        <TextList count="22.">
          The stock broker shall provide the client with the relevant contact
          details of the concerned Exchanges and SEBI.
        </TextList>
        <TextList count="23.">
          The stock broker shall co-operate in redressing grievances of the
          client in respect of all transactions routed through it and in
          removing objections for bad delivery of shares, rectification of bad
          delivery, etc.
        </TextList>
        <TextList count="24.">
          The client and the stock broker shall refer any claims and/or disputes
          with respect to deposits, margin money, etc., to arbitration as per
          the Rules, Byelaws and Regulations of the Exchanges where the trade is
          executed and circulars/notices issued thereunder as may be in force
          from time to time.
        </TextList>
        <TextList count="25.">
          The stock broker shall ensure faster settlement of any arbitration
          proceedings arising out of the transactions entered into between him
          vis-à-vis the client and he shall be liable to implement the
          arbitration awards made in such proceedings.
        </TextList>{" "}
        <TextList count="26.">
          The client/stock-broker understands that the instructions issued by an
          authorized representative for dispute resolution, if any, of the
          client/stock-broker shall be binding on the client/stock-broker in
          accordance with the letter authorizing the said representative to deal
          on behalf of the said client/stock-broker.
        </TextList>
        <Text style={tw(`font-bold uppercase text-xs`)}>
          TERMINATION OF RELATIONSHIP
        </Text>
        <TextList count="27.">
          This relationship between the stock broker and the client shall be
          terminated; if the stock broker for any reason ceases to be a member
          of the stock exchange including cessation of membership by reason of
          the stock broker's default, death, resignation or expulsion or if the
          certificate is cancelled by the Board.
        </TextList>
      </View>
    </View>
  );
}

export default Page20;
