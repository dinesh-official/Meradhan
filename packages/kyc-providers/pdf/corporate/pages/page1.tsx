import { Text, View } from '@react-pdf/renderer';
import Footer from '../../elements/Footer';
import LogoSvg from '../../images/LogoSvg';
import { CheckBoxRow } from '../../elements/CheckBoxRow';

function CorporateKycPdfPage1Content() {

    return (
        <View style={{ fontFamily: "Poppins" }}>
            <LogoSvg showAll={true} />
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: 60, paddingHorizontal: 35 }} >
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
            <View>



            </View>

            <View style={{ marginTop: 650 }}>
                <Footer />
            </View>
        </View>
    )
}
export default CorporateKycPdfPage1Content;