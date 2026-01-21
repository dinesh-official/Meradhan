import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";
import { formatDate } from "../helper";
const TableData1 = [
  {
    name: "Brokerage (Any transaction)",
    value: `Up to 2.5% of the transaction value.`,
  },
  {
    name: "Reporting Charges",
    value: `Nil`,
  },
  {
    name: "Trade Reporting Charges",
    value: `Nil`,
  },
  {
    name: "Settlement Failure Charges",
    value: "Nil",
  },
];
function Page37() {
  // Get today's date formatted as DD/MM/YYYY
  const today = formatDate(new Date().toISOString(), "DD/MM/YYYY");

  return (
    <View style={tw(`w-[90%]  px-4  mx-auto mt-6 text-xs`)}>
      <Text style={tw(`font-[600] text-center text-sm`)}>TARIFF SHEET</Text>
      <Text style={tw(`text-center mt-3`)}>Tariff Sheet - Trading Account</Text>
      <Text style={tw(`leading-4 mt-8`)}>
        {`To
BondNest Capital India Securities Private Limited
TBQ, Suite No 511,
5th floor, Tower 2A, North Annex
One World Centre, Senapati Bapat Marg,
Lower Parel, Mumbai, Maharashtra 400013`}
      </Text>
      <Text style={tw(`font-[600] mt-2`)}>
        Charges for BondNest Trading Services
      </Text>
      <Text style={tw(`leading-3 mt-3`)}>
        I/We agree to pay the charges as per the following charges structure for
        our Trading account with BondNest effective from {today}
      </Text>

      <View
        style={tw(
          `border-t border-b mx-auto flex flex-row border-gray-200 mt-5`,
        )}
      >
        <View
          style={tw(
            `w-[40%] border-r border-gray-200 p-2 font-[600]   flex justify-center`,
          )}
        >
          <Text>Charge Head</Text>
        </View>
        <View style={tw(`w-[60%] flex p-2 justify-center font-[600] `)}>
          <Text>Brokerage/Charges</Text>
        </View>
      </View>
      {TableData1.map((e, i) => {
        return (
          <View
            style={tw(`border-b mx-auto flex flex-row border-gray-200`)}
            key={i}
          >
            <View style={tw(`w-[40%] border-r border-gray-200 p-2  flex `)}>
              <Text style={{ lineHeight: 0.6 }}>{e.name}</Text>
            </View>
            <View style={tw(`w-[60%] flex p-2 `)}>
              <Text style={{ lineHeight: 0.6 }}>{e.value}</Text>
            </View>
          </View>
        );
      })}

      <View style={tw(`flex flex-col gap-2 mt-5 leading-3`)}>
        <Text>
          Clients who requests to receive physical Order Receipt/Deal
          Sheet/Quote Receipt will be charged INR 100 per Order Receipt/Deal
          Sheet/Quote Receipt plus courier charges.
        </Text>
        <Text style={tw(`font-[600]`)}>Schedule of Charges:</Text>
        <Text>
          In addition to the brokerage charge, the following charges will also
          be levied:
        </Text>
        <Text>
          1. Exchange transaction charges | 2. Clearing charges | 3. Securities
          Transaction Tax | 4. Goods & Services Tax | 5. SEBI Turnover fees | 6.
          Stamp Duty
        </Text>
        <Text>Note:</Text>
        <TextList count="•">
          Brokerage will not exceed the rates specified by SEBI and the Exchange
        </TextList>
        <TextList count="•">
          All Statutory and Regulatory charges will be levied as per exchange,
          SEBI, and depository circulars published from time to time.
        </TextList>
        <TextList count="•">
          Charges for other value-added services will be applicable at the time
          of availing such service, upon your consent
        </TextList>
      </View>
    </View>
  );
}

export default Page37;
