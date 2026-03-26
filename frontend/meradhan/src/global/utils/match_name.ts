import stringSimilarity from "string-similarity";
import natural from "natural";
import unidecode from "unidecode";

/**
 * Honorifics that should be removed from names before comparison
 */
const HONORIFICS = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "mx",
  "dr",
  "prof",
  "sir",
  "madam",
  "shri",
  "shree",
  "sri",
  "smt",
  "ku",
  "km",
  "adv",
  "ca",
  "cs",
]);

/**
 * Match result with score, decision, and detailed breakdown
 */
export type MatchResult = {
  /** Match score as percentage (0-100) */
  score: number;
  /** Match decision status */
  decision: "MATCH_FULL" | "MATCH_PARTIAL" | "MATCH_FAIL";
  /** Detailed breakdown of matching factors */
  breakdown: {
    /** Fuzzy string similarity score (0-1) */
    fuzzy: number;
    /** Token overlap score (0-1) */
    tokenOverlap: number;
    /** Phonetic similarity score (0-1) */
    phonetic: number;
    /** Whether initials match */
    initialsMatch: boolean;
    /** Whether last names match exactly */
    lastNameExact: boolean;
    /** Whether initial-style name detected (e.g., "R K Singh") */
    initialStyleDetected: boolean;
    /** Whether dates of birth match */
    dateOfBirthMatch: boolean;
  };
};

/**
 * Configuration options for name matching
 */
export type MatchOptions = {
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Custom honorifics to remove (in addition to defaults) */
  customHonorifics?: string[];
};

/**
 * Remove honorifics from the beginning of a normalized name
 */
function removeHonorifics(
  normalizedName: string,
  customHonorifics?: string[],
): string {
  const allHonorifics = customHonorifics
    ? new Set([...HONORIFICS, ...customHonorifics.map((h) => h.toLowerCase())])
    : HONORIFICS;

  const tokens = normalizedName.split(" ").filter(Boolean);
  if (tokens.length > 0) {
    const firstToken = tokens[0];
    if (allHonorifics.has(firstToken)) {
      return tokens.slice(1).join(" ").trim();
    }
  }
  return normalizedName;
}

/**
 * Normalize name:
 * - lowercase
 * - remove accents
 * - remove punctuation
 * - collapse spaces
 * - remove honorifics
 */
function normalize(name: string, customHonorifics?: string[]): string {
  const normalized = unidecode(name)
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return removeHonorifics(normalized, customHonorifics);
}

/**
 * Extract initials: "Rajesh Kumar Singh" -> "rks"
 */
function extractInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("");
}

/**
 * Get last name from a normalized name
 */
function getLastName(name: string): string | null {
  const parts = name.split(" ").filter(Boolean);
  return parts.length ? parts[parts.length - 1] : null;
}

/**
 * Calculate token overlap score (order-independent)
 */
function tokenOverlapScore(a: string, b: string): number {
  const t1 = new Set(a.split(" "));
  const t2 = new Set(b.split(" "));
  const common = [...t1].filter((x) => t2.has(x)).length;
  return common / Math.max(t1.size, t2.size);
}

/**
 * Calculate phonetic similarity using token-level metaphone
 */
function phoneticScore(a: string, b: string): number {
  const metaphone = new natural.Metaphone();
  const ta = a.split(" ");
  const tb = b.split(" ");

  let matches = 0;

  for (const x of ta) {
    for (const y of tb) {
      if (metaphone.process(x) === metaphone.process(y)) {
        matches++;
        break;
      }
    }
  }

  return matches > 0 ? 1 : 0;
}

/**
 * Detect initial-style names (e.g., "R K Singh", "A.P.J Abdul")
 */
function isInitialStyleName(name: string): boolean {
  const tokens = name.split(" ").filter(Boolean);
  const initialTokens = tokens.filter((t) => t.length === 1);
  return initialTokens.length >= 1;
}

/**
 * Compare dates of birth (handles Date objects and date strings)
 */
function compareDates(
  dob1: Date | string | null | undefined,
  dob2: Date | string | null | undefined,
): boolean {
  if (!dob1 || !dob2) return false;

  return dob1 == dob2;
}

/**
 * Compare two names and return match result
 *
 * @param name1 - First name to compare
 * @param name2 - Second name to compare
 * @param dob1 - Optional date of birth for first name
 * @param dob2 - Optional date of birth for second name
 * @param options - Optional configuration options
 * @returns MatchResult with score, decision, and breakdown
 *
 * @example
 * ```typescript
 * const result = compareNames("Rajesh Kumar Singh", "R.K. Singh");
 * console.log(result.decision); // "MATCH_FULL" | "MATCH_PARTIAL" | "MATCH_FAIL"
 * console.log(result.score); // 0-100
 * ```
 */
export function compareNames(
  name1: string,
  name2: string,
  dob1?: Date | string | null,
  dob2?: Date | string | null,
  options?: MatchOptions,
): MatchResult {
  const customHonorifics = options?.customHonorifics;
  const debug = options?.debug ?? false;

  const n1 = normalize(name1, customHonorifics);
  const n2 = normalize(name2, customHonorifics);

  if (debug) {
    console.log(`[DEBUG] Name1: "${name1}" -> "${n1}"`);
    console.log(`[DEBUG] Name2: "${name2}" -> "${n2}"`);
  }

  // Calculate similarity scores
  const fuzzy = stringSimilarity.compareTwoStrings(n1, n2);
  const tokenOverlap = tokenOverlapScore(n1, n2);
  const phonetic = phoneticScore(n1, n2);

  // Extract initials and check matches
  const initials1 = extractInitials(n1);
  const initials2 = extractInitials(n2);

  const initialsMatch =
    initials1 === initials2 ||
    initials1.includes(initials2) ||
    initials2.includes(initials1);

  const lastNameExact =
    getLastName(n1) !== null && getLastName(n1) === getLastName(n2);

  const initialStyleDetected = isInitialStyleName(n1) || isInitialStyleName(n2);

  const dateOfBirthMatch = compareDates(dob1, dob2);

  /**
   * Base weighted score calculation
   * - Fuzzy similarity: 40%
   * - Token overlap: 30%
   * - Phonetic similarity: 20%
   * - Last name exact match: 10%
   */
  let finalScore =
    fuzzy * 0.4 +
    tokenOverlap * 0.3 +
    phonetic * 0.2 +
    (lastNameExact ? 0.1 : 0);

  // Boost score if date of birth matches
  if (dateOfBirthMatch) {
    finalScore += 0.15;
    finalScore = Math.min(finalScore, 1.0);
  }

  /**
   * KYC override:
   * Initials + exact last name + initial style = strong identity signal
   */
  if (initialsMatch && lastNameExact && initialStyleDetected) {
    finalScore = Math.max(finalScore, 0.88);
  }

  /**
   * Decision logic based on score:
   * - MATCH_FULL: Score ≥ 95% (Auto approve)
   * - MATCH_PARTIAL: Score 80% - 94.99% (Partial match)
   * - MATCH_FAIL: Score < 80% OR DOB mismatch (if both provided) (Retry)
   */
  let decision: MatchResult["decision"];

  // MATCH_FAIL if DOB is provided but doesn't match
  // if (dob1 && dob2 && !dateOfBirthMatch) {
  //     decision = "MATCH_FAIL";
  // } else
  if (finalScore >= 0.95) {
    decision = "MATCH_FULL";
  } else if (finalScore >= 0.8) {
    decision = "MATCH_PARTIAL";
  } else {
    decision = "MATCH_FAIL";
  }

  return {
    score: Number(finalScore.toFixed(3)) * 100,
    decision,
    breakdown: {
      fuzzy,
      tokenOverlap,
      phonetic,
      initialsMatch,
      lastNameExact,
      initialStyleDetected,
      dateOfBirthMatch,
    },
  };
}

/**
 * Get user-friendly label and next step based on match decision and score
 *
 * @param decision - Match decision status
 * @param score - Match score (0-100)
 * @returns Object with status, label, nextStep, and score
 */
export function getStatusInfo(
  decision: MatchResult["decision"],
  score: number,
): {
  status: MatchResult["decision"];
  label: string;
  nextStep: string;
  score: number;
} {
  switch (decision) {
    case "MATCH_FULL":
      return {
        status: "MATCH_FULL",
        label: "Verified",
        nextStep: "Auto proceed",
        score,
      };
    case "MATCH_PARTIAL":
      return {
        status: "MATCH_PARTIAL",
        label: "*Partially Matched – Confirmation Required*",
        nextStep: "Proceed with confirmation",
        score,
      };
    case "MATCH_FAIL":
      return {
        status: "MATCH_FAIL",
        label: "Unable to Match",
        nextStep: "Retry / Support",
        score,
      };
  }
}
