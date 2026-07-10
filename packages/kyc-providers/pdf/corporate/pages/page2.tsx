import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import InputField from "../../elements/TextFiled";
import { tw } from "../../MdPdf";

/**
 * Page 2 — layout aligned to KYC_P1_Non_Individuals_v1_P2.pdf (no logo / no footer).
 */
function CorporateKycPdfPage2Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const pad = { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 12 };
  const poi = data.poaPermanent ?? data.poi ?? {};
  const c = data.contact ?? {};
  const ou = data.officeUse ?? {};

  return (
    <View style={[{ fontFamily: "Poppins" }, pad]}>
      {/* Proof of Address */}
      <Text style={{ fontSize: 8, fontWeight: 600, marginBottom: 3, lineHeight: 1.25 }}>
        Proof of Address (PoA):* (attested copy of any one POA to be submitted —# Not more than 2 months
        old)
      </Text>

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
        <View style={tw("w-[34%]")}>
          <CheckBoxRow label="Latest Bank Account Statement #" checked={pdfChk(poi.bankStatement)} />
        </View>
      </View>

      <View style={tw("flex flex-row flex-start gap-2 flex-wrap mt-1 items-end")}>
        <View style={tw("w-[55%]")}>
          <CheckBoxRow label="Registered Lease / Sale Agreement of Office Premises" checked={pdfChk(poi.registeredLease)} />
        </View>
        <View style={tw("w-[42%]")}>
          <InputField
            title="Validity / Expiry Date of POA (DD / MM / YYYY):*"
            value={pdfStr(data.poiExpiry)}
            className="w-[100%]"
          />
        </View>
      </View>

      <View style={tw("flex flex-row flex-start gap-2 mt-1 items-end")}>
        <View style={tw("w-[40%]")}>
          <CheckBoxRow label="Any other proof of address document" checked={pdfChk(poi.anyOtherPoa)} />
        </View>
        <View style={{ flex: 1 }}>
          <InputField title="" value={pdfStr(data.otherPoaText)} className="w-[100%]" />
        </View>
      </View>

      {/* 3. Contact Details */}
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          3. Contact Details (All communications will be sent on provided Mobile No. / Email-ID)
        </Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <View style={tw("flex flex-row gap-2")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Email ID:*" value={pdfStr(c.email)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Alternate Email ID:" value={pdfStr(c.alternateEmail)} className="w-[100%]" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Mobile No.:*" value={pdfStr(c.mobile)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Alternate Mobile No.:" value={pdfStr(c.alternateMobile)} className="w-[100%]" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Fax:" value={pdfStr(c.fax)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Telephone (Off):" value={pdfStr(c.telephoneOff)} className="w-[100%]" />
          </View>
        </View>
      </View>

      {/* 4. Annexures */}
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          4. Annexures Submitted (Please fill part 2 for each related person)
        </Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="Number of Related Persons:*" value={pdfStr(data.annexuresRelatedPersonsCount)} className="w-[40%]" />
      </View>

      {/* 5. Remarks */}
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>5. Remarks</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="" value={pdfStr(data.remarks)} className="w-[100%]" />
      </View>

      {/* 6. Applicant Declaration */}
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>6. Applicant Declaration</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <Text style={{ fontSize: 6.8, lineHeight: 1.28, color: "#222", textAlign: "justify" }}>
          BondNest Capital India Securities Private Limited (MeraDhan) or its representatives may
          fetch / re-fetch / confirm KYC / Registration documents and other credentials of the Applicant
          from independent third party(ies) including but not limited to CKYC / KRA Portals. The Applicant
          shall verify the correctness and completeness of the data as and when prompted. In case where
          Applicant&apos;s updated information, documents, details are not available on the KYC Portals,
          viz, CKYC, NDML KRA etc. the applicant shall immediately furnish the same to BondNest Capital
          India Securities Private Limited.
        </Text>
        <Text style={{ fontSize: 6.8, lineHeight: 1.28, color: "#222", textAlign: "justify", marginTop: 3 }}>
          I / We hereby declare that the KYC details furnished by me are true and correct to the best of
          my / our knowledge and belief and I / we undertake to inform you of any changes therein,
          immediately. In case any of the above information is found to be false or untrue or misleading or
          misrepresenting, I am / We are aware that I / We may be held liable for it.
        </Text>
        <Text style={{ fontSize: 6.8, lineHeight: 1.28, color: "#222", textAlign: "justify", marginTop: 3 }}>
          I / We hereby consent to receiving information from CKYC / KRA through SMS / Email on the above
          registered number / email address. I / We hereby authorize BondNest Capital India Securities
          Private Limited (MeraDhan), its affiliates, vendors, service providers, facilitating agency and
          their representatives to call, send email, SMS or communicate through WhatsApp about the
          Services and other updates / offerings from time to time.
        </Text>
      </View>

      {/* Signatures */}
      <View style={tw("flex flex-row justify-between gap-3 mt-2")}>
        <View style={tw("w-[30%] border border-gray-300 h-20 p-1")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant e-Sign</Text>
        </View>
        <View style={tw("w-[30%] border border-gray-300 h-20 p-1")}>
          <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant Wet Signature</Text>
        </View>
      </View>
      <View style={tw("flex flex-row gap-2 mt-1")}>
        <View style={tw("w-[48%]")}>
          <InputField title="Date (DD / MM / YYYY):*" value={pdfStr(data.declarationDate)} className="w-[90%]" />
        </View>
        <View style={tw("w-[48%]")}>
          <InputField title="Place:*" value={pdfStr(data.declarationPlace)} className="w-[90%]" />
        </View>
      </View>


      {/* 7. For Office Use Only */}
      <View style={tw("bg-main px-2 py-1 w-full mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>7. For Office Use Only</Text>
      </View>
      <View style={{ marginTop: 4 }}>
        <InputField title="KYC Carried out by:" value={pdfStr(ou.kycBy)} className="w-[90%]" />
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="KYC Date (DD / MM / YYYY):*" value={pdfStr(ou.kycDate)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Name:" value={pdfStr(ou.empName)} className="w-[100%]" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 mt-1")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Code:" value={pdfStr(ou.empCode)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Emp. Designation:" value={pdfStr(ou.empDesignation)} className="w-[100%]" />
          </View>
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="Intermediary Details:*" value={pdfStr(ou.intermediaryDetails)} className="w-[100%]" />
        </View>
        <View style={tw("flex flex-row flex-wrap gap-2 mt-1")}>
          <CheckBoxRow label="Self certified document copies received (Originals Verified)" checked={pdfChk(ou.selfCertifiedCopies)} />
        </View>
        <View style={tw("mt-1")}>
          <CheckBoxRow label="True Copies of documents received (Attested)" checked={pdfChk(ou.trueCopiesAttested)} />
        </View>
        <View style={{ marginTop: 4 }}>
          <InputField title="AMC / Intermediary Name OR Code:" value={pdfStr(ou.amcIntermediaryName)} className="w-[100%]" />
        </View>
        <View style={tw("flex flex-row justify-between gap-3 mt-2")}>
          <View style={tw("w-[45%] border border-gray-300 h-20 p-1")}>
            <Text style={{ fontSize: 6.5, textAlign: "center" }}>Employee Signature and Stamp</Text>
          </View>
          <View style={tw("w-[45%] border border-gray-300 h-20 p-1")}>
            <Text style={{ fontSize: 6.5, textAlign: "center" }}>Institution Name and Stamp</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default CorporateKycPdfPage2Content;
