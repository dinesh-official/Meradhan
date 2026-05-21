/**
 * Extract rating agency name from NSDL/CRM combined strings.
 * Aligned with backend `extractRatingCompanyAndDate` in nsdl_bond_processor.ts.
 */

const RATING_TOKENS = [
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
].sort((a, b) => b.length - a.length);

const OUTLOOK_WORDS = [
  "stable",
  "negative",
  "positive",
  "outlook",
  "watch",
  "developing",
  "reaffirmed",
  "assigned",
] as const;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Match rating token as a standalone token, not a substring inside agency names (e.g. ICRA). */
function findFirstRatingToken(normalized: string): { token: string; index: number } | null {
  for (const token of RATING_TOKENS) {
    const escaped = escapeRegExp(token);
    const re = new RegExp(`(^|[^A-Z0-9])(${escaped})(?=[^A-Z0-9]|$)`, "i");
    const match = re.exec(normalized);
    if (match && match.index !== undefined) {
      const index = match.index + (match[1]?.length ?? 0);
      return { token, index };
    }
  }
  return null;
}

function removeRatingTokens(normalized: string): string {
  let remainder = normalized;
  for (const token of RATING_TOKENS) {
    const escaped = escapeRegExp(token);
    const re = new RegExp(`(^|[^A-Z0-9])${escaped}(?=[^A-Z0-9]|$)`, "gi");
    remainder = remainder.replace(re, " ");
  }
  return remainder.replace(/\s+/g, " ").trim();
}

function cleanCompanyName(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[^A-Z0-9&\s.-]/gi, "")
    .trim();
}

function isMeaningfulAgency(value: string): boolean {
  if (!value) return false;
  if (/^[\d.\s-]+$/i.test(value)) return false;
  const upper = value.toUpperCase();
  if (["N/A", "NA", "UNKNOWN", "UNRATED", "NULL"].includes(upper)) return false;
  return true;
}

/**
 * Returns agency-only label (e.g. "CRISIL", "HDFC LTD") from a combined agency+rating string.
 */
export function extractRatingAgencyName(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const upper = trimmed.toUpperCase();
  if (["N/A", "NA", "UNKNOWN", "NULL"].includes(upper)) return null;

  let normalized = upper;
  normalized = normalized.replace(/\b\d{2}-\d{2}-\d{4}\b/g, " ");
  normalized = normalized.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");
  normalized = normalized.replace(/\bDT\b/g, " ");

  for (const word of OUTLOOK_WORDS) {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, "gi"), " ");
  }

  normalized = normalized.replace(/\s+/g, " ").trim();
  if (!normalized) return null;

  const ratingHit = findFirstRatingToken(normalized);

  let companyName = "";

  if (ratingHit) {
    const beforeRating = normalized.slice(0, ratingHit.index).trim();
    if (beforeRating) {
      companyName = beforeRating;
      if (companyName.includes("DT")) {
        companyName = companyName.split("DT")[0]?.trim() ?? "";
      }
    } else {
      companyName = removeRatingTokens(normalized);
    }
  } else {
    companyName = normalized;
  }

  const cleaned = cleanCompanyName(companyName);
  return isMeaningfulAgency(cleaned) ? cleaned : null;
}
