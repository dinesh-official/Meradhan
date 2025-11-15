import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page29() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-5`)}>
      <View style={tw(`flex flex-col gap-3  text-xs leading-6`)}>
        <TextList count="3.">
          Currency prices are highly volatile. Price movements for currencies
          are influenced by, among other things: changing supply-demand
          relationships; trade, fiscal, monetary, exchange control programs and
          policies of governments; foreign political and economic events and
          policies; changes in national and international interest rates and
          inflation; currency devaluation; and sentiment of the market place.
          None of these factors can be controlled by any individual advisor and
          no assurance can be given that an advisor's advice will result in
          profitable trades for a participating customer or that a customer will
          not incur losses from such events.
        </TextList>
        <Text style={tw(`font-[600]`)}>2.3 Risk of Option holders:</Text>

        <TextList count="1.">
          An option holder runs the risk of losing the entire amount paid for
          the option in a relatively short period of time. This risk reflects
          the nature of an option as a wasting asset which becomes worthless
          when it expires. An option holder who neither sells his option in the
          secondary market nor exercises it prior to its expiration will
          necessarily lose his entire investment in the option. If the price of
          the underlying does not change in the anticipated direction before the
          option expires, to an extent sufficient to cover the cost of the
          option, the investor may lose all or a significant part of his
          investment in the option.
        </TextList>
        <TextList count="2.">
          The Exchanges may impose exercise restrictions and have absolute
          authority to restrict the exercise of options at certain times in
          specified circumstances.
        </TextList>
        <Text style={tw(`font-[600]`)}>2.4 Risks of Option Writers:</Text>

        <TextList count="1.">
          If the price movement of the underlying is not in the anticipated
          direction, the option writer runs the risks of losing substantial
          amount.
        </TextList>
        <TextList count="2.">
          The risk of being an option writer may be reduced by the purchase of
          other options on the same underlying interest and thereby assuming a
          spread position or by acquiring other types of hedging positions in
          the options markets or other markets. However, even where the writer
          has assumed a spread or other hedging position, the risks may still be
          significant. A spread position is not necessarily less risky than a
          simple 'long' or 'short' position.
        </TextList>
        <TextList count="3.">
          Transactions that involve buying and writing multiple options in
          combination, or buying or writing options in combination with buying
          or selling short the underlying interests, present additional risks to
          investors. Combination transactions, such as option spreads, are more
          complex than buying or writing a single option. And it should be
          further noted that, as in any area of investing, a complexity not well
          understood is, in itself, a risk factor. While this is not to suggest
          that combination strategies should not be considered, it is advisable,
          as is the case with all investments in options, to consult with
          someone who is experienced and knowledgeable with respect to the risks
          and potential rewards of combination transactions under various market
          circumstances.
        </TextList>

        <Text style={tw(`font-[600]`)}>
          3. TRADING THROUGH WIRELESS TECHNOLOGY/ SMART ORDER ROUTING OR ANY
          OTHER TECHNOLOGY:
        </Text>
        <Text>
          Any additional provisions defining the features, risks,
          responsibilities, obligations and liabilities associated with
          securities trading through wireless technology/ smart order routing or
          any other technology should be brought to the notice of the client by
          the stock broker.
        </Text>
      </View>
    </View>
  );
}

export default Page29;
