import { Text, View } from "@react-pdf/renderer";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

/**
 * Page 4 — continuation (KYC_P1_Non_Individuals_v1_P4.pdf). No logo / no footer.
 */
function CorporateKycPdfPage4Content() {
  const pad = { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 };

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <Text style={{ fontSize: 8, fontWeight: 600, marginBottom: 3, lineHeight: 1.25 }}>
        B. Permanent residence address of applicant, if different from above A / Overseas Address* (Mandatory
        for NRI Applicant)
      </Text>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 2 }}>Address Type:*</Text>
      <View style={tw("flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1")}>
        <CheckBoxRow label="Residential/Business" checked={false} />
        <CheckBoxRow label="Residential" checked={false} />
        <CheckBoxRow label="Business" checked={false} />
        <CheckBoxRow label="Registered Office" checked={false} />
        <CheckBoxRow label="Unspecified" checked={false} />
      </View>

      <View style={tw("flex flex-col flex-start mt-2 ")}>
        <InputField title="Line 1:*" value=" " className="w-[10%]" />
        <InputField title="Line 2:" value=" " className="w-[10%]" />
        <InputField title="Line 3:" value=" " className="w-[10%]" />
        <View style={tw("flex flex-row flex-start gap-2 flex-wrap")}>
          <View style={tw("w-[38%]")}>
            <InputField title="City / Town / Village:*" value=" " className="w-[95%]" />
          </View>
          <View style={tw("w-[30%]")}>
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

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 6, lineHeight: 1.25 }}>
        Proof of Address* (attested copy of any 1 POA for correspondence and permanent address each to be
        submitted)
      </Text>
      <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="Aadhar Card XXXX XXXX" checked={false} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="Voter-ID Card" checked={false} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="NREGA Job Card" checked={false} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="NPR" checked={false} />
        </View>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-2 mt-1 items-end")}>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="Driving License" checked={false} />
        </View>
        <View style={tw("w-[55%]")}>
          <InputField title="(Expiry Date) DD / MM / YYYY" value=" " className="" />
        </View>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-2 mt-1 items-end")}>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="Passport Number" checked={false} />
        </View>
        <View style={tw("w-[55%]")}>
          <InputField title="(Expiry Date) DD / MM / YYYY" value=" " className="" />
        </View>
      </View>
      <View style={tw("mt-1")}>
        <CheckBoxRow
          label="Other (any document notified by Central Government)"
          checked={false}
        />
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="Identification Number" value=" " className="" />
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>3. Contact Details</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="Email ID:" value=" " className="" />
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Mobile Number:" value=" " className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Alternate Mobile Number:" value=" " className="" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Telephone (Office):" value=" " className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Telephone (Residence):" value=" " className="" />
          </View>
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          4. FATCA - CRS Certification / Declaration*
        </Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <CheckBoxRow
          label="I am a tax resident of India and not resident of any other country."
          checked={false}
        />
        <View style={tw("mt-1")}>
          <CheckBoxRow
            label="I am a tax resident of country/ies as per details mentioned in the ANNEXURE - 1.2 (Additionally)"
            checked={false}
          />
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          5. Politically Exposed Person / Related to Politically Exposed Person (PEP)*
        </Text>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-x-4 gap-y-1 mt-2")}>
        <CheckBoxRow label="Yes - PEP" checked={false} />
        <CheckBoxRow label="Yes - Related to PEP" checked={false} />
        <CheckBoxRow label="No - PEP / Related to PEP" checked={false} />
      </View>
      <Text style={{ fontSize: 6.5, lineHeight: 1.3, color: "#333", textAlign: "justify", marginTop: 4 }}>
        Politically Exposed Persons (PEPs) are individuals who currently hold, or have previously held,
        prominent public positions in a foreign country. This includes heads of state or government, senior
        politicians, high-ranking judicial or military officials, senior executives of state-owned
        corporations, and key officials of political parties.
      </Text>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>6. Applicant Declaration</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <Text style={{ fontSize: 6.8, lineHeight: 1.28, color: "#222", textAlign: "justify" }}>
          I hereby declare that the details furnished above are true and correct to the best of my knowledge
          and belief and I undertake to inform you of any changes therein, immediately. In case any of the
          above information is found to be false or untrue or misleading or misrepresenting, I am aware that
          I may be held liable for it.
        </Text>
        <Text style={{ fontSize: 6.8, lineHeight: 1.28, color: "#222", textAlign: "justify", marginTop: 3 }}>
          I/We hereby give consent to receiving information from Central KYC Registry / KRA through SMS/Email
          on the above registered number/email address
        </Text>
      </View>

      <View style={tw("flex flex-row gap-2 mt-2")}>
        <View style={tw("w-[48%]")}>
          <InputField title="Date: DD / MM / YYYY" value=" " className="" />
        </View>
        <View style={tw("w-[48%]")}>
          <InputField title="Place:" value=" " className="" />
        </View>
      </View>

      <View style={tw("flex flex-row justify-between gap-3 mt-2")}>
        <View style={tw("w-[30%] border border-gray-300 h-16 p-1")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant e-Sign</Text>
        </View>
        <View style={tw("w-[30%] border border-gray-300 h-16 p-1 flex flex-col justify-between items-center")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant Wet Signature</Text>
          <Text style={{ fontSize: 6, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>7. For Office Use Only</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="KYC Carried out by:" value=" " className="w-[90%]" />
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="KYC Date: DD / MM / YYYY" value=" " className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Name:" value=" " className="" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Code:" value=" " className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Designation:" value=" " className="" />
          </View>
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="Intermediary Details:*" value=" " className="" />
        </View>
        <View style={tw("flex flex-row flex-wrap gap-2 mt-1")}>
          <CheckBoxRow label="Self certified document copies received (Originals Verified)" checked={false} />
        </View>
        <View style={tw("mt-1")}>
          <CheckBoxRow label="True Copies of documents received (Attested)" checked={false} />
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="AMC / Intermediary Name OR Code:" value=" " className="" />
        </View>
        <View style={tw("flex flex-row justify-between gap-3 mt-2")}>
          <View style={tw("w-[45%] border border-gray-300 h-16 p-1")}>
            <Text style={{ fontSize: 6.5, textAlign: "center" }}>Employee Signature and Stamp</Text>
          </View>
          <View style={tw("w-[45%] border border-gray-300 h-16 p-1")}>
            <Text style={{ fontSize: 6.5, textAlign: "center" }}>Institution Name and Stamp</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CorporateKycPdfPage4Content;
