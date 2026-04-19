import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

const BANK_SLOTS = [1, 2, 3, 4, 5] as const;

/**
 * Page 6 — Part IV Annexure A bank accounts (KYC_P1_Non_Individuals_v1_P6.pdf). No logo / no footer.
 */
function CorporateKycPdfPage6Content() {
  const pad = { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 };

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
        <InputField title="PAN:*" value=" " className="" />
        <View style={{ marginTop: 2 }}>
          <InputField title="Name (same as per PAN):*" value=" " className="" />
        </View>
      </View>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 8 }}>Bank Details</Text>

      {BANK_SLOTS.map((n) => (
        <View key={n} style={{ marginTop: n === 1 ? 4 : 6 }}>
          <View style={tw("flex flex-row flex-wrap items-end gap-2")}>
            <Text style={{ fontSize: 8, fontWeight: 600 }}>{n}. Is it a Primary account?:</Text>
            <CheckBoxRow label="Yes" checked={false} />
            <CheckBoxRow label="No" checked={false} />
          </View>
          <View style={{ marginTop: 2 }}>
            <InputField title="IFSC Code:" value=" " className="" />
          </View>
          <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
            <View style={tw("w-[48%]")}>
              <InputField title="Name as per Bank:" value=" " className="" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Name as per PAN:" value=" " className="" />
            </View>
          </View>
          <View style={{ marginTop: 2 }}>
            <InputField title="Branch:" value=" " className="" />
          </View>
          <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
            <View style={tw("w-[48%]")}>
              <InputField title="Account Type:" value=" " className="" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Account Number:" value=" " className="" />
            </View>
          </View>
          <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
            <View style={tw("w-[48%]")}>
              <InputField title="Bank Name:" value=" " className="" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="MICR Code:" value=" " className="" />
            </View>
          </View>
        </View>
      ))}

      <View style={tw("flex flex-row gap-3 mt-3 flex-wrap")}>
        <View style={tw("w-[45%]")}>
          <InputField title="Place:" value=" " className="" />
        </View>
        <View style={tw("w-[45%]")}>
          <InputField title="Date: DD / MM / YYYY" value=" " className="" />
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
