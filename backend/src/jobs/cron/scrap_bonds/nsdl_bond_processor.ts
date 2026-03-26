import { type $Enums, type DataBaseSchema } from "@core/database/database";
import dayjs from "dayjs";
import { allCompanyNameOrTyes } from "./all_company_data";
import { type BondDataSet } from "./nsdl_bond_service";
import fs from "fs";

export class NsdlBondProcessor {
  constructor(private bond: BondDataSet) { }

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
      // Handle cases where the date is in string format
      const excelEpoch = new Date(Date.UTC(1899, 11, 30)); // Excel's day 0 (Dec 30, 1899)
      const millisecondsPerDay = 24 * 60 * 60 * 1000;

      // Convert serial number to milliseconds and add to epoch
      const date = new Date(
        excelEpoch.getTime() + serialDate * millisecondsPerDay
      );
      // console.log(`Converted serial date ${serialDate} to JS Date: ${date.toISOString()}`);

      return date.toISOString(); // Return ISO string format
    }

    const jsDate = new Date(serialDate); // Convert to JavaScript Date
    if (isNaN(jsDate.getTime())) {
      return this.convertUTCToIST(
        this.extractDatesFromText(serialDate.toString().trim())?.toISOString()
      );
    } else {
      return this.convertUTCToIST(jsDate.toISOString());
    }
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
  private getRedemptionDate() {
    const dateField = this.bond.REDEMPTION;
    const redemptionDate = this.getStructuredDate(dateField);
    const line = `ISIN:${this.bond.ISIN} | DATE:${redemptionDate} | ${dateField}\n`;
    fs.appendFileSync("redemptions.txt", line);

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

  // Main parse function to extract and structure bond data
  public parse(): DataBaseSchema.BondsCreateInput {
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
      redemptionDate: this.getRedemptionDate(),
      creditRating: this.getCreditRating(),
      interestPaymentMode: this.getInterestFrequency(),
      isListed: this.isListedBond(),
      ratingAgencyName:
        this.extractRatingCompanyAndDate()?.companyName || "N/A",
      ratingDate: this.extractRatingCompanyAndDate()?.date,
      categories: this.getBondCategories(),
      sectorName: this.getBondCorporateName(this.bond.COMPANY),
      dateOfAllotment: this.getDateOfAllotment(),
      maturityDate: this.getRedemptionDate(),
    };
  }
}
