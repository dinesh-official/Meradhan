import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page28() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View style={tw(`flex flex-col gap-4 mt-5 text-xs leading-6`)}>
        <Text style={tw(`font-[600]`)}>
          2. As far as Derivatives segments are concerned, please note and get
          yourself acquainted with the following additional features:-
        </Text>
        <Text style={tw(`font-[600]`)}>
          2.1 Effect of "Leverage" or "Gearing":
        </Text>
        <Text>
          In the derivatives market, the amount of margin is small relative to
          the value of the derivatives contract so the transactions are
          'leveraged' or 'geared'. Derivatives trading, which is conducted with
          a relatively small amount of margin, provides the possibility of great
          profit or loss in comparison with the margin amount. But transactions
          in derivatives carry a high degree of risk.
        </Text>
        <Text>
          You should therefore completely understand the following statements
          before actually trading in derivatives and also trade with caution
          while taking into account one's circumstances, financial resources,
          etc. If the prices move against you, you may lose a part of or whole
          margin amount in a relatively short period of time. Moreover, the loss
          may exceed the original margin amount.
        </Text>

        <TextList count="A.">
          Futures trading involve daily settlement of all positions. Every day
          the open positions are marked to market based on the closing level of
          the index / derivatives contract. If the contract has moved against
          you, you will be required to deposit the amount of loss (notional)
          resulting from such movement. This amount will have to be paid within
          a stipulated time frame, generally before commencement of trading on
          next day.
        </TextList>
        <TextList count="B.">
          If you fail to deposit the additional amount by the deadline or if an
          outstanding debt occurs in your account, the stock broker may
          liquidate a part of or the whole position or substitute securities. In
          this case, you will be liable for any losses incurred due to such
          close-outs.
        </TextList>
        <TextList count="C.">
          Under certain market conditions, an investor may find it difficult or
          impossible to execute transactions. For example, this situation can
          occur due to factors such as illiquidity i.e. when there are
          insufficient bids or offers or suspension of trading due to price
          limit or circuit breakers etc.
        </TextList>
        <TextList count="D.">
          In order to maintain market stability, the following steps may be
          adopted: changes in the margin rate, increases in the cash margin rate
          or others. These new measures may also be applied to the existing open
          interests. In such conditions, you will be required to put up
          additional margins or reduce your positions.
        </TextList>
        <TextList count="E.">
          You must ask your broker to provide the full details of derivatives
          contracts you plan to trade i.e. the contract specifications and the
          associated obligations.
        </TextList>

        <Text style={tw(`font-[600]`)}>2.2 Currency specific risks:</Text>
        <TextList count="1.">
          The profit or loss in transactions in foreign currency-denominated
          contracts, whether they are traded in your own or another
          jurisdiction, will be affected by fluctuations in currency rates where
          there is a need to convert from the currency denomination of the
          contract to another currency.
        </TextList>
        <TextList count="2.">
          Under certain market conditions, you may find it difficult or
          impossible to liquidate a position. This can occur, for example when a
          currency is deregulated or fixed trading bands are widened.
        </TextList>
      </View>
    </View>
  );
}

export default Page28;
