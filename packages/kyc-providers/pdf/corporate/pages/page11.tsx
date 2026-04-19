import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

const hx = 32;

/**
 * Page 11 — Non-Individual v1 P2: correspondence address + PoA (KYC_P1_Non_Individual_v1_P2.pdf). Header + footer.
 */
function CorporateKycPdfPage11Content() {
  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} />

      <View style={{ paddingHorizontal: hx, paddingTop: 8 }}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: "#002C59", marginBottom: 6 }}>
          B. Correspondence / Local Address (if different from registered address)*
        </Text>

        <View style={tw("flex flex-col flex-start gap-[2px]")}>
          <InputField title="Line 1:*" value=" " className="w-[10%]" />
          <InputField title="Line 2:" value=" " className="w-[10%]" />
          <InputField title="Line 3:" value=" " className="w-[10%]" />
        </View>

        <View style={tw("flex flex-row flex-start gap-2 mt-2 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="City / Town / Village:*" value=" " className="w-[95%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="District:*" value=" " className="w-[95%]" />
          </View>
        </View>
        <View style={tw("flex flex-row flex-start gap-2 mt-2 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="State:*" value=" " className="w-[95%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Country:*" value=" " className="w-[95%]" />
          </View>
        </View>

        <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 10, marginBottom: 4 }}>Proof of Address (PoA):*</Text>

        <View style={tw("flex flex-row flex-start gap-1 flex-wrap")}>
          <View style={tw("w-[34%]")}>
            <CheckBoxRow label="Certificate of Incorporation/Formation" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Registration Certificate" checked={false} />
          </View>
          <View style={tw("w-[34%] flex flex-row items-center gap-1")}>
            <CheckBoxRow label="Other document" checked={false} />
            <View style={{ flex: 1 }}>
              <InputField title="" value=" " className="w-[100%]" />
            </View>
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-1 flex-wrap mt-1")}>
          <View style={tw("w-[34%]")}>
            <CheckBoxRow label="Latest Telephone Bill # (Landline only)" checked={false} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Latest Electricity Bill #" checked={false} />
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-2 flex-wrap mt-1")}>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Latest Bank Account Statement #" checked={false} />
          </View>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Trust Deed" checked={false} />
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-2 flex-wrap mt-1")}>
          <View style={tw("w-[50%]")}>
            <CheckBoxRow label="Activity Proof - 1# (For Sole Proprietorship Only)" checked={false} />
          </View>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Activity Proof - 2# (For Sole Proprietorship Only)" checked={false} />
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <CheckBoxRow
            label="Power of attorney granted to its manager, office, employees to transact on its behalf"
            checked={false}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <InputField title="Pincode:*" value=" " className="w-[40%]" />
        </View>
      </View>

      <View style={{ marginTop: 400 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage11Content;
