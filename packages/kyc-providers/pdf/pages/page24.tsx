import { View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

function Page24() {
  return (
    <View style={tw(`w-[90%]  px-4  mx-auto `)}>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          gap: 10,
          marginTop: 15,
        }}
      >
        <TextList count="3.">
          The stock broker shall bring to the notice of client the features,
          risks, responsibilities, obligations and liabilities associated with
          securities trading through wireless technology/internet/smart order
          routing or any other technology should be brought to the notice of the
          client by the stock broker.
        </TextList>
        <TextList count="4.">
          The stock broker shall make the client aware that the Stock Broker’s
          IBT system itself generates the initial password and its password
          policy as stipulated in line with norms prescribed by Exchanges/SEBI.
        </TextList>

        <TextList count="5.">
          The Client shall be responsible for keeping the Username and Password
          confidential and secure and shall be solely responsible for all orders
          entered and transactions done by any person whosoever through the
          Stock broker’s IBT System using the Client’s Username and/or Password
          whether or not such person was authorized to do so. Also the client is
          aware that authentication technologies and strict security measures
          are required for the internet trading/securities trading through
          wireless technology through order routed system and undertakes to
          ensure that the password of the client and/or his authorized
          representative are not revealed to any third party including employees
          and dealers of the stock broker.
        </TextList>
        <TextList count="6.">
          The Client shall immediately notify the Stock broker in writing if he
          forgets his password, discovers security flaw in Stock Broker’s IBT
          System, discovers/suspects discrepancies/ unauthorized access through
          his username/password/account with full details of such unauthorized
          use, the date, the manner and the transactions effected pursuant to
          such unauthorized use, etc.
        </TextList>
        <TextList count="7.">
          The Client is fully aware of and understands the risks associated with
          availing of a service for routing orders over the internet/securities
          trading through wireless technology and Client shall be fully liable
          and responsible for any and all acts done in the Client’s
          Username/password in any manner whatsoever.
        </TextList>
        <TextList count="8.">
          The stock broker shall send the order/trade confirmation through email
          to the client at his request. The client is aware that the order/
          trade confirmation is also provided on the web portal. In case client
          is trading using wireless technology, the stock broker shall send the
          order/trade confirmation on the device of the client.
        </TextList>
        <TextList count="9.">
          The client is aware that trading over the internet involves many
          uncertain factors and complex hardware, software, systems,
          communication lines, peripherals, etc. are susceptible to
          interruptions and dislocations. The Stock broker and the Exchange do
          not make any representation or warranty that the Stock broker’s IBT
          Service will be available to the Client at all times without any
          interruption.
        </TextList>
        <TextList count="10.">
          The Client shall not have any claim against the Exchange or the Stock
          broker on account of any suspension, interruption, non-availability or
          malfunctioning of the Stock broker’s IBT System or Service or the
          Exchange’s service or systems or non-execution of his orders due to
          any link/system failure at the Client/Stock brokers/Exchange end for
          any reason beyond the control of the stock broker/Exchanges.
        </TextList>
      </View>
    </View>
  );
}

export default Page24;
