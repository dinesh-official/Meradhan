import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function Page27() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-4`)}>
      <View style={tw(`flex flex-col gap-3 mt-3 text-xs leading-6`)}>
        <Text>
          <Text style={tw(`font-[500]`)}>1.4.2</Text> A "limit" order will be
          executed only at the "limit" price specified for the order or a better
          price. However, while the customer receives price protection, there is
          a possibility that the order may not be executed at all.
        </Text>
        <Text>
          <Text style={tw(`font-[500]`)}>1.4.3</Text> A stop loss order is
          generally placed "away" from the current price of a stock /
          derivatives contract, and such order gets activated if and when the
          security / derivatives contract reaches, or trades through, the stop
          price. Sell stop orders are entered ordinarily below the current
          price, and buy stop orders are entered ordinarily above the current
          price. When the security / derivatives contract reaches the pre
          -determined price, or trades through such price, the stop loss order
          converts to a market/limit order and is executed at the limit or
          better. There is no assurance therefore that the limit order will be
          executable since a security / derivatives contract might penetrate the
          pre-determined price, in which case, the risk of such order not
          getting executed arises, just as with a regular limit order.
        </Text>
        <Text style={tw(`font-[600]  text-xs`)}>
          1.5 Risk of News Announcements:
        </Text>

        <Text>
          News announcements that may impact the price of stock / derivatives
          contract may occur during trading, and when combined with lower
          liquidity and higher volatility, may suddenly cause an unexpected
          positive or negative movement in the price of the security / contract.
        </Text>

        <Text style={tw(`font-[600]  text-xs`)}>1.6 Risk of Rumors:</Text>

        <Text>
          Rumors about companies / currencies at times float in the market
          through word of mouth, newspapers, websites or news agencies, etc. The
          investors should be wary of and should desist from acting on rumors.
        </Text>

        <Text style={tw(`font-[600]  text-xs`)}>1.7 System Risk:</Text>

        <Text>
          High volume trading will frequently occur at the market opening and
          before market close. Such high volumes may also occur at any point in
          the day. These may cause delays in order execution or confirmation.
        </Text>
        <Text>
          <Text style={tw(`font-[600]  text-xs`)}>1.7.1</Text> During periods of
          volatility, on account of market participants continuously modifying
          their order quantity or prices or placing fresh orders, there may be
          delays in order execution and its confirmations.
        </Text>

        <Text>
          <Text style={tw(`font-[600]  text-xs`)}>1.7.2</Text> Under certain
          market conditions, it may be difficult or impossible to liquidate a
          position in the market at a reasonable price or at all, when there are
          no outstanding orders either on the buy side or the sell side, or if
          trading is halted in a security / derivatives contract due to any
          action on account of unusual trading activity or security /
          derivatives contract hitting circuit filters or for any other reason.
        </Text>
        <Text style={tw(`font-[600]  text-xs`)}>
          1.8 System/Network Congestion:
        </Text>

        <Text>
          Trading on exchanges is in electronic mode, based on satellite/leased
          line based communications, combination of technologies and computer
          systems to place and route orders. Thus, there exists a possibility of
          communication failure or system problems or slow or delayed response
          from system or trading halt, or any such other problem/glitch whereby
          not being able to establish access to the trading system/network,
          which may be beyond control and may result in delay in processing or
          not processing buy or sell orders either in part or in full. You are
          cautioned to note that although these problems may be temporary in
          nature, but when you have outstanding open positions or unexecuted
          orders, these represent a risk because of your obligations to settle
          all executed transactions.
        </Text>
      </View>
    </View>
  );
}

export default Page27;
