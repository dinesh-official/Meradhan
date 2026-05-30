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
 * Page 9 — PART A KYC form basic information (KYC_P1_Non_Individual_v1.pdf). Header + footer.
 */
function CorporateKycPdfPage9Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const et = data.entityType ?? {};
  const poi = data.poi ?? {};

  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} nonIndiv={true} />



      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          paddingHorizontal: hx,
          marginTop: 8,
        }}
      >
        <View style={tw("flex flex-row flex-wrap gap-2 items-center")}>
          <Text style={{ fontSize: 8, fontWeight: "bold" }}>For Office Use Only</Text>
          <Text style={{ fontSize: 8 }}>Application Type:*</Text>
          <CheckBoxRow label="New" checked={data.applicationType === "new"} />
          <CheckBoxRow label="Update" checked={data.applicationType === "update"} />
        </View>
        <InputField title="KYC Number:" value={pdfStr(data.kycNumber)} className="w-[70%]" />
        <View>
          <Text style={{ fontSize: 8 }}>KYC Type:*</Text>
          <View style={tw("flex flex-row flex-wrap gap-4 mt-1")}>
            <CheckBoxRow label="Normal (PAN Mandatory)" checked={pdfChk(data.kycTypeNormal)} />
            <CheckBoxRow label="PAN Exempted" checked={pdfChk(data.kycTypePanExempted)} />
          </View>
        </View>
        <View>
          <Text style={{ fontSize: 8 }}>KYC Mode:*</Text>
          <View style={tw("flex flex-row flex-wrap gap-3 mt-1")}>
            <CheckBoxRow label="Online KYC" checked={pdfChk(data.kycModeOnline)} />
            <CheckBoxRow label="Offline e-KYC" checked={pdfChk(data.kycModeOfflineEkyc)} />
            <CheckBoxRow label="Digilocker KYC" checked={pdfChk(data.kycModeDigilocker)} />
          </View>
        </View>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-3")}>
        <Text style={tw("text-[8px] text-white font-[600] text-center")}>
          PART A - KYC FORM (BASIC INFORMATION)
        </Text>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-2")}>
        <Text style={tw("text-xs text-white font-[600]")}>
          1. Entity Details (Please refer instructions at the end)
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <InputField title="PAN:*" value={pdfStr(data.pan)} className="w-[30%]" />
      </View>
      <View style={{ paddingHorizontal: hx, marginTop: 4 }}>
        <InputField title="Name of the Applicant (same as ID Proof):*" value={pdfStr(data.entityName)} className="w-[30%]" />
      </View>
      <View style={{ paddingHorizontal: hx, display: "flex", flexDirection: "row", gap: 10, marginTop: 4 }}>
        <InputField title="Date of Incorporation* DD / MM / YYYY" value={pdfStr(data.dateOfIncorporation)} className="w-[80%]" />
        <InputField title="Place of Incorporation*" value={pdfStr(data.placeOfIncorporation)} className="w-[80%]" />
      </View>
      <View style={{ paddingHorizontal: hx, display: "flex", flexDirection: "row", gap: 10, marginTop: 4 }}>
        <InputField title="Date of Commencement* DD / MM / YYYY" value={pdfStr(data.dateOfCommencement)} className="w-[85%]" />
        <InputField title="Registration Number*" value={pdfStr(data.registrationNumber)} className="w-[70%]" />
      </View>

      <Text style={{ paddingHorizontal: hx, marginTop: 6, fontSize: 8 }}>Entity Type:*</Text>
      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <View style={tw("flex flex-row flex-start flex-wrap gap-2")}>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Private Limited Co." checked={pdfChk(et.privateLimitedCo)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Public Limited Co." checked={pdfChk(et.publicLimitedCo)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Body Corporate" checked={pdfChk(et.bodyCorporate)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Partnership" checked={pdfChk(et.partnership)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Trust" checked={pdfChk(et.trust)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Charity" checked={pdfChk(et.charity)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="NGO" checked={pdfChk(et.ngo)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="AOP" checked={pdfChk(et.aop)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category I" checked={pdfChk(et.fpiCatI)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category II" checked={pdfChk(et.fpiCatII)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="FPI Category III" checked={pdfChk(et.fpiCatIII)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="HUF" checked={pdfChk(et.huf)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Bank" checked={pdfChk(et.bank)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Government Body" checked={pdfChk(et.governmentBody)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Defence Establishment" checked={pdfChk(et.defenceEstablishment)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Society" checked={pdfChk(et.society)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Body of Individuals" checked={pdfChk(et.bodyOfIndividuals)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="LLP" checked={pdfChk(et.llp)} />
          </View>
          <View style={tw("w-[34.5%]")}>
            <CheckBoxRow label="Non-Government Organization" checked={pdfChk(et.nonGovOrg)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <CheckBoxRow label="Others (Please Specify)" checked={pdfChk(et.othersSpecify)} />
          </View>
          <View style={tw("w-[22.5%]")}>
            <InputField title="" value={pdfStr(data.othersSpecify)} className="w-[0%]" />
          </View>
        </View>

        <Text style={{ marginTop: 8, fontSize: 9, fontWeight: "semibold" }}>Proof of Identity (PoI):*</Text>
        <View style={tw("flex flex-column mt-2 flex-start flex-wrap gap-2")}>
          <CheckBoxRow label="Officially Valid Document(s) in respect of person authorized to transact" checked={pdfChk(poi.officiallyValidDocs)} />
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Certificate of Incorporation/Formation" checked={pdfChk(poi.certificateOfIncorporation)} />
            </View>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Registration Certificate" checked={pdfChk(poi.registrationCertificate)} />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[39%]")}>
              <CheckBoxRow label="Memorandum of Articles and Association" checked={pdfChk(poi.memorandumArticles)} />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Board Resolution" checked={pdfChk(poi.boardResolution)} />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Trust Deed" checked={pdfChk(poi.trustDeed)} />
            </View>
            <View style={tw("w-[18%]")}>
              <CheckBoxRow label="Partnership Deed" checked={pdfChk(poi.partnershipDeed)} />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2")}>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Activity Proof - 1# (For Sole Proprietorship Only)" checked={pdfChk(poi.activityProof1)} />
            </View>
            <View style={tw("w-[50%]")}>
              <CheckBoxRow label="Activity Proof - 2# (For Sole Proprietorship Only)" checked={pdfChk(poi.activityProof2)} />
            </View>
          </View>
          <CheckBoxRow label="Power of attorney granted to its manager, office, employees to transact on its behalf" checked={pdfChk(poi.powerOfAttorney)} />
        </View>
      </View>

      <View style={{ marginTop: 170 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage9Content;
