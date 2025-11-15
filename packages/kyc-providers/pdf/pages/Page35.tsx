import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page35() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto text-xs flex flex-col gap-3 leading-6 mt-5`
      )}
    >
      <Text>
        such other service providers shall be the agent of the client and the
        delivery shall be complete when communication is given to the postal
        department/the courier company/the e-mail/voice mail service provider,
        etc. by the stock broker and the client agrees never to challenge the
        same on any grounds including delayed receipt/non receipt or any other
        reasons whatsoever and once parameters for margin/security requirements
        are so communicated, the client shall monitor his/her/its position
        (dealings/trades and valuation of security) on his/her/its own and
        provide the required/deficit margin/security forthwith as required from
        time to time whether or not any margin call or such other separate
        communication to that effect is sent by the stock broker to the client
        and /or whether or not such communication is received by the client.
      </Text>
      <Text>
        The client is not entitled to trade without adequate margin/security and
        that it shall be his/her/its responsibility to ascertain beforehand the
        margin/security requirements for his/ her /its orders/trades/deals and
        to ensure that the required margin/security is made available to the
        stock broker in such form and manner as may be required by the
        stockbroker. If the client's order is executed despite a short fall in
        the available margin, the client, shall, whether or not the stock broker
        intimates such shortfall in the margin to the client, make up the
        shortfall suo moto immediately.
      </Text>
      <Text>
        The client further agrees that he /she/it shall be responsible for all
        orders (including any orders that may be executed without the required
        margin in the client's account) &/or any claim /loss/ damage arising out
        of the non availability /shortage of margin /security required by the
        stock broker &/or exchange &/or SEBI.
      </Text>
      <Text>
        The stock broker is entitled to vary the form (Le., the replacement of
        the margin/security in one form with the margin/security in any other
        form, say, in the form of money instead of shares) &/or quantum &/or
        percentage of the margin &/or security required to be deposited/made
        available, from time to time.
      </Text>
      <Text>
        The margin/security deposited by the client with the stock broker are
        not eligible for any interest.
      </Text>
      <Text>
        The stock broker is entitled to include/appropriate any/all payout of
        funds &/or securities towards margin/security without requiring specific
        authorizations for each payout.
      </Text>
      <Text>
        The stock broker is entitled to transfer funds &/ or securities from his
        account for one exchange &/or one segment of the exchange to his/her/its
        account for another exchange &/or another segment of the same exchange
        whenever applicable and found necessary by the stock broker.
      </Text>
      <Text>
        The client also agrees and authorises the stock broker to treat/adjust
        his/ her/its margin/security lying in one exchange &/or one segment of
        the exchange/towards the margin/security/pay in requirements of another
        exchange &/or another segment of the exchange.
      </Text>
      <Text>
        The stock broker is entitled to disable/freeze the account &/or trading
        facility/any other service. facility, if, in the opinion of the stock
        broker, the client has committed a crime/fraud or has acted in
        contradiction of this agreement or/is likely to evade/violate any laws,
        rules, regulations, directions of a lawful authority whether Indian or
        foreign or if the stock broker so apprehends.
      </Text>
      <Text style={tw(`font-[600]`)}>3. Applicable brokerage rate</Text>
      <Text>
        The stock broker is entitled to charge brokerage within the limits
        imposed by exchange which at present is as under:
      </Text>
      <TextList count="a.">
        For Cash Market Segment: The maximum brokerage chargeable in relation to
        trades effected in the securities{" "}
      </TextList>
    </View>
  );
}

export default Page35;
