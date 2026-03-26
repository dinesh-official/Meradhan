import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page36_3() {
  return (
    <View
      style={tw(
        `w-[90%]  px-4  mx-auto mt-1 text-xs flex flex-col gap-3 leading-6 mt-5`
      )}
    >
      <TextList count="vii.">
        If the Client have taken or suffered to be taken any action for its
        reorganization, liquidation or dissolution;
      </TextList>
      <TextList count="viii.">
        If the Client has made any material misrepresentation of facts,
        including (without limitation) in relation to the Security;
      </TextList>
      <TextList count="ix.">
        If there is reasonable apprehension that the Client is unable to pay its
        debts or the Client has admitted its inability to pay its debts, as they
        become payable;
      </TextList>
      <TextList count="x.">
        If the Client suffers any adverse material change in his/her/its
        financial position or defaults in any other agreement with the Stock
        broker;
      </TextList>
      <TextList count="xi.">
        If the Client is in breach of any term, condition or covenant of this
        Agreement;
      </TextList>
      <TextList count="xii.">
        If any covenant or warranty of the Client is incorrect or untrue in any
        material respect; However notwithstanding any termination of the
        agreement, all transactions made under/pursuant to this agreement shall
        be subject to all the terms and conditions of this agreement and parties
        to this agreement submit to exclusive jurisdiction of courts of law at
        the place of execution of this agreement by Stock Broker.
      </TextList>
      <Text style={tw(`font-[600]`)}>
        9. Policy regarding treatment of inactive accounts:{" "}
      </Text>
      <Text>
        Client account will be considered as in active if the client does not
        trade for a period of one year. Calculation will be done at the
        beginning of every month and those clients who have not traded even a
        single time will be considered as inactive. Steps will be taken for
        transferring the shares/credit balance, if any, to such client within
        one week of identifying the client as inactive. Whenever such inactive
        account holders restart trading, a telephonic/personal confirmation will
        be made from the client to ensure that there is no error in
        identification the client.
      </Text>
      <Text style={tw(`font-[600]`)}>
        Client Acceptance of Policies and Procedures stated herein above:
      </Text>
      <Text>
        I/We have fully understood the same and do hereby sign the same and
        agree not to call into question the validity, enforceability and
        applicability of any provision/clauses this document any circumstances
        what so ever. These Policies and Procedures may be amended/changed
        unilaterally by the broker, provided the change is informed to me/us
        with through anyone or more means or methods such as post/speed
        post/courier/registered post/registered
        AD/facsimile/telegram/cable/e-mail/voice mails/telephone (telephone
        includes such devices as mobile phones etc.) including SMS on the mobile
        phone or any other similar device; by messaging on the computer screen
        of the client's computer; by informing the client through
        employees/agents of the stock broker; by publishing/displaying it on the
        website of the stock broker/making it available as a download from the
        website of the stock broker; by displaying it on the notice board of the
        branch/office through which the client trades or if the circumstances,
        so require, by radio broadcast/television broadcast/newspapers
        advertisements etc; or any other suitable or applicable mode or manner.
        I/we agree that the postal department/the courier company /newspaper
        company and the e-mail/ voice mail service provider and such other
        service providers shall be my/our agent and the delivery shall be
        complete when communication is given to the postal department/the
        courier company/the e-mail/voice mail service provider, etc. by the
        stock broker and I/we agree never to challenge the same on any grounds
        including delayed receipt/non-receipt or any other reasons whatsoever.
        These Policies and Procedures shall always be read along with the
        agreement and shall be compulsorily referred to while deciding any
        dispute/difference or claim between me/ us and stock broker before any
        court of law/judicial/adjudicating authority including
        arbitrator/mediator etc.
      </Text>
    </View>
  );
}

export default Page36_3;
