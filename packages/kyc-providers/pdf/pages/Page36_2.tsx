import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page36_2() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto  text-xs flex flex-col gap-2 leading-6 mt-5`
      )}
    >
      <Text>
        The policy and procedure for settlement of shortages in obligations
        arising out of internal netting of trades is as under:
      </Text>
      <TextList count="a.">
        The securities delivered short are purchased from market on T+3 day
        which is the Auction Day on Exchange, and the purchase consideration
        (inclusive of all statutory taxes & levies) is debited to the short
        delivering seller client.
      </TextList>
      <TextList count="b.">
        If securities cannot be purchased from market due to any reason
        whatsoever on T+3 day they can be covered from the market on any
        subsequent trading days. In case any reason whatsoever (any error or
        omission) any delay in covering of securities leads to higher losses,
        stock broker will not be liable for the same. Where the delivery is
        matched partially or fully at the Exchange Clearing, the delivery and
        debits/credits shall be as per Exchange Debits and Credits.
      </TextList>
      <TextList count="c.">
        In cases of securities having corporate actions all cases of short
        delivery of cum transactions which cannot be auctioned on cum basis or
        where the cum basis auction payout is after the book closure/record
        date, would be compulsory closed out at higher of10% above the official
        closing price on the auction day or the highest traded price from first
        trading day of the settlement till the auction day
      </TextList>
      <Text style={tw(`font-[600]`)}>
        7. Conditions under which a client may not be allowed to take further
        position or the broker may close the existing position of a client.
      </Text>
      <Text>
        We have margin based RMS System. Client may take exposure upto the
        amount of margin available with us. Client may not be allowed to take
        position in case of non-availability/ shortage of margin as per our RMS
        policy of the company. The existing position of the client is also
        liable to square off/ close out without giving notice due to shortage of
        margin/non making of payment for their pay-in obligation/outstanding
        debts.
      </Text>
      <Text style={tw(`font-[600]`)}>8. De-registering a client</Text>
      <Text>
        Notwithstanding anything to the contrary stated in the agreement, the
        stock broker shall be entitled to terminate the agreement with immediate
        effect in any of the following circumstances:
      </Text>
      <TextList count="i.">
        If the action of the Client are prima facie illegal/improper or such as
        to manipulate the price of any securities or disturb the normal/ proper
        functioning of the market, either alone or in conjunction with others.
      </TextList>
      <TextList count="ii.">
        If there is any commencement of a legal process against the Client under
        any law in force;
      </TextList>
      <TextList count="iii.">
        On the death/lunacy or other disability of the Client;
      </TextList>
      <TextList count="iv.">
        If a receiver, administrator or liquidator has been appointed or allowed
        to be appointed of all or any part of the undertaking of the Client;
      </TextList>
      <TextList count="v.">
        If the Client has voluntarily or compulsorily become the subject of
        proceedings under any bankruptcy or insolvency law or being a company,
        goes into liquidation or has a receiver appointed in respect of its
        assets or refers itself to the Board for Industrial and Financial
        Reconstruction or under any other law providing protection as a relief
        undertaking;
      </TextList>
      <TextList count="vi.">
        If the Client being a partnership firm, has any steps taken by the
        Client and/ or its partners for dissolution of the partnership;
      </TextList>
    </View>
  );
}

export default Page36_2;
