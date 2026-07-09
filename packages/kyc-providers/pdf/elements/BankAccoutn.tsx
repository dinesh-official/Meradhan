import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "./CheckBoxRow";
import TextFiled from "./TextFiled";

type BankAccountProps = {
  isPrimary?: boolean;
  accountType?: string;
  ifscCode: string;
  accountNumber: string;
  nameAsPerBank: string;
  micrCode?: string;
  bankName: string;
  branch: string;
  index: number;
};

function BankAccoutn({
  isPrimary = undefined,
  accountType = "saving",
  ifscCode,
  accountNumber,
  nameAsPerBank,
  micrCode = " ",
  bankName,
  branch,
  index,
}: BankAccountProps) {
  return (
    <View style={tw(`w-[90%] mx-auto flex flex-col gap-3 mt-4`)}>
      {/* Primary + Account Type */}
      <View style={tw(`flex justify-between flex-row text-xs`)}>
        <View style={tw(`flex flex-row gap-2`)}>
          <Text style={tw(`font-bold`)}>{index}.</Text>
          <Text>Is it a Primary account?:</Text>
          <View style={tw(`flex flex-row gap-4`)}>
            <CheckBoxRow label="Yes" checked={isPrimary} />
            <CheckBoxRow
              label="No"
              checked={isPrimary === false && !!accountNumber}
            />
          </View>
        </View>
        <View style={tw(`flex flex-row gap-2 pr-[5.5px]`)}>
          <Text>Account Type:</Text>
          <View style={tw(`flex flex-row gap-4`)}>
            <CheckBoxRow label="Saving" checked={accountType === "saving"} />
            <CheckBoxRow label="Current" checked={accountType === "current"} />
            <CheckBoxRow label="Others" checked={accountType === "others"} />
          </View>
        </View>
      </View>

      {/* IFSC + Account Number */}
      <View style={tw(`flex flex-row gap-10 w-full`)}>
        <TextFiled title="IFSC Code:" value={ifscCode} className="pr-10" />
        <TextFiled
          title="Account Number:"
          value={accountNumber}
          className="pr-20"
        />
      </View>

      {/* Name + MICR */}
      <View style={tw(`flex flex-row gap-10 w-full`)}>
        <TextFiled
          title="Name as per Bank:"
          value={nameAsPerBank}
          className="pr-5"
        />
      </View>

      {/* Bank + Branch */}
      <TextFiled title="Bank Name:" value={bankName} className="pr-5" />
      <View style={tw(`flex flex-row gap-10 w-full`)}>
        <TextFiled title="Branch:" value={branch || " "} className="pr-5" />
        <View style={tw(`w-[200px]`)}>
          <TextFiled
            title="MICR Code:"
            value={micrCode || " "}
            className="pr-20"
          />
        </View>
      </View>
    </View>
  );
}

export default BankAccoutn;
