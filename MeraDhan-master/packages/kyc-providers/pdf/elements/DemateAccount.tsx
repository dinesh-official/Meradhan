import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "./CheckBoxRow";
import TextFiled from "./TextFiled";

type DematAccountProps = {
  isPrimary?: boolean;
  depository?: "NSDL" | "CDSL" | "";
  dpName?: string;
  nameAsPerPAN?: string;
  dpId?: string;
  beneficiaryId?: string;
  index: number;
};

function DemateAccount({
  isPrimary = false,
  depository = "",
  dpName = "",
  nameAsPerPAN = "",
  dpId = "",
  beneficiaryId = "",
  index,
}: DematAccountProps) {
  return (
    <View style={tw(`w-[90%] mx-auto flex flex-col gap-3 mt-4`)}>
      {/* Primary & Depository Row */}
      <View style={tw(`flex justify-between flex-row text-xs gap-10`)}>
        {/* Primary Account */}
        <View style={tw(`flex flex-row gap-2 w-full`)}>
          <Text style={tw(`font-bold`)}>{index}.</Text>
          <Text>Is it a Primary account?:</Text>
          <View style={tw(`flex flex-row gap-4`)}>
            <CheckBoxRow label="Yes" checked={isPrimary} />
            <CheckBoxRow
              label="No"
              checked={dpId.trim().length != 0 ? !isPrimary : false}
            />
          </View>
        </View>

        {/* Depository */}
        <View style={tw(`flex flex-row gap-2 w-full`)}>
          <Text>Depository:</Text>
          <View style={tw(`flex flex-row gap-4`)}>
            <CheckBoxRow label="CDSL" checked={depository === "CDSL"} />
            <CheckBoxRow label="NSDL" checked={depository === "NSDL"} />
          </View>
        </View>
      </View>

      {/* DP & Name */}
      <TextFiled title="DP Name:" value={dpName} className="pr-5" />
      <TextFiled
        title="Name as per PAN:"
        value={nameAsPerPAN}
        className="pr-7"
      />

      {/* DP ID & Beneficiary */}
      <View style={tw(`flex flex-row gap-10 w-full`)}>
        <TextFiled title="DP ID:" value={dpId} className="pr-5" />
        <TextFiled
          title="Beneficiary ID:"
          value={beneficiaryId}
          className="pr-10"
        />
      </View>
    </View>
  );
}

export default DemateAccount;
