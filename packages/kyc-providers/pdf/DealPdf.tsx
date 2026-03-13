import { Document, Font, Page } from "@react-pdf/renderer";
import type {
  BondDetailsResponse,
  CustomerByIdPayload,
} from "@root/apiGateway";
import DealPage from "./Orders/DealPage";
import DealPageTwo from "./Orders/DealPageTwo";
import Footer from "./elements/Footer";
import { LogoSvgTop } from "./images/LogoSvg";

interface OrderPdfOrderData {
  subTotal?: number;
  stampDuty?: number;
  totalAmount?: number;
  createdAt?: string;
  price?: number;
  metadata?: {
    rfqNumber?: string;
    dealId?: string;
    exchangeRfqId?: string;
    accruedInterest?: number;
    accruedInterestDays?: number;
    settlementDate?: string;
    valueDate?: string;
    lastInterestPaymentDate?: string;
    settlementNumber?: string;
    interestPaymentDates?: string[];
    interestPaymentFrequencyLabel?: string;
    settlementBank?: { bankName?: string; ifscCode?: string; accountNo?: string };
    settlementDemat?: { dpName?: string; dpId?: string; benId?: string };
  };
}

export function DealPdf({
  bond,
  user,
  orderId,
  qun,
  releasedOrder,
  orderData,
}: {
  user: CustomerByIdPayload;
  bond: BondDetailsResponse;
  orderId: string;
  qun: number;
  releasedOrder?: boolean;
  orderData?: OrderPdfOrderData;
}) {
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
    <Document >
      <Page size="A4" style={{ fontFamily: "Poppins" }}    >
        <LogoSvgTop showAll={false} title="DEAL SHEET" />
        <DealPage
          bond={bond}
          user={user}
          orderId={orderId}
          qun={qun}
          releasedOrder={releasedOrder}
          orderData={orderData}
        />
        <Footer />
      </Page>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvgTop showAll={false} title="DEAL SHEET" />
        <DealPageTwo user={user} releasedOrder={releasedOrder} orderData={orderData} />
        <Footer />
      </Page>
    </Document>
  );
}
