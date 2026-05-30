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
 * Page 10 — Non-Individual v1 P1: entity + registered address (KYC_P1_Non_Individual_v1_P1.pdf). Header + footer.
 */
function CorporateKycPdfPage10Content({ data = {} }: { data?: CorporateKycPdfData }) {
  const et = data.entityType ?? {};
  const poi = data.poi ?? {};
  const reg = data.registered ?? {};

  return (
    <View style={{ fontFamily: "Poppins" }}>
      <LogoSvg showAll={true} nonIndiv={true} />



      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
          gap: 40,
          paddingHorizontal: hx,
          marginTop: 8,
          flexWrap: "wrap",
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
        <View style={{ minWidth: 160 }}>
          <InputField title="Application Number:" value={pdfStr(data.applicationNumber)} className="w-[100%]" />
        </View>
      </View>

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-3")}>
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
              <CheckBoxRow label="Certificate of Incorporation / Formation" checked={pdfChk(poi.certificateOfIncorporation)} />
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

      <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-4")}>
        <Text style={tw("text-xs text-white font-[600]")}>
          2. Address Details (Please refer instructions at the end)
        </Text>
      </View>

      <View style={{ paddingHorizontal: hx, marginTop: 6 }}>
        <Text style={{ fontSize: 9, fontWeight: "semibold", marginTop: 2 }}>A. Registered Address*</Text>
        <View style={tw("flex flex-col flex-start mt-1 gap-[2px]")}>
          <InputField title="Line 1:*" value={pdfStr(reg.line1)} className="w-[10%]" />
          <InputField title="Line 2:" value={pdfStr(reg.line2)} className="w-[10%]" />
          <InputField title="Line 3:" value={pdfStr(reg.line3)} className="w-[10%]" />
          <View style={tw("flex flex-row flex-start gap-2 flex-wrap")}>
            <View style={tw("w-[38%]")}>
              <InputField title="City / Town / Village:*" value={pdfStr(reg.city)} className="w-[95%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="State:*" value={pdfStr(reg.state)} className="w-[90%]" />
            </View>
            <View style={tw("w-[28%]")}>
              <InputField title="District:*" value={pdfStr(reg.district)} className="w-[90%]" />
            </View>
          </View>
          <View style={tw("flex flex-row flex-start gap-2 mt-1")}>
            <View style={tw("w-[48%]")}>
              <InputField title="Country:*" value={pdfStr(reg.country)} className="w-[95%]" />
            </View>
            <View style={tw("w-[48%]")}>
              <InputField title="Pincode:*" value={pdfStr(reg.pincode)} className="w-[95%]" />
            </View>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 66 }}>
        <Footer />
      </View>
    </View>
  );
}

export default CorporateKycPdfPage10Content;
