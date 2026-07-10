import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import TextFiled from "../elements/TextFiled";
import { CheckBoxRow } from "../elements/CheckBoxRow";


function Page13({
  introducerName = "",
  introducerStatus = "",
  introducerAddress = "",
  introducerPhone = "",
  email = "",
  firstName = "",
  lastName = "",
  city = "",
  state = "",
  signatureUrl = "",
}: {
  introducerName?: string;
  introducerStatus?: string;
  introducerAddress?: string;
  introducerPhone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  signatureUrl?: string;
}) {
  // Get full name
  const fullName = `${firstName} ${lastName}`;

  // Format today's date as DD/MM/YYYY
  const today = new Date().toLocaleDateString("en-GB");

  // Place from city or state
  const place = city || state || "";


  return (
    <View style={tw("px-4 w-[90%] mx-auto mt-5")}>
      {/* Introducer Section */}
      <View style={tw("bg-main w-full px-3 py-2 rounded")}>
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          9. Introducer Details (optional)
        </Text>
      </View>

      <View style={tw("flex flex-col gap-2 mt-4 text-xs")}>
        <TextFiled
          title="Name of the Introducer:"
          value={introducerName}
          className="pr-12"
        />
        <TextFiled
          title="Status of the Introducer (Sub-broker/Remisier/Authorized Person/Existing Client):"
          value={introducerStatus}
          className="pr-4 w-[900px]"
        />
        <TextFiled
          title="Address of the Introducer:"
          value={introducerAddress}
          className="pr-12"
        />
        <TextFiled title="Phone Number:" value={introducerPhone} className="pr-10" />
      </View>

      {/* Additional Details */}
      <View style={tw("bg-main w-full px-3 py-2 rounded mt-5")}>
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          10. Additional Details
        </Text>
      </View>

      <View style={tw("flex flex-col gap-4 mt-5")}>
        <View style={tw("flex flex-row gap-8 text-xs")}>
          <Text>Whether you wish to receive</Text>
          <CheckBoxRow label="a) Physical contract note" />
          <CheckBoxRow label="b) Electronic Contract Note (ECN)" checked />
        </View>
        <TextFiled
          title={`E-mail id to receive ECN, Electronic Order Receipt,
Deal Sheet and Quote Sheet`}
          className="w-[400px] leading-2.5"
          value={email}
        />
        <View style={tw("text-xs flex flex-row gap-20")}>
          <Text>{`Whether you wish to avail the facility of
internet trading/wireless technology/mobile trading`}</Text>
          <CheckBoxRow label="Yes" checked />
          <CheckBoxRow label="No" />
        </View>
      </View>

      {/* Declaration */}
      <View style={tw("bg-main w-full px-3 py-2 rounded mt-5")}>
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          11. Declaration
        </Text>
      </View>

      <Text style={tw("text-xs leading-6 mt-3")}>
        I/We hereby confirm that the particulars provided above are true,
        correct, and complete to the best of my/our knowledge as on the date of
        this application. I/We undertake to promptly notify the Depository
        Participant (DP) and Stock Broker of any changes to the information
        furnished in this form. I/We further acknowledge and agree that if any
        information provided by me/us is found to be false, incorrect, or
        misleading, I/we shall be held responsible and my/our account may be
        terminated, with BondNest Capital India Securities Private Limited
        (MeraDhan) entitled to take any necessary action in this regard.
      </Text>

      {/* Signature Block */}
      <View style={tw("flex justify-between flex-row w-full mt-10")}>
        <View style={tw("text-xs flex flex-col gap-5")}>
          <Text>Name: {fullName}</Text>
          <Text>Date: {today}</Text>
          <Text>Place: {place}</Text>
        </View>
        <View style={tw(`flex flex-col gap-4 justify-center items-center`)}>
          <Image src={signatureUrl} style={tw("w-40 h-auto object-contain")} />
          <Text style={tw(`text-xs`)}>Signature</Text>
        </View>
      </View>
    </View>
  );
}

export default Page13;
