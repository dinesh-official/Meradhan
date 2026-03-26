import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page36_1() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto  text-xs flex flex-col gap-3 leading-6 mt-5`
      )}
    >
      <Text>
        Where the margin /security is made available by way of securities or any
        other property, the stock broker is empowered to decline its acceptance
        as margin/security &/or to accept it at such reduced value as the
        stockbroker may deem fit by applying haircuts or by valuing it by
        marking it to market or by any other method as the stock broker may deem
        fit in its absolute discretion.
      </Text>
      <Text style={tw(`text-xs leading-[5px]`)}>
        The stock broker has the right but not the obligation, to cancel all
        pending orders and to sell/close/liquidate all open positions/
        securities/shares at the pre-defined square off time or when Mark to
        Market (M-T-M) percentage reaches or crosses stipulated margin
        percentage mentioned on the website, whichever is earlier. The stock
        broker will have sole discretion to decide referred stipulated margin
        percentage depending upon the market condition. In the event of such
        square off, the client agrees to bear all the losses based on actual
        executed prices. In case open position (Le. short/long) gets converted
        into delivery due to non square off because of any reason whatsoever,
        the client agrees to provide securities/funds to fulfill the payin
        obligation failing which the client will have to face auctions or
        internal close outs; in addition to this the client will have to pay
        penalties and charges levied by exchange in actual and losses, if any.
        Without prejudice to the foregoing, theclient shall also be solely
        liable for all and any penalties and charges levied by the exchange(s).
      </Text>

      <Text>
        The stock broker is entitled to prescribe the date and time by which the
        margin/security is to be made available and the stock broker may refuse
        to accept any payments in any form after such deadline for
        margin/security expires.
      </Text>

      <Text>
        Notwithstanding anything to the contrary in the agreement or elsewhere,
        if the client fails to maintain or provide the required
        margin/fund/security or to meet the funds/margins/ securities pay in
        obligations for the orders/trades/deals of the client within the
        prescribed time and form, the stock broker shall have the right without
        any further notice or communication to the client to take any one or
        more of the following steps:
      </Text>
      <TextList count="i.">
        To withhold any payout of funds/securities.
      </TextList>
      <TextList count="ii.">
        To withhold/disable the trading/dealing facility to the client.
      </TextList>
      <TextList count="iii.">
        To liquidate one or more security(s) of the client by selling the same
        in such manner and at such rate which the stock broker may deem fit in
        its absolute discretion. It is agreed and understood by the client that
        securities here includes securities which are pending delivery/receipt.
      </TextList>
      <TextList count="iv.">
        To liquidate/square off partially or fully the position of sale &/or
        purchase in anyone or more securities/contracts in such manner and at
        such rate which the stock broker may decide in its absolute discretion.
      </TextList>
      <TextList count="v.">
        To take any other steps which in the given circumstances, the stock
        broker may deem fit.
      </TextList>
      <TextList count=" ">
        The client agrees that the loss(s) if any, on account of anyone or more
        steps as enumerated herein above being taken by the stock broker, shall
        be borne exclusively by the client alone and agrees not to question the
        reasonableness, requirements, timing, manner, form, pricing etc., which
        are chosen by the stock broker.
      </TextList>
      <Text style={tw(`font-[600]`)}>
        6. Shortages in obligations arising out of internal netting of trades
      </Text>
      <Text>
        Stock broker shall not be obliged to deliver any securities or pay any
        money to the client unless and until the same has been received by the
        stock broker from the exchange, the clearing corporation/ clearing house
        or other company or entity liable to make the payment and the client has
        fulfilled his/her/ its obligations first.
      </Text>
    </View>
  );
}

export default Page36_1;
