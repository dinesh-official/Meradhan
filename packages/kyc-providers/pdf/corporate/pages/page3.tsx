import { Text, View } from "@react-pdf/renderer";
import type { CorporateKycPdfData } from "../corporateKycPdfData";
import { pdfChk, pdfStr } from "../corporateKycPdfData";
import { CheckBoxRow } from "../../elements/CheckBoxRow";
import Footer from "../../elements/Footer";
import InputField from "../../elements/TextFiled";
import LogoSvg from "../../images/LogoSvg";
import { tw } from "../../MdPdf";

/**
 * Page 3 — Part II: Related Person (KYC_P1_Non_Individuals_v1_P3.pdf).
 * Styling aligned with page1 (logo + footer).
 */
function CorporateKycPdfPage3Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const hx = 32;
  const rp = data.relatedPerson ?? {};
  const rpoi = rp.poi ?? {};
  const rc = rp.correspondence ?? data.correspondence ?? {};
  const rs = rp.residentialStatus ?? {};
  const occ = rp.occupationType ?? {};
  const rpt = rp.relatedPersonType ?? {};

  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={false} />



      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 40,
          paddingHorizontal: hx,
          marginTop: 10,
        }}
      >
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 10 }}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>For Office Use Only</Text>
          <View style={{ display: "flex", flexDirection: "row", gap: 8 }}>
            <Text style={{ fontSize: 8 }}>Application Type:*</Text>
            <CheckBoxRow label="New" checked={data.applicationType === "new"} />
            <CheckBoxRow label="Update" checked={data.applicationType === "update"} />
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 8 }}>Application Number: {pdfStr(data.applicationNumber)}</Text>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>
          1. Identity Details of Related Person
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <View style={tw("flex flex-row justify-between gap-2")}>
          <View style={tw("w-[55%]")}>
            <InputField title="PAN:*" value={pdfStr(rp.pan)} className="w-[95%]" />
          </View>
          <View style={tw("flex flex-row items-end pb-1")}>
            <CheckBoxRow label="FORM 60" checked={pdfChk(rp.form60)} />
          </View>
        </View>

        <InputField title="Name (same as ID Proof):*" value={pdfStr(rp.name)} className="w-[30%]" />
        <View style={tw("flex flex-row gap-2 ")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Maiden Name (if any):" value={pdfStr(rp.maidenName)} className="w-[90%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Father's / Spouse Name:*" value={pdfStr(rp.fatherOrSpouseName)} className="w-[90%]" />
          </View>
        </View>
        <View style={tw("flex flex-row gap-2 ")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Mother's Name:" value={pdfStr(rp.motherName)} className="w-[90%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="Date of Birth (DD-MM-YYYY):*" value={pdfStr(rp.dob)} className="w-[90%]" />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Gender:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="Male" checked={pdfChk(rp.genderMale)} />
          <CheckBoxRow label="Female" checked={pdfChk(rp.genderFemale)} />
          <CheckBoxRow label="Transgender" checked={pdfChk(rp.genderTransgender)} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Marital Status:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="Single" checked={pdfChk(rp.maritalSingle)} />
          <CheckBoxRow label="Married" checked={pdfChk(rp.maritalMarried)} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Nationality:*</Text>
        <View style={tw("flex flex-row gap-4 mt-1")}>
          <CheckBoxRow label="IN - Indian" checked={pdfChk(rp.nationalityIndian)} />
          <CheckBoxRow label="Other" checked={pdfChk(rp.nationalityOther)} />
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Residential Status:*</Text>
        <View style={tw("flex flex-row flex-wrap gap-x-3 gap-y-1 mt-1")}>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Resident Individual" checked={pdfChk(rs["Resident Individual"])} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Non Resident Indian" checked={pdfChk(rs["Non Resident Indian"])} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Foreign National" checked={pdfChk(rs["Foreign National"])} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Person of Indian Origin" checked={pdfChk(rs["Person of Indian Origin"])} />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Occupation Type:*</Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Private Sector" checked={pdfChk(occ["Private Sector"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Public Sector" checked={pdfChk(occ["Public Sector"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Government Sector" checked={pdfChk(occ["Government Sector"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Business" checked={pdfChk(occ.Business)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Professional" checked={pdfChk(occ.Professional)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Agriculturist" checked={pdfChk(occ.Agriculturist)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Retired" checked={pdfChk(occ.Retired)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Housewife" checked={pdfChk(occ.Housewife)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Student" checked={pdfChk(occ.Student)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Forex Dealer" checked={pdfChk(occ["Forex Dealer"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Others:" checked={pdfChk(occ.Others)} />
          </View>
        </View>

        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Related Person Type* (Please specify)</Text>
        <Text style={{ fontSize: 6.5, marginTop: 1, color: "#444" }}>
          (mandatory if the related person is Director)
        </Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1 mt-1")}>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Director" checked={pdfChk(rpt.Director)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Partner" checked={pdfChk(rpt.Partner)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Authorized Signatory" checked={pdfChk(rpt["Authorized Signatory"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Promoter" checked={pdfChk(rpt.Promoter)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Beneficiary" checked={pdfChk(rpt.Beneficiary)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Beneficial Owner" checked={pdfChk(rpt["Beneficial Owner"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Karta" checked={pdfChk(rpt.Karta)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Proprietor" checked={pdfChk(rpt.Proprietor)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Trustee" checked={pdfChk(rpt.Trustee)} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Power of Attorney Holder" checked={pdfChk(rpt["Power of Attorney Holder"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="Court Appointed Official" checked={pdfChk(rpt["Court Appointed Official"])} />
          </View>
          <View style={tw("w-[23%]")}>
            <CheckBoxRow label="DIN" checked={pdfChk(rpt.DIN)} />
          </View>
          <View style={tw("w-[30%]")}>
            <CheckBoxRow label="Others:" checked={pdfChk(rpt.Others)} />
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 2 }}>
        <Text style={{ fontSize: 8, fontWeight: 600, marginBottom: 1 }}>
          Proof of Identity (PoI) submitted for PAN exempted cases (Please tick):*
        </Text>
        <View style={tw("flex flex-row flex-wrap gap-x-2 gap-y-1")}>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="AAadhaarCard" checked={pdfChk(rpoi.aadhar)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Driving License" checked={pdfChk(rpoi.drivingLicense)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Voter-ID Card" checked={pdfChk(rpoi.voterId)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Passport Number" checked={pdfChk(rpoi.passport)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="NREGA Job Card" checked={pdfChk(rpoi.nrega)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="NPR" checked={pdfChk(rpoi.npr)} />
          </View>
          <View style={tw("w-[31%]")}>
            <CheckBoxRow label="Other" checked={pdfChk(rpoi.otherPoi)} />
          </View>
        </View>
        <Text style={{ fontSize: 6.5, marginTop: 2, color: "#444" }}>
          (any document notified by Central Government)
        </Text>
        <View style={tw("flex flex-row gap-2 mt-1 flex-wrap")}>
          <View style={tw("w-[48%]")}>
            <InputField title="Identification Number" value={pdfStr(rp.poiIdNumber)} className="w-[100%]" />
          </View>
          <View style={tw("w-[48%]")}>
            <InputField title="(Expiry Date) DD / MM / YYYY" value={pdfStr(rp.poiExpiry)} className="w-[100%]" />
          </View>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-2")}>
        <Text style={tw("text-[8px] text-white font-[600]")}>2. Address Details *</Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <Text style={{ fontSize: 9, fontWeight: "semibold" }}>A. Correspondence / Local Address *</Text>
        <Text style={{ fontSize: 8, marginTop: 2, fontWeight: 600 }}>Address Type:*</Text>
        <View style={tw("flex flex-row gap-6 mt-1")}>
          <CheckBoxRow label="Residential" checked={pdfChk(rp.addressTypeResidential)} />
          <CheckBoxRow label="Business" checked={pdfChk(rp.addressTypeBusiness)} />
        </View>
        <View style={tw("flex flex-col flex-start mt-1 ")}>
          <InputField title="Line 1:*" value={pdfStr(rc.line1)} className="w-[10%]" />
          <InputField title="Line 2:" value={pdfStr(rc.line2)} className="w-[10%]" />
          <InputField title="Line 3:" value={pdfStr(rc.line3)} className="w-[10%]" />
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[38%]")}>
              <InputField title="City / Town / Village:*" value={pdfStr(rc.city)} className="w-[95%]" />
            </View>
            <View style={tw("w-[30%]")}>
              <InputField title="District:*" value={pdfStr(rc.district)} className="w-[90%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="Pincode*" value={pdfStr(rc.pincode)} className="w-[90%]" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2 mt-1")}>
            <View style={tw("w-[48%]")}>
              <InputField title="State:*" value={pdfStr(rc.state)} className="w-[95%]" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Country:*" value={pdfStr(rc.country)} className="w-[95%]" />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: hx,
          marginTop: 4,
          gap: 10,
          justifyContent: "flex-end",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <View style={tw("w-[30%] border border-gray-300 h-14 p-1")}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant e-Sign</Text>
        </View>
        <View style={tw("w-[30%] border border-gray-300 h-14 p-1 flex flex-col gap-1 justify-between items-center")}>
          <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant Wet Signature</Text>
          <Text style={{ fontSize: 6, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>
        </View>
      </View>

      <View style={{ marginTop: 48 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage3Content;
