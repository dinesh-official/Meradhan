import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

const DEMAT_SLOTS = [0, 1, 2, 3, 4] as const;

/**
 * Page 7 — Annexure B Demat accounts (KYC_P1_Non_Individuals_v1_P7.pdf). No logo / no footer.
 */
function CorporateKycPdfPage7Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 };
  const demats = data.dematAccounts ?? [];

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <Text
        style={{
          fontSize: 9,
          fontWeight: 700,
          textAlign: "center",
          color: "#002C59",
        }}
      >
        ANNEXURE B - DEMAT ACCOUNTS
      </Text>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 10 }}>Details of Applicant</Text>
      <View style={{ marginTop: 3 }}>
        <InputField title="PAN:*" value={pdfStr(data.pan)} className="w-[12%]" />
        <View style={{ marginTop: 2 }}>
          <InputField title="Name (same as per PAN):*" value={pdfStr(data.entityName)} className="w-[35%]" />
        </View>
      </View>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>Demat Details</Text>

      {DEMAT_SLOTS.map((idx) => {
        const n = idx + 1;
        const d = demats[idx];
        const primary = d?.isPrimary;
        return (
        <View key={n} style={{ marginTop: n === 1 ? 4 : 6 }}>
          <View style={tw("flex flex-row flex-wrap items-end gap-2")}>
            <Text style={{ fontSize: 8, fontWeight: 600 }}>{n}. Is it a Primary account?:</Text>
            <CheckBoxRow label="Yes" checked={primary === true} />
            <CheckBoxRow label="No" checked={primary === false} />
          </View>
          <View style={{ marginTop: 2 }}>
            <InputField title="DP Name:" value={pdfStr(d?.dpName)} className="w-[12%]" />
          </View>
          <View style={{ marginTop: 2 }}>
            <InputField title="DP ID:" value={pdfStr(d?.dpId)} className="w-[10%]" />
          </View>
          <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 4 }}>Depository:</Text>
          <View style={tw("flex flex-row gap-8 mt-1")}>
            <CheckBoxRow label="CDSL" checked={pdfChk(d?.depositoryCdsl)} />
            <CheckBoxRow label="NSDL" checked={pdfChk(d?.depositoryNsdl)} />
          </View>
          <View style={{ marginTop: 2 }}>
            <InputField title="Beneficiary ID:" value={pdfStr(d?.beneficiaryId)} className="w-[16%]" />
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
        details shared above in Demat accounts&apos; list
      </Text>
    </View>
  );
}

export default CorporateKycPdfPage7Content;
