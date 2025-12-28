/* eslint-disable @typescript-eslint/no-explicit-any */
import https from "https";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import os from "os";
import path from "path";
import * as xlsx from "xlsx";

export interface BondDataSet {
  COMPANY?: string;
  ISIN: string;
  NAME_OF_THE_INSTRUMENT: string;
  DESCRIPTION_IN_NSDL: string;
  ISSUE_PRICE: number;
  FACE_VALUE: number;
  DATE_OF_ALLOTMENT: any;
  REDEMPTION: any;
  COUPON_RATE: any;
  FREQUENCY_OF_THE_INTEREST_PAYMENT: any;
  PUT_CALL_OPTION?: string;
  CERTIFICATE_NOS: any;
  TOTAL_ISSUE_SIZE?: number;
  REGISTRAR_WITH_BP_ID_NO: string;
  ADDRESS_WHERE_PHYSICAL_SECURITIES_IS_TO_BE_SENT?: string;
  DEFAULTED_IN_REDEMPTION?: string;
  NAME_OF_DEBENTURE: string;
  CREDIT_RATING_CREDIT_RATING_AGENCY?: string;
  REMARKS: any;
}

export class NsdlBondService {
  private readonly NSDL_URL = "https://nsdl.co.in/downloadables/list-debt.php";
  private readonly TMP_DIR = os.tmpdir();
  private readonly FILE_NAME = "bonds_data.xls";

  private get httpsAgent() {
    return new https.Agent({
      keepAlive: true,
      keepAliveMsecs: 10000,
      maxSockets: 10,
      rejectUnauthorized: false, // Enable TLS verification to prevent MITM attacks
      // If certificate validation fails, add the CA certificate to the system trust store
      // or use ca option with the certificate chain
    });
  }

  // 🟢 Fetch XLS file link from NSDL
  private async getNsdlFileLink(retries = 2): Promise<string> {
    try {
      const response = await axios.get(this.NSDL_URL, {
        httpsAgent: this.httpsAgent,
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Referer: "https://nsdl.co.in/",
          "Accept-Language": "en-US,en;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      });

      const $ = cheerio.load(response.data);
      const link = $(
        "a:contains('Download the entire list of Debt Instruments (including Redeemed)')"
      ).attr("href");

      if (!link) {
        throw new Error("XLS file link not found.");
      }

      const finalLink = `https://nsdl.co.in${link.replace("../", "/")}`;
      return finalLink;
    } catch (error) {
      if (retries > 0) {
        console.warn(`Retrying to fetch XLS link... (${retries} retries left)`);
        return await this.getNsdlFileLink(retries - 1);
      }
      console.error("Error fetching XLS link:", error);
      throw error;
    }
  }

  // 🟢 Download XLS file to temp directory
  private async downloadXlsFile(fileUrl: string): Promise<string> {
    const filePath = path.join(this.TMP_DIR, this.FILE_NAME);

    try {
      console.log("Downloading XLS file...");

      const response = await axios({
        url: fileUrl,
        method: "GET",
        responseType: "stream",
        httpsAgent: this.httpsAgent,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
          Referer: "https://nsdl.co.in/",
          "Accept-Language": "en-US,en;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        },
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      return await new Promise<string>((resolve, reject) => {
        writer.on("finish", () => {
          console.log(`✅ File saved at: ${filePath}`);
          resolve(filePath);
        });
        writer.on("error", reject);
      });
    } catch (error) {
      console.error("Error downloading XLS file:", error);
      throw error;
    }
  }

  // 🟢 Convert XLS/XLSX to JSON
  private xlsxToJson(filePath: string): BondDataSet[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in the XLS/XLSX file.");
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`Worksheet "${sheetName}" is missing or corrupted.`);
    }

    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: "yyyy-mm-dd",
    });

    const outputPath = path.join(process.cwd(), "bonds.json");
    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

    console.log(`✅ JSON file created at: ${outputPath}`);
    return jsonData as BondDataSet[];
  }

  // 🟢 Public method to fetch + download + parse NSDL data
  public async fetchBondData(): Promise<BondDataSet[]> {
    try {
      const fileLink = await this.getNsdlFileLink();
      const filePath = await this.downloadXlsFile(fileLink);
      const bondData = this.xlsxToJson(filePath);
      return bondData;
    } catch (error) {
      console.error("Error in fetchBondData:", error);
      throw error;
    }
  }
}
