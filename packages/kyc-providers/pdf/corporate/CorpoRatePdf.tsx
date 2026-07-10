import { Document, Font, Page } from "@react-pdf/renderer";
import CorporateKycPdfPage1Content from "./pages/page1";
import CorporateKycPdfPage2Content from "./pages/page2";
import CorporateKycPdfPage3Content from "./pages/page3";
import CorporateKycPdfPage4Content from "./pages/page4";
import CorporateKycPdfPage5Content from "./pages/page5";
import CorporateKycPdfPage6Content from "./pages/page6";
import CorporateKycPdfPage7Content from "./pages/page7";
import CorporateKycPdfPage8Content from "./pages/page8";
import CorporateKycPdfPage9Content from "./pages/page9";
import CorporateKycPdfPage10Content from "./pages/page10";
import CorporateKycPdfPage11Content from "./pages/page11";
import CorporateKycPdfPage12Content from "./pages/page12";
import CorporateKycPdfPage13Content from "./pages/page13";
import CorporateKycPdfPage14Content from "./pages/page14";
import CorporateKycPdfPage15Content from "./pages/page15";
import CorporateKycPdfPage16Content from "./pages/page16";
import type { CorporateKycPdfData } from "./corporateKycPdfData";

function CorpoRatePdf({ data }: { data?: CorporateKycPdfData }) {
    const pdfData = data ?? {};
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
            <Page size="A4" style={{ fontFamily: "Poppins" }} dpi={270} >
                <CorporateKycPdfPage1Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage2Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage3Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage4Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage5Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage6Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage7Content data={pdfData} />
            </Page>
            <Page size="A4" orientation="landscape" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage8Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage9Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage10Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage11Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage12Content data={pdfData} />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage13Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage14Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage15Content />
            </Page>
            <Page size="A4" style={{ fontFamily: "Poppins" }}>
                <CorporateKycPdfPage16Content />
            </Page>
        </Document>
    );
}

export default CorpoRatePdf;
