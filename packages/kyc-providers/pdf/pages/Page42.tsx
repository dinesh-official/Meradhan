import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";


function Page42({
  firstName = "",
  lastName = "",
  uccId = "",
  signatureUrl = "",
}: {
  firstName?: string;
  lastName?: string;
  uccId?: string;
  signatureUrl?: string;
}) {
  // Full name
  const fullName = `${firstName} ${lastName}`;

  // Date: auto-generate today's date
  const today = new Date().toLocaleDateString("en-GB");

  // Signature URL
  const signature = signatureUrl
    ? signatureUrl
    : "https://via.placeholder.com/150x50?text=Signature";

  return (
    <View style={tw(`w-[90%] px-4 mx-auto mt-4 text-xs flex flex-col gap-3`)}>
      <Text style={tw(`text-center font-[600] uppercase mt-3 mb-3`)}>
        Declaration Form for opting out of nomination
      </Text>

      {/* Address + Date */}
      <View style={tw(`flex flex-row mt-3 justify-between`)}>
        <Text style={tw(`leading-3`)}>
          {`To,
BondNest Capital India Securities Private Limited
TBQ, Suite No 511,
5th floor, Tower 2A, North Annex
One World Centre, Senapati Bapat Marg,
Lower Parel, Mumbai, Maharashtra 400013`}
        </Text>
        <Text>Date: {today}</Text>
      </View>

      {/* UCC & Name */}
      <View style={tw(`mt-4`)}>
        <View
          style={tw(
            `border-t border-b border-gray-200 flex flex-row py-2.5 pt-1.5`
          )}
        >
          <Text style={tw(`w-[30%] font-[600]`)}>UCC ID</Text>
          <Text>{uccId}</Text>
        </View>
        <View
          style={tw(`border-b border-gray-200 flex flex-row py-2.5 pt-1.5`)}
        >
          <Text style={tw(`w-[30%] font-[600]`)}>Sole/First Holder Name</Text>
          <Text>{fullName}</Text>
        </View>
      </View>

      {/* Declaration Text */}
      <Text style={tw(`leading-3 mt-4`)}>
        I hereby confirm that I do not wish to appoint any nominee(s) in my
        trading account and understand the issues involved in non-appointment of
        nominee(s) and further are aware that in case of death of all the
        account holder(s), my legal heirs would need to submit all the requisite
        documents / information for claiming of assets held in my trading
        account, which may also include documents issued by Court or other such
        competent authority, based on the value of assets held in the trading
        account.
      </Text>

      {/* Signature Block */}
      <View style={tw(`flex flex-row mt-5 justify-between`)}>
        <Text style={tw(`font-[600]`)}>Name and Signature of Holder(s)*</Text>
        <View style={tw(`flex flex-col gap-8 justify-center items-center`)}>
          <Image src={signature} style={tw(`w-40 h-24 object-contain`)} />
          <Text style={tw(`text-sm`)}>Signature</Text>
        </View>
      </View>

      {/* Name Display */}
      <View style={tw(`flex flex-row justify-between`)}>
        <Text>Name: {fullName}</Text>
      </View>
    </View>
  );
}

export default Page42;
