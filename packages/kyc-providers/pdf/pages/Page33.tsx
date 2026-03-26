import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page33() {
  return (
    <View
      style={tw(`w-[90%]  px-4  mx-auto mt-6 text-xs flex flex-col gap-3 `)}
    >
      <Text style={tw(`font-[600]`)}>DISPUTES/ COMPLAINTS</Text>
      <TextList count="18.">
        Please note that the details of the arbitration proceedings, penal
        action against the brokers and investor complaints against the stock
        brokers are displayed on the website of the relevant Stock exchange.
      </TextList>
      <TextList count="19.">
        In case your issue/problem/grievance is not being sorted out by
        concerned stock broker/sub-broker then you may take up the matter with
        the concerned Stock exchange. If you are not satisfied with the
        resolution of your complaint then you can escalate the matter to SEBI.
      </TextList>
      <TextList count="20.">
        Note that all the stock broker/sub-brokers have been mandated by SEBI to
        designate an e-mail ID of the grievance redressal division/ compliance
        officer exclusively for the purpose of registering complaints.
      </TextList>
    </View>
  );
}

export default Page33;
