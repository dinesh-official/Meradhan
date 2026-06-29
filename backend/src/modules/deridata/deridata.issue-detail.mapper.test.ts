import { describe, it, expect } from "bun:test";
import { mapIssueDetailToRow, mapIssueDetailToBonds } from "./deridata.issue-detail.mapper";
import type { IssueDetail } from "./deridata.api";

const sample: IssueDetail = {
  isin: "INE2OTQ07077",
  did: "0685NABARDJAN298EQ2",
  coupon: "6.2626%",
  coupon_fixed: 6.2626,
  coupon_type: "Fixed",
  coupon_frequency: "Quarterly",
  maturity: "11-Apr-2028",
  issue_date: "26-Jun-2023",
  allotment_date: "26-Jun-2023",
  coupon_date: "11-Apr-2026",
  face_value: 100000,
  record_date: 15,
  issuer_name: "FEDBANK FINANCIAL SERVICES LIMITED",
  issuer_industry: "NBFC",
  seniority: "Senior",
  security: "Secured",
  listed: "NSE",
  tax_free: "No",
  current_rating: ["CARE: AA+", "IND: AA+"],
  rating_agency: ["CARE", "IND"],
  tags: [],
  total_issue_size_cr: 200,
} as IssueDetail;

describe("mapIssueDetailToRow", () => {
  it("copies scalar fields and parses dates to IST ISO", () => {
    const row = mapIssueDetailToRow(sample);
    expect(row.isin).toBe("INE2OTQ07077");
    expect(row.did).toBe("0685NABARDJAN298EQ2");
    expect(row.couponFixed).toBe(6.2626);
    expect(row.maturity).toBe("2028-04-11T05:30:00.000Z");
    expect(row.faceValue).toBe(100000);
    expect(row.currentRating).toEqual(["CARE: AA+", "IND: AA+"]);
    expect(row.raw).toBeDefined();
    expect(row.fetchedAt).toBeInstanceOf(Date);
  });
});

describe("mapIssueDetailToBonds", () => {
  it("maps enums and catalog fields Deridata supplies", () => {
    const b = mapIssueDetailToBonds(sample);
    expect(b.bondName).toBe("FEDBANK FINANCIAL SERVICES LIMITED");
    expect(b.faceValue).toBe(100000);
    expect(b.interestPaymentMode).toBe("QUARTERLY");
    expect(b.taxStatus).toBe("TAXABLE");
    expect(b.natureOfInstrument).toBe("SECURED");
    expect(b.seniority).toBe("SENIOR");
    expect(b.isListed).toBe("YES");
    expect(b.exchangeListedOn).toBe("NSE");
    expect(b.maturityDate).toBe("2028-04-11T05:30:00.000Z");
  });

  it("treats tax_free=Yes as TAX_FREE and unlisted as NO/UNKNOWN", () => {
    const b = mapIssueDetailToBonds({ ...sample, tax_free: "Yes", listed: null } as IssueDetail);
    expect(b.taxStatus).toBe("TAX_FREE");
    expect(b.isListed).toBe("NO");
    expect(b.exchangeListedOn).toBe("UNKNOWN");
  });
});
