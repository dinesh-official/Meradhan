import { Text, View } from '@react-pdf/renderer';
import type { CorporateKycPdfData } from '../corporateKycPdfData';
import { pdfChk, pdfStr } from '../corporateKycPdfData';
import { CheckBoxRow } from '../../elements/CheckBoxRow';
import Footer from '../../elements/Footer';
import InputField from '../../elements/TextFiled';
import LogoSvg from '../../images/LogoSvg';
import { tw } from '../../MdPdf';

function CorporateKycPdfPage1Content({ data = {} }: { data?: CorporateKycPdfData }) {
    const et = data.entityType ?? {};
    const poi = data.poi ?? {};

    return (
        <View style={{ fontFamily: "Poppins" }}>
            <LogoSvg showAll={true} />
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 60, paddingHorizontal: 32 }} >
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 10 }}>
                    <Text style={{ fontSize: 7, fontWeight: "bold" }}>For Office Use Only</Text>
                    <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                        <Text style={{ fontSize: 7 }}>Application Type:*</Text>
                        <CheckBoxRow fontSize={7} label="New" checked={data.applicationType === "new"} />
                        <CheckBoxRow fontSize={7} label="Update" checked={data.applicationType === "update"} />
                    </View>
                </View>
                <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Text style={{ fontSize: 7 }}>Application Number:: {pdfStr(data.applicationNumber)}</Text>
                </View>
            </View>

            <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-2 ")}>
                <Text style={tw("text-[7px] text-white font-[600]")}>
                    1. Entity Details (Please refer instructions at the end)
                </Text>
            </View>


            <View style={{ paddingHorizontal: 32, justifyContent: "space-between", display: "flex", flexDirection: "row" }} >
                <View style={tw("flex flex-row justify-between items-center gap-4")} >
                    <View style={tw("w-[64%]")}>
                        <InputField title="Pan*" value={pdfStr(data.pan)} className='w-[15%] text-[7px]' />
                    </View>
                </View>

                <View style={tw("flex flex-row justify-between items-center gap-4")} >
                    <CheckBoxRow fontSize={7} label="Form 60" checked={pdfChk(data.form60)} />
                </View>

            </View>


            <View style={{ paddingHorizontal: 32, justifyContent: "space-between", display: "flex", flexDirection: "row" }} >
                <InputField title="Name (same as ID Proof):*" value={pdfStr(data.entityName)} className='w-[24%] text-[7px]' />
            </View>

            <View style={{ paddingHorizontal: 32, justifyContent: "space-between", display: "flex", flexDirection: "row", gap: 10 }} >
                <InputField title="Date of Incorporation*" value={pdfStr(data.dateOfIncorporation)} className='w-[75%] text-[7px]' />
                <InputField title="Place of Incorporation*" value={pdfStr(data.placeOfIncorporation)} className='w-[75%] text-[7px]' />
            </View>
            <View style={{ paddingHorizontal: 32, justifyContent: "space-between", display: "flex", flexDirection: "row", gap: 10 }} >
                <InputField title="Date of Commencement*" value={pdfStr(data.dateOfCommencement)} className='w-[85%] text-[7px]' />
                <InputField title="Registration Number*" value={pdfStr(data.registrationNumber)} className='w-[70%] text-[7px]' />
            </View>

            <Text style={{ paddingHorizontal: 32, marginTop: 4, fontSize: 7 }}>Entity Type:*</Text>
            <View style={{
                paddingHorizontal: 32,
                marginTop: 8,
            }}>
                <View style={tw("flex flex-row flex-start flex-wrap gap-2")} >
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Private Limited Co." checked={pdfChk(et.privateLimitedCo)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Public Limited Co." checked={pdfChk(et.publicLimitedCo)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Body Corporate" checked={pdfChk(et.bodyCorporate)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Partnership" checked={pdfChk(et.partnership)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Trust/Charity/NGO" checked={pdfChk(et.trustCharityNgo)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="HUF" checked={pdfChk(et.huf)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="FPI Category I" checked={pdfChk(et.fpiCatI)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="FPI Category II" checked={pdfChk(et.fpiCatII)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="AOP" checked={pdfChk(et.aop)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Bank" checked={pdfChk(et.bank)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Government Body" checked={pdfChk(et.governmentBody)} />
                    </View>

                    <View style={tw("w-[22.5%]")} >

                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Defence Establishment" checked={pdfChk(et.defenceEstablishment)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Body of Individuals" checked={pdfChk(et.bodyOfIndividuals)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="Society" checked={pdfChk(et.society)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow fontSize={7} label="LLP" checked={pdfChk(et.llp)} />
                    </View>
                    <View style={tw("w-[34.5%]")} >
                        <CheckBoxRow fontSize={7} label="Non-Government Organization" checked={pdfChk(et.nonGovOrg)} />
                    </View>
                    <View style={tw("w-[10.5%]")} >
                    </View>
                    <View style={tw("w-[18.5%]")} >
                        <CheckBoxRow fontSize={7} label="Others (Specify):" checked={pdfChk(et.othersSpecify)} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <InputField title="" value={pdfStr(data.othersSpecify)} className='w-[0%]' />
                    </View>
                </View>
                <Text style={{ marginTop: 4, fontSize: 7, fontWeight: "semibold" }}>Proof of Identity (PoI):*</Text>
                <View style={tw("flex flex-column mt-2 flex-start flex-wrap gap-2")} >
                    <CheckBoxRow fontSize={7} label='Officially Valid Document(s) in respect of person authorized to transact' checked={pdfChk(poi.officiallyValidDocs)} />
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow fontSize={7} label='Certificate of Incorporation/Formation' checked={pdfChk(poi.certificateOfIncorporation)} />
                        </View>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow fontSize={7} label='Registration Certificate' checked={pdfChk(poi.registrationCertificate)} />
                        </View>
                    </View>
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[39%]")}>
                            <CheckBoxRow fontSize={7} label='Memorandum of Articles and Association' checked={pdfChk(poi.memorandumArticles)} />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow fontSize={7} label='Board Resolution' checked={pdfChk(poi.boardResolution)} />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow fontSize={7} label='Trust Deed' checked={pdfChk(poi.trustDeed)} />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow fontSize={7} label='Partnership Deed' checked={pdfChk(poi.partnershipDeed)} />
                        </View>
                    </View>
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow fontSize={7} label='Activity Proof - 1# (For Sole Proprietorship Only)' checked={pdfChk(poi.activityProof1)} />
                        </View>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow fontSize={7} label='Activity Proof - 2# (For Sole Proprietorship Only)' checked={pdfChk(poi.activityProof2)} />
                        </View>
                    </View>
                    <CheckBoxRow fontSize={7} label='Power of attorney granted to its manager, office, employees to transact on its behalf' checked={pdfChk(poi.powerOfAttorney)} />

                </View>


            </View>
            <View style={tw("bg-main px-3 py-1 w-[90%] mx-auto rounded mt-4 ")}>
                <Text style={tw("text-[7px] text-white font-[600]")}>
                    2. Address Details (Please refer instructions at the end)
                </Text>
            </View>


            <View style={{ paddingHorizontal: 32, marginTop: 3 }} >
                <Text style={{ fontSize: 7, fontWeight: "semibold", marginTop: 2 }}>A. Registered Address*</Text>
                <View style={tw("flex flex-col flex-start mt-1 gap-[2px]")}>
                    <InputField title="Line 1:*" value={pdfStr(data.registered?.line1)} className='w-[10%] text-[7px]' />
                    <InputField title="Line 2:*" value={pdfStr(data.registered?.line2)} className='w-[10%] text-[7px]' />
                    <InputField title="Line 3:*" value={pdfStr(data.registered?.line3)} className='w-[10%] text-[7px]' />
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[40%]")}>
                            <InputField title="City / Town / Village:*" value={pdfStr(data.registered?.city)} className='w-[90%] text-[7px]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="District:*" value={pdfStr(data.registered?.district)} className='w-[50%] text-[7px]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="Pincode:*" value={pdfStr(data.registered?.pincode)} className='w-[50%] text-[7px]' />
                        </View>
                    </View>
                </View>

            </View>

            <View style={{ paddingHorizontal: 32, marginTop: 3 }} >
                <Text style={{ fontSize: 7, fontWeight: "semibold", marginTop: 2 }}>B. Correspondence / Local Address in India (if different from above)*</Text>
                <View style={tw("flex flex-col flex-start mt-1 gap-[1px]")}>
                    <InputField title="Line 1:*" value={pdfStr(data.correspondence?.line1)} className='w-[10%] text-[7px]' />
                    <InputField title="Line 2:*" value={pdfStr(data.correspondence?.line2)} className='w-[10%] text-[7px]' />
                    <InputField title="Line 3:*" value={pdfStr(data.correspondence?.line3)} className='w-[10%] text-[7px]' />
                    <View style={tw("flex flex-row flex-start gap-1")}>
                        <View style={tw("w-[40%]")}>
                            <InputField title="City / Town / Village:*" value={pdfStr(data.correspondence?.city)} className='w-[90%] text-[7px]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="District:*" value={pdfStr(data.correspondence?.district)} className='w-[50%] text-[7px]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="Pincode:*" value={pdfStr(data.correspondence?.pincode)} className='w-[50%] text-[7px]' />
                        </View>
                    </View>
                </View>

            </View>

            <View>


            </View>
            <View style={{ paddingHorizontal: 32, marginTop: 8, gap: 10, justifyContent: "flex-end", display: "flex", flexDirection: "row" }} >
                <View style={tw("w-[30%] border border-gray-300 h-20 p-1")}>
                    <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant e-Sign</Text>
                </View>
                <View style={tw("w-[30%] border border-gray-300 h-20 p-1 flex flex-col gap-1 justify-between items-center")}>
                    <Text style={{ fontSize: 7, textAlign: "center" }}>Applicant Wet Signature</Text>
                    <Text style={{ fontSize: 6, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>
                </View>
            </View>
            <View style={{ marginTop: 48 }}>
                <Footer />
            </View>
        </View>
    )
}
export default CorporateKycPdfPage1Content;
