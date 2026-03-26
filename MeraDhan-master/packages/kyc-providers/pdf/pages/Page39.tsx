import React from "react";
import { Text, View, Image } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import TextList from "../elements/TextList";
import TextFiled from "../elements/TextFiled";
import { CheckBoxRow } from "../elements/CheckBoxRow";

function Page39({
  firstName = "",
  lastName = "",
  nomineeName = "",
  hasNominee = false,
  signatureUrl = "",
}: {
  firstName?: string;
  lastName?: string;
  nomineeName?: string;
  hasNominee?: boolean;
  signatureUrl?: string;
}) {
  // Full name
  const fullName = `${firstName} ${lastName}`;

  // Signature URL
  const signature = signatureUrl
    ? signatureUrl
    : "https://via.placeholder.com/120x40?text=Sign";

  return (
    <View style={tw(`w-[90%] px-4 mx-auto mt-5 text-xs`)}>
      {/* Nomination Section */}
      <TextList count="1)" fontSize={9}>
        I / We want the details of my / our nominee to be printed in the
        statement of holding, provided to me/ us by the AMC / DP as follows;
        (please tick, as appropriate)
      </TextList>

      <View style={tw(`w-[50%] mt-2 ml-5`)}>
        <TextFiled
          title="Name of nominee(s)"
          className="pr-24"
          value={nomineeName}
        />
      </View>

      <View style={tw("flex w-full flex-row mt-3 ml-5")}>
        <View style={tw("w-[19.5%]")}>
          <Text style={tw("text-xs mt-[-1px]")}>Nomination:</Text>
        </View>
        <View style={tw("w-[14.18%]")}>
          <CheckBoxRow label="Yes" checked={hasNominee} />
        </View>
        <View style={tw("w-[20%]")}>
          <CheckBoxRow label="No" checked={!hasNominee} />
        </View>
      </View>

      {/* Authorization Section */}
      <View style={tw(`flex flex-col gap-2 mt-3`)}>
        <View style={tw(`flex flex-row gap-3`)}>
          <Text style={tw(`mt-1`)}>2) I hereby authorize</Text>
          <View
            style={tw(
              `border-b border-gray-200 py-1 items-start w-[35%] justify-start`
            )}
          >
            <Text style={tw(`font-[600]`)}>{nomineeName}</Text>
          </View>
          <Text style={tw(`mt-1`)}>(nominee number</Text>
          <View
            style={tw(
              `border-b border-gray-200 py-1 items-center w-[4%] text-center justify-center`
            )}
          >
            <Text style={tw(`font-[600] text-center`)}>1</Text>
          </View>
          <Text style={tw(`mt-1`)}>) to operate my account</Text>
        </View>

        <Text style={tw(`ml-5`)}>
          on my behalf, in case of my incapacitation in terms of paragraph 3.5
          of the circular. He / She is authorized to
        </Text>

        <View style={tw(`flex flex-row gap-3 ml-5`)}>
          <Text style={tw(`mt-1`)}>encash my assets up to</Text>
          <View
            style={tw(
              `border-b border-gray-200 py-1 items-start w-[5%] justify-start`
            )}
          >
            <Text style={tw(`font-[600]`)}>100</Text>
          </View>
          <Text style={tw(`mt-1`)}>
            % of assets in the account / folio or Rs.
          </Text>
          <View
            style={tw(
              `border-b border-gray-200 py-1 items-start w-[24%] justify-start`
            )}
          >
            <Text style={tw(`font-[600]`)}>1</Text>
          </View>
        </View>

        <TextList fontSize={9} count="3)">
          This nomination shall supersede any prior nomination made by me / us,
          if any.
        </TextList>
      </View>

      {/* Table */}
      <View style={tw(`border-b border-t mt-8 flex flex-row border-gray-200`)}>
        <View
          style={tw(
            `w-[30%] border-r border-gray-200 p-2 font-[500] flex justify-center`
          )}
        >
          <Text style={tw(`text-center text-[7px]`)}>Name(s) of holder(s)</Text>
        </View>
        <View
          style={tw(
            `w-[23%] flex p-2 justify-center border-r border-gray-200 font-[500]`
          )}
        >
          <Text style={tw(`text-center text-[7px]`)}>
            Signature(s) of holder
          </Text>
        </View>
        <View
          style={tw(
            `w-[23%] flex p-2 border-r border-gray-200 justify-center font-[500]`
          )}
        >
          <Text style={tw(`text-center text-[7px]`)}>Witness Signature*</Text>
        </View>
        <View style={tw(`w-[24%] flex p-2 justify-center font-[500]`)}>
          <Text style={tw(`text-center text-[7px]`)}>
            Name of Witness & Address (wherever applicable)*
          </Text>
        </View>
      </View>

      {/* Holders Rows */}
      {[fullName].map((holder, idx) => (
        <View key={idx} style={tw(`border-b flex flex-row border-gray-200`)}>
          <View
            style={tw(
              `w-[15%] border-r border-gray-200 p-2 flex justify-center`
            )}
          >
            <Text style={tw(`text-left text-[7px]`)}>
              Sole / First Holder (Mr./Ms.)
            </Text>
          </View>
          <View
            style={tw(
              `w-[15%] border-r border-gray-200 p-2 flex justify-center`
            )}
          >
            <Text style={tw(`text-center text-[7px]`)}>{holder}</Text>
          </View>
          <View
            style={tw(
              `w-[23%] flex p-2 justify-center border-r border-gray-200`
            )}
          >
            <Image
              src={signature}
              style={tw(`w-40 h-20 object-contain mx-auto`)}
            />
          </View>
          <View
            style={tw(
              `w-[23%] flex p-2 border-r border-gray-200 justify-center`
            )}
          />
          <View style={tw(`w-[24%] flex p-2 justify-center`)} />
        </View>
      ))}

      <Text style={{ fontSize: 7, marginTop: 7 }}>
        * Signature of two witness(es), along with name and address are
        required, if the account holder affixes thumb impression, instead of wet
        signature.
      </Text>

      {/* Rights Section */}
      <View style={tw(`flex flex-col gap-2`)}>
        <Text style={tw(`font-[600] text-xs mt-5 mb-2`)}>
          Rights, Entitlement and Obligation of the investor and nominee:
        </Text>
        <TextList count="•" fontSize={9}>
          If you are opening a new demat account / MF folios, you have to
          provide nomination. Otherwise, you have to follow procedure as per
          3.10 of this circular.
        </TextList>
        <TextList count="•" fontSize={9}>
          You can make nomination or change nominee any number of times without
          any restriction.
        </TextList>
        <TextList count="•" fontSize={9}>
          You are entitled to receive acknowledgement from the AMC / DP for each
          instance of providing or changing nomination.
        </TextList>
        <TextList count="•" fontSize={9}>
          Upon demise of the investor, the nominees shall have the option to
          either continue as joint holders with other nominees or for each
          nominee(s) to open separate single account / folio.
        </TextList>
        <TextList count="•" fontSize={9}>
          In case all your nominees do not claim the assets from the AMC / DP,
          then the residual unclaimed asset shall continue to be with the AMC in
          case of MF units and with the concerned Depository in case of Demat
          account.
        </TextList>
      </View>
    </View>
  );
}

export default Page39;
