import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";

function Page34() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto mt-6 text-xs flex flex-col gap-3 leading-6`
      )}
    >
      <View style={tw("bg-main py-2 rounded ")}>
        <Text style={tw("text-white font-[600] text-sm text-center uppercase")}>
          Policies and Procedures
        </Text>
      </View>
      <Text style={tw(`font-[600] text-center`)}>
        POLICIES AND PROCEDURES AS PER SEBI CIRCULAR NO. MIRSD/ SE /CIR-19/2009
        DATED 3 DEC, 2009
      </Text>
      <Text style={tw(`font-[600] mt-3`)}>
        1. Refusal of orders for penny/illiquid stock
      </Text>
      <Text>
        The stock broker may from time to time limit (quantity/ value)/refuse
        orders in one or more securities due to various reasons including market
        liquidity, value of security(ies), the order being for securities which
        are not in the permitted list of the stock broker/ exchange(s)/SEBI.
        Provided further that stock broker may require compulsory
        settlement/advance payment of expected settlement value/ delivery of
        securities for settlement prior to acceptance/placement of order(s) as
        well. The client agrees that the losses, if any on account of such
        refusal or due to delay caused by such limits, shall be borne
        exclusively by the client alone. The stock broker may require
        reconfirmation of orders, which are larger than that specified by the
        stock broker's risk management, and is also aware that the stock broker
        has the discretion to reject the execution of such orders based on its
        risk perception
      </Text>
      <Text style={tw(`font-[600] mt-3`)}>
        2. Setting up client's exposure limits and conditions under which a
        client may not be allowed to take further position or the broker may
        close the existing position of a client.
      </Text>

      <Text>
        The stock broker may from time to time impose and vary limits on the
        orders that the client can place through the stock broker's trading
        system (including exposure limits, turnover limits, limits as to the
        number, value and/or kind of securities in respect of which orders can
        be placed etc.). The client is aware and agrees that the stock broker
        may need to vary or reduce the limits or impose new limits urgently on
        the basis of the stockbroker's risk perception and other factors
        considered relevant by the stock broker including but not limited to
        limits on account of exchange/ SEBI directions/limits ( such as broker
        level/ market level limits in security specific/volume specific
        exposures etc.) , and the stock broker may be unable to inform the
        client of such variation, reduction or imposition in advance. The client
        agrees that the stock broker shall not be responsible for such
        variation, reduction or imposition or the client's inability to route
        any order through the stock broker's trading system on account of any
        such variation, reduction or imposition of limits. The client further
        agrees that the stock broker may at any time, at its sole discretion and
        without prior notice, prohibit or restrict the client's ability to place
        orders or trade in securities through the stock broker, or it may
        subject any order placed by the client to a review before its entry into
        the trading systems and may refuse to execute/allow execution of orders
        due to but not limited to the reason of lack of margin/securities or the
        order being outside the limits set by stock broker/exchange/ SEBI and
        any other reasons which the stock broker may deem appropriate in the
        circumstances. The client agrees that the losses, if any on account of
        such refusal or due to delay caused by such review, shall be borne
        exclusively by the client alone.
      </Text>
      <Text>
        The stock broker is required only to communicate/advise the parameters
        for the calculation of the margin/security requirements as
        rate(s)/percentage(s) of the dealings, through anyone or more means or
        methods such as post /speed post/courier/registered post/registered A.D/
        facsimile/telegram/cable/e-mail/voice mails/ telephone (telephone
        includes such devices as mobile phones etc.) including SMS on the mobile
        phone or any other similar device; by messaging on the computer screen
        of the client's computer; by informing the client through
        employees/agents of the stock broker; by publishing/displaying it on the
        website of the stock broker/making it available as a download from the
        website of the stock broker; by displaying it on the notice board of the
        branch/office through which the client trades or if the circumstances,
        so require, by radio broadcast/television broadcast / newspapers
        advertisements etc; or any other suitable or applicable mode or manner.
        The client agrees that the postal department/the courier company
        /newspaper company and the e-mail/voice mail service provider and
      </Text>
    </View>
  );
}

export default Page34;
