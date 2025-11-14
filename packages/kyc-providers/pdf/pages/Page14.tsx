import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";

function Page14({
  firstName = "",
  middleName = "",
  lastName = "",
  participantCode = "",
  email = "",
  address = "",
  mobile = "",
}: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  participantCode?: string;
  email?: string;
  address?: string;
  mobile?: string;
}) {
  const fullName = `${firstName}${middleName ? ` ${middleName} ` : " "}${lastName}`.trim();

  const tableData = [
    {
      sno: 1,
      name: "Participant Name",
      value: fullName,
    },
    {
      sno: 2,
      name: "Participant Code",
      value: participantCode,
    },
    {
      sno: 3,
      name: "Contact Person",
      value: fullName,
    },
    {
      sno: 4,
      name: "E-mail id of contact person",
      value: email,
    },
    {
      sno: 5,
      name: "Address for Communication with Pin Code",
      value: address,
    },
    {
      sno: 6,
      name: `Phone/Mobile Number of Contact Person
(with STD Code)`,
      value: mobile ? mobile : "",
    },
  ];

  return (
    <View style={tw("px-4 w-[90%] mx-auto")}>
      {/* Title */}
      <Text style={tw(`font-bold uppercase text-xs text-center pt-6`)}>
        NCL ANNEXURE
      </Text>
      <Text style={tw(`text-center text-xs mt-3`)}>
        Format of Letter providing Bank & DP details for settlement of Corporate
        Debt Instruments
      </Text>

      {/* Letter Head */}
      <View style={tw(`text-xs mt-6`)}>
        <Text>Date: {new Date().toLocaleDateString("en-GB")}</Text>
        <Text style={tw(`leading-4`)}>
          {`
The Manager,
NSE Clearing Ltd - Corporate Bond Settlements,
4th Floor, NSE Exchange Plaza,
Plot no. C/1, G Block,
Bandra-Kurla Complex
Bandra (E), Mumbai - 400 051`}
        </Text>

        <Text style={tw(`mt-4 mb-4`)}>
          Sub: Bank & DP details for settlement of Corporate Debt Instruments
        </Text>
        <Text style={tw(`leading-3`)}>
          We are interested in carrying out the clearing and settlement of our
          trades in corporate debt instruments through NSE Clearing Ltd (NCL).
          In this regard, please find below the details of our Bank and DP
          account
        </Text>
      </View>

      {/* Table */}
      <View style={tw(`text-xs mt-5`)}>
        {/* Table Header */}
        <View style={tw(`border-t border-b flex flex-row border-gray-200`)}>
          <View
            style={tw(
              `w-[10%] border-r border-gray-200 p-2 font-[500] flex justify-center`
            )}
          >
            <Text>Sr. No.</Text>
          </View>
          <View
            style={tw(
              `w-[45%] border-r border-gray-200 p-2 font-[500] flex justify-center`
            )}
          >
            <Text>Particulars</Text>
          </View>
          <View style={tw(`w-[45%] flex p-2 justify-center font-[500]`)}>
            <Text>To be filled by the Participant</Text>
          </View>
        </View>

        {/* Table Rows */}
        {tableData.map((e, i) => (
          <View
            key={i}
            style={tw(`border-b mx-auto flex flex-row border-gray-200`)}
          >
            <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex`)}>
              <Text style={{ lineHeight: 0.6 }}>{e.sno}</Text>
            </View>
            <View style={tw(`w-[45%] border-r border-gray-200 p-2 flex`)}>
              <Text style={{ lineHeight: 0.6 }}>{e.name}</Text>
            </View>
            <View style={tw(`w-[45%] flex p-2`)}>
              <Text style={{ lineHeight: 0.6 }}>{e.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default Page14;
