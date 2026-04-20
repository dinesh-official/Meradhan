import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

const hx = 32;

/**
 * Page 11 — Non-Individual v1 P2: correspondence address + PoA (KYC_P1_Non_Individual_v1_P2.pdf). Header + footer.
 */
function CorporateKycPdfPage11Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const corr = data.correspondence ?? {};
  const poi = data.poaPermanent ?? data.poi ?? {};

  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} />

      <View style={{ paddingHorizontal: hx, paddingTop: 8 }}>
        <Text style={{ fontSize: 9, fontWeight: 700, color: "#002C59", marginBottom: 6 }}>
          B. Correspondence / Local Address (if different from registered address)*
        </Text>

        <View style={tw("flex flex-col flex-start gap-[2px]")}>
          <InputField title="Line 1:*" value={pdfStr(corr.line1)} className="w-[10%]" />
          <InputField title="Line 2:" value={pdfStr(corr.line2)} className="w-[10%]" />
          <InputField title="Line 3:" value={pdfStr(corr.line3)} className="w-[10%]" />
        </View>

        <View style={tw("flex flex-row flex-start gap-2 mt-2 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="City / Town / Village:*" value={pdfStr(corr.city)} className="w-[95%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="District:*" value={pdfStr(corr.district)} className="w-[95%]" />
          </View>
        </View>
        <View style={tw("flex flex-row flex-start gap-2 mt-2 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="State:*" value={pdfStr(corr.state)} className="w-[95%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Country:*" value={pdfStr(corr.country)} className="w-[95%]" />
          </View>
        </View>

        <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 10, marginBottom: 4 }}>Proof of Address (PoA):*</Text>

        <View style={tw("flex flex-row flex-start gap-1 flex-wrap")}>
          <View style={tw("w-[34%]")}>
            <CheckBoxRow label="Certificate of Incorporation/Formation" checked={pdfChk(poi.certificateOfIncorporation)} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Registration Certificate" checked={pdfChk(poi.registrationCertificate)} />
          </View>
          <View style={tw("w-[34%] flex flex-row items-center gap-1")}>
            <CheckBoxRow label="Other document" checked={pdfChk(poi.otherDocument)} />
            <View style={{ flex: 1 }}>
              <InputField title="" value={pdfStr(data.otherPoaText)} className="w-[100%]" />
            </View>
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-1 flex-wrap mt-1")}>
          <View style={tw("w-[34%]")}>
            <CheckBoxRow label="Latest Telephone Bill # (Landline only)" checked={pdfChk(poi.telephoneBill)} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Latest Electricity Bill #" checked={pdfChk(poi.electricityBill)} />
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-2 flex-wrap mt-1")}>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Latest Bank Account Statement #" checked={pdfChk(poi.bankStatement)} />
          </View>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Trust Deed" checked={pdfChk(poi.trustDeed)} />
          </View>
        </View>

        <View style={tw("flex flex-row flex-start gap-2 flex-wrap mt-1")}>
          <View style={tw("w-[50%]")}>
            <CheckBoxRow label="Activity Proof - 1# (For Sole Proprietorship Only)" checked={pdfChk(poi.activityProof1)} />
          </View>
          <View style={tw("w-[48%]")}>
            <CheckBoxRow label="Activity Proof - 2# (For Sole Proprietorship Only)" checked={pdfChk(poi.activityProof2)} />
          </View>
        </View>

        <View style={{ marginTop: 4 }}>
          <CheckBoxRow
            label="Power of attorney granted to its manager, office, employees to transact on its behalf"
            checked={pdfChk(poi.powerOfAttorney)}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <InputField title="Pincode:*" value={pdfStr(corr.pincode)} className="w-[40%]" />
        </View>
      </View>

      <View style={{ marginTop: 400 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage11Content;
