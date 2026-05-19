import { type $Enums, type DataBaseSchema } from "@core/database/database";
import type { AbsoluteDataBondItem } from "./absolutedata.types";

type BondsCreateInput = DataBaseSchema.BondsCreateInput;

const pickStr = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
};

/** `YYYY-MM-DD` → IST-aligned ISO string (same convention as NSDL scraper). */
export function absoluteDataYmdToIstIso(ymd: string | null | undefined): string | null {
  const s = pickStr(ymd);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const utc = new Date(Date.UTC(y!, m! - 1, d!, 0, 0, 0));
  if (Number.isNaN(utc.getTime())) return null;
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(utc.getTime() + IST_OFFSET_MS);
  return ist.toISOString();
}

const ymdToIstDateOnly = (ymd: string | null | undefined): Date | undefined => {
  const iso = absoluteDataYmdToIstIso(ymd);
  if (!iso) return undefined;
  return new Date(iso);
};

const mapInterestMode = (
  freq: string | null | undefined,
): $Enums.INTEREST_MODE | undefined => {
  const f = pickStr(freq)?.toLowerCase();
  if (!f) return undefined;
  if (f.includes("month")) return "MONTHLY";
  if (f.includes("quarter")) return "QUARTERLY";
  if (f.includes("semi") || f.includes("half")) return "HALF_YEARLY";
  if (f.includes("annual") || f.includes("year")) return "YEARLY";
  if (f.includes("maturity")) return "ON_MATURITY";
  return undefined;
};

const mapTaxStatus = (tax: string | null | undefined): $Enums.TAX_TYPE | undefined => {
  const t = pickStr(tax)?.toLowerCase();
  if (!t) return undefined;
  if (t.includes("free")) return "TAX_FREE";
  if (t.includes("saving")) return "TAX_SAVING";
  if (t.includes("exempt")) return "TAX_EXEMPTION";
  if (t.includes("taxable") || t === "taxable") return "TAXABLE";
  return undefined;
};

const mapIsListed = (listed: boolean | undefined): $Enums.IS_LISTED | undefined => {
  if (listed === true) return "YES";
  if (listed === false) return "NO";
  return undefined;
};

const mapSeniority = (
  s: string | null | undefined,
): $Enums.BOND_SENIORITY | undefined => {
  const v = pickStr(s)?.toLowerCase();
  if (!v) return undefined;
  if (v === "senior" || v.startsWith("senior")) return "SENIOR";
  if (v.includes("tier 2") || v.includes("tier ii")) return "TIER_2_SUBORDINATED";
  if (v.includes("lower tier")) return "LOWER_TIER_II_SUBORDINATED";
  return "UNKNOWN";
};

const mapNature = (
  n: string | null | undefined,
): $Enums.INSTRUMENT_SECURITY | undefined => {
  const v = pickStr(n)?.toLowerCase();
  if (!v) return undefined;
  if (v.includes("secured")) return "SECURED";
  if (v.includes("unsecured")) return "UNSECURED";
  return "UNKNOWN";
};

const mapBondType = (
  category: string | null | undefined,
  bondType: string | null | undefined,
): $Enums.BondType | undefined => {
  const hay = `${pickStr(category) ?? ""} ${pickStr(bondType) ?? ""}`.toLowerCase();
  if (!hay.trim()) return undefined;
  if (hay.includes("government") || hay.includes("sovereign")) return "GOVERNMENT";
  if (hay.includes("tax") && hay.includes("free")) return "TAX_FREE";
  if (hay.includes("gold")) return "SOVEREIGN_GOLD_BOND";
  if (hay.includes("psu")) return "PSU";
  if (hay.includes("corporate")) return "CORPORATE";
  return "OTHER";
};

const mapExchange = (
  name: string | null | undefined,
): $Enums.STOCK_EXCHANGE | undefined => {
  const e = pickStr(name)?.toUpperCase();
  if (!e) return undefined;
  if (e.includes("BSE") && e.includes("NSE")) return "BOTH";
  if (e.includes("NSE")) return "NSE";
  if (e.includes("BSE")) return "BSE";
  return "UNKNOWN";
};

const isEmptyNum = (n: number | null | undefined) =>
  n == null || n === 0 || !Number.isFinite(n);

const isUnknownListed = (v: $Enums.IS_LISTED) => v === "UNKNOWN";
const isUnknownTax = (v: $Enums.TAX_TYPE) => v === "UNKNOWN";
const isUnknownInterest = (v: $Enums.INTEREST_MODE) =>
  v === "UNKNOWN" || v === "ON_MATURITY";

/** Collect coupon payment dates from v1.5+ schedule arrays when present. */
function extractCouponScheduleDates(item: AbsoluteDataBondItem): string[] {
  const raw = item as Record<string, unknown>;
  const schedules = [
    raw.coupon_payment_schedule,
    raw.coupon_payments,
    raw.cashflow_schedule,
  ];
  const out: string[] = [];
  for (const block of schedules) {
    if (!Array.isArray(block)) continue;
    for (const row of block) {
      if (!row || typeof row !== "object") continue;
      const pd = pickStr((row as Record<string, unknown>).payment_date);
      if (pd) out.push(pd);
    }
  }
  return [...new Set(out)].sort();
}

function buildAdRemarksSupplement(item: AbsoluteDataBondItem): string {
  const ids = item.instrument_identifiers;
  const figi = item.third_party_identifiers?.figi;
  const lines = [
    `[AbsoluteData ${pickStr(item.updated_date) ?? ""}]`,
    ids.figi ? `FIGI: ${ids.figi}` : null,
    ids.ad_instrument_id ? `AD ID: ${ids.ad_instrument_id}` : null,
    figi?.bloomberg_ticker ? `BBG: ${figi.bloomberg_ticker}` : null,
    figi?.security_description ? `BBG desc: ${figi.security_description}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * Merge Absolute Data bond reference into NSDL-parsed `BondsCreateInput`.
 * NSDL wins for registrar / certificates; AD fills gaps and enriches terms & coupons.
 */
export function mergeAbsoluteDataIntoBond(
  base: BondsCreateInput,
  item: AbsoluteDataBondItem,
): BondsCreateInput {
  console.log(item);

  const issuer = item.issuer;
  const terms = item.terms_and_conditions;
  const coupon = item.coupon;
  const listing = item.listing_and_trading;
  const redemption = item.redemption_features;

  const issueDateIso = absoluteDataYmdToIstIso(terms.issue_date ?? terms.announcement_date);
  const maturityIso = terms.is_perpetual
    ? absoluteDataYmdToIstIso("9999-12-31")
    : absoluteDataYmdToIstIso(terms.maturity_date);

  const nextCouponIso = absoluteDataYmdToIstIso(coupon.next_coupon_date);
  const lastCouponIso = absoluteDataYmdToIstIso(coupon.last_coupon_date);

  const scheduleYmds = extractCouponScheduleDates(item);
  const scheduleIsos = scheduleYmds
    .map((d) => absoluteDataYmdToIstIso(d))
    .filter((d): d is string => !!d);
  const scheduleIstDates = scheduleIsos.map((iso) => new Date(iso));

  const adInterestMode = mapInterestMode(coupon.interest_payment_frequency);
  const adTax = mapTaxStatus(terms.tax_status);
  const listingRaw = listing as { is_listed?: boolean; bond_listing?: boolean };
  const listedFlag =
    typeof listingRaw.is_listed === "boolean"
      ? listingRaw.is_listed
      : typeof listingRaw.bond_listing === "boolean"
        ? listingRaw.bond_listing
        : undefined;
  const adListed = mapIsListed(listedFlag);

  const putCall = [
    redemption.call.call_indicator ? "Callable" : null,
    redemption.put.put_indicator ? "Putable" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const adCategories = [
    pickStr(issuer.bond_category),
    pickStr(issuer.classification.sector),
    pickStr(terms.bond_type),
    pickStr(terms.instrument_nature),
    terms.is_perpetual ? "perpetual" : null,
  ]
    .filter(Boolean)
    .map((c) => c!.toLowerCase());

  const baseCategories = Array.isArray(base.categories)
    ? base.categories
    : [];
  const mergedCategories = [...new Set([...baseCategories, ...adCategories])];

  const adRemarks = buildAdRemarksSupplement(item);
  const remarks = [pickStr(base.remarks), adRemarks].filter(Boolean).join("\n\n");

  const adDescription =
    pickStr(terms.bond_description) ??
    pickStr(item.third_party_identifiers?.figi?.security_description);

  const merged: BondsCreateInput = {
    ...base,
    bondName: pickStr(issuer.issuer_name) || base.bondName,
    instrumentName:
      pickStr(terms.bond_description) ||
      pickStr(issuer.issuer_short_name) ||
      base.instrumentName,
    description: adDescription
      ? [pickStr(base.description), adDescription].filter(Boolean).join("\n")
      : base.description,
    issuePrice: isEmptyNum(base.issuePrice) && terms.issue_price != null
      ? terms.issue_price
      : base.issuePrice,
    couponRate:
      (base.couponRate === 0 || isEmptyNum(base.couponRate)) &&
        coupon.issuance_coupon != null
        ? coupon.issuance_coupon
        : base.couponRate,
    interestPaymentFrequency:
      pickStr(coupon.interest_payment_frequency) || base.interestPaymentFrequency,
    interestPaymentMode:
      adInterestMode &&
        (!base.interestPaymentMode || isUnknownInterest(base.interestPaymentMode))
        ? adInterestMode
        : (base.interestPaymentMode ?? adInterestMode ?? "UNKNOWN"),
    putCallOptionDetails:
      putCall || pickStr(base.putCallOptionDetails) || undefined,
    totalIssueSize:
      isEmptyNum(base.totalIssueSize) && terms.amount_issued != null
        ? terms.amount_issued
        : base.totalIssueSize,
    taxStatus:
      adTax && isUnknownTax(base.taxStatus) ? adTax : adTax ?? base.taxStatus,
    isListed:
      adListed && (!base.isListed || isUnknownListed(base.isListed))
        ? adListed
        : (base.isListed ?? adListed ?? "UNKNOWN"),
    sectorName: pickStr(issuer.classification.sector) || base.sectorName,
    categories: mergedCategories,
    modeOfIssuance: pickStr(terms.mode_of_issuance) ?? base.modeOfIssuance ?? undefined,
    couponType: pickStr(coupon.coupon_type) ?? base.couponType ?? undefined,
    providerName: "AbsoluteData",
    isPerpetual: terms.is_perpetual ?? base.isPerpetual ?? undefined,
    bondType:
      mapBondType(issuer.bond_category, terms.bond_type) ?? base.bondType ?? undefined,
    seniority:
      mapSeniority(terms.seniority) ?? base.seniority ?? undefined,
    natureOfInstrument:
      mapNature(terms.instrument_nature) ?? base.natureOfInstrument ?? undefined,
    dayConvention:
      pickStr(terms.business_day_convention) ??
      pickStr(terms.day_count) ??
      base.dayConvention ??
      undefined,
    exchangeListedOn:
      mapExchange(issuer.classification.exchange_name) ??
      base.exchangeListedOn ??
      undefined,
    remarks: remarks || base.remarks,
  };

  if (issueDateIso && !base.dateOfAllotment) {
    merged.dateOfAllotment = issueDateIso;
    merged.dateOfAllotmentIst = ymdToIstDateOnly(terms.issue_date ?? terms.announcement_date);
    merged.startDate = issueDateIso;
    merged.startDateIst = merged.dateOfAllotmentIst;
  }

  if (maturityIso) {
    const nsdlMaturityYear = base.maturityDate
      ? new Date(base.maturityDate).getUTCFullYear()
      : undefined;
    const nsdlSuspicious =
      !base.maturityDate ||
      nsdlMaturityYear === 1999 ||
      (terms.is_perpetual && nsdlMaturityYear !== 9999);

    if (nsdlSuspicious || !base.maturityDate) {
      merged.redemptionDate = maturityIso;
      merged.maturityDate = maturityIso;
      merged.maturityDateIst = ymdToIstDateOnly(
        terms.is_perpetual ? "9999-12-31" : terms.maturity_date,
      );
      merged.maturityDateOnly = merged.maturityDateIst;
      merged.redemptionDateIst = merged.maturityDateIst;
      merged.endDate = maturityIso;
      merged.endDateIst = merged.maturityDateIst;
    }
  }

  if (nextCouponIso) {
    merged.nextCouponDate = nextCouponIso;
    merged.nextCouponDateIst = ymdToIstDateOnly(coupon.next_coupon_date);
  }

  if (lastCouponIso) {
    merged.lastCouponDate = lastCouponIso;
    merged.lastCouponDateIst = ymdToIstDateOnly(coupon.last_coupon_date);
  }

  if (scheduleIsos.length) {
    merged.allCouponDates = scheduleIsos;
    merged.allCouponDatesIst = scheduleIstDates;
    if (!merged.nextCouponDate) {
      const today = Date.now();
      const future = scheduleIsos.find((iso) => new Date(iso).getTime() >= today);
      const pick = future ?? scheduleIsos[scheduleIsos.length - 1];
      if (pick) {
        merged.nextCouponDate = pick;
        merged.nextCouponDateIst = new Date(pick);
      }
    }
    if (!merged.lastCouponDate && scheduleIsos.length) {
      const last = scheduleIsos[scheduleIsos.length - 1]!;
      merged.lastCouponDate = last;
      merged.lastCouponDateIst = new Date(last);
    }
  }

  const firstCoupon = absoluteDataYmdToIstIso(coupon.first_coupon_date);
  if (firstCoupon && !merged.startDate) {
    merged.startDate = firstCoupon;
    merged.startDateIst = ymdToIstDateOnly(coupon.first_coupon_date);
  }
  console.log(merged);

  return merged;
}
