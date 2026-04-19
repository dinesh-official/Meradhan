import { Document, Font, Page } from "@react-pdf/renderer";
import CorporateKycPdfPage1Content from "./pages/page1";
import CorporateKycPdfPage2Content from "./pages/page2";
import CorporateKycPdfPage3Content from "./pages/page3";
import CorporateKycPdfPage4Content from "./pages/page4";

function CorpoRatePdf() {
    Font.register({
        family: "Poppins",
        fonts: [
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Regular.ttf",
                fontWeight: 400,
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Bold.ttf",
                fontWeight: 700,
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Italic.ttf",
                fontStyle: "italic",
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Light.ttf",
                fontWeight: 300,
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Medium.ttf",
                fontWeight: 500,
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-SemiBold.ttf",
                fontWeight: 600,
            },
            {
                src: "https://www.meradhan.co/fonts/Poppins/Poppins-Black.ttf",
                fontWeight: 900,
            },
            // Add more variants as needed
        ],
    });

    Font.register({
        family: "Quicksand",
        fonts: [
            {
                src: "https://www.meradhan.co/fonts/Quicksand/Quicksand-Regular.ttf",
                fontWeight: 400,
            },
            {
                src: "https://www.meradhan.co/fonts/Quicksand/Quicksand-Bold.ttf",
                fontWeight: 700,
            },
            {
                src: "https://www.meradhan.co/fonts/Quicksand/Quicksand-Light.ttf",
                fontWeight: 300,
            },
            {
                src: "https://www.meradhan.co/fonts/Quicksand/Quicksand-Medium.ttf",
                fontWeight: 500,
            },
            {
                src: "https://www.meradhan.co/fonts/Quicksand/Quicksand-SemiBold.ttf",
                fontWeight: 600,
            },
            // Add more variants as needed
        ],
    });
    return (
        <Document>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage1Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage2Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage3Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage4Content />
            </Page>
        </Document>
    );
}

export default CorpoRatePdf;
