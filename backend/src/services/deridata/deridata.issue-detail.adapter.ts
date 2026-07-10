import moment from "moment";
import { parseDeriDataRecordDateYmd } from "./deridata.calc.adapter";
import type { DeriDataIssueDetailItem } from "./deridata.types";

export type MappedDeriDataIssueDetail = {
  bondName: string | null;
  instrumentName: string | null;
  description: string | null;
  sectorName: string | null;
  creditRating: string | null;
  creditRatingInfo: string | null;
  ratingAgencyName: string | null;
  natureOfInstrument: "SECURED" | "UNSECURED" | "UNKNOWN" | null;
  maturityDate: string | null;
  dateOfAllotment: string | null;
  recordDays: number | null;
  faceValue: number | null;
  couponRate: number | null;
  interestPaymentFrequency: string | null;
  interestPaymentMode: string | null;
  couponType: string | null;
  redemptionType: string | null;
  seniority: string | null;
  taxStatus: string | null;
  isListed: string | null;
  totalIssueSize: number | null;
  putCallOptionDetails: string | null;
  categories: string[];
  firstInterestDate: string | null;
};

function pickStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

/** DeriData dates are typically `DD-MMM-YYYY` (e.g. 21-Feb-2027). */
export function parseDeriDataIssueDateYmd(
  raw: string | null | undefined,
): string | null {
  const s = pickStr(raw);
  if (!s) return null;
  if (/^NA$/i.test(s)) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // Reuse same parser as calculator record_date
  const fromAdapter = parseDeriDataRecordDateYmd(s);
  if (fromAdapter) return fromAdapter;
  const m = moment(
    s,
    ["DD-MMM-YYYY", "DD-MMM-YY", "DD/MM/YYYY", "DD-MM-YYYY"],
    true,
  );
  return m.isValid() ? m.format("YYYY-MM-DD") : null;
}

function parseNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  const n = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export function mapDeriDataCouponFrequency(
  raw: string | null | undefined,
): string | null {
  const v = pickStr(raw)?.toLowerCase();
  if (!v) return null;
  if (v.includes("month")) return "MONTHLY";
  if (v.includes("quarter")) return "QUARTERLY";
  if (v.includes("semi") || v.includes("half")) return "HALF_YEARLY";
  if (v.includes("annual") || v.includes("year")) return "YEARLY";
  if (v.includes("maturity")) return "ON_MATURITY";
  return "UNKNOWN";
}

export function mapDeriDataNature(
  security: string | null | undefined,
): "SECURED" | "UNSECURED" | "UNKNOWN" | null {
  const v = pickStr(security)?.toUpperCase();
  if (!v) return null;
  if (v.includes("UNSECURED")) return "UNSECURED";
  if (v.includes("SECURED")) return "SECURED";
  return "UNKNOWN";
}

export function mapDeriDataSeniority(
  raw: string | null | undefined,
): string | null {
  const v = pickStr(raw)?.toLowerCase();
  if (!v || v === "na") return null;
  if (v === "senior" || v.startsWith("senior")) return "SENIOR";
  if (v.includes("tier 2") || v.includes("tier ii") || v.includes("tier-2")) {
    return "TIER_2_SUBORDINATED";
  }
  if (v.includes("lower tier")) return "LOWER_TIER_II_SUBORDINATED";
  return "UNKNOWN";
}

export function mapDeriDataTaxStatus(
  taxFree: string | null | undefined,
): string | null {
  const v = pickStr(taxFree)?.toLowerCase();
  if (!v) return null;
  if (v === "yes" || v.includes("free")) return "TAX_FREE";
  if (v === "no" || v.includes("taxable")) return "TAXABLE";
  return "UNKNOWN";
}

export function mapDeriDataIsListed(
  listed: string | boolean | null | undefined,
): string | null {
  if (listed === true) return "YES";
  if (listed === false) return "NO";
  const v = pickStr(listed)?.toLowerCase();
  if (!v || v === "na" || v === "null") return null;
  if (v === "yes" || v === "y" || v === "listed") return "YES";
  if (v === "no" || v === "n" || v === "unlisted") return "NO";
  if (v.includes("bse") || v.includes("nse")) return "YES";
  return "UNKNOWN";
}

export function mapDeriDataCouponType(
  item: Pick<
    DeriDataIssueDetailItem,
    "coupon_type" | "coupon" | "coupon_floating" | "tags"
  >,
): string | null {
  const explicit = pickStr(item.coupon_type);
  if (explicit) return explicit;
  const coupon = pickStr(item.coupon)?.toLowerCase();
  if (coupon?.includes("zero")) return "Zero Coupon";
  if (coupon?.includes("float") || pickStr(item.coupon_floating)) {
    return "Floating";
  }
  if (coupon?.includes("fixed")) return "Fixed";
  const tags = (item.tags ?? []).map((t) => String(t).toUpperCase());
  if (tags.some((t) => t.includes("ZERO"))) return "Zero Coupon";
  if (tags.some((t) => t.includes("FLOAT"))) return "Floating";
  return null;
}

/** Map DeriData tags → CRM listing category slugs where possible. */
export function mapDeriDataTagsToCategories(
  tags: string[] | null | undefined,
): string[] {
  const out = new Set<string>();
  for (const raw of tags ?? []) {
    const t = String(raw).trim().toUpperCase();
    if (!t) continue;
    if (t.includes("ZERO COUPON") || t === "ZERO-COUPON") out.add("zero-coupon");
    if (t.includes("TAX FREE") || t.includes("TAX-FREE")) out.add("tax-free");
    if (t.includes("PSU")) out.add("psu");
    if (t.includes("NBFC")) out.add("nbfc");
    if (t.includes("BANK")) out.add("banks");
    if (t.includes("PERPETUAL")) out.add("perpetual");
    if (t.includes("CORPORATE") || t.includes("NCD")) out.add("corporate");
  }
  return [...out];
}

function isDeriDataNaValue(s: string | undefined): boolean {
  return !s || /^NA$/i.test(s) || s.toLowerCase() === "null";
}

/** DeriData `total_issue_size_cr` (crores) → absolute rupees (e.g. 529.2 → 5292000000). */
export function convertIssueSizeCroreToRupees(
  crore: number | null | undefined,
): number | null {
  if (crore == null || !Number.isFinite(crore)) return null;
  return Math.round(crore * 10_000_000);
}

function formatPutCallDetails(item: DeriDataIssueDetailItem): string | null {
  const parts: string[] = [];
  const putDate = pickStr(item.put_date);
  const callDate = pickStr(item.call_date);

  if (!isDeriDataNaValue(putDate)) parts.push(`Put: ${putDate}`);

  if (!isDeriDataNaValue(callDate)) parts.push(`Call: ${callDate}`);

  return parts.length ? parts.join(" ") : null;
}

/** Pull a readable string from DeriData scalar/object rating payload cells. */
function stringifyDeriDataCell(
  value: unknown,
  preferredKeys: string[],
): string | null {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number") {
    const s = String(value).trim();
    return s && s !== "[object Object]" ? s : null;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    for (const item of value) {
      const s = stringifyDeriDataCell(item, preferredKeys);
      if (s) return s;
    }
    return null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of preferredKeys) {
      if (!(key in obj)) continue;
      const s = stringifyDeriDataCell(obj[key], preferredKeys);
      if (s) return s;
    }
    // No preferred key matched — do not grab arbitrary object values
    // (that caused outlook objects to look like agencies).
  }
  return null;
}

type RatingRow = {
  agency: string | null;
  rating: string | null;
  outlook: string | null;
};

function extractRatingRow(value: unknown): RatingRow {
  if (value == null) {
    return { agency: null, rating: null, outlook: null };
  }
  if (typeof value === "string" || typeof value === "number") {
    return {
      agency: null,
      rating: String(value).trim() || null,
      outlook: null,
    };
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return {
      agency: stringifyDeriDataCell(value, [
        "agency",
        "rating_agency",
        "agency_name",
        "name",
        "rater",
      ]),
      rating: stringifyDeriDataCell(value, [
        "rating",
        "current_rating",
        "grade",
        "credit_rating",
        "value",
      ]),
      outlook: stringifyDeriDataCell(value, [
        "outlook",
        "rating_outlook",
        "credit_outlook",
        "watch",
      ]),
    };
  }
  return {
    agency: null,
    rating: stringifyDeriDataCell(value, ["rating", "value"]),
    outlook: null,
  };
}

function formatSingleRatingInfo(row: RatingRow): string | null {
  const agency = row.agency?.trim() || null;
  let rating = row.rating?.trim() || null;
  const outlook = row.outlook?.trim() || null;
  if (!agency && !rating) return null;

  // Rating cell may already be "ICRA: A+" — avoid "ICRA: ICRA: A+".
  if (agency && rating) {
    const agencyPrefix = new RegExp(
      `^${agency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:\\-]\\s*`,
      "i",
    );
    if (agencyPrefix.test(rating)) {
      rating = rating.replace(agencyPrefix, "").trim() || rating;
    }
  }

  if (agency && rating) {
    return outlook
      ? `${agency}: ${rating} (${outlook})`
      : `${agency}: ${rating}`;
  }
  if (rating) {
    return outlook ? `${rating} (${outlook})` : rating;
  }
  return agency;
}

function formatCreditRating(
  ratings: unknown[] | null | undefined,
  agencies?: unknown[] | null,
): string | null {
  const cleaned: string[] = [];
  for (let i = 0; i < (ratings ?? []).length; i++) {
    const row = extractRatingRow(ratings![i]);
    const agency =
      row.agency ??
      stringifyDeriDataCell(agencies?.[i], ["agency", "rating_agency", "name"]);
    let rating =
      row.rating ??
      stringifyDeriDataCell(ratings![i], ["rating", "grade", "value"]);
    if (!rating?.trim()) continue;
    if (agency) {
      const agencyPrefix = new RegExp(
        `^${agency.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:\\-]\\s*`,
        "i",
      );
      if (agencyPrefix.test(rating)) {
        rating = rating.replace(agencyPrefix, "").trim() || rating;
      }
    }
    cleaned.push(rating);
  }
  if (!cleaned.length) return "UnRated";
  return cleaned.join(", ");
}

function formatCreditRatingInfo(item: DeriDataIssueDetailItem): string | null {
  const agencies = item.rating_agency ?? [];
  const ratings = item.current_rating ?? [];
  const outlooks = item.outlook ?? [];
  const len = Math.max(agencies.length, ratings.length, outlooks.length);
  if (len === 0) return null;

  const parts: string[] = [];
  for (let i = 0; i < len; i++) {
    const fromAgency = extractRatingRow(agencies[i]);
    const fromRating = extractRatingRow(ratings[i]);
    const fromOutlook = extractRatingRow(outlooks[i]);
    const row: RatingRow = {
      agency: fromAgency.agency ?? fromRating.agency ?? fromOutlook.agency,
      rating: fromRating.rating ?? fromAgency.rating ?? fromOutlook.rating,
      outlook:
        fromOutlook.outlook ?? fromRating.outlook ?? fromAgency.outlook,
    };
    // Prefer parallel arrays when cells are plain strings.
    if (!row.agency) {
      row.agency = stringifyDeriDataCell(agencies[i], [
        "agency",
        "rating_agency",
        "name",
      ]);
    }
    if (!row.rating) {
      row.rating = stringifyDeriDataCell(ratings[i], [
        "rating",
        "current_rating",
        "grade",
      ]);
    }
    if (!row.outlook) {
      row.outlook = stringifyDeriDataCell(outlooks[i], [
        "outlook",
        "rating_outlook",
      ]);
    }
    const formatted = formatSingleRatingInfo(row);
    if (formatted) parts.push(formatted);
  }

  return parts.length ? parts.join("; ") : null;
}

/**
 * Map DeriData `issue-detail` payload into CRM autofill / bond form fields.
 */
export function mapDeriDataIssueDetailToBondFields(
  item: DeriDataIssueDetailItem,
): MappedDeriDataIssueDetail {
  const interestMode = mapDeriDataCouponFrequency(item.coupon_frequency);
  const couponFixed = parseNumber(item.coupon_fixed);
  const faceValue = parseNumber(item.face_value);
  const issueSizeCr = parseNumber(item.total_issue_size_cr);
  const recordDaysRaw = item.record_date;
  const recordDays =
    typeof recordDaysRaw === "number"
      ? Number.isFinite(recordDaysRaw)
        ? Math.round(recordDaysRaw)
        : null
      : parseNumber(recordDaysRaw) != null
        ? Math.round(parseNumber(recordDaysRaw)!)
        : null;

  const issuerName = pickStr(item.issuer_name) ?? null;
  const description = pickStr(item.description) ?? null;

  return {
    bondName: issuerName,
    instrumentName: description
      ? description.slice(0, 200)
      : pickStr(item.did) ?? issuerName,
    description,
    sectorName: pickStr(item.issuer_industry) ?? null,
    creditRating: formatCreditRating(item.current_rating, item.rating_agency),
    creditRatingInfo: formatCreditRatingInfo(item),
    ratingAgencyName:
      (item.rating_agency ?? [])
        .map(
          (a) =>
            extractRatingRow(a).agency ??
            stringifyDeriDataCell(a, ["agency", "rating_agency", "name"]),
        )
        .filter((s): s is string => Boolean(s?.trim()))
        .join(", ") || null,
    natureOfInstrument: mapDeriDataNature(item.security),
    maturityDate: parseDeriDataIssueDateYmd(item.maturity),
    dateOfAllotment:
      parseDeriDataIssueDateYmd(item.allotment_date) ??
      parseDeriDataIssueDateYmd(item.issue_date),
    recordDays,
    faceValue,
    couponRate: couponFixed,
    interestPaymentFrequency: interestMode,
    interestPaymentMode: interestMode,
    couponType: mapDeriDataCouponType(item),
    redemptionType: pickStr(item.redemption_type) ?? null,
    seniority: mapDeriDataSeniority(item.seniority),
    taxStatus: mapDeriDataTaxStatus(item.tax_free),
    isListed: mapDeriDataIsListed(item.listed),
    totalIssueSize: convertIssueSizeCroreToRupees(issueSizeCr),
    putCallOptionDetails: formatPutCallDetails(item),
    categories: mapDeriDataTagsToCategories(item.tags),
    firstInterestDate: parseDeriDataIssueDateYmd(item.first_interest_date),
  };
}
