import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

const ROWS = [0, 1, 2, 3] as const;

/**
 * Page 8 — Annexure 1 promoters/partners/directors grid (KYC_P1_Non_Individuals_v1_P8.pdf). No logo / no footer.
 */
function CorporateKycPdfPage8Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 22, paddingTop: 18, paddingBottom: 10 };
  const rows = data.promoterRows ?? [];

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <Text
        style={{
          fontSize: 7,
          lineHeight: 1.35,
          textAlign: "center",
          color: "#111",
          fontWeight: 600,
        }}
      >
        Details of Promoters/Partners/Karta/Trustees and Whole-time Directors forming a part of Know Your Client
        (KYC) Application form for Non-Individuals
      </Text>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded ")}>
        <Text style={tw("text-[8px] text-white font-[600] text-center")}>ANNEXURE 1</Text>
      </View>

      <View style={{ marginTop: 4 }}>
        <InputField title="Name of Applicant:" value={pdfStr(data.entityName)} className="" />
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="PAN of the Applicant:" value={pdfStr(data.pan)} className="" />
      </View>

      <Text style={{ fontSize: 7.5, fontWeight: 600, marginTop: 8, marginBottom: 4 }}>
        Sr. No. · PAN · Name · DIN (For Directors) · Aadhaar (for others) · Residential / Registered Address ·
        Relationship with Applicant (i.e. promoters, whole-time directors etc.) · Whether Politically Exposed?
      </Text>

      {ROWS.map((idx) => {
        const sr = idx + 1;
        const p = rows[idx];
        return (
        <View
          key={sr}
          style={{
            marginTop: sr === 1 ? 2 : 8,
            paddingBottom: 8,
            borderBottomWidth: sr < 4 ? 1 : 0,
            borderBottomColor: "#ddd",
          }}
        >
          <Text style={{ fontSize: 8, fontWeight: 700, marginBottom: 4 }}>Sr. No. {sr}</Text>
          <View style={tw("flex flex-row ")}>
            <View style={{ flex: 1 }}>
              <InputField title="PAN:" value={pdfStr(p?.pan)} className="" />
              <View style={{ marginTop: 2 }}>
                <InputField title="Name:" value={pdfStr(p?.name)} className="" />
              </View>
              <View style={tw("flex flex-row gap-2 ")}>
                <View style={tw("w-[48%]")}>
                  <InputField title="DIN (For Directors):" value={pdfStr(p?.din)} className="" />
                </View>
                <View style={tw("w-[48%]")}>
                  <InputField title="Aadhaar (for others):" value={pdfStr(p?.aadhar)} className="" />
                </View>
              </View>
              <View style={{ marginTop: 2 }}>
                <InputField title="Residential / Registered Address:" value={pdfStr(p?.address)} className="" />
              </View>
              <View style={{ marginTop: 2 }}>
                <InputField title="Relationship with Applicant:" value={pdfStr(p?.relationship)} className="" />
              </View>
              <Text style={{ fontSize: 7.5, fontWeight: 600, marginTop: 4 }}>Whether Politically Exposed?</Text>
              <View style={tw("flex flex-row gap-4 mt-1")}>
                <CheckBoxRow label="PEP" checked={pdfChk(p?.pep)} />
                <CheckBoxRow label="RPEP" checked={pdfChk(p?.rpep)} />
                <CheckBoxRow label="No" checked={pdfChk(p?.pepNo)} />
              </View>
            </View>
            <View style={{ width: 72, alignItems: "center" }}>
              <Text style={{ fontSize: 6.5, marginBottom: 2 }}>Photograph</Text>
              <View
                style={{
                  width: "100%",
                  height: 72,
                  borderWidth: 1,
                  borderColor: "#999",
                }}
              />
            </View>
          </View>
        </View>
        );
      })}

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>
        Name & Signature of the Authorised Signatory(ies) Along with Stamp
      </Text>
      <View style={tw("flex flex-row gap-3  flex-wrap items-end")}>
        <View style={tw("min-w-[45%] border border-gray-300 h-14 p-1 flex-1")}>
          <Text style={{ fontSize: 6.5, textAlign: "center" }}>Signatory / Stamp</Text>
        </View>
        <View style={tw("w-[40%]")}>
          <InputField title="Date: DD / MM / YYYY" value={pdfStr(data.declarationDate)} className="" />
        </View>
      </View>

      <Text style={{ fontSize: 6.5, lineHeight: 1.4, color: "#333", marginTop: 8 }}>
        * Note: If Partner / Director is more than four, please refer Annexure or attach one more supplement of the
        same page
      </Text>
    </View>
  );
}

export default CorporateKycPdfPage8Content;
