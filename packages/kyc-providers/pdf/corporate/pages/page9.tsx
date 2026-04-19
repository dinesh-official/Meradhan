import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

const hx = 32;

/**
 * Page 9 — PART A KYC form basic information (KYC_P1_Non_Individual_v1.pdf). Header + footer.
 */
function CorporateKycPdfPage9Content() {
  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} />



      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingHorizontal: hx,
          marginTop: 8,
        }}
      >
        <View style={tw("flex flex-row flex-wrap gap-2 items-center")}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>For Office Use Only</Text>
          <Text style={{ fontSize: 8 }}>Application Type:*</Text>
          <CheckBoxRow label="New" checked={false} />
          <CheckBoxRow label="Update" checked={false} />
        </View>
        <InputField title="KYC Number:" value=" " className="w-[70%]" />
        <View>
          <Text style={{ fontSize: 8 }}>KYC Type:*</Text>
          <View style={tw("flex flex-row flex-wrap gap-4 mt-1")}>
            <CheckBoxRow label="Normal (PAN Mandatory)" checked={false} />
            <CheckBoxRow label="PAN Exempted" checked={false} />
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 8 }}>KYC Mode:*</Text>
          <View style={tw("flex flex-row flex-wrap gap-3 mt-1")}>
            <CheckBoxRow label="Online KYC" checked={false} />
            <CheckBoxRow label="Offline e-KYC" checked={false} />
            <CheckBoxRow label="Digilocker KYC" checked={false} />
          </View>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-3")}>
        <Text style={tw("text-[8px] text-white font-[600] text-center")}>
          PART A - KYC FORM (BASIC INFORMATION)
        </Text>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-2")}>
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
              <CheckBoxRow label="Certificate of Incorporation/Formation" />
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

      <View style={{ marginTop: 170 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage9Content;
