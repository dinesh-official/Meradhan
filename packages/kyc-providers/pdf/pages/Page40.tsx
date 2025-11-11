import React from "react";

import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";

const dataL = [
  {
    nominee: "A",
    share: "60%",
    subNominee: "A",
    initial: "0",
    apportioned: "0",
    total: "0",
  },
  {
    nominee: "B",
    share: "30%",
    subNominee: "A",
    initial: "30%",
    apportioned: "45%",
    total: "75%",
  },
  {
    nominee: "C",
    share: "10%",
    subNominee: "A",
    initial: "10%",
    apportioned: "15%",
    total: "25%",
  },
  {
    nominee: "Total",
    share: "100%",
    subNominee: "-",
    initial: "40%",
    apportioned: "60%",
    total: "100%",
  },
];

function Page40() {
  return (
    <View style={tw(`w-[90%] px-4 mx-auto mt-4 text-xs`)}>
      <View style={tw(`flex flex-col gap-2`)}>
        <TextList count="•" fontSize={9}>
          You have the option to designate any one of your nominees to operate
          your account / folio, if case of your physical incapciation. This
          mandate can be changed any time you choose.
        </TextList>
        <TextList count="•" fontSize={9}>
          The signatories for this nomination form in joint folios / account,
          shall be the same as that of your joint MF folio / demat account. i.e.
        </TextList>
        <View style={tw(`ml-5 flex flex-col gap-2 `)}>
          <TextList count="•" fontSize={9}>
            ‘Either or Survivor’ Folios / Accounts - any one of the holder can
            sign
          </TextList>
          <TextList count="•" fontSize={9}>
            ‘Jointly’ Folios / Accounts - both holders have to sign
          </TextList>
        </View>
      </View>
      <Text style={tw(`font-[600] mt-4 mb-3`)}>Transmission aspects</Text>
      <View style={tw(` flex flex-col gap-2 `)}>
        <TextList count="•" fontSize={9}>
          AMCs / DPs shall transmit the folio / account to the nominee(s) upon
          receipt of 1) copy of death certificate and 2) completion / updation
          of KYC of the nominee(s). The nomimee is not required to provide
          affidavits, indemnitites, undertakings, attestations or notarization.
        </TextList>
        <TextList count="•" fontSize={9}>
          Nominee(s) shall extend all possible co-operation to transfer the
          assets to the legal heir(s) of the deceased investor. In this regard,
          no dispute shall lie against the AMC / DP.
        </TextList>
        <TextList count="•" fontSize={9}>
          In case of multiple nomineees the assets shall be distributed pro-rata
          to the surviving nominees, as illustrated below.
        </TextList>
      </View>

      <View style={tw(`mt-6 border-t border-gray-300`)}>
        {/* Header Row */}
        <View style={tw(`flex flex-row border-b border-gray-300`)}>
          <View style={tw(`w-[50%] border-r border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              % share as specified by{"\n"}investor at the time{"\n"}of
              nomination
            </Text>
          </View>
          <View style={tw(`w-[50%]`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              % assets to be apportioned to{"\n"}surviving nominees upon{"\n"}
              demise of investor and nominee ‘A’
            </Text>
          </View>
        </View>

        {/* Sub Header Row */}
        <View style={tw(`flex flex-row border-gray-300`)}>
          <View style={tw(`w-[12%] border-r border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              Nominee
            </Text>
          </View>
          <View style={tw(`w-[13%] border-r border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              % share
            </Text>
          </View>
          <View style={tw(`w-[12%] border-r border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              Nominee
            </Text>
          </View>
          <View style={tw(`w-[13%] border-r border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              % initial share
            </Text>
          </View>
          <View style={tw(`w-[25%] border-r border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              % of A’s share to{"\n"}be apportioned
            </Text>
          </View>
          <View style={tw(`w-[25%] border-b border-gray-300`)}>
            <Text style={tw(`text-center text-[7px] p-1 font-bold`)}>
              Total % share
            </Text>
          </View>
        </View>

        {/* Data Rows */}
        {dataL.map((row, idx) => (
          <View
            key={idx}
            style={tw(
              `flex flex-row border-b border-gray-300 ${
                dataL.length == idx + 1 && "font-[600]"
              }`
            )}
          >
            <View style={tw(`w-[12%] border-r border-gray-300`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>
                {row.nominee}
              </Text>
            </View>
            <View style={tw(`w-[13%] border-r border-gray-300`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>{row.share}</Text>
            </View>
            <View style={tw(`w-[12%] border-r border-gray-300`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>
                {row.subNominee}
              </Text>
            </View>
            <View style={tw(`w-[13%] border-r border-gray-300`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>
                {row.initial}
              </Text>
            </View>
            <View style={tw(`w-[25%] border-r border-gray-300`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>
                {row.apportioned}
              </Text>
            </View>
            <View style={tw(`w-[25%]`)}>
              <Text style={tw(`text-center text-[7px] py-2`)}>{row.total}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default Page40;
