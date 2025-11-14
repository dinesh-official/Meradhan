import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "../elements/CheckBoxRow";
import Stamp from "../elements/Stamp";

function Page5(data: {
  documentsReceived: string;
  // | "Certified"
  // | "DigitalKYC"
  // | "e-document"
  // | "UIDAI"
  // | "VideoKyc"
  // | "Offline";

  ipvDate?: string;
  empName?: string;
  empCode?: string;
  empDesignation?: string;
  empBranch?: string;
  empSignature?: string;
  institutionCode?: string;
}) {
  return (
    <View style={tw("px-4")}>
      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-5")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          8. Attestation / For Office Use Only
        </Text>
      </View>

      <View
        style={tw(
          `w-[90%] mx-auto py-4  flex flex-col gap-4  mt-3 border-b border-gray-300`
        )}
      >
        <View style={tw(" flex flex-row")}>
          <View style={tw("w-[20%]")}>
            <Text style={tw("text-xs")}>Documents Received:</Text>
          </View>
          <View style={tw("w-[26.66%] ")}>
            <CheckBoxRow
              label="Certified Copies"
              checked={data.documentsReceived === "Certified"}
            />
          </View>
          <View style={tw("w-[26.66%] ")}>
            <CheckBoxRow
              label="Digital KYC Process"
              checked={data.documentsReceived === "DigitalKYC"}
            />
          </View>
          <View style={tw("w-[26.66%] ")}>
            <CheckBoxRow
              label="Equivalent e-document"
              checked={data.documentsReceived === "e-document"}
            />
          </View>
        </View>
        <View style={tw(" flex flex-row")}>
          <View style={tw("w-[20%]")}>
            {/* <Text style={tw("text-xs")}>Documents Received:</Text> */}
          </View>
          <View style={tw("w-[53.333%] ")}>
            <CheckBoxRow
              label="E-KYC data received from UIDAI"
              checked={data.documentsReceived === "UIDAI"}
            />
          </View>
          <View style={tw("w-[26.66%] ")}>
            <CheckBoxRow
              label="Video Based KYC"
              checked={data.documentsReceived === "VideoKyc"}
            />
          </View>
        </View>

        <View style={tw(" flex flex-row")}>
          <View style={tw("w-[20%]")}>
            {/* <Text style={tw("text-xs")}>Documents Received:</Text> */}
          </View>
          <View style={tw("")}>
            <CheckBoxRow
              label="Data received from Offline Verification"
              checked={data.documentsReceived === "Offline"}
            />
          </View>
        </View>
      </View>
      <View style={tw(`w-[90%] mx-auto py-4  flex flex-col gap-4`)}>
        <Text style={tw("text-xs")}>
          In-Person Verification (IPV) Carried out by:
        </Text>

        <View style={tw(`flex flex-row gap-10`)}>
          <View style={tw(`w-[45%] flex flex-col gap-4 `)}>
            <Text style={tw("text-xs")}>IPV Date: {data.ipvDate}</Text>
            <Text style={tw("text-xs")}>Emp. Name: {data.empName}</Text>
            <Text style={tw("text-xs")}>Emp. Code: {data.empCode}</Text>
            <Text style={tw("text-xs")}>
              Emp. Designation: {data.empDesignation}
            </Text>
            <Text style={tw("text-xs")}>Emp. Branch: {data.empBranch}</Text>
            <View
              style={tw(
                `border w-full h-40 rounded-xl border-gray-300 flex flex-col justify-between items-center p-3 mt-3`
              )}
            >
              <View>
                {data.empSignature && (
                  <Image
                    source={data.empSignature}
                    style={{ width: 100, height: 100 }}
                  />
                )}
              </View>
              <Text style={tw(`text-xs text-gray-400`)}>
                Employee Signature
              </Text>
            </View>
          </View>

          <View style={tw(`w-[55%] flex flex-col gap-4 `)}>
            <Text style={tw("text-xs")}>Institution Details</Text>
            <Text style={tw("text-xs")}>
              Name: BondNest Capital India Securities Private Limited
            </Text>
            <Text style={tw("text-xs")}>Code:</Text>

            <View
              style={tw(
                `border w-full rounded-xl border-gray-300 flex flex-col justify-between items-center p-2 mt-3 gap-5`
              )}
            >
              <View>
                <Stamp />
              </View>
              <Text style={tw(`text-xs text-gray-400`)}>Institution Stamp</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default Page5;
