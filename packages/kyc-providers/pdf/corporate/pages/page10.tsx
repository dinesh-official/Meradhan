import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

const hx = 32;

/**
 * Page 10 — Non-Individual v1 P1: entity + registered address (KYC_P1_Non_Individual_v1_P1.pdf). Header + footer.
 */
function CorporateKycPdfPage10Content() {
  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} />



      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 40,
          paddingHorizontal: hx,
          marginTop: 8,
          flexWrap: "wrap",
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
        <View style={{ minWidth: 160 }}>
          <InputField title="Application Number:" value=" " className="w-[100%]" />
        </View>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-3")}>
        <Text style={tw("text-xs text-white font-[600]")}>
          1. Entity Details (Please refer instructions at the end)
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <InputField title="PAN:*" value=" " className="w-[30%]" />
      </View>
      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <InputField title="Name of the Applicant (same as ID Proof):*" value=" " className="w-[30%]" />
      </View>
      <View style={{ paddingHorizontal: hx, display: "flex", flexDirection: "row", gap: 10, marginTop: 4 }}>
        <InputField title="Date of Incorporation* DD / MM / YYYY" value=" " className="w-[80%]" />
        <InputField title="Place of Incorporation*" value=" " className="w-[80%]" />
      </View>
      <View style={{ paddingHorizontal: hx, display: "flex", flexDirection: "row", gap: 10, marginTop: 4 }}>
        <InputField title="Date of Commencement* DD / MM / YYYY" value=" " className="w-[85%]" />
        <InputField title="Registration Number*" value=" " className="w-[70%]" />
      </View>

      <Text style={{ paddingHorizontal: hx, marginTop: 6, fontSize: 8 }}>Entity Type:*</Text>
      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <View style={tw("flex flex-row flex-start flex-wrap gap-2")}>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Private Limited Co." checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Public Limited Co." checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Body Corporate" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Partnership" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Trust" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Charity" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="NGO" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="AOP" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category I" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category II" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category III" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="HUF" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Bank" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Government Body" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Defence Establishment" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Society" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Body of Individuals" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="LLP" checked={false} />
          </View>
          <View style={tw("w-[34.5%]")}>
            <CheckBoxRow label="Non-Government Organization" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Others (Please Specify)" checked={false} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <InputField title="" value=" " className="w-[0%]" />
          </View>
        </View>

        <Text style={{ marginTop: 8, fontSize: 9, fontWeight: "semibold" }}>Proof of Identity (PoI):*</Text>
        <View style={tw("flex flex-column mt-2 flex-start flex-wrap gap-2")}>
          <CheckBoxRow label="Officially Valid Document(s) in respect of person authorized to transact" />
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Certificate of Incorporation / Formation" />
            </View>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Registration Certificate" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[39%]")}>
              <CheckBoxRow label="Memorandum of Articles and Association" />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Board Resolution" />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Trust Deed" />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Partnership Deed" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Activity Proof - 1# (For Sole Proprietorship Only)" />
            </View>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Activity Proof - 2# (For Sole Proprietorship Only)" />
            </View>
          </View>
          <CheckBoxRow label="Power of attorney granted to its manager, office, employees to transact on its behalf" />
        </View>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-4")}>
        <Text style={tw("text-xs text-white font-[600]")}>
          2. Address Details (Please refer instructions at the end)
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <Text style={{ fontSize: 9, fontWeight: "semibold", marginTop: 2 }}>A. Registered Address*</Text>
        <View style={tw("flex flex-col flex-start mt-1 gap-[2px]")}>
          <InputField title="Line 1:*" value=" " className="w-[10%]" />
          <InputField title="Line 2:" value=" " className="w-[10%]" />
          <InputField title="Line 3:" value=" " className="w-[10%]" />
          <View style={tw("flex flex-row flex-start gap-2 flex-wrap")}>
            <View style={tw("w-[38%]")}>
              <InputField title="City / Town / Village:*" value=" " className="w-[95%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="State:*" value=" " className="w-[90%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="District:*" value=" " className="w-[90%]" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2 mt-1")}>
            <View style={tw("w-[48%]")}>
              <InputField title="Country:*" value=" " className="w-[95%]" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Pincode:*" value=" " className="w-[95%]" />
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 66 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage10Content;
