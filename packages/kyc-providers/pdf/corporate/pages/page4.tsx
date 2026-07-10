import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

/**
 * Page 4 — continuation (KYC_P1_Non_Individuals_v1_P4.pdf). No logo / no footer.
 */
function CorporateKycPdfPage4Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 };
  const po = data.permanentOverseas ?? {};
  const poi = data.poaPermanent ?? data.relatedPerson?.poi ?? {};
  const c = data.contact ?? {};
  const ou = data.officeUse ?? {};

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      <Text style={{ fontSize: 8, fontWeight: 600, marginBottom: 3, lineHeight: 1.25 }}>
        B. Permanent residence address of applicant, if different from above A / Overseas Address* (Mandatory
        for NRI Applicant)
      </Text>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 2 }}>Address Type:*</Text>
      <View style={tw("flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1")}>
        <CheckBoxRow label="Residential/Business" checked={pdfChk(po.addressTypeResidentialBusiness)} />
        <CheckBoxRow label="Residential" checked={pdfChk(po.addressTypeResidential)} />
        <CheckBoxRow label="Business" checked={pdfChk(po.addressTypeBusiness)} />
        <CheckBoxRow label="Registered Office" checked={pdfChk(po.addressTypeRegisteredOffice)} />
        <CheckBoxRow label="Unspecified" checked={pdfChk(po.addressTypeUnspecified)} />
      </View>

      <View style={tw("flex flex-col flex-start mt-2 ")}>
        <InputField title="Line 1:*" value={pdfStr(po.line1)} className="w-[10%]" />
        <InputField title="Line 2:" value={pdfStr(po.line2)} className="w-[10%]" />
        <InputField title="Line 3:" value={pdfStr(po.line3)} className="w-[10%]" />
        <View style={tw("flex flex-row flex-start gap-2 flex-wrap")}>
          <View style={tw("w-[38%]")}>
            <InputField title="City / Town / Village:*" value={pdfStr(po.city)} className="w-[95%]" />
          </View>
          <View style={tw("w-[30%]")}>
            <InputField title="State:*" value={pdfStr(po.state)} className="w-[90%]" />
          </View>
          <View style={tw("w-[28%]")}>
            <InputField title="District:*" value={pdfStr(po.district)} className="w-[90%]" />
          </View>
        </View>
        <View style={tw("flex flex-row flex-start gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Country:*" value={pdfStr(po.country)} className="w-[95%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Pincode:*" value={pdfStr(po.pincode)} className="w-[95%]" />
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 8, fontWeight: 600, marginTop: 6, lineHeight: 1.25 }}>
        Proof of Address* (attested copy of any 1 POA for correspondence and permanent address each to be
        submitted)
      </Text>
      <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="AAadhaarCard XXXX XXXX" checked={pdfChk(poi.aadhar)} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="Voter-ID Card" checked={pdfChk(poi.voterId)} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="NREGA Job Card" checked={pdfChk(poi.nrega)} />
        </View>
        <View style={tw("w-[31%]")}>
          <CheckBoxRow label="NPR" checked={pdfChk(poi.npr)} />
        </View>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-2 mt-1 items-end")}>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="Driving License" checked={pdfChk(poi.drivingLicense)} />
        </View>
        <View style={tw("w-[55%]")}>
          <InputField title="(Expiry Date) DD / MM / YYYY" value={pdfStr(data.poiExpiry)} className="" />
        </View>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-2 mt-1 items-end")}>
        <View style={tw("w-[42%]")}>
          <CheckBoxRow label="Passport Number" checked={pdfChk(poi.passport)} />
        </View>
        <View style={tw("w-[55%]")}>
          <InputField title="(Expiry Date) DD / MM / YYYY" value={pdfStr(data.relatedPerson?.poiExpiry)} className="" />
        </View>
      </View>
      <View style={tw("mt-1")}>
        <CheckBoxRow
          label="Other (any document notified by Central Government)"
          checked={pdfChk(poi.otherPoi)}
        />
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="Identification Number" value={pdfStr(data.relatedPerson?.poiIdNumber)} className="" />
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>3. Contact Details</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="Email ID:" value={pdfStr(c.email)} className="" />
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Mobile Number:" value={pdfStr(c.mobile)} className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Alternate Mobile Number:" value={pdfStr(c.alternateMobile)} className="" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Telephone (Office):" value={pdfStr(c.telephoneOff)} className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Telephone (Residence):" value={pdfStr(c.telephoneRes)} className="" />
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
          checked={pdfChk(data.fatcaIndiaOnly)}
        />
        <View style={tw("mt-1")}>
          <CheckBoxRow
            label="I am a tax resident of country/ies as per details mentioned in the ANNEXURE - 1.2 (Additionally)"
            checked={pdfChk(data.fatcaAnnexure)}
          />
        </View>
      </View>

      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          5. Politically Exposed Person / Related to Politically Exposed Person (PEP)*
        </Text>
      </View>
      <View style={tw("flex flex-row flex-wrap gap-x-4 gap-y-1 mt-2")}>
        <CheckBoxRow label="Yes - PEP" checked={pdfChk(data.pepYes)} />
        <CheckBoxRow label="Yes - Related to PEP" checked={pdfChk(data.pepRelated)} />
        <CheckBoxRow label="No - PEP / Related to PEP" checked={pdfChk(data.pepNo)} />
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
          <InputField title="Date: DD / MM / YYYY" value={pdfStr(data.declarationDate)} className="" />
        </View>
        <View style={tw("w-[48%]")}>
          <InputField title="Place:" value={pdfStr(data.declarationPlace)} className="" />
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
        <InputField title="KYC Carried out by:" value={pdfStr(ou.kycBy)} className="w-[90%]" />
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="KYC Date: DD / MM / YYYY" value={pdfStr(ou.kycDate)} className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Name:" value={pdfStr(ou.empName)} className="" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Code:" value={pdfStr(ou.empCode)} className="" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Designation:" value={pdfStr(ou.empDesignation)} className="" />
          </View>
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="Intermediary Details:*" value={pdfStr(ou.intermediaryDetails)} className="" />
        </View>
        <View style={tw("flex flex-row flex-wrap gap-2 mt-1")}>
          <CheckBoxRow label="Self certified document copies received (Originals Verified)" checked={pdfChk(ou.selfCertifiedCopies)} />
        </View>
        <View style={tw("mt-1")}>
          <CheckBoxRow label="True Copies of documents received (Attested)" checked={pdfChk(ou.trueCopiesAttested)} />
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="AMC / Intermediary Name OR Code:" value={pdfStr(ou.amcIntermediaryName)} className="" />
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
