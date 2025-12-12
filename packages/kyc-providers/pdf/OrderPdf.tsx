import { Document, Font, Page } from "@react-pdf/renderer";
import Footer from "./elements/Footer";
import LogoSvg from "./images/LogoSvg";
import OrdersPage from "./Orders/OrdersPage";
import OrdersPageTwo from "./Orders/OrdersPageTwo";
import type {
  BondDetailsResponse,
  CustomerByIdPayload,
} from "@root/apiGateway";

export function OrderPdf({
  bond,
  user,
  orderId,
  qun,
  releasedOrder,
}: {
  user: CustomerByIdPayload;
  bond: BondDetailsResponse;
  orderId: string;
  qun: number;
  releasedOrder?: boolean;
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
    <Document>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg showAll={false} />
        <OrdersPage
          bond={bond}
          user={user}
          orderId={orderId}
          qun={qun}
          releasedOrder={releasedOrder}
        />
        <Footer />
      </Page>
      <Page size="A4" style={{ fontFamily: "Poppins" }}>
        <LogoSvg showAll={false} />
        <OrdersPageTwo user={user} />
        <Footer />
      </Page>
    </Document>
  );
}
