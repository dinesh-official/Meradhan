import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page36() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto  text-xs flex flex-col gap-3 leading-6 mt-5`
      )}
    >
      <Text style={tw(`pl-[18px]`)}>
        admitted to dealings on the Capital Market segment of the Exchange shall
        be 2.5 % of the contract price exclusive of statutory levies. It is
        hereby further clarified that where the sale/purchase value of a share
        is Rs.10/ - or less, a maximum brokerage of 25 paise per share may be
        collected.
      </Text>
      <TextList count="b.">
        For Option contracts: Brokerage for option contracts shall be charged on
        the premium amount at which the option contract was bought or sold and
        not on the strike price of the option contract. It is hereby clarified
        that brokerage charged on options contracts shall not exceed 2.5% of the
        premium amount or Rs 100/- (per lot) whichever is higher.
      </TextList>
      <Text style={tw(`font-[600]`)}>
        4. Imposition of penalty/delayed payment charges
      </Text>
      <Text>
        The client agrees that any amounts which are overdue from the client
        towards trading or on account of any other reason to the stock broker
        will be charged with delayed payment charges @1.5% per month. The client
        agrees that the stock broker may impose fines/penalties for any
        orders/trades/deals/actions of the client which are contrary to this
        agreement/rules/ regulations/byelaws of the exchange or any other law
        for the time being in force, at such rates and in such form as it may
        deem fit.Further where the stock broker has to pay any fine or bear any
        punishment from any authority in connection with/as a consequence of/in
        relation to any of the orders/trades/deals/actions of the client, the
        same shall be borne by the client. The client agrees to pay to the stock
        broker brokerage, commission, fees, all taxes, duties, levies imposed by
        any authority including but not limited to the stock exchanges
        (including any amount due on account of reassessment/backlogs etc.),
        transaction expenses, incidental expenses such as postage, courier etc.
        as they apply from time to time to the client's
        account/transactions/services that the client avails from the stock
        broker.
      </Text>
      <Text style={tw(`font-[600]`)}>
        5. The right to sell clients' securities or close clients' positions,
        without giving notice to the client, on account\of non-payment of
        client's dues
      </Text>
      <Text>
        The stock broker maintains centralized banking and securities handling
        processes and related banking and depository accounts at designated
        place. The client shall ensure timely availability of funds/securities
        in designated form and manner at designated time and in designated bank
        and depository account(s) at designated place, for meeting his/her/its
        pay in obligation of funds and securities.
      </Text>
      <Text>
        The stock broker shall not be responsible for any claim/loss/damage
        arising out of non availability/short availability of funds/securities
        by the client in the designated account(s) of the stock broker for
        meeting the pay in obligation of either funds or securities. If the
        client gives orders/trades in the anticipation of the required
        securities being available subsequently for pay in through anticipated
        payout from the exchange or through borrowings or any off market
        delivery(s) or market delivery(s) and if such anticipated availability
        does not materialize in actual availability of securities/funds for pay
        in for any reason whatsoever including but not limited to any
        delays/shortages at the exchange or stock broker level/non release of
        margin by the stock broker etc., the losses which may occur to the
        client as a consequence of such shortages in any manner such as on
        account of auctions/square off/closing outs etc., shall be solely to the
        account of the client and the client agrees not to hold the stock broker
        responsible for the same in any form or manner whatsoever.
      </Text>
      <Text>
        In case the payment of the margin/security is made by the client through
        a bank instrument, the stock broker shall be at liberty to give the
        benefit/credit for the same only on the realization of the funds from
        the said bank instrument etc. at the absolute discretion of the
        stockbroker.
      </Text>
    </View>
  );
}

export default Page36;
