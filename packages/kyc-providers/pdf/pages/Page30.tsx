import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page30() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-6`)}>
      <View style={tw(`flex flex-col gap-4 mt-3 text-xs leading-6`)}>
        <Text style={tw(`font-[600]`)}>4. GENERAL</Text>

        <TextList count="1.">
          <Text style={tw(`font-[600]`)}>4.1</Text> The term ‘constituent’ shall
          mean and include a client, a customer or an investor, who deals with a
          stock broker for the purpose of acquiring and/or selling of securities
          / derivatives contracts through the mechanism provided by the
          Exchanges.
        </TextList>
        <TextList count="2.">
          <Text style={tw(`font-[600]`)}>4.2</Text> The term ‘stock broker’
          shall mean and include a stock broker, a broker or a stock broker, who
          has been admitted as such by the Exchanges and who holds a
          registration certificate from SEBI.
        </TextList>
      </View>
    </View>
  );
}

export default Page30;
