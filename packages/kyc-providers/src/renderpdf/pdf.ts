/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderToFile } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import MdPdf from "../../pdf/MdPdf";
import { mapAllPages } from "../../pdf/dataMapper";
import { OrderPdf } from "../../pdf/OrderPdf";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    await renderToFile(
      MdPdf({
        pageData: data,
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
