import { type $Enums, type DataBaseSchema } from "@core/database/database";
import type { IssueDetail } from "./deridata.api";
import { deridataDateToIstIso, deridataDateToIstDateOnly } from "./deridata.date";

const pickStr = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /^(n\/?a|-)$/i.test(s)) return undefined;
  return s;
};
const pickNum = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

function mapInterestMode(freq: string | null | undefined): $Enums.INTEREST_MODE | undefined {
  const f = pickStr(freq)?.toLowerCase();
  if (!f) return undefined;
  if (f.includes("month")) return "MONTHLY";
  if (f.includes("quarter")) return "QUARTERLY";
  if (f.includes("semi") || f.includes("half")) return "HALF_YEARLY";
  if (f.includes("annual") || f.includes("year")) return "YEARLY";
  if (f.includes("maturity")) return "ON_MATURITY";
  return undefined;
}

export function mapTaxStatus(taxFree: string | null | undefined): $Enums.TAX_TYPE | undefined {
  const t = pickStr(taxFree)?.toLowerCase();
  if (!t) return undefined;
  if (t === "yes" || t.includes("free")) return "TAX_FREE";
  if (t === "no") return "TAXABLE";
  return undefined;
}

function mapNature(security: string | null | undefined): $Enums.INSTRUMENT_SECURITY | undefined {
  const v = pickStr(security)?.toLowerCase();
  if (!v) return undefined;
  if (v.includes("unsecured")) return "UNSECURED";
  if (v.includes("secured")) return "SECURED";
  return "UNKNOWN";
}

export function mapSeniority(s: string | null | undefined): $Enums.BOND_SENIORITY | undefined {
  const v = pickStr(s)?.toLowerCase();
  if (!v) return undefined;
  if (v.startsWith("senior")) return "SENIOR";
  if (v.includes("tier 2") || v.includes("tier ii")) return "TIER_2_SUBORDINATED";
  if (v.includes("lower tier")) return "LOWER_TIER_II_SUBORDINATED";
  return "UNKNOWN";
}

/** Deridata `listed`: "NSE" | "BSE" | "NSE: BSE" | null (null ⇒ unlisted). */
export function mapListed(listed: string | null | undefined): {
  isListed: $Enums.IS_LISTED;
  exchange: $Enums.STOCK_EXCHANGE;
} {
  const e = pickStr(listed)?.toUpperCase();
  if (!e) return { isListed: "NO", exchange: "UNKNOWN" };
  const hasNse = e.includes("NSE");
  const hasBse = e.includes("BSE");
  const exchange: $Enums.STOCK_EXCHANGE =
    hasNse && hasBse ? "BOTH" : hasNse ? "NSE" : hasBse ? "BSE" : "UNKNOWN";
  return { isListed: "YES", exchange };
}

export function mapIssueDetailToRow(
  item: IssueDetail,
): DataBaseSchema.DeridataIssueDetailCreateInput {
  return {
    isin: String(item.isin ?? "").trim().toUpperCase(),
    did: pickStr(item.did),
    coupon: pickStr(item.coupon),
    couponFixed: pickNum(item.coupon_fixed),
    couponType: pickStr(item.coupon_type),
    couponFrequency: pickStr(item.coupon_frequency),
    issuerName: pickStr(item.issuer_name),
    description: pickStr(item.description),
    issuerIndustry: pickStr(item.issuer_industry),
    seniority: pickStr(item.seniority),
    security: pickStr(item.security),
    listed: pickStr(item.listed),
    taxFree: pickStr(item.tax_free),
    redemptionType: pickStr(item.redemption_type),
    redemptionPremium: pickStr(item.redemption_premium),
    faceValue: pickNum(item.face_value),
    recordDate: pickNum(item.record_date),
    totalIssueSizeCr: pickNum(item.total_issue_size_cr),
    maturity: deridataDateToIstIso(item.maturity),
    maturityIst: deridataDateToIstDateOnly(item.maturity),
    issueDate: deridataDateToIstIso(item.issue_date),
    issueDateIst: deridataDateToIstDateOnly(item.issue_date),
    allotmentDate: deridataDateToIstIso(item.allotment_date),
    allotmentDateIst: deridataDateToIstDateOnly(item.allotment_date),
    couponDate: deridataDateToIstIso(item.coupon_date),
    couponDateIst: deridataDateToIstDateOnly(item.coupon_date),
    currentRating: (item.current_rating ?? []).filter((x): x is string => typeof x === "string"),
    ratingAgency: (item.rating_agency ?? []).filter((x): x is string => typeof x === "string"),
    instrumentType: (item.instrument_type ?? []).filter((x): x is string => typeof x === "string"),
    tags: (item.tags ?? []).filter((x): x is string => typeof x === "string"),
    outlook: (item.outlook ??
      undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["outlook"],
    redemption: (item.redemption ??
      undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["redemption"],
    financialCovenants: (item.financial_covenants ??
      undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["financialCovenants"],
    raw: item as unknown as DataBaseSchema.DeridataIssueDetailCreateInput["raw"],
    fetchedAt: new Date(),
  };
}

export function mapIssueDetailToBonds(
  item: IssueDetail,
): Partial<DataBaseSchema.BondsUpdateInput> {
  const { isListed, exchange } = mapListed(item.listed);
  const out: Partial<DataBaseSchema.BondsUpdateInput> = {
    bondName: pickStr(item.issuer_name),
    description: pickStr(item.description),
    couponRate: pickNum(item.coupon_fixed),
    couponType: pickStr(item.coupon_type),
    interestPaymentFrequency: pickStr(item.coupon_frequency),
    interestPaymentMode: mapInterestMode(item.coupon_frequency),
    faceValue: pickNum(item.face_value),
    totalIssueSize: pickNum(item.total_issue_size_cr),
    sectorName: pickStr(item.issuer_industry),
    taxStatus: mapTaxStatus(item.tax_free),
    natureOfInstrument: mapNature(item.security),
    seniority: mapSeniority(item.seniority),
    isListed,
    exchangeListedOn: exchange,
    redemptionType: pickStr(item.redemption_type),
    maturityDate: deridataDateToIstIso(item.maturity),
    maturityDateIst: deridataDateToIstDateOnly(item.maturity),
    dateOfAllotment: deridataDateToIstIso(item.allotment_date),
    dateOfAllotmentIst: deridataDateToIstDateOnly(item.allotment_date),
    providerName: "Deridata",
  };
  return out;
}
