import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

/**
 * Page 3 — Part II: Related Person (KYC_P1_Non_Individuals_v1_P3.pdf).
 * Styling aligned with page1 (logo + footer).
 */
function CorporateKycPdfPage3Content() {
  const hx = 32;

  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={false} />



      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 40,
          paddingHorizontal: hx,
          marginTop: 10,
        }}
      >
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 10 }}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>For Office Use Only</Text>
          <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <Text style={{ fontSize: 8 }}>Application Type:*</Text>
            <CheckBoxRow label="New" checked={false} />
            <CheckBoxRow label="Update" checked={false} />
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 8 }}>Application Number:</Text>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          1. Identity Details of Related Person
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <View style={tw("flex flex-row justify-between gap-2")}>
          <View style={tw("w-[55%]")}>
            <InputField title="PAN:*" value=" " className="w-[95%]" />
          </View>
          <View style={tw("flex flex-row items-end pb-1")}>
            <CheckBoxRow label="FORM 60" checked={false} />
          </View>
        </View>

        <InputField title="Name (same as ID Proof):*" value=" " className="w-[30%]" />
        <View style={tw("flex flex-row gap-2 ")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Maiden Name (if any):" value=" " className="w-[90%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Father's / Spouse Name:*" value=" " className="w-[90%]" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 ")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Mother's Name:" value=" " className="w-[90%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Date of Birth (DD-MM-YYYY):*" value=" " className="w-[90%]" />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Gender:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="Male" checked={false} />
          <CheckBoxRow label="Female" checked={false} />
          <CheckBoxRow label="Transgender" checked={false} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Marital Status:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="Single" checked={false} />
          <CheckBoxRow label="Married" checked={false} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Nationality:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="IN - Indian" checked={false} />
          <CheckBoxRow label="Other" checked={false} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Residential Status:*</Text>
        <View style={tw("flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1")}>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Resident Individual" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Non Resident Indian" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Foreign National" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Person of Indian Origin" checked={false} />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Occupation Type:*</Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Private Sector" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Public Sector" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Government Sector" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Business" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Professional" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Agriculturist" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Retired" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Housewife" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Student" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Forex Dealer" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Others:" checked={false} />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Related Person Type* (Please specify)</Text>
        <Text style={{ fontSize: 6.5, marginTop: 1, color: "#444" }}>
          (mandatory if the related person is Director)
        </Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Director" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Partner" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Authorized Signatory" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Promoter" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Beneficiary" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Beneficial Owner" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Karta" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Proprietor" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Trustee" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Power of Attorney Holder" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Court Appointed Official" checked={false} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="DIN" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Others:" checked={false} />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 2 }}>
        <Text style={{ fontSize: 8, fontWeight: 600, marginBottom: 1 }}>
          Proof of Identity (PoI) submitted for PAN exempted cases (Please tick):*
        </Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1")}>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Aadhar Card" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Driving License" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Voter-ID Card" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Passport Number" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="NREGA Job Card" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="NPR" checked={false} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Other" checked={false} />
          </View>
        </View>
        <Text style={{ fontSize: 6.5, marginTop: 2, color: "#444" }}>
          (any document notified by Central Government)
        </Text>
        <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Identification Number" value=" " className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="(Expiry Date) DD / MM / YYYY" value=" " className="w-[100%]" />
          </View>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>2. Address Details *</Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <Text style={{ fontSize: 9, fontWeight: "semibold" }}>A. Correspondence / Local Address *</Text>
        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Address Type:*</Text>
        <View style={tw("flex flex-row gap-6 mt-1")}>
          <CheckBoxRow label="Residential" checked={false} />
          <CheckBoxRow label="Business" checked={false} />
        </View>
        <View style={tw("flex flex-col flex-start mt-1 ")}>
          <InputField title="Line 1:*" value=" " className="w-[10%]" />
          <InputField title="Line 2:" value=" " className="w-[10%]" />
          <InputField title="Line 3:" value=" " className="w-[10%]" />
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[38%]")}>
              <InputField title="City / Town / Village:*" value=" " className="w-[95%]" />
            </View>
            <View style={tw("w-[30%]")}>
              <InputField title="District:*" value=" " className="w-[90%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="Pincode*" value=" " className="w-[90%]" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2 mt-1")}>
            <View style={tw("w-[48%]")}>
              <InputField title="State:*" value=" " className="w-[95%]" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Country:*" value=" " className="w-[95%]" />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: hx,
          marginTop: 4,
          gap: 10,
          justifyContent: "flex-end",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <View style={tw("w-[30%] border border-gray-300 h-14 p-1")}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant e-Sign</Text>
        </View>
        <View style={tw("w-[30%] border border-gray-300 h-14 p-1 flex flex-col gap-1 justify-between items-center")}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant Wet Signature</Text>
          <Text style={{ fontSize: 6, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>
        </View>
      </View>

      <View style={{ marginTop: 48 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage3Content;
