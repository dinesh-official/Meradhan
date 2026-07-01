/**
 * Maps corporate risk-profile questionnaire answers to PDF risk tiers.
 * Option weights are keyed by question `index` — keep in sync with
 * `CORPORATE_RISK_PROFILE_QUESTIONS` on the backend.
 *
 * pdf-service Page 8 (`additionalInfo.riskProfile`) uses question 3 only:
 * "What is your risk appetite?" (index `2`).
 */

/** Question index for "What is your risk appetite?" — drives Page 8 checkbox. */
export const CORPORATE_RISK_APPETITE_QUESTION_INDEX = 2;

export type CorporateRiskProfileAnswer = {
  index: number;
  ans: string;
};

/** Tier weight: 1 = conservative, 2 = moderate, 3 = aggressive. */
const CORPORATE_RISK_OPTION_WEIGHT_BY_INDEX: Record<
  number,
  Record<string, 1 | 2 | 3>
> = {
  0: {
    None: 1,
    "Up to 1 year": 1,
    "1 – 5 years": 2,
    "More than 5 years": 3,
  },
  1: {
    "Steady Income": 1,
    "Capital Gains": 3,
    "Short-term Parking": 2,
    "Risk Diversification": 2,
  },
  2: {
    "Low Risk & Low Returns": 1,
    "Moderate Risk & Moderate Returns": 2,
    "High Risk & High Returns": 3,
  },
  3: {
    "Up to 1 year": 1,
    "1 – 3 years": 2,
    "3 – 5 years": 2,
    "More than 5 years": 3,
  },
};

export type CorporateRiskPdfCheckboxes = {
  riskConservative?: boolean;
  riskModerate?: boolean;
  riskAggressive?: boolean;
};

export type CorporateRiskPdfTier = "Low Risk" | "Moderate" | "High Risk";

/** Same values as pdf-service `RISK_PROFILES` / `additionalInfo.riskProfile`. */
export const CORPORATE_RISK_APPETITE_ANSWER_TO_PROFILE = {
  "Low Risk & Low Returns": "Low Risk",
  "Moderate Risk & Moderate Returns": "Moderate",
  "High Risk & High Returns": "High Risk",
} as const satisfies Record<string, CorporateRiskPdfTier>;

export const CORPORATE_RISK_APPETITE_QUESTION_TEXT =
  "What is your risk appetite?";

/**
 * Normalises stored risk-profile rows (may include `qus` without `index`).
 */
export function normalizeCorporateRiskProfileAnswers(
  data: unknown[],
): CorporateRiskProfileAnswer[] {
  const appetiteKey = CORPORATE_RISK_APPETITE_QUESTION_TEXT.toLowerCase();

  return data
    .map((item) => {
      const row = item as { index?: number; ans?: string; qus?: string };
      const ans = String(row.ans ?? "").trim();
      if (!ans) return null;

      if (typeof row.index === "number" && row.index >= 0) {
        return { index: row.index, ans };
      }

      if (row.qus?.trim().toLowerCase() === appetiteKey) {
        return { index: CORPORATE_RISK_APPETITE_QUESTION_INDEX, ans };
      }

      return null;
    })
    .filter((a): a is CorporateRiskProfileAnswer => a !== null);
}

/**
 * Maps Q3 "What is your risk appetite?" to pdf-service Page 8
 * `additionalInfo.riskProfile` — one of Low Risk / Moderate / High Risk.
 */
export function mapCorporateRiskAppetiteToPdfTier(
  answers: CorporateRiskProfileAnswer[],
): CorporateRiskPdfTier | undefined {
  const byIndex = new Map(answers.map((a) => [a.index, a.ans.trim()]));
  const ans = byIndex.get(CORPORATE_RISK_APPETITE_QUESTION_INDEX);
  if (!ans) return undefined;

  return CORPORATE_RISK_APPETITE_ANSWER_TO_PROFILE[
    ans as keyof typeof CORPORATE_RISK_APPETITE_ANSWER_TO_PROFILE
  ];
}

/**
 * Maps questionnaire answers to the pdf-service `additionalInfo.riskProfile` tier.
 * Uses risk appetite (Q3) only — not an average across all questions.
 */
export function mapCorporateRiskProfileToPdfTier(
  answers: CorporateRiskProfileAnswer[],
): CorporateRiskPdfTier | undefined {
  return mapCorporateRiskAppetiteToPdfTier(answers);
}

/**
 * Overlays Page 8 risk profile onto a saved CRM PDF payload (`lastPdfPayload`)
 * from Q3 "What is your risk appetite?" before calling pdf-service.
 */
export function applyCorporateRiskProfileToSavedPdfPayload(
  payload: Record<string, unknown>,
  riskProfileAnswers: CorporateRiskProfileAnswer[],
): Record<string, unknown> {
  const tier = mapCorporateRiskProfileToPdfTier(riskProfileAnswers);
  if (!tier) return payload;

  const additionalInfo =
    (payload.additionalInfo as Record<string, unknown> | undefined) ?? {};

  return {
    ...payload,
    additionalInfo: {
      ...additionalInfo,
      riskProfile: tier,
    },
  };
}

/**
 * Ensures Page 15 participant code is set on a saved payload when missing.
 */
export function applyParticipantCodeToSavedPdfPayload(
  payload: Record<string, unknown>,
  participantCode?: string,
): Record<string, unknown> {
  const code = participantCode?.trim();
  if (!code) return payload;

  const nclAnnexure =
    (payload.nclAnnexure as Record<string, unknown> | undefined) ?? {};
  const values =
    (nclAnnexure.values as Record<string, unknown> | undefined) ?? {};
  const existing =
    typeof values.participantCode === "string"
      ? values.participantCode.trim()
      : "";

  if (existing) return payload;

  const additionalInfo =
    (payload.additionalInfo as Record<string, unknown> | undefined) ?? {};
  const settlementAgency =
    (additionalInfo.settlementAgency as Record<string, unknown> | undefined) ??
    {};

  return {
    ...payload,
    additionalInfo: {
      ...additionalInfo,
      settlementAgency: {
        ...settlementAgency,
        nclChecked: settlementAgency.nclChecked ?? true,
        nclCode:
          typeof settlementAgency.nclCode === "string" &&
          settlementAgency.nclCode.trim()
            ? settlementAgency.nclCode
            : code,
      },
    },
    nclAnnexure: {
      ...nclAnnexure,
      values: {
        ...values,
        participantCode: code,
      },
    },
  };
}

/**
 * Derives risk tier from all answered questions (average weight). Used by the
 * in-repo react-pdf pack (page 5 checkboxes), not pdf-service Page 8.
 */
export function mapCorporateRiskProfileToPdfCheckboxes(
  answers: CorporateRiskProfileAnswer[],
): CorporateRiskPdfCheckboxes {
  const weights: number[] = [];

  for (const { index, ans } of answers) {
    const trimmed = ans.trim();
    if (!trimmed) continue;
    const byOption = CORPORATE_RISK_OPTION_WEIGHT_BY_INDEX[index];
    const weight = byOption?.[trimmed];
    if (weight !== undefined) {
      weights.push(weight);
    }
  }

  if (weights.length === 0) {
    return {};
  }

  const avg = weights.reduce((a, b) => a + b, 0) / weights.length;

  if (avg <= 1.5) {
    return { riskConservative: true };
  }
  if (avg <= 2.5) {
    return { riskModerate: true };
  }
  return { riskAggressive: true };
}

/** Returns true when every expected question index has a mapped answer weight. */
export function isCorporateRiskProfileCompleteForPdf(
  answers: CorporateRiskProfileAnswer[],
  expectedIndexes: number[] = [0, 1, 2, 3],
): boolean {
  const byIndex = new Map(answers.map((a) => [a.index, a.ans.trim()]));
  return expectedIndexes.every((idx) => {
    const ans = byIndex.get(idx);
    if (!ans) return false;
    const weight = CORPORATE_RISK_OPTION_WEIGHT_BY_INDEX[idx]?.[ans];
    return weight !== undefined;
  });
}
