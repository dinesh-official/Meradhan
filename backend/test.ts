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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function extractRatingCompanyAndDate(str: string) {
  if (!str) return null;

  let normalized = str.trim().toUpperCase();
  const dateMatch = normalized.match(/\b\d{2}-\d{2}-\d{4}\b/);
  const date = dateMatch ? dateMatch[0] : null;

  normalized = normalized.replace(/\b\d{2}-\d{2}-\d{4}\b/g, " ");
  normalized = normalized.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");
  normalized = normalized.replace(/\bDT\b/g, " ");
  normalized = normalized.replace(/\s+/g, " ").trim();

  const ratingHit = findFirstRatingToken(normalized);
  if (!ratingHit) return null;

  let companyName = normalized.slice(0, ratingHit.index).trim();

  if (!companyName) {
    companyName = removeRatingTokens(normalized);
  } else if (companyName.includes("DT")) {
    companyName = companyName.split("DT")[0]?.trim() || "";
  }

  companyName = companyName
    .replace(/\s+/g, " ")
    .replace(/[^A-Z0-9&\s.-]/g, "")
    .trim();

  if (!companyName) return null;

  return {
    companyName,
    date,
  };
}

console.log(
  extractRatingCompanyAndDate(
    "A- INDIA RATING AND RESEARCH PVT. LTD DT 24-12-2024",
  ),
);
