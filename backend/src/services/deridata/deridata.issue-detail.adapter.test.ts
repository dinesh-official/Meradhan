import { describe, expect, test } from "bun:test";
import {
  convertIssueSizeCroreToRupees,
  mapDeriDataIssueDetailToBondFields,
  mapDeriDataTagsToCategories,
  parseDeriDataIssueDateYmd,
} from "./deridata.issue-detail.adapter";
import type { DeriDataIssueDetailItem } from "./deridata.types";

const sample: DeriDataIssueDetailItem = {
  isin: "INE2OTQ07077",
  did: "0000SILHOM21FEB277077",
  coupon: "Zero Coupon",
  maturity: "21-Feb-2027",
  issue_date: "16-Feb-2026",
  face_value: 2500000.0,
  coupon_fixed: "0.0000",
  coupon_frequency: "On Maturity",
  record_date: 15,
  coupon_date: null,
  issuer_id: 993,
  issuer_name: "SILVERLINE HOMES PRIVATE LIMITED",
  description:
    "SECURED UNRATED UNLISTED REDEEMABLE NON CONVERTIBLE DEBENTURE SERIES 2 TRANCHE 3 DATE OF MATURITY 21/02/2027",
  seniority: "Senior",
  security: "Secured",
  rating_agency: [],
  current_rating: [],
  outlook: [],
  listed: null,
  tax_free: "No",
  allotment_date: "16-Feb-2026",
  issuer_industry: "Real Estate",
  instrument_type: ["PLAIN VANILLA"],
  total_issue_size_cr: "9.5000",
  coupon_type: null,
  redemption_type: "Bullet",
  put_date: "NA",
  put_amount: "NA",
  call_date: "NA",
  call_amount: "NA",
  tags: ["ZERO COUPON", "REITS/RE"],
  first_interest_date: null,
};

describe("deridata.issue-detail.adapter", () => {
  test("parseDeriDataIssueDateYmd", () => {
    expect(parseDeriDataIssueDateYmd("21-Feb-2027")).toBe("2027-02-21");
    expect(parseDeriDataIssueDateYmd("NA")).toBeNull();
  });

  test("map tags to categories", () => {
    expect(mapDeriDataTagsToCategories(["ZERO COUPON", "REITS/RE"])).toEqual([
      "zero-coupon",
    ]);
  });

  test("maps sample issue-detail to bond fields", () => {
    const mapped = mapDeriDataIssueDetailToBondFields(sample);
    expect(mapped.bondName).toBe("SILVERLINE HOMES PRIVATE LIMITED");
    expect(mapped.faceValue).toBe(2500000);
    expect(mapped.couponRate).toBe(0);
    expect(mapped.interestPaymentMode).toBe("ON_MATURITY");
    expect(mapped.natureOfInstrument).toBe("SECURED");
    expect(mapped.seniority).toBe("SENIOR");
    expect(mapped.taxStatus).toBe("TAXABLE");
    expect(mapped.maturityDate).toBe("2027-02-21");
    expect(mapped.dateOfAllotment).toBe("2026-02-16");
    expect(mapped.recordDays).toBe(15);
    expect(mapped.redemptionType).toBe("Bullet");
    expect(mapped.couponType).toBe("Zero Coupon");
    expect(convertIssueSizeCroreToRupees(9.5)).toBe(95_000_000);
    expect(mapped.totalIssueSize).toBe(95_000_000);
    expect(mapped.sectorName).toBe("Real Estate");
    expect(mapped.categories).toEqual(["zero-coupon"]);
    expect(mapped.creditRating).toBe("UnRated");
    expect(mapped.putCallOptionDetails).toBeNull();
  });

  test("formats object-shaped ratings without [object Object] or agency duplication", () => {
    const rated: DeriDataIssueDetailItem = {
      ...sample,
      rating_agency: ["ICRA"],
      current_rating: ["ICRA: A+"],
      outlook: [{ outlook: "Stable" }],
    };
    const mapped = mapDeriDataIssueDetailToBondFields(rated);
    expect(mapped.creditRatingInfo).toBe("ICRA: A+ (Stable)");
    expect(mapped.creditRating).toBe("A+");
    expect(mapped.ratingAgencyName).toBe("ICRA");
  });

  test("converts issue size crore to absolute rupees", () => {
    const large: DeriDataIssueDetailItem = {
      ...sample,
      total_issue_size_cr: "529.2",
    };
    const mapped = mapDeriDataIssueDetailToBondFields(large);
    expect(mapped.totalIssueSize).toBe(5_292_000_000);
  });

  test("maps exchange names like BSE/NSE to listed YES", () => {
    const bseListed: DeriDataIssueDetailItem = {
      ...sample,
      listed: "BSE",
    };
    const nseListed: DeriDataIssueDetailItem = {
      ...sample,
      listed: "NSE",
    };

    expect(mapDeriDataIssueDetailToBondFields(bseListed).isListed).toBe("YES");
    expect(mapDeriDataIssueDetailToBondFields(nseListed).isListed).toBe("YES");
  });

  test("formats put/call from DeriData without NA placeholders", () => {
    const withPutCall: DeriDataIssueDetailItem = {
      ...sample,
      put_date: "21-Feb-2028",
      put_amount: "100.00",
      call_date: "21-Feb-2029",
      call_amount: "101.00",
    };
    const mapped = mapDeriDataIssueDetailToBondFields(withPutCall);
    expect(mapped.putCallOptionDetails).toBe(
      "Put: 21-Feb-2028 Call: 21-Feb-2029",
    );
  });

  test("formats fully nested rating objects", () => {
    const rated: DeriDataIssueDetailItem = {
      ...sample,
      rating_agency: [{ agency: "ICRA" }],
      current_rating: [{ rating: "A+", outlook: "Positive" }],
      outlook: [],
    };
    const mapped = mapDeriDataIssueDetailToBondFields(rated);
    expect(mapped.creditRatingInfo).toBe("ICRA: A+ (Positive)");
    expect(mapped.creditRating).toBe("A+");
  });
});
