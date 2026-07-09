import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function Page26() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-[10px]`)}>
      <Text style={tw(`font-[600] uppercase text-xs `)}>1. BASIC RISKS:</Text>
      <Text style={tw(`font-[600]  text-xs mt-4`)}>
        1.1 Risk of Higher Volatility:
      </Text>
      <View style={tw(`flex flex-col gap-3 mt-4  text-xs leading-6`)}>
        <Text>
          Volatility refers to the dynamic changes in price that a
          security/derivatives contract undergoes when trading activity
          continues on the Stock Exchanges. Generally, higher the volatility of
          a security/derivatives contract, greater is its price swings. There
          may be normally greater volatility in thinly traded securities /
          derivatives contracts than in active securities /derivatives
          contracts. As a result of volatility, your order may only be partially
          executed or not executed at all, or the price at which your order got
          executed may be substantially different from the last traded price or
          change substantially thereafter, resulting in notional or real losses.
        </Text>

        <Text style={tw(`font-[600]  text-xs`)}>
          1.2 Risk of Lower Liquidity:
        </Text>

        <Text>
          Liquidity refers to the ability of market participants to buy and/or
          sell securities / derivatives contracts expeditiously at a competitive
          price and with minimal price difference. Generally, it is assumed that
          more the numbers of orders available in a market, greater is the
          liquidity. Liquidity is important because with greater liquidity, it
          is easier for investors to buy and/or sell securities / derivatives
          contracts swiftly and with minimal price difference, and as a result,
          investors are more likely to pay or receive a competitive price for
          securities / derivatives contracts purchased or sold. There may be a
          risk of lower liquidity in some securities / derivatives contracts as
          compared to active securities / derivatives contracts. As a result,
          your order may only be partially executed, or may be executed with
          relatively greater price difference or may not be executed at all.
        </Text>

        <Text>
          <Text style={tw(`font-[600]  text-xs`)}>1.2.1</Text> Buying or selling
          securities / derivatives contracts as part of a day trading strategy
          may also result into losses, because in such a situation, securities /
          derivatives contracts may have to be sold / purchased at low / high
          prices, compared to the expected price levels, so as not to have any
          open position or obligation to deliver or receive a security /
          derivatives contract.
        </Text>

        <Text style={tw(`font-[600]  text-xs`)}>
          1.3 Risk of Wider Spreads:
        </Text>

        <Text>
          Spread refers to the difference in best buy price and best sell price.
          It represents the differential between the price of buying a security
          / derivatives contract and immediately selling it or vice versa. Lower
          liquidity and higher volatility may result in wider than normal
          spreads for less liquid or illiquid securities / derivatives
          contracts. This in turn will hamper better price formation.
        </Text>

        <Text style={tw(`font-[600]  text-xs`)}>1.4 Risk-reducing orders:</Text>

        <Text>
          The placing of orders (e.g., "stop loss” orders, or "limit" orders)
          which are intended to limit losses to certain amounts may not be
          effective many a time because rapid movement in market conditions may
          make it impossible to execute such orders.
        </Text>

        <Text>
          <Text style={tw(`font-[600]  text-xs`)}>1.4.1</Text> A "market" order
          will be executed promptly, subject to availability of orders on
          opposite side, without regard to price and that, while the customer
          may receive a prompt execution of a "market" order, the execution may
          be at available prices of outstanding orders, which satisfy the order
          quantity, on price time priority. It may be understood that these
          prices may be significantly different from the last traded price or
          the best price in that security / derivatives contract. contract.
        </Text>
      </View>
    </View>
  );
}

export default Page26;
