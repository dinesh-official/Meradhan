import { Text, View } from '@react-pdf/renderer';
import { CheckBoxRow } from '../../elements/CheckBoxRow';
import Footer from '../../elements/Footer';
import InputField from '../../elements/TextFiled';
import LogoSvg from '../../images/LogoSvg';
import { tw } from '../../MdPdf';

function CorporateKycPdfPage1Content() {

    return (
        <View style={{ fontFamily: "Poppins" }}>
            <LogoSvg showAll={true} />
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 60, paddingHorizontal: 32 }} >
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 10 }}>
                    <Text style={{ fontSize: 8, fontWeight: "bold" }}>For Office Use Only</Text>
                    <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
                        <Text style={{ fontSize: 8 }}>Application Type:*</Text>
                        <CheckBoxRow label="New" checked={true} />
                        <CheckBoxRow label="Update" checked={true} />
                    </View>
                </View>
                <View style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <Text style={{ fontSize: 8 }}>Application Number:: 1234567890</Text>
                </View>
            </View>

            <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-2 ")}>
                <Text style={tw("text-xs text-white font-[600]")}>
                    1. Entity Details (Please refer instructions at the end)
                </Text>
            </View>


            <View style={{ paddingHorizontal: 32, marginTop: 2, justifyContent: "space-between", display: "flex", flexDirection: "row" }} >
                <View style={tw("flex flex-row justify-between items-center gap-4")} >
                    <View style={tw("w-[64%]")}>
                        <InputField title="Pan*" value=" " className='w-[18%]' />
                    </View>
                </View>

                <View style={tw("flex flex-row justify-between items-center gap-4")} >
                    <CheckBoxRow label="Form 60" checked={true} />
                </View>

            </View>


            <View style={{ paddingHorizontal: 32, marginTop: 2, justifyContent: "space-between", display: "flex", flexDirection: "row" }} >
                <InputField title="Name (same as ID Proof):*" value=" " className='w-[30%]' />
            </View>

            <View style={{ paddingHorizontal: 32, marginTop: 2, justifyContent: "space-between", display: "flex", flexDirection: "row", gap: 10 }} >
                <InputField title="Date of Incorporation*" value=" " className='w-[80%]' />
                <InputField title="Place of Incorporation*" value=" " className='w-[80%]' />
            </View>
            <View style={{ paddingHorizontal: 32, marginTop: 2, justifyContent: "space-between", display: "flex", flexDirection: "row", gap: 10 }} >
                <InputField title="Date of Commencement*" value=" " className='w-[85%]' />
                <InputField title="Registration Number*" value=" " className='w-[70%]' />
            </View>

            <Text style={{ paddingHorizontal: 32, marginTop: 6, fontSize: 8 }}>Entity Type:*</Text>
            <View style={{
                paddingHorizontal: 32,
                marginTop: 8,
            }}>
                <View style={tw("flex flex-row flex-start flex-wrap gap-2")} >
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Private Limited Co." checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Public Limited Co." checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Body Corporate" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Partnership" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Trust/Charity/NGO" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="HUF" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="FPI Category I" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="FPI Category II" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="AOP" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Bank" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Government Body" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Defence Establishment" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Body of Individuals" checked={true} />
                    </View>
                    <View style={tw("w-[22.5%]")} >
                        <CheckBoxRow label="Others (Specify):" checked={true} />
                    </View>
                </View>


                <Text style={{ marginTop: 10, fontSize: 9, fontWeight: "bold" }}>Others (Specify):</Text>
                <View style={tw("flex flex-column mt-2 flex-start flex-wrap gap-2")} >
                    <CheckBoxRow label='Officially Valid Document(s) in respect of person authorized to transact' />
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow label='Certificate of Incorporation/Formation' />
                        </View>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow label='Registration Certificate' />
                        </View>
                    </View>
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[39%]")}>
                            <CheckBoxRow label='Memorandum of Articles and Association' />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow label='Board Resolution' />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow label='Trust Deed' />
                        </View>
                        <View style={tw("w-[18%]")}>
                            <CheckBoxRow label='Partnership Deed' />
                        </View>
                    </View>
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow label='Activity Proof - 1# (For Sole Proprietorship Only)' />
                        </View>
                        <View style={tw("w-[50%]")}>
                            <CheckBoxRow label='Activity Proof - 2# (For Sole Proprietorship Only)' />
                        </View>
                    </View>
                    <CheckBoxRow label='Power of attorney granted to its manager, office, employees to transact on its behalf' />

                </View>


            </View>
            <View style={tw("bg-main px-3 py-2 w-[90%] mx-auto rounded mt-4 ")}>
                <Text style={tw("text-xs text-white font-[600]")}>
                    2. Address Details (Please refer instructions at the end)
                </Text>
            </View>


            <View style={{ paddingHorizontal: 32, marginTop: 5 }} >
                <Text style={{ fontSize: 9, fontWeight: "bold", marginTop: 2 }}>A. Registered Address*</Text>
                <View style={tw("flex flex-col flex-start mt-1 gap-[2px]")}>
                    <InputField title="Line 1:*" value=" " className='w-[10%]' />
                    <InputField title="Line 2:*" value=" " className='w-[10%]' />
                    <InputField title="Line 3:*" value=" " className='w-[10%]' />
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[40%]")}>
                            <InputField title="City / Town / Village:*" value=" " className='w-[90%]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="District:*" value=" " className='w-[50%]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="Pincode:*" value=" " className='w-[50%]' />
                        </View>
                    </View>
                </View>

            </View>

            <View style={{ paddingHorizontal: 32, marginTop: 5 }} >
                <Text style={{ fontSize: 9, fontWeight: "bold", marginTop: 2 }}>B. Correspondence / Local Address in India (if different from above)*</Text>
                <View style={tw("flex flex-col flex-start mt-1 gap-[2px]")}>
                    <InputField title="Line 1:*" value=" " className='w-[10%]' />
                    <InputField title="Line 2:*" value=" " className='w-[10%]' />
                    <InputField title="Line 3:*" value=" " className='w-[10%]' />
                    <View style={tw("flex flex-row flex-start gap-2")}>
                        <View style={tw("w-[40%]")}>
                            <InputField title="City / Town / Village:*" value=" " className='w-[90%]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="District:*" value=" " className='w-[50%]' />
                        </View>
                        <View style={tw("w-[30%]")}>
                            <InputField title="Pincode:*" value=" " className='w-[50%]' />
                        </View>
                    </View>
                </View>

            </View>

            <View>


            </View>
            <View style={{ paddingHorizontal: 32, marginTop: 8, gap: 10, justifyContent: "flex-end", display: "flex", flexDirection: "row" }} >
                <View style={tw("w-[30%] border border-gray-300 h-20 p-1")}>
                    <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant e-Sign</Text>
                </View>
                <View style={tw("w-[30%] border border-gray-300 h-20 p-1 flex flex-col gap-1 justify-between items-center")}>
                    <Text style={{ fontSize: 8, textAlign: "center" }}>Applicant Wet Signature</Text>
                    <Text style={{ fontSize: 6, textAlign: "center" }}>Authorised Signatory with Sign and stamp</Text>

                </View>
            </View>
            <View style={{ marginTop: 50 }}>
                <Footer />
            </View>
        </View>
    )
}
export default CorporateKycPdfPage1Content;