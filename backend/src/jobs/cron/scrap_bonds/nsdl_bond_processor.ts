import { type $Enums, type DataBaseSchema } from "@core/database/database";
import dayjs from "dayjs";
import { allCompanyNameOrTyes } from "./all_company_data";
import { type BondDataSet } from "./nsdl_bond_service";
import fs from "fs";
import { absoluteDataApiFromEnv } from "@modules/absolutedata/absolutedata.api";
import { mergeAbsoluteDataIntoBond } from "@modules/absolutedata/absolutedata.bonds.mapper";
import type { AbsoluteDataGetBondByIsinResult } from "@modules/absolutedata/absolutedata.types";
import { env } from "@packages/config/src/env";

export class NsdlBondProcessor {
  constructor(private bond: BondDataSet) { }

  private toIstDateOnly(isoDateTime?: string | null): string | null {
    if (!isoDateTime) return null;
    const dt = new Date(isoDateTime);
    if (Number.isNaN(dt.getTime())) return null;

    // Convert the instant to IST, then format as YYYY-MM-DD.
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
    const ist = new Date(dt.getTime() + IST_OFFSET_MS);

    const y = ist.getUTCFullYear();
    const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
    const d = String(ist.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  /**
   * NSDL XLS sometimes contains placeholder maturity like 31-12-9999, but during parsing
   * it can get truncated/normalized to a 2-digit year (e.g. 31-12-99). JavaScript then
   * interprets "99" as 1999. This parser expands 2-digit years safely and preserves the
   * 9999 placeholder when it appears as 31-12-99 / 31/12/99 / 31.12.99.
   */
  private parseNsdlDateString(raw: string): Date | null {
    const s = (raw ?? "").toString().trim();
    if (!s) return null;

    // If it's a numeric string, it might be an Excel serial number.
    if (/^\d+(\.\d+)?$/.test(s)) {
      const n = Number(s);
      if (!Number.isFinite(n)) return null;
      // Avoid treating 2-digit years ("99") as dates.
      if (n <= 100) return null;
      // Typical Excel date serials are in the ~20k..60k range.
      if (n >= 1000 && n <= 80000) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        return new Date(excelEpoch.getTime() + n * millisecondsPerDay);
      }
      // Otherwise, let other parsing try.
    }

    // Handle common dd-mm-yy / dd/mm/yy / dd.mm.yy and dd-mm-yyyy etc.
    const dmy = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})$/.exec(s);
    if (dmy) {
      const day = Number(dmy[1]);
      const month = Number(dmy[2]);
      let yearRaw = dmy[3]!;
      let year = Number(yearRaw);
      if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
        return null;
      }
      if (yearRaw.length === 2) {
        // Preserve NSDL perpetual placeholder (commonly 31-12-9999 -> 31-12-99 after truncation)
        if (year === 99 && day === 31 && month === 12) {
          year = 9999;
        } else {
          // Expand 2-digit years as 20xx (avoids JS mapping to 19xx).
          year = 2000 + year;
        }
      }
      // Build in UTC to avoid local timezone shifting the date.
      const dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    // Handle yyyy-mm-dd / yyyy/mm/dd / yyyy.mm.dd
    const ymd = /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/.exec(s);
    if (ymd) {
      const year = Number(ymd[1]);
      const month = Number(ymd[2]);
      const day = Number(ymd[3]);
      const dt = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    return null;
  }

  // Extract dates from text using multiple formats UTIL function
  private extractDatesFromText(text: string) {
    const formats = [
      "D MMMM YYYY", // 6 June 2025
      "DD MMMM YYYY", // 06 June 2025
      "D MMM YYYY", // 6 Jun 2025
      "DD MMM YYYY", // 06 Jun 2025
      "D MMM, YYYY", // 6 Jun, 2025
      "DD MMM, YYYY", // 06 Jun, 2025
      "D MMMM, YYYY", // 6 June, 2025
      "DD MMMM, YYYY", // 06 June, 2025

      "D/MM/YYYY", // 6/06/2025
      "DD/MM/YYYY", // 06/06/2025
      "D/M/YYYY", // 6/6/2025
      "DD/M/YYYY", // 06/6/2025
      "D/MMM/YYYY", // 6/Jun/2025
      "DD/MMM/YYYY", // 06/Jun/2025

      "D-M-YYYY", // 6-6-2025
      "DD-MM-YYYY", // 06-06-2025
      "D-MM-YYYY", // 6-06-2025
      "D-MMM-YYYY", // 6-Jun-2025
      "DD-MMM-YYYY", // 06-Jun-2025
      "DD-MMM-YY", // 06-Jun-25
      "DD-MM-YY", // 06-06-25
      "D-M-YY", // 6-6-25
      "DD MM YY", // 06 06 25
      "D MM YY", // 6 06 25

      "D.M.YYYY", // 6.6.2025
      "DD.MM.YYYY", // 06.06.2025
      "D.MM.YYYY", // 6.06.2025

      "YYYY-MM-DD", // 2025-06-06
      "YYYY/MM/DD", // 2025/06/06
      "YYYY.MM.DD", // 2025.06.06

      "MMM D, YYYY", // Jun 6, 2025
      "MMMM D, YYYY", // June 6, 2025
      "MMM DD, YYYY", // Jun 06, 2025
      "MMMM DD, YYYY", // June 06, 2025

      "DDMMYYYY", // 06062025
      "DMMYYYY", // 6062025
      "DDMMYY", // 060625
      "DMMYY", // 6625
    ];

    function parseToDate(input: string): Date | null {
      for (const format of formats) {
        const parsed = dayjs(input, format, true);
        if (parsed.isValid()) {
          return parsed.toDate();
        }
      }
      return null;
    }
    return parseToDate(text);
  }
  private convertUTCToIST(utcDateTimeStr?: string) {
    if (!utcDateTimeStr) {
      return null;
    }
    const utcDate = new Date(utcDateTimeStr);

    // IST Offset: +5 hours 30 minutes = 19800000 milliseconds
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + IST_OFFSET);

    const formattedIST = istDate.toLocaleString();

    return new Date(formattedIST).toISOString();
  }
  private getStructuredDate(serialDate: string | number) {
    if (typeof serialDate === "number") {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's day 0 (Dec 30, 1899)
      const millisecondsPerDay = 24 * 60 * 60 * 1000;

      // Convert serial number to milliseconds and add to epoch
      const date = new Date(
        excelEpoch.getTime() + serialDate * millisecondsPerDay
      );
      // console.log(`Converted serial date ${serialDate} to JS Date: ${date.toISOString()}`);

      // Keep behavior consistent with string parsing: store IST ISO in DB.
      return this.convertUTCToIST(date.toISOString());
    }

    const raw = (serialDate ?? "").toString().trim();

    // Avoid JS Date quirks: "99" becomes 1999-01-01 in many environments.
    if (/^\d{1,2}$/.test(raw)) {
      return null;
    }

    // Prefer explicit NSDL-safe parsing (prevents "99" => 1999).
    const nsdlParsed = this.parseNsdlDateString(raw);
    if (nsdlParsed) {
      return this.convertUTCToIST(nsdlParsed.toISOString());
    }

    // Fallback: try dayjs formats list before JS Date (JS Date is locale-dependent).
    const extracted = this.extractDatesFromText(raw);
    if (extracted) return this.convertUTCToIST(extracted.toISOString());

    const jsDate = new Date(raw);
    if (isNaN(jsDate.getTime())) return null;
    return this.convertUTCToIST(jsDate.toISOString());
  }
  private formatString(str: string | number | undefined) {
    if (str === undefined) {
      return "";
    } else {
      return String(str);
    }
  }
  private fixRangeFloat(num: number) {
    const len = num.toString().length;
    if (len < 4) {
      return parseFloat(num.toFixed(4));
    }
    return num;
  }

  // Extract bond corporate name from bond data
  private getBondCorporateName(companyName?: string) {
    if (!companyName) {
      return "N/A";
    }
    const findCompany = allCompanyNameOrTyes.find(
      (e) => e.EntityName.toLowerCase() == companyName.toLowerCase()
    );
    return findCompany?.ISector || "N/A";
  }

  // Check if bond is perpetual
  private isPerpetualBond() {
    return this.bond.NAME_OF_THE_INSTRUMENT?.toLocaleLowerCase().includes(
      " perpetual "
    );
  }

  // Check if bond is zero coupon
  private isZeroCouponBond() {
    const rate = this.getCouponRate();
    return rate == 0;
  }

  // Extract coupon rate from bond data
  private getCouponRate() {
    const rate = this.bond.COUPON_RATE;

    if (!isNaN(rate)) {
      const val = rate < 1 ? rate * 100 : rate;
      return this.fixRangeFloat(+val);
    }

    const match = rate?.match(/([\d.]+)%/); // Match number followed by %

    if (!match) return 0;

    const num = parseFloat(match[0]);

    if (isNaN(num)) {
      return 0;
    }
    return this.fixRangeFloat(num);
  }

  // Extract credit rating from bond data
  private getCreditRating() {
    const suffixList = [" (SO)", " (CE)"];
    const notNeeded = ["PP-MLD", "PP-MLD?"];

    const ratingRaw = this.bond.CREDIT_RATING_CREDIT_RATING_AGENCY?.trim();

    if (!ratingRaw || ratingRaw.length === 0) {
      return "UnRated";
    }

    // Find suffix like (SO) or (CE)
    let suffix = "";
    for (const s of suffixList) {
      if (ratingRaw.includes(s)) {
        suffix = s.trim();
        break;
      }
    }

    // Split rating string by space
    const parts = ratingRaw.split(" ").filter(Boolean);
    if (parts.length === 0) return "UnRated";

    let rating = parts[0];

    if (!rating) {
      return "UnRated";
    }

    // Handle unwanted prefixes (like PP-MLD)
    if (notNeeded.includes(rating)) {
      rating = parts[1] || "";
    }

    // Remove trailing 'r' if exists
    if (rating.endsWith("r")) {
      rating = rating.slice(0, -1);
    }

    rating = rating.trim();
    return rating.length > 0 ? rating + suffix : "UnRated";
  }

  // Extract rating company and date from bond data
  private extractRatingCompanyAndDate() {
    const str = this.bond.CREDIT_RATING_CREDIT_RATING_AGENCY;
    const ratings = [
      "AAA",
      "AA+",
      "AA",
      "AA-",
      "A+",
      "A",
      "A-",
      "BBB+",
      "BBB",
      "BBB-",
      "BB+",
      "BB",
      "BB-",
      "B+",
      "B",
      "B-",
      "C+",
      "C",
      "C-",
      "D",
      "PP-MLD",
      "PP-MLD?",
      "A+(CE)",
      "A-(CE)",
      "AAA(CE)",
      "A(CE)",
      "AA(CE)",
      "BB+(CE)",
      "BBB-(CE)",
      "BB-(CE)",
      "B(CE)",
      "AA-(CE)",
      "BB-(SO)",
      "A1+(SO)",
      "AA+r",
      "AA-r",
      "AAAr",
      "A++",
      "A2",
    ];

    if (!str) return null;

    const normalized = str.trim().toUpperCase();

    // Extract date in DD-MM-YYYY format
    const dateMatch = normalized.match(/\b\d{2}-\d{2}-\d{4}\b/);
    const date = dateMatch ? dateMatch[0] : null;

    // Find the first matching rating token
    const ratingMatch = ratings.find((rating) => normalized.includes(rating));

    if (!ratingMatch) return null;

    // Split around the rating to isolate the possible company part
    const beforeRating = normalized.split(ratingMatch)[0]?.trim();
    if (!beforeRating) {
      return null;
    }

    // If "DT" is present (e.g., "HDFC LTD AA+ DT 15-08-2025")
    let companyName = beforeRating;
    if (beforeRating.includes("DT")) {
      companyName = beforeRating.split("DT")[0]?.trim() || "N/A";
    }

    // Clean up redundant symbols
    companyName = companyName
      .replace(/\s+/g, " ")
      .replace(/[^A-Z0-9&\s.-]/g, "")
      .trim();

    if (!companyName || !date) return null;

    return {
      companyName,
      date: this.extractDatesFromText(date),
    };
  }

  // Extract date of allotment from bond data
  private getDateOfAllotment() {
    const dateField = this.bond.DATE_OF_ALLOTMENT;
    if (!dateField) throw new Error("Date of Allotment is missing");
    const dateOfAllotment = this.getStructuredDate(dateField);
    if (!dateOfAllotment) throw new Error("Date of Allotment is missing");
    return dateOfAllotment;
  }

  // Extract redemption date from bond data
  private getRedemptionDate(logToFile = true) {
    const dateField = this.bond.REDEMPTION;
    let redemptionDate = dateField ? this.getStructuredDate(dateField) : null;

    // NSDL perpetual bonds often use a 9999 placeholder that can get truncated.
    // If we can't parse redemption but bond looks perpetual, keep a consistent max date.
    if (!redemptionDate && this.isPerpetualBond()) {
      redemptionDate = this.convertUTCToIST(
        new Date(Date.UTC(9999, 11, 31, 0, 0, 0)).toISOString(),
      );
    }

    if (logToFile) {
      const line = `ISIN:${this.bond.ISIN} | DATE:${redemptionDate} | ${dateField}\n`;
      fs.appendFileSync("redemptions.txt", line);
    }

    return redemptionDate;
  }

  // Extract taxable information from bond data
  private getTaxable(): $Enums.TAX_TYPE {
    const text = this.bond.NAME_OF_THE_INSTRUMENT;
    if (typeof text !== "string") return "UNKNOWN";

    const lower = text.toLowerCase();

    if (lower.includes("free")) {
      return "TAX_FREE";
    }

    if (lower.includes("tax") && !lower.includes("free")) {
      return "TAXABLE";
    }

    if (lower.includes("tax") && lower.includes("saving")) {
      return "TAX_SAVING";
    }

    if (lower.includes("tax") && lower.includes("exemption")) {
      return "TAX_EXEMPTION";
    }

    // Not enough info to determine
    return "UNKNOWN";
  }
  // Extract interest frequency from bond data
  private getInterestFrequency(): $Enums.INTEREST_MODE {
    const text = this.bond.FREQUENCY_OF_THE_INTEREST_PAYMENT;
    if (typeof text !== "string") return "ON_MATURITY";

    const lower = text.toLowerCase();

    const monthlyTerms = [
      "monthly",
      "monthy",
      "twelve times a year",
      "every month",
      "per month",
    ];

    // Quarterly
    const quarterlyTerms = [
      "quarterly",
      "quartely",
      "qaurterly",
      "quaterly",
      "quately",
      "once a quarter",
      "querterly",
      "every quarter",
      "every 3 months",
    ];

    // Half Yearly
    const halfYearlyTerms = [
      "semi-annually",
      "semi anually",
      "semi annually",
      "semi annnually",
      "semiannualy",
      "every 6 months",
      "half yearly",
      "halfyearly",
      "twice a year",
    ];

    // Yearly
    const yearlyTerms = [
      "annually",
      "yearly",
      "anually",
      "once a year",
      "annual",
      "annualy",
      "every year",
      "annul",
      "annaully",
      "anualy",
    ];

    // On Maturity
    const maturityTerms = [
      "on maturity",
      "at maturity",
      "on matyurity",
      "bullet payment",
      "on matuirty",
    ];

    const matchesAny = (terms: string[]) =>
      terms.some((term) => lower.includes(term));

    if (matchesAny(monthlyTerms)) return "MONTHLY";
    if (matchesAny(quarterlyTerms)) return "QUARTERLY";
    if (matchesAny(halfYearlyTerms)) return "HALF_YEARLY";
    if (matchesAny(yearlyTerms)) return "YEARLY";
    if (matchesAny(maturityTerms)) return "ON_MATURITY";
    return "UNKNOWN";
  }

  // Extract listed bond information from bond data
  private isListedBond(): $Enums.IS_LISTED {
    const instrumentName = this.bond.NAME_OF_THE_INSTRUMENT || "";
    if (instrumentName.toLowerCase().includes(" listed ")) {
      return "YES";
    } else if (instrumentName.toLowerCase().includes(" unlisted ")) {
      return "NO";
    }
    return "UNKNOWN";
  }

  // Check if bond is a new release (issued within the last month)
  private isNewReleaseBond() {
    const date = this.getDateOfAllotment();
    const now = new Date();
    const releaseDate = new Date(date);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    return releaseDate >= oneMonthAgo && releaseDate <= now;
  }

  isConvertible() {
    const instrumentName = this.bond.NAME_OF_THE_INSTRUMENT || "";
    if (instrumentName.toLocaleLowerCase().includes("non")) {
      return false;
    } else if (instrumentName.toLocaleLowerCase().includes("convertible")) {
      return true;
    }
    return false;
  }

  // Get bond categories based on various attributes
  private getBondCategories() {
    const isector = this.getBondCorporateName(this.bond.COMPANY);
    const taxFree = this.getTaxable() == "TAX_FREE";
    const perpetual = this.isPerpetualBond();
    const zeroCoupon = this.isZeroCouponBond();
    const isConvertible = this.isConvertible();
    const isNewRelease = this.isNewReleaseBond();

    const category = [];

    if (isector) {
      category.push(isector);
    }

    if (taxFree) {
      category.push("tax-free");
    }

    if (perpetual) {
      category.push("perpetual");
    }

    if (zeroCoupon) {
      category.push("zero-coupon");
    }

    if (isConvertible) {
      category.push("convertible");
    }

    if (isNewRelease) {
      category.push("latest-release");
    }

    return category.map((c) => c.toLowerCase());
  }

  public parseData(): DataBaseSchema.BondsCreateInput {
    const redemptionDate = this.getRedemptionDate(true);
    console.log(this.bond.ISIN, redemptionDate);

    const dateOfAllotment = this.getDateOfAllotment();

    return {
      isin: this.formatString(this.bond.ISIN),
      bondName: this.formatString(this.bond.COMPANY),
      instrumentName: this.formatString(this.bond.NAME_OF_THE_INSTRUMENT),
      description: this.formatString(this.bond.DESCRIPTION_IN_NSDL),
      issuePrice: Number(this.bond.ISSUE_PRICE) || 0,
      faceValue: Number(this.bond.FACE_VALUE) || 0,
      couponRate: this.getCouponRate(),
      interestPaymentFrequency: this.getInterestFrequency(),
      putCallOptionDetails: this.formatString(this.bond.PUT_CALL_OPTION),
      certificateNumbers: this.formatString(this.bond.CERTIFICATE_NOS),
      totalIssueSize: Number(this.bond.TOTAL_ISSUE_SIZE),
      registrarDetails: this.formatString(this.bond.REGISTRAR_WITH_BP_ID_NO),
      physicalSecurityAddress: this.formatString(
        this.bond.ADDRESS_WHERE_PHYSICAL_SECURITIES_IS_TO_BE_SENT
      ),
      defaultedInRedemption: this.formatString(
        this.bond.DEFAULTED_IN_REDEMPTION
      ),
      debentureTrustee: this.formatString(this.bond.DEFAULTED_IN_REDEMPTION),
      creditRatingInfo: this.formatString(
        this.bond.CREDIT_RATING_CREDIT_RATING_AGENCY
      ),
      remarks: this.formatString(this.bond.REMARKS),
      taxStatus: this.getTaxable(),
      redemptionDate,
      creditRating: this.getCreditRating(),
      interestPaymentMode: this.getInterestFrequency(),
      isListed: this.isListedBond(),
      ratingAgencyName:
        this.extractRatingCompanyAndDate()?.companyName || "N/A",
      ratingDate: this.extractRatingCompanyAndDate()?.date,
      categories: this.getBondCategories(),
      sectorName: this.getBondCorporateName(this.bond.COMPANY),
      dateOfAllotment,
      dateOfAllotmentIst: this.toIstDateOnly(dateOfAllotment),
      maturityDate: redemptionDate,
      maturityDateIst: this.toIstDateOnly(redemptionDate),
      maturityDateOnly: this.toIstDateOnly(redemptionDate),
      redemptionDateIst: this.toIstDateOnly(redemptionDate),
      ratingDateIst: this.extractRatingCompanyAndDate()?.date ? this.toIstDateOnly(this.extractRatingCompanyAndDate()!.date?.toISOString()) : undefined,
    };
  }


  public async getAbsoluteData(
    isin: string,
  ): Promise<AbsoluteDataGetBondByIsinResult | null> {
    if (!env.ABSOLUTE_DATA_API_KEY?.trim()) {
      return null;
    }
    try {
      const api = absoluteDataApiFromEnv();
      return await api.getBondByIsin(isin);
    } catch {
      return null;
    }
  }

  /** NSDL scrape + Absolute Data enrichment when API key is configured. */
  public async parse(): Promise<DataBaseSchema.BondsCreateInput> {
    const data = this.parseData();
    const isin = pickStr(data.isin);
    if (!isin) return data;

    const abResult = await this.getAbsoluteData(isin);
    if (!abResult?.ok || !abResult.data.items.length) {
      return data;
    }

    return mergeAbsoluteDataIntoBond(data, abResult.data.items[0]!);
  }
}

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}
