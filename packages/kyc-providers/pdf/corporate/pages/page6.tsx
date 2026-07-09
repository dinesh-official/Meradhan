import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

const BANK_SLOTS = [0, 1, 2, 3, 4] as const;

/**
 * Page 6 — Part IV Annexure A bank accounts (KYC_P1_Non_Individuals_v1_P6.pdf). No logo / no footer.
 */
function CorporateKycPdfPage6Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 };
  const banks = data.bankAccounts ?? [];

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>PART IV</Text>
      </View>
      <Text
        style={{
          fontSize: 9,
          fontWeight: 700,
          marginTop: 6,
          textAlign: "center",
          color: "#002C59",
        }}
      >
        ANNEXURE A - BANK ACCOUNTS
      </Text>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>Details of Applicant</Text>
      <View style={{ marginTop: 3 }}>
        <InputField title="PAN:*" value={pdfStr(data.pan)} className="w-[12%]" />
        <View style={{ marginTop: 2 }}>
          <InputField title="Name (same as per PAN):*" value={pdfStr(data.entityName)} className="w-[35%]" />
        </View>
      </View>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>Bank Details</Text>

      {BANK_SLOTS.map((idx) => {
        const n = idx + 1;
        const b = banks[idx];
        const primary = b?.isPrimary;
        return (
          <View key={n} style={{ marginTop: n === 1 ? 4 : 6 }}>
            <View style={tw("flex flex-row flex-wrap items-end gap-2")}>
              <Text style={{ fontSize: 8, fontWeight: 600 }}>{n}. Is it a Primary account?:</Text>
              <CheckBoxRow label="Yes" checked={primary === true} />
              <CheckBoxRow label="No" checked={primary === false} />
            </View>
            <View style={{ marginTop: 2 }}>
              <InputField title="IFSC Code:" value={pdfStr(b?.ifsc)} className="w-[12%]" />
            </View>
            <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
              <View style={tw("w-[48%]")}>
                <InputField title="Name as per Bank:" value={pdfStr(b?.nameAsPerBank)} className="w-[55%]" />
              </View>
              <View style={tw("w-[48%]")}>
                <InputField title="Name as per PAN:" value={pdfStr(b?.nameAsPerPan)} className="w-[52%]" />
              </View>
            </View>
            <View style={{ marginTop: 2 }}>
              <InputField title="Branch:" value={pdfStr(b?.branch)} className="w-[10%]" />
            </View>
            <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
              <View style={tw("w-[48%]")}>
                <InputField title="Account Type:" value={pdfStr(b?.accountType)} className="w-[40%]" />
              </View>
              <View style={tw("w-[48%]")}>
                <InputField title="Account Number:" value={pdfStr(b?.accountNumber)} className="w-[50%]" />
              </View>
            </View>
            <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
              <View style={tw("w-[48%]")}>
                <InputField title="Bank Name:" value={pdfStr(b?.bankName)} className="w-[35%]" />
              </View>
              <View style={tw("w-[48%]")}>
                <InputField title="MICR Code:" value={pdfStr(b?.micr)} className="w-[35%]" />
              </View>
            </View>
          </View>
        );
      })}

      <View style={tw("flex flex-row gap-3 mt-3 flex-wrap")}>
        <View style={tw("w-[45%]")}>
          <InputField title="Place:" value={pdfStr(data.declarationPlace)} className="w-[18%]" />
        </View>
        <View style={tw("w-[45%]")}>
          <InputField title="Date: DD / MM / YYYY" value={pdfStr(data.declarationDate)} className="w-[68%]" />
        </View>
      </View>

      <Text style={{ fontSize: 6.5, lineHeight: 1.35, color: "#333", textAlign: "justify", marginTop: 6 }}>
        Note: Please ensure either you are sole account holder or first account holder in case of Joint account
        details shared above in Bank accounts&apos; list
      </Text>
    </View>
  );
}

export default CorporateKycPdfPage6Content;
