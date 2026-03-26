import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { splitInto8 } from "../dataMapper";

function Page15({
  bankName = "",
  bankBranch = "",
  ifscCode = "",
  accountNumber = "",
  isDefaultBank = false,
  depository = "",
  dpName = "",
  dpId = "",
  clientId = "",
  pan = "",
  firstName = "",
  middleName = "",
  lastName = "",
  signatureUrl = "",
}: {
  bankName?: string;
  bankBranch?: string;
  ifscCode?: string;
  accountNumber?: string;
  isDefaultBank?: boolean;
  depository?: string;
  dpName?: string;
  dpId?: string;
  clientId?: string;
  pan?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  signatureUrl?: string;
}) {
  const tableData = [
    {
      sno: 7,
      name: "Bank Name",
      value: bankName,
    },
    {
      sno: 8,
      name: "Bank Branch",
      value: bankBranch,
    },
    {
      sno: 9,
      name: "Bank IFSC Code (RTGS)",
      value: ifscCode,
    },
    {
      sno: 10,
      name: "Bank Account No.",
      value: accountNumber,
    },
    {
      sno: 11,
      name: "Default Bank",
      value: isDefaultBank ? bankName : "",
    },
    {
      sno: 12,
      name: "Depository (NSDL/CDSL)",
      value: depository,
    },
    {
      sno: 13,
      name: "DP Name",
      value: dpName,
    },
  ];

  // DP ID and Client ID split into digits
  const dpIdDigits =
    depository == "CDSL"
      ? splitInto8(clientId)[0]?.split("") || []
      : dpId.split("");
  const clientIdDigits =
    depository == "CDSL"
      ? splitInto8(clientId)[1]?.split("") || []
      : clientId.split("");

  return (
    <View style={tw("px-4 w-[90%] mx-auto text-xs mt-8")}>
      {tableData.map((e, i) => (
        <View
          key={i}
          style={tw(
            `border-b mx-auto flex flex-row border-gray-200 ${
              i === 0 ? "border-t" : ""
            }`
          )}
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

      {/* DP ID */}
      <View style={tw(`border-b mx-auto flex flex-row border-gray-200`)}>
        <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>12</Text>
        </View>
        <View style={tw(`w-[45%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>DP ID</Text>
        </View>
        <View style={tw(`w-[45%] flex flex-row`)}>
          {dpIdDigits.map((digit, idx) => (
            <View
              key={idx}
              style={tw(
                `border-r border-gray-200 text-center min-w-[20px] flex justify-center items-center`
              )}
            >
              <Text>{digit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Client ID */}
      <View style={tw(`border-b mx-auto flex flex-row border-gray-200`)}>
        <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>13</Text>
        </View>
        <View style={tw(`w-[45%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>Client ID</Text>
        </View>
        <View style={tw(`w-[45%] flex flex-row`)}>
          {clientIdDigits.map((digit, idx) => (
            <View
              key={idx}
              style={tw(
                `border-r border-gray-200 text-center min-w-[20px] flex justify-center items-center`
              )}
            >
              <Text>{digit}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* PAN */}
      <View style={tw(`border-b mx-auto flex flex-row border-gray-200`)}>
        <View style={tw(`w-[10%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>16</Text>
        </View>
        <View style={tw(`w-[45%] border-r border-gray-200 p-2 flex`)}>
          <Text style={{ lineHeight: 0.6 }}>PAN</Text>
        </View>
        <View style={tw(`w-[45%] flex p-2`)}>
          <Text style={{ lineHeight: 0.6 }}>{pan}</Text>
        </View>
      </View>

      {/* Undertaking */}
      <Text style={tw(`leading-3 mt-5`)}>
        We undertake that the above mentioned bank and DP accounts shall be used
        for the purpose of making pay-ins and receiving payouts for settlement
        of corporate debt instrument deals through NCL.
      </Text>

      {/* Name & Signature */}
      <Text style={tw(`leading-3 mt-8 `)}>
        Name: {firstName}
        {middleName ? ` ${middleName} ` : " "}
        {lastName}
      </Text>

      <View style={tw(`flex flex-row gap-8 justify-start mt-4 items-center`)}>
        <Text style={tw(` flex flex-col gap-5`)}>Signature:</Text>
        <Image
          src={signatureUrl || ""}
          style={tw(`w-40 h-20 object-contain`)}
        />
      </View>
    </View>
  );
}

export default Page15;
