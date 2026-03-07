import { Document, Font, Page } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import LogoSvg from "./images/LogoSvg";

import { mapAllPages } from "./dataMapper";
import Footer from "./elements/Footer";
import Page1 from "./pages/Page1";
import Page10 from "./pages/Page10";
import Page11 from "./pages/Page11";
import Page12 from "./pages/Page12";
import Page13 from "./pages/Page13";
import Page14 from "./pages/Page14";
import Page15 from "./pages/Page15";
import Page16 from "./pages/Page16";
import Page17 from "./pages/Page17";
import Page18 from "./pages/Page18";
import Page19 from "./pages/Page19";
import Page2 from "./pages/Page2";
import Page20 from "./pages/Page20";
import Page21 from "./pages/Page21";
import Page22 from "./pages/Page22";
import Page23 from "./pages/page23";
import Page24 from "./pages/page24";
import Page25 from "./pages/Page25";
import Page26 from "./pages/Page26";
import Page27 from "./pages/Page27";
import Page28 from "./pages/Page28";
import Page29 from "./pages/Page29";
import Page3 from "./pages/Page3";
import Page30 from "./pages/Page30";
import Page31 from "./pages/Page31";
import Page32 from "./pages/Page32";
import Page33 from "./pages/Page33";
import Page34 from "./pages/Page34";
import Page35 from "./pages/Page35";
import Page36 from "./pages/Page36";
import Page36_1 from "./pages/Page36_1";
import Page36_2 from "./pages/Page36_2";
import Page36_3 from "./pages/Page36_3";
import Page37 from "./pages/Page37";
import Page4 from "./pages/Page4";
import Page43 from "./pages/Page43";
import Page44 from "./pages/Page44";
import Page45 from "./pages/Page45";
import Page46 from "./pages/Page46";
import Page47 from "./pages/Page47";
import Page48 from "./pages/Page48";
import Page5 from "./pages/Page5";
import Page6 from "./pages/Page6";
import Page7 from "./pages/Page7";
import Page8 from "./pages/Page8";
import Page9 from "./pages/page9";

// Tailwind setup
export const tw = createTw({
  fontFamily: {
    sans: ["Quicksand"],
  },
  colors: {
    orange: "#EF4822",
    main: "#002C59",
  },
});

// Map all page data once for easy access

const MdPdf = ({
  pageData,
}: {
  pageData: Awaited<ReturnType<typeof mapAllPages>>;
}) => {
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
    // <PDFViewer
    //   style={{ width: "100vw", height: "100vh", fontFamily: "Poppins" }}
    // >
    <Document>
      <Page size="A4" style={{ fontFamily: "Poppins" }}  >
        <LogoSvg showAll={true} />
        <Page1 {...pageData.page1} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page2 {...pageData.page2} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page3 {...pageData.page3} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page4 {...pageData.page4} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page5 {...pageData.page5} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page6 {...pageData.page6} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page7 {...pageData.page7} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page8 {...pageData.page8} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page9 {...pageData.page9} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page10 />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page11 {...pageData.page11} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page12 {...pageData.page12} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page13 {...pageData.page13} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page14 {...pageData.page14} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page15 {...pageData.page15} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page16 {...pageData.page16} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page17 {...pageData.page17} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page18 {...pageData.page18} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page19 {...pageData.page19} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page20 {...pageData.page20} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page21 {...pageData.page21} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page22 {...pageData.page22} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page23 {...pageData.page23} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page24 {...pageData.page24} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page25 {...pageData.page25} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page26 {...pageData.page26} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page27 {...pageData.page27} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page28 {...pageData.page28} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page29 {...pageData.page29} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page30 {...pageData.page30} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page31 {...pageData.page31} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page32 {...pageData.page32} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page33 {...pageData.page33} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page34 {...pageData.page34} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page35 {...pageData.page35} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page36 {...pageData.page36} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page36_1 {...pageData.page36_1} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page36_2 {...pageData.page36_2} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page36_3 {...pageData.page36_3} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page37 {...pageData.page37} />
        <Footer />
      </Page>

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page38 {...pageData.page38} />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page39 {...pageData.page39} />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page40 />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page41 />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page42 {...pageData.page42} />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page43 {...pageData.page43} />
        <Footer />
      </Page> */}
      {/* 
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page44 {...pageData.page44} />
        <Footer />
      </Page> */}
      {/* 
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page45 {...pageData.page45} />
        <Footer />
      </Page> */}

      {/* <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg  />
        <Page46 {...pageData.page46} />
        <Footer />
      </Page> */}

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page43 />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page44 {...pageData.page44} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page45 />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page46 />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page47 {...pageData.page47} />
        <Footer />
      </Page>

      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg />
        <Page48 {...pageData.page48} />
        <Footer />
      </Page>
    </Document>
    // </PDFViewer>
  );
};

export default MdPdf;
