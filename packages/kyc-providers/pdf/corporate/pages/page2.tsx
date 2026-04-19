import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";
import TextFiled from "../../elements/TextFiled";

/**
 * Page 2 — continuation (FATCA/CRS, address completion, declarations).
 * Styling matches `page1.tsx` (LogoSvg, tw, InputField, CheckBoxRow, Footer).
 */
function CorporateKycPdfPage2Content() {
  return (
    <View style={{ fontFamily: "Poppins" }}>
      <View style={{ padding: 32 }} >
        <Text style={{ fontSize: 9, fontWeight: "semibold", marginTop: 2 }}>Proof of Address (PoA):* (attested copy of any one POA to be submitted—#Not more than 2 months old)</Text>
        <View style={tw("flex flex-row flex-start  gap-[2px] flex-wrap mt-2")}>
          <View style={tw("w-[38.5%]")}>
            <CheckBoxRow label="Certificate of Incorporation/Formation" checked={true} />
          </View>
          <View style={tw("w-[24.5%]")}>
            <CheckBoxRow label="Registration Certificate" checked={true} />
          </View>
          <View style={tw("w-[35.5%] flex flex-row justify-start items-start")}>
            <CheckBoxRow label="Other document" checked={true} />
            <TextFiled title="" value=" " className='w-[100%]' />
          </View>
        </View>
        <View style={tw("flex flex-row flex-start  gap-[2px] flex-wrap ")}>
          <View style={tw("w-[38.5%]")}>
            <CheckBoxRow label="Latest Telephone Bill# (Landline only)" checked={true} />
          </View>
          <View style={tw("w-[24.5%]")}>
            <CheckBoxRow label="Latest Electricity Bill#" checked={true} />
          </View>
          <View style={tw("w-[35.5%] flex flex-row justify-start items-start")}>
            <CheckBoxRow label="Latest Bank Account Statement#" checked={true} />
          </View>
        </View>
        <View style={tw("flex flex-row flex-start  gap-[8px] flex-wrap mt-2")}>
          <View style={tw("w-[48.5%]")}>
            <CheckBoxRow label="Registered Lease/ Sale Agreement of Office Premises" checked={true} />
          </View>
          <View style={tw("w-[48.5%] flex flex-row justify-start items-start")}>
            <Text style={{ fontSize: 8 }}>Validity/Expiry Date of POA (Expiry Date)</Text>
            <TextFiled title="" value=" " className='w-[100%]' />
          </View>
        </View>

        <View style={tw("flex flex-row flex-start justify-start items-start gap-[8px]")}>
          <View style={tw("w-[34%]")}>
            <CheckBoxRow label="Any other proof of address document" checked={true} />
          </View>
          <View style={tw("w-[66%] ")}>
            <TextFiled title="" value=" " className='' />
          </View>
        </View>

      </View>
    </View>
  );
}

export default CorporateKycPdfPage2Content;
