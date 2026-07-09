import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

/**
 * Page 5 — Part III additional information (KYC_P1_Non_Individuals_v1_P5.pdf). No logo / no footer.
 */
function CorporateKycPdfPage5Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 };

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <InputField title="Name of Applicant:" value={pdfStr(data.nameOfApplicantPart3 ?? data.entityName)} className="w-52" />

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>1. Settlement Agency*</Text>
      <View style={tw("flex flex-row flex-wrap gap-x-6 gap-y-2 mt-2 items-end")}>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="NCL" checked={pdfChk(data.settlementNcl)} />
          <InputField title="(Direct Code if any)" value={pdfStr(data.nclDirectCode)} className="" />
        </View>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="ICCL" checked={pdfChk(data.settlementIccl)} />
          <InputField title="(Direct Code if any)" value={pdfStr(data.icclDirectCode)} className="" />
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-3")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>2. Other Details</Text>
      </View>
      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 6 }}>Please confirm your risk profile*</Text>
      <View style={tw("flex flex-row flex-wrap gap-x-6 gap-y-1 mt-2")}>
        <CheckBoxRow label="Aggressive" checked={pdfChk(data.riskAggressive)} />
        <CheckBoxRow label="Moderate" checked={pdfChk(data.riskModerate)} />
        <CheckBoxRow label="Conservative" checked={pdfChk(data.riskConservative)} />
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-3")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>3. Relationship with Existing Client</Text>
      </View>
      <Text style={{ fontSize: 7.5, lineHeight: 1.35, marginTop: 6, color: "#222" }}>
        Does any of your group/ holding/ Subsidiary company have existing relationship with BondNest Capital India
        Securities Private Limited?
      </Text>
      <View style={tw("flex flex-row gap-8 mt-2")}>
        <CheckBoxRow label="Yes" checked={pdfChk(data.existingRelationshipYes)} />
        <CheckBoxRow label="No" checked={pdfChk(data.existingRelationshipNo)} />
      </View>
      <Text style={{ fontSize: 7.5, marginTop: 6, fontWeight: 600 }}>If Yes, provide any one detail of the following.</Text>
      <View style={tw("flex flex-row gap-2 mt-2 flex-wrap")}>
        <View style={tw("w-[31%]")}>
          <InputField title="PAN:" value={pdfStr(data.existingPan)} className="" />
        </View>
        <View style={tw("w-[31%]")}>
          <InputField title="Name:" value={pdfStr(data.existingName)} className="" />
        </View>
        <View style={tw("w-[34%]")}>
          <InputField title="Referrer / Applicant Code:" value={pdfStr(data.existingReferrerCode)} className="" />
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-3")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>4. Notes*</Text>
      </View>
      <View style={{ marginTop: 6 }}>
        <Text style={{ fontSize: 6.8, lineHeight: 1.32, color: "#222", textAlign: "justify" }}>
          The transactions in Fixed Income Securities may be routed through RFQ platform of the Stock Exchanges, BondNest
          Capital India Securities Private Limited (MeraDhan) may enable your registration with Stock Exchanges /
          Clearing Corporations under its Participant Code. You may receive communication from Stock Exchanges /
          Clearing Corporations. You authorize BondNest to execute / report transactions on RFQ platform of the Stock
          Exchanges and take such other actions as may be required towards reporting, execution and settlement of
          transactions.
        </Text>
        <Text style={{ fontSize: 6.8, lineHeight: 1.32, color: "#222", textAlign: "justify", marginTop: 4 }}>
          We may verify your bank account through penny drop facility. INR 1 will be credited to your account at the time
          of verification.
        </Text>
      </View>

      <View style={tw("flex flex-row gap-3 mt-4 items-end flex-wrap")}>
        <View style={tw("w-[40%]")}>
          <InputField title="Date: DD / MM / YYYY" value={pdfStr(data.declarationDate)} className="" />
        </View>
        <View style={tw("w-[28%] border border-gray-300 h-14 p-1")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant e-Sign</Text>
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-4")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>PART III - ADDITIONAL INFORMATION</Text>
      </View>

      <View style={{ marginTop: 8 }}>
        <InputField title="PAN of the Applicant:" value={pdfStr(data.part3Pan ?? data.pan)} className="w-52" />
        <View style={tw("flex flex-row gap-2 mt-2 items-end flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="(Direct Code if any) SGL" value={pdfStr(data.part3SglDirectCode)} className="" />
          </View>
        </View>
      </View>

      <View style={tw("flex flex-row justify-between gap-4 mt-4")}>
        <View style={tw("w-[45%] border border-gray-300 h-16 p-1 flex flex-col justify-between items-center")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant Wet Signature</Text>
          <Text style={{ fontSize: 6, textAlign: "center" }}>(Bank/Demat)</Text>
        </View>
        <View style={tw("w-[45%] border border-gray-300 h-16 p-1 flex flex-col justify-center items-center")}>
          <Text style={{ fontSize: 6.5, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>
        </View>
      </View>

      <Text style={{ fontSize: 6.5, lineHeight: 1.35, color: "#333", textAlign: "justify", marginTop: 10 }}>
        Disclaimer: Fixed returns do not constitute guaranteed or assured returns. Investments in corporate debt
        securities, municipal debt securities/securitised debt instruments are subject to credit risks, market risks
        and default risks including delay and/or default in payment. Read all the offer related documents carefully.
      </Text>
    </View>
  );
}

export default CorporateKycPdfPage5Content;
