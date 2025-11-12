import { Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "../elements/CheckBoxRow";

function Page3(data: {
  email: string;
  mobile: string;
  telephone1?: string;
  telephone2?: string;
  FATCAdeclaration: boolean;
  isAPep: "YES" | "RELATED" | "NO";
}) {
  return (
    <View style={tw("px-4")}>
      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-5")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          3. Contact Details
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto py-3 flex flex-col `)}>
        <View
          style={tw(
            `text-xs flex flex-row gap-3 border-b border-gray-300 py-2`
          )}
        >
          <Text>Email ID:*</Text>
          <Text style={tw(`font-[500]`)}>{data.email}</Text>
        </View>
        <View
          style={tw(
            `text-xs flex flex-row gap-3 border-b border-gray-300 py-2`
          )}
        >
          <Text>Mobile Number: *</Text>
          <Text style={tw(`font-[500]`)}>{data.mobile}</Text>
        </View>
        <View style={tw(`flex flex-row py-2 `)}>
          <View style={tw(`text-xs flex w-[50%] flex-row gap-3`)}>
            <Text>Telephone (Residence): </Text>
            <Text style={tw(`font-[500]`)}> {data.telephone1}</Text>
          </View>
          <View style={tw(`text-xs flex w-[50%] flex-row gap-3`)}>
            <Text>Telephone (Office): </Text>
            <Text style={tw(`font-[500]`)}>{data.telephone2}</Text>
          </View>
        </View>
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-1")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          4. I am an Indian citizen and a tax resident of India only (FATCA
          declaration)*
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto py-3 flex flex-row gap-20 `)}>
        <CheckBoxRow label="Yes" checked={data.FATCAdeclaration} />
        <CheckBoxRow label="No" checked={!data.FATCAdeclaration} />
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-1")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          5. Politically Exposed Person*
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto py-3 flex flex-col gap-3`)}>
        <View style={tw(`flex flex-col gap-1 `)}>
          <CheckBoxRow
            label="I’m a Politically Exposed Person (PEP)"
            checked={data.isAPep === "YES"}
          />
          <Text
            style={[
              tw(`text-xs text-gray-700  pl-[17px] mt-1`),
              { lineHeight: 1.3 },
            ]}
          >
            Politically Exposed Persons (PEPs) are individuals who currently
            hold, or have previously held, prominent public positions in a
            foreign country. This includes heads of state or government, senior
            politicians, high-ranking judicial or military officials, senior
            executives of state-owned corporations, and key officials of
            political parties.
          </Text>
        </View>
        <View style={tw(`flex flex-col gap-1 `)}>
          <CheckBoxRow
            label="Related to PEP"
            checked={data.isAPep === "RELATED"}
          />
          <Text
            style={[
              tw(`text-xs text-gray-700  pl-[17px] mt-1`),
              { lineHeight: 1.3 },
            ]}
          >
            Family members and close relatives of a PEP shall also be classified
            as PEPs, and all due diligence measures applicable to PEPs shall
            equally apply to them.
          </Text>
        </View>

        <CheckBoxRow label="Not Applicable" checked={data.isAPep == "NO"} />
      </View>

      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-3")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          6. Remarks (if any)
        </Text>
      </View>
    </View>
  );
}

export default Page3;
