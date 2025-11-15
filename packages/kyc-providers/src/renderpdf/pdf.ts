import { renderToFile } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import MdPdf from "../../pdf/MdPdf";
import { mapAllPages } from "../../pdf/dataMapper";

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
