import { Text, View } from "@react-pdf/renderer";
import { tw } from "../MdPdf";
import type { Page2Props } from "../dataMapper";
import { CheckBoxRow } from "../elements/CheckBoxRow";

function Page2({
  currentAddress,
  permanentAddress,
  proofWith,
  aadharNo
}: Page2Props) {
  return (
    <View style={tw("px-4")}>
      <View
        style={tw("bg-main px-3 py-1.5 pb-1 w-[90%] mx-auto rounded  mt-5")}
      >
        <Text style={tw("text-xs text-white font-[500] leading-[1px]")}>
          2. Address Details
        </Text>
      </View>

      <View
        style={tw(
          `w-[90%] mx-auto py-3 flex flex-col mt-1 border-b border-gray-300 pb-4`
        )}
      >
        <Text style={tw(`text-xs font-[600]`)}>
          2. 1 Permanent / Current Address:*
        </Text>

        <View style={tw(`flex flex-col gap-4 mt-4`)}>
          <View style={tw(`flex justify-start flex-row items-center`)}>
            <Text style={tw(`text-xs w-[25%]`)}>Address Type:*</Text>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Residential"
                checked={permanentAddress.addressType === "RESIDENTIAL"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Business"
                checked={permanentAddress.addressType === "BUSINESS"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Registered Office"
                checked={permanentAddress.addressType === "REG_OFFICE"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Unspecified"
                checked={permanentAddress.addressType === "UNSPECIFIED"}
              />
            </View>
          </View>

          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 1:*</Text>
            <Text style={tw(`font-[500]`)}>
              {permanentAddress.addressLine1}
            </Text>
          </View>
          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 2:</Text>
            <Text style={tw(`font-[500]`)}>
              {permanentAddress.addressLine2}
            </Text>
          </View>
          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 3:</Text>
            <Text style={tw(`font-[500]`)}>
              {permanentAddress.addressLine3}
            </Text>
          </View>

          <View style={tw(`flex flex-row`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>City / Town / Village*</Text>
              <Text style={tw(`font-[500]`)}>{permanentAddress.city}</Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>District:*</Text>
              <Text style={tw(`font-[500]`)}>{permanentAddress.district}</Text>
            </View>
          </View>

          <View style={tw(`flex flex-row`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>Pincode:*</Text>
              <Text style={tw(`font-[500]`)}>{permanentAddress.pincode}</Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>State:*</Text>
              <Text style={tw(`font-[500]`)}>{permanentAddress.state}</Text>
            </View>
          </View>

          <View style={tw(`flex flex-row gap-5`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[37%]`)}>
              <Text>Country:*</Text>
              <Text style={tw(`font-[500]`)}>India</Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 `)}>
              <Text>State UT Code:</Text>
              <Text style={tw(`font-[500]`)}>
                {permanentAddress.stateUTCode}
              </Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 `)}>
              <Text>ISO 3166 Country Code:</Text>
              <Text style={tw(`font-[500]`)}>IN</Text>
            </View>
          </View>
        </View>
      </View>

      {/* // LOcal Address  */}
      <View
        style={tw(
          `w-[90%] mx-auto py-3 flex flex-col mt-1 border-b border-gray-300 pb-4`
        )}
      >
        <Text style={tw(`text-xs font-[600]`)}>
          2. 2 Correspondence / Local Address:*
        </Text>

        <View style={tw(`flex flex-col gap-4 mt-4`)}>
          <CheckBoxRow
            label="Same as above (Permanent / Current Address)"
            checked={currentAddress.sameAsPermanentAddress}
          />
          <View style={tw(`flex justify-start flex-row items-center`)}>
            <Text style={tw(`text-xs w-[25%]`)}>Address Type:*</Text>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Residential"
                checked={currentAddress.data.addressType === "RESIDENTIAL"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Business"
                checked={currentAddress.data.addressType === "BUSINESS"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Registered Office"
                checked={currentAddress.data.addressType === "REG_OFFICE"}
              />
            </View>
            <View style={tw(`w-[25%]`)}>
              <CheckBoxRow
                label="Unspecified"
                checked={currentAddress.data.addressType === "UNSPECIFIED"}
              />
            </View>
          </View>

          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 1:*</Text>
            <Text style={tw(`font-[500]`)}>
              {currentAddress.data.addressLine1}
            </Text>
          </View>
          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 2:</Text>
            <Text style={tw(`font-[500]`)}>
              {currentAddress.data.addressLine2}
            </Text>
          </View>
          <View style={tw(`text-xs flex flex-row gap-3`)}>
            <Text>Line 3:</Text>
            <Text style={tw(`font-[500]`)}>
              {currentAddress.data.addressLine3}
            </Text>
          </View>

          <View style={tw(`flex flex-row`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>City / Town / Village*</Text>
              <Text style={tw(`font-[500]`)}>{currentAddress.data.city}</Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>District:*</Text>
              <Text style={tw(`font-[500]`)}>
                {currentAddress.data.district}
              </Text>
            </View>
          </View>

          <View style={tw(`flex flex-row`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>Pincode:*</Text>
              <Text style={tw(`font-[500]`)}>
                {currentAddress.data.pincode}
              </Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 w-[50%]`)}>
              <Text>State:*</Text>
              <Text style={tw(`font-[500]`)}>{currentAddress.data.state}</Text>
            </View>
          </View>

          <View style={tw(`flex flex-row gap-5`)}>
            <View style={tw(`text-xs flex flex-row gap-3 w-[37%]`)}>
              <Text>Country:*</Text>
              <Text style={tw(`font-[500]`)}>India</Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 `)}>
              <Text>State UT Code:</Text>
              <Text style={tw(`font-[500]`)}>
                {currentAddress.data.stateUTCode}
              </Text>
            </View>
            <View style={tw(`text-xs flex flex-row gap-3 `)}>
              <Text>ISO 3166 Country Code:</Text>
              <Text style={tw(`font-[500]`)}>IN</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={tw(`w-[90%] mx-auto py-4`)}>
        <Text style={tw(`text-xs font-[600] `)}>Proof of Address (PoA):*</Text>
        {/* // L1 */}

        <View style={tw(`flex flex-col gap-2 py-3 pb-3`)}>
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Aadhar Card"
                checked={proofWith === "AADHAAR"}
              />
            </View>
            <View>
              <Text style={tw(`text-xs mt-[1px]`)}>{aadharNo}</Text>
            </View>
          </View>
          {/* // L2 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow
                label="Driving License"
                checked={proofWith === "DL"}
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
                checked={proofWith === "VID"}
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
                checked={proofWith === "PASSPORT"}
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
                checked={proofWith === "NREGA"}
              />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
          {/* // L6 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow label="NPR" checked={proofWith === "NPR"} />
            </View>
            <View style={tw(`w-[22%]`)}>
              <Text style={tw(`text-xs mt-[1px]`)}></Text>
            </View>
          </View>
          {/* // L7 */}
          <View style={tw(`flex flex-row  `)}>
            <View style={tw(`w-[20%]`)}>
              <CheckBoxRow label="Other" checked={proofWith === "OTHERS"} />
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

export default Page2;
