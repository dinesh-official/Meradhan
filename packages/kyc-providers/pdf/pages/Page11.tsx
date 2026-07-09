import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "../elements/CheckBoxRow";
import TextFiled from "../elements/TextFiled";
import { splitInto8 } from "../dataMapper";

function Page11({
  primaryBank,
  primaryDemat,
  signatureUrl,
}: {
  primaryBank: {
    bankName: string;
    isPrimary: boolean;
    accountType: string;
    ifscCode: string;
    accountNumber: string;
    nameAsPerBank: string;
    micrCode: string;
    branch: string;
  };
  primaryDemat: {
    depository: string;
    dpName: string;
    nameAsPerPAN: string;
    dpId: string;
    beneficiaryId: string;
    isPrimary: boolean;
  };
  signatureUrl: string;
}) {
  return (
    <>
      <Text style={tw(`font-bold uppercase text-[9px] text-center pt-6`)}>
        PART B - TRADING ACCOUNT RELATED INFORMATION
      </Text>

      {/* BANK ACCOUNT SECTION */}
      <View style={tw("px-4")}>
        <View
          style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
        >
          <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
            1. Primary Bank Account Details (will be used for all transactions)
          </Text>
        </View>

        <View style={tw(`w-[90%] mx-auto flex flex-col gap-3 mt-4`)}>
          <View style={tw(`flex justify-between flex-row text-xs gap-10`)}>
            <View style={tw(`flex flex-row gap-2 w-full`)}>
              <Text style={tw(`font-bold`)}>1.</Text>
              <Text>Is it a Primary account?:</Text>
              <View style={tw(`flex flex-row gap-4`)}>
                <CheckBoxRow label="Yes" checked={!!primaryBank?.isPrimary} />
                <CheckBoxRow label="No" checked={!primaryBank?.isPrimary} />
              </View>
            </View>
            <View style={tw(`flex flex-row gap-2 w-full`)}>
              <Text>Account Type:</Text>
              <View style={tw(`flex flex-row gap-4`)}>
                <CheckBoxRow
                  label="Saving"
                  checked={primaryBank?.accountType === "savings"}
                />
                <CheckBoxRow
                  label="Current"
                  checked={primaryBank?.accountType === "current"}
                />
                <CheckBoxRow
                  label="Others"
                  checked={primaryBank?.accountType == "others"}
                />
              </View>
            </View>
          </View>

          <View style={tw(`flex flex-row gap-10 w-full`)}>
            <TextFiled
              title="IFSC Code:*"
              value={primaryBank?.ifscCode || ""}
              className="pr-10"
            />
            <TextFiled
              title="Account Number:*"
              value={primaryBank?.accountNumber || ""}
              className="pr-20"
            />
          </View>
          <View style={tw(`flex flex-row gap-10 w-full`)}>
            <TextFiled
              title="Name as per Bank:*"
              value={primaryBank?.nameAsPerBank || ""}
              className="pr-24"
            />
            <TextFiled
              title="MICR Code:"
              value={primaryBank?.micrCode || ""}
              className="pr-10"
            />
          </View>
          <TextFiled
            title="Bank Name:"
            value={primaryBank?.bankName || ""}
            className="pr-5"
          />
          <TextFiled
            title="Branch:"
            value={primaryBank?.branch || ""}
            className="pr-5"
          />
          <Text style={tw(`text-xs`)}>
            For additional bank account(s), please refer to ANNEXURE 1
          </Text>
        </View>
      </View>

      {/* DEMAT ACCOUNT SECTION */}
      <View style={tw("px-4")}>
        <View
          style={tw(
            "bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded gap-3 mt-4"
          )}
        >
          <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
            2. Primary Demat Account Details (will be used for all transactions)
          </Text>
        </View>

        <View style={tw(`w-[90%] mx-auto flex flex-col gap-3  mt-4`)}>
          <View style={tw(`flex justify-between flex-row text-xs  gap-10`)}>
            <View style={tw(`flex flex-row gap-2 w-full`)}>
              <Text style={tw(`font-bold`)}>1.</Text>
              <Text>Is it a Primary account?:</Text>
              <View style={tw(`flex flex-row gap-4`)}>
                <CheckBoxRow label="Yes" checked={!!primaryDemat?.isPrimary} />
                <CheckBoxRow label="No" checked={!primaryDemat?.isPrimary} />
              </View>
            </View>
            <View style={tw(`flex flex-row gap-2 w-full `)}>
              <Text>Depository:</Text>
              <View style={tw(`flex flex-row gap-4`)}>
                <CheckBoxRow
                  label="CDSL"
                  checked={primaryDemat?.depository === "CDSL"}
                />
                <CheckBoxRow
                  label="NSDL"
                  checked={primaryDemat?.depository === "NSDL"}
                />
              </View>
            </View>
          </View>

          <TextFiled
            title="DP Name:"
            value={primaryDemat?.dpName || ""}
            className="pr-5"
          />
          <TextFiled
            title="Name as per PAN*:"
            value={primaryDemat?.nameAsPerPAN || ""}
            className="pr-10"
          />
          <View style={tw(`flex flex-row gap-10 w-full`)}>
            <TextFiled
              title="DP ID:"
              value={
                (primaryDemat?.depository == "CDSL"
                  ? splitInto8(primaryDemat.beneficiaryId)?.[0] || ""
                  : primaryDemat?.dpId) || ""
              }
              className="pr-5"
            />
            <TextFiled
              title="Beneficiary ID:"
              value={
                (primaryDemat?.depository == "CDSL"
                  ? splitInto8(primaryDemat.beneficiaryId)?.[1] || ""
                  : primaryDemat?.beneficiaryId) || ""
              }
              className="pr-10"
            />
          </View>

          <Text style={tw(`text-xs`)}>
            For additional demat account(s), please refer to ANNEXURE 2
          </Text>
        </View>

        {/* Trading Preferences */}
        <View
          style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-4")}
        >
          <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
            3. Trading Preferences
          </Text>
        </View>
        <View style={tw(`w-[90%] mx-auto text-xs mt-4`)}>
          <Text>
            Please sign in the boxes for the trading segments you wish to
            activate. Cross out the ones you don’t choose
          </Text>

          <View style={tw(`border border-gray-300 rounded-lg mt-4`)}>
            <View style={tw(`flex flex-row`)}>
              <View
                style={tw(
                  `border-b border-r border-gray-300 p-3 py-2 w-[33.33%]`
                )}
              >
                <Text style={tw(`font-[500]`)}>Exchanges</Text>
              </View>
              <View
                style={tw(
                  `border-b border-r border-gray-300 p-3 py-2 w-[33.33%]`
                )}
              >
                <Text style={tw(`font-[500]`)}>Segment</Text>
              </View>
              <View
                style={tw(`border-b border-gray-300 p-3 py-2 w-[33.33%]`)}
              ></View>
            </View>
            <View style={tw(`flex flex-row`)}>
              <View style={tw(`border-r border-gray-300 p-3 py-10 w-[33.33%]`)}>
                <Text>National Stock Exchange (NSE)</Text>
              </View>
              <View style={tw(`border-r border-gray-300 p-3 py-10 w-[33.33%]`)}>
                <Text>Debt (Online Bond Platform)</Text>
              </View>
              <View style={tw(`border-gray-300 p-3 pb-0 pt-0 w-[33.33%]`)}>
                <View
                  style={tw(`flex flex-col  justify-center items-center pb-5`)}
                >
                  <Image
                    source={signatureUrl}
                    style={tw(`w-40 h-auto object-contain`)}
                  />
                  <Text style={tw(`text-xs text-gray-400 `)}>Sign Here</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

export default Page11;
