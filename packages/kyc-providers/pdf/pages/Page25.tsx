import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function Page25() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View style={tw("bg-main py-2 rounded mt-6")}>
        <Text
          style={tw(
            "text-sm text-white font-[600] leading-[1px] text-center uppercase"
          )}
        >
          Risk Disclosure Document
        </Text>
      </View>
      <Text style={tw(`font-[600] uppercase text-xs text-center mt-3`)}>
        RISK DISCLOSURE DOCUMENT FOR CAPITAL MARKET AND DERIVATIVES SEGMENTS
      </Text>
      <View style={tw(`flex flex-col gap-4 mt-6 text-xs leading-6`)}>
        <Text>
          This document contains important information on trading in
          Equities/Derivatives Segments of the stock exchanges. All prospective
          constituents should read this document before trading in
          Equities/Derivatives Segments of the Exchanges.
        </Text>
        <Text>
          Stock exchanges/SEBI does neither singly or jointly and expressly nor
          impliedly guarantee nor make any representation concerning the
          completeness, the adequacy or accuracy of this disclosure document nor
          have Stock exchanges /SEBI endorsed or passed any merits of
          participating in the trading segments. This brief statement does not
          disclose all the risks and other significant aspects of trading.
        </Text>
        <Text>
          In the light of the risks involved, you should undertake transactions
          only if you understand the nature of the relationship into which you
          are entering and the extent of your exposure to risk.
        </Text>
        <Text>
          You must know and appreciate that trading in Equity shares,
          derivatives contracts or other instruments traded on the Stock
          Exchange, which have varying element of risk, is generally not an
          appropriate avenue for someone of limited resources/limited investment
          and/or trading experience and low risk tolerance. You should therefore
          carefully consider whether such trading is suitable for you in the
          light of your financial condition. In case you trade on Stock
          exchanges and suffer adverse consequences or loss, you shall be solely
          responsible for the same and Stock exchanges/its Clearing Corporation
          and/or SEBI shall not be responsible, in any manner whatsoever, for
          the same and it will not be open for you to take a plea that no
          adequate disclosure regarding the risks involved was made or that you
          were not explained the full risk involved by the concerned stock
          broker. The constituent shall be solely responsible for the
          consequences and no contract can be rescinded on that account. You
          must acknowledge and accept that there can be no guarantee of profits
          or no exception from losses while executing orders for purchase and/or
          sale of a derivative contract being traded on Stock exchanges.
        </Text>
        <Text>
          It must be clearly understood by you that your dealings on Stock
          exchanges through a stock broker shall be subject to your fulfilling
          certain formalities set out by the stock broker, which may inter alia
          include your filling the know your client form, reading the rights and
          obligations, do’s and don’ts, etc., and are subject to the Rules,
          Byelaws and Regulations of relevant Stock exchanges, its Clearing
          Corporation, guidelines prescribed by SEBI and in force from time to
          time and Circulars as may be issued by Stock exchanges or its Clearing
          Corporation and in force from time to time.
        </Text>
        <Text>
          Stock exchanges does not provide or purport to provide any advice and
          shall not be liable to any person who enters into any business
          relationship with any stock broker of Stock exchanges and/or any third
          party based on any information contained in this document. Any
          information contained in this document must not be construed as
          business advice. No consideration to trade should be made without
          thoroughly understanding and reviewing the risks involved in such
          trading. If you are unsure, you must seek professional advice on the
          same.
        </Text>
        <Text>
          In considering whether to trade or authorize someone to trade for you,
          you should be aware of or must get acquainted with the following:
        </Text>
      </View>
    </View>
  );
}

export default Page25;
