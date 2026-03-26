/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToBuffer, renderToFile } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import MdPdf from "../../pdf/MdPdf";
import { DealPdf } from "../../pdf/DealPdf";
import { OrderPdf } from "../../pdf/OrderPdf";
import { mapAllPages } from "../../pdf/dataMapper";

export async function generateKycPdf(userData: any) {
  try {
    const data = await mapAllPages(userData);

    const docId = userData.data?.id.toString() + Date.now().toFixed();
    const dirPath = path.join(process.cwd(), "tmp-pdfs");
    const filePath = path.join(dirPath, `kyc-${docId}.pdf`);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate PDF and save to file
    const buffer = await renderToBuffer(
      MdPdf({
        pageData: data,
      })
    );

    fs.writeFileSync(filePath, buffer);

    // Return file path
    return filePath;
  } catch (error) {
    console.error("Error generating KYC PDF:", error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateTempOrderPdf({
  bond,
  isReleased,
  user,
  orderId,
}: {
  user: any;
  orderId: string;
  isReleased: boolean;
  bond: any;
  qun: number;
}) {
  try {
    const dirPath = path.join(process.cwd(), "tmp-orders-pdfs");
    const filePath = path.join(dirPath, `order-${1}.pdf`);

    // Ensure directory exists
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Generate PDF and save to file
    await renderToFile(
      OrderPdf({
        bond,
        orderId,
        qun: 1,
        user,
        releasedOrder: isReleased,
      }),
      filePath
    );

    // Return file path
    return filePath;
  } catch (error) {
    console.error("Error generating KYC PDF:", error);
    throw error;
  }
}

/** Renders the bond order slip (OrderPdf) to a buffer. Use for API responses. */
export async function generateOrderPdfBuffer({
  bond,
  isReleased = false,
  user,
  orderId,
  qun = 1,
  orderData,
}: {
  user: any;
  orderId: string;
  isReleased?: boolean;
  bond: any;
  qun?: number;
  orderData?: {
    price?: number;
    subTotal?: number;
    stampDuty?: number;
    totalAmount?: number;
    createdAt?: string;
    metadata?: { dealId?: string; rfqNumber?: string;[key: string]: unknown };
  };
}): Promise<Buffer> {
  const buffer = await renderToBuffer(
    OrderPdf({
      bond,
      orderId,
      qun,
      user,
      releasedOrder: isReleased,
      orderData,
      userFor: "ORDER",
    })
  );
  return Buffer.from(buffer);
}

/** Renders the deal sheet (DealPdf) to a buffer. Use for API responses. */
export async function generateDealPdfBuffer({
  bond,
  isReleased = false,
  user,
  orderId,
  qun = 1,
  orderData,
}: {
  user: any;
  orderId: string;
  isReleased?: boolean;
  bond: any;
  qun?: number;
  orderData?: {
    price?: number;
    subTotal?: number;
    stampDuty?: number;
    totalAmount?: number;
    createdAt?: string;
    metadata?: { dealId?: string; rfqNumber?: string;[key: string]: unknown };
  };
}): Promise<Buffer> {
  const buffer = await renderToBuffer(
    DealPdf({
      bond,
      orderId,
      qun,
      user,
      releasedOrder: isReleased,
      orderData,
    })
  );
  return Buffer.from(buffer);
}
