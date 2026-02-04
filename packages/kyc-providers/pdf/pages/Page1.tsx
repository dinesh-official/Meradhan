import { Image, Text, View } from "@react-pdf/renderer";
import React from "react";
import { tw } from "../MdPdf";
import { CheckBoxRow } from "../elements/CheckBoxRow";

import { formatDate } from "../helper";
import type { Page1Props } from "../dataMapper";

function Page1(data: Page1Props) {
  return (
    <View style={tw("px-4")}>
      <View style={tw(" border-b border-gray-200 pb-4 w-[90%] mx-auto")}>
        {/* Section with grid 1 */}
        <View style={tw(" flex flex-row")}>
          <View style={tw("w-[26%] ")}>
            <Text style={tw("text-xs font-[600]")}>For Office Use Only</Text>
          </View>

          <View style={tw("w-[17%]")}>
            <Text style={tw("text-xs")}>Application Type:*</Text>
          </View>
          <View style={tw("w-[19%] ")}>
            <CheckBoxRow label="New" checked={data.applicationType === "NEW"} />
          </View>
          <View style={tw("w-[19%] ")}>
            <CheckBoxRow
              label="Update"
              checked={data.applicationType === "UPDATE"}
            />
          </View>
          <View style={tw("w-[19%] ")}></View>
        </View>
        {/* // section 2  */}
        <View style={tw(" mx-auto mt-4 flex flex-row")}>
          <View style={tw("w-[26%] ")}>
            <Text style={tw("text-xs")}>KYC Number: {data.kycNo}</Text>
          </View>

          <View style={tw("w-[17%]")}>
            <Text style={tw("text-xs")}>KYC Type:*</Text>
          </View>
          <View style={tw("w-[38%] ")}>
            <CheckBoxRow
              label="Normal (PAN Mandatory)"
              checked={data.kycType === "NORMAL"}
            />
          </View>
          <View style={tw("w-[19%] ")}>
            <CheckBoxRow
              label="PAN Exempted"
              checked={data.kycType === "PAN_EXEMPTED"}
            />
          </View>
        </View>

        {/* // section 3  */}
        <View style={tw(" mx-auto mt-4 flex flex-row")}>
          <View style={tw("w-[26%] ")}></View>

          <View style={tw("w-[17%]")}>
            <Text style={tw("text-xs")}>KYC Mode:*</Text>
          </View>

          <View style={tw("w-[19%] ")}>
            <CheckBoxRow
              label="Online KYC"
              checked={data.kycMode === "ONLINE"}
            />
          </View>
          <View style={tw("w-[19%] ")}>
            <CheckBoxRow
              label="Offline e-KYC"
              checked={data.kycMode === "OFFLINE"}
            />
          </View>
          <View style={tw("w-[19%] ")}>
            <CheckBoxRow
              label="Digilocker KYC"
              checked={data.kycMode === "DIGILOCKER"}
            />
          </View>
        </View>
      </View>

      {/* Body */}
      <Text style={tw("text-xs font-[600] my-3  text-center")}>
        PART A - KYC FORM (BASIC INFORMATION)
      </Text>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded ")}>
        <Text style={tw("text-xs text-white font-[600]")}>
          1. Identity Details (Please refer instructions at the end)
        </Text>
      </View>
      <View style={tw(`w-[90%] mx-auto mt-2`)}>
        {/* line 1 */}
        <View style={tw(" flex flex-row border-b border-gray-300 py-2.5")}>
          <View style={tw("w-[26.5%] ")}>
            <Text style={tw("text-xs mt-[0]")}>PAN:*</Text>
          </View>

          <View style={tw("w-[28%]")}>
            <Text style={tw("text-xs mt-[0]")}>{data.panNo}</Text>
          </View>
          <View style={tw("")}>
            <CheckBoxRow label="Form 60 Furnished" />
          </View>
        </View>
      </View>
      <View style={tw(`flex flex-row w-[90%] mx-auto  `)}>
        <View style={tw(`w-full `)}>
          {/* line 2 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2.5")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-3px]")}>
                Name (same as ID Proof):*
              </Text>
            </View>

            <View style={tw("w-auto")}>
              <Text style={tw("text-xs mt-[-3px]")}>
                {data.name.toUpperCase()}
              </Text>
            </View>
          </View>
          {/* line 3 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2.5")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-3px]")}>Maiden Name (if any):</Text>
            </View>

            <View style={tw("w-auto")}>
              <Text style={tw("text-xs")}>{data.maidanName}</Text>
            </View>
          </View>
          {/* line 4 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2.5 ")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-3px] pt-0")}>
                Father’s / Spouse Name:*
              </Text>
            </View>

            <View style={tw("w-auto")}>
              <Text style={tw("text-xs mt-[-3px] pt-0")}>
                {data.fatherSpouseName}
              </Text>
            </View>
          </View>
          {/* line 5 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2.5")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-3px]")}>Mother’s Name:</Text>
            </View>

            <View style={tw("w-auto")}>
              <Text style={tw("text-xs mt-[-3px]")}>
                {data.motherName || ""}
              </Text>
            </View>
          </View>

          {/* line 6 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2.5")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-3px]")}>
                Date of Birth (DD-MM-YYYY):*
              </Text>
            </View>

            <View style={tw("w-auto")}>
              <Text style={tw("text-xs mt-[-3px]")}>
                {formatDate(data.dateOfBirth)}
              </Text>
            </View>
          </View>

          {/* line 7 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-1px]")}>Gender:*</Text>
            </View>

            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Male" checked={data.gender == "MALE"} />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Female" checked={data.gender == "FEMALE"} />
            </View>
            <View style={tw("")}>
              <CheckBoxRow
                label="Transgender"
                checked={data.gender == "OTHER"}
              />
            </View>
          </View>

          {/* line 7 */}
          <View style={tw(" flex flex-row border-b border-gray-300 py-2")}>
            <View style={tw("w-[34%] ")}>
              <Text style={tw("text-xs mt-[-1px]")}>Marital Status:*</Text>
            </View>

            <View style={tw("w-[18%]")}>
              <CheckBoxRow
                label="Single"
                checked={data.maritalStatus == "SINGLE"}
              />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow
                label="Married"
                checked={data.maritalStatus == "MARRIED"}
              />
            </View>
            <View style={tw("")}>
              <CheckBoxRow
                label="Other"
                checked={data.maritalStatus == "OTHERS"}
              />
            </View>
          </View>
        </View>

        <View
          style={tw(
            `w-48 border border-gray-300 border-t-0 flex flex-col justify-start items-start`
          )}
        >
          {/* <Image source={data.profilePic} style={tw(`max-w-28 min-w-28 h-38 min-h-38 object-cover overflow-hidden border`)}  /> */}
          <view
            style={{
              width: 110,
              height: 120,
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri: data.profilePic || "",
              }}
              style={{
                width: 110,
                height: 120,
                objectFit: "cover",
                overflow: "hidden",
                marginTop: -6,
              }}
            />
          </view>

          <Image source={{
            uri: data.signature || ""
          }} style={tw(`w-auto h-10 mx-auto`)} />
        </View>
      </View>

      <View style={tw(`w-[90%] mx-auto`)}>
        {/* line 8 */}
        <View style={tw(" flex flex-row border-b border-gray-300 py-2 pb-1")}>
          <View style={tw("w-[26.55%] ")}>
            <Text style={tw("text-xs mt-[-1px]")}>Nationality:*</Text>
          </View>

          <View style={tw("w-[14.18%]")}>
            <CheckBoxRow
              label="IN - Indian"
              checked={data.nationality == "INDIAN"}
            />
          </View>
          <View style={tw("w-[20%]")}>
            <CheckBoxRow label="Other" checked={data.nationality == "OTHERS"} />
          </View>
          <View style={tw("w-[30%]")}>
            <Text style={tw(`text-[8px] text-right`)}>
              ISO 3166 Country Code:
            </Text>
          </View>
        </View>

        {/* liee 9  */}
        <View style={tw(`flex flex-col gap-2 border-b border-gray-300 py-2`)}>
          {/* Row 1 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")}>
              <Text style={tw("text-xs")}>Residential Status:*</Text>
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Resident Individual"
                checked={data.residentialStatus == "Resident Individual"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Non Resident Indian"
                checked={data.residentialStatus == "Non Resident Indian"}
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")} />

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Foreign National"
                checked={data.residentialStatus == "Foreign National"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Person of Indian Origin"
                checked={data.residentialStatus == "Person of Indian Origin"}
              />
            </View>
          </View>
        </View>

        {/* line 10  */}

        {/* liee 9  */}

        <View style={tw(`flex flex-col gap-2 py-2 border-b border-gray-300`)}>
          {/* Row 1 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")}>
              <Text style={tw("text-xs")}>Occupation Type:*</Text>
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Private Sector"
                checked={data.occupationType === "Private Sector"}
              />
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Public Sector"
                checked={data.occupationType === "Public Sector"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Business"
                checked={data.occupationType === "Business"}
              />
            </View>
          </View>

          {/* Row 2 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")} />

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Government Sector"
                checked={data.occupationType === "Government Sector"}
              />
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Self Employed"
                checked={data.occupationType === "Self Employed Professional" || data.occupationType === "Self Employed"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Professional"
                checked={data.occupationType === "Professional"}
              />
            </View>
          </View>

          {/* Row 3 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")} />

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Agriculturist"
                checked={data.occupationType === "Agriculturist"}
              />
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Retired"
                checked={data.occupationType === "Retired"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Housewife"
                checked={data.occupationType === "Housewife"}
              />
            </View>
          </View>

          {/* Row 4 */}
          <View style={tw("flex flex-row")}>
            <View style={tw("w-[26.5%]")} />

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Student"
                checked={data.occupationType === "Student"}
              />
            </View>

            <View style={tw("w-[28%]")}>
              <CheckBoxRow
                label="Forex Dealer"
                checked={data.occupationType === "Forex Dealer"}
              />
            </View>

            <View>
              <CheckBoxRow
                label="Others"
                checked={data.occupationType === "Others"}
              />
            </View>
          </View>
        </View>
      </View>

      <View style={tw(`w-[90%] mx-auto py-4`)}>
        <Text style={tw(`text-xs font-[600] `)}>Proof of Identity (PoI):*</Text>
        {/* // L1 */}

        <View style={tw(`flex flex-col gap-2 py-3 pb-3`)}>
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Aadhar Card"
                checked={data.verifyWith === "AADHAAR"}
              />
            </View>
            <View>
              <Text style={tw(`text-xs mt-[1px]`)}>{data.aadhaarNo}</Text>
            </View>
          </View>
          {/* // L2 */}

          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Driving License"
                checked={data.verifyWith === "DL"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
            <View>
              <Text style={tw(`text-[5px] mt-[1px]`)}>(Expiry Date)</Text>
            </View>
          </View>
          {/* // L3 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Voter-ID Card"
                checked={data.verifyWith === "VID"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
          {/* // L4 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Passport Number"
                checked={data.verifyWith === "PASSPORT"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
            <View>
              <Text style={tw(`text-[5px] mt-[1px]`)}>(Expiry Date)</Text>
            </View>
          </View>
          {/* // L5 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="NREGA Job Card"
                checked={data.verifyWith === "NREGA"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
          {/* // L6 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow label="NPR" checked={data.verifyWith === "NPR"} />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
          {/* // L7 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Other"
                checked={data.verifyWith === "OTHERS"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
        </View>

        {/* // L1 */}
        <Text style={tw(`text-xs mb-3`)}>Identification Type & Number</Text>
      </View>
    </View>
  );
}

export default Page1;
