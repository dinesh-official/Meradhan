import { describe, expect, test } from "bun:test";
import {
  applyCorporateRiskProfileToSavedPdfPayload,
  isCorporateRiskProfileCompleteForPdf,
  mapCorporateRiskAppetiteToPdfTier,
  mapCorporateRiskProfileToPdfCheckboxes,
  mapCorporateRiskProfileToPdfTier,
  normalizeCorporateRiskProfileAnswers,
} from "./corporateRiskProfilePdfMap";

const conservativeAnswers = [
  { index: 0, ans: "None" },
  { index: 1, ans: "Steady Income" },
  { index: 2, ans: "Low Risk & Low Returns" },
  { index: 3, ans: "Up to 1 year" },
];

const moderateAnswers = [
  { index: 0, ans: "1 – 5 years" },
  { index: 1, ans: "Risk Diversification" },
  { index: 2, ans: "Moderate Risk & Moderate Returns" },
  { index: 3, ans: "1 – 3 years" },
];

const aggressiveAnswers = [
  { index: 0, ans: "More than 5 years" },
  { index: 1, ans: "Capital Gains" },
  { index: 2, ans: "High Risk & High Returns" },
  { index: 3, ans: "More than 5 years" },
];

describe("mapCorporateRiskProfileToPdfCheckboxes", () => {
  test("maps low-average answers to conservative", () => {
    expect(mapCorporateRiskProfileToPdfCheckboxes(conservativeAnswers)).toEqual({
      riskConservative: true,
    });
  });

  test("maps mid-average answers to moderate", () => {
    expect(mapCorporateRiskProfileToPdfCheckboxes(moderateAnswers)).toEqual({
      riskModerate: true,
    });
  });

  test("maps high-average answers to aggressive", () => {
    expect(mapCorporateRiskProfileToPdfCheckboxes(aggressiveAnswers)).toEqual({
      riskAggressive: true,
    });
  });

  test("returns empty object when no valid weights", () => {
    expect(mapCorporateRiskProfileToPdfCheckboxes([])).toEqual({});
    expect(
      mapCorporateRiskProfileToPdfCheckboxes([{ index: 0, ans: "unknown" }]),
    ).toEqual({});
  });
});

describe("isCorporateRiskProfileCompleteForPdf", () => {
  test("true when all four indexes have mapped answers", () => {
    expect(isCorporateRiskProfileCompleteForPdf(moderateAnswers)).toBe(true);
  });

  test("false when any answer missing or unmapped", () => {
    expect(
      isCorporateRiskProfileCompleteForPdf([
        { index: 0, ans: "None" },
        { index: 1, ans: "" },
        { index: 2, ans: "Low Risk & Low Returns" },
        { index: 3, ans: "Up to 1 year" },
      ]),
    ).toBe(false);
  });
});

describe("mapCorporateRiskAppetiteToPdfTier", () => {
  test("maps each Q3 option to RISK_PROFILES value", () => {
    expect(
      mapCorporateRiskAppetiteToPdfTier([
        { index: 2, ans: "Low Risk & Low Returns" },
      ]),
    ).toBe("Low Risk");
    expect(
      mapCorporateRiskAppetiteToPdfTier([
        { index: 2, ans: "Moderate Risk & Moderate Returns" },
      ]),
    ).toBe("Moderate");
    expect(
      mapCorporateRiskAppetiteToPdfTier([
        { index: 2, ans: "High Risk & High Returns" },
      ]),
    ).toBe("High Risk");
  });
});

describe("normalizeCorporateRiskProfileAnswers", () => {
  test("resolves risk appetite by question text when index is missing", () => {
    const normalized = normalizeCorporateRiskProfileAnswers([
      { qus: "What is your risk appetite?", ans: "High Risk & High Returns" },
    ]);
    expect(normalized).toEqual([
      { index: 2, ans: "High Risk & High Returns" },
    ]);
    expect(mapCorporateRiskAppetiteToPdfTier(normalized)).toBe("High Risk");
  });
});

describe("mapCorporateRiskProfileToPdfTier", () => {
  test("maps answers to pdf-service Page 8 riskProfile from Q3 risk appetite", () => {
    expect(mapCorporateRiskProfileToPdfTier(conservativeAnswers)).toBe("Low Risk");
    expect(mapCorporateRiskProfileToPdfTier(moderateAnswers)).toBe("Moderate");
    expect(mapCorporateRiskProfileToPdfTier(aggressiveAnswers)).toBe(
      "High Risk",
    );
  });

  test("Page 8 tier follows risk appetite (index 2) even when other answers differ", () => {
    expect(
      mapCorporateRiskProfileToPdfTier([
        { index: 0, ans: "More than 5 years" },
        { index: 1, ans: "Capital Gains" },
        { index: 2, ans: "Low Risk & Low Returns" },
        { index: 3, ans: "More than 5 years" },
      ]),
    ).toBe("Low Risk");
    expect(
      mapCorporateRiskProfileToPdfTier([
        { index: 0, ans: "None" },
        { index: 1, ans: "Steady Income" },
        { index: 2, ans: "High Risk & High Returns" },
        { index: 3, ans: "Up to 1 year" },
      ]),
    ).toBe("High Risk");
  });
});

describe("applyCorporateRiskProfileToSavedPdfPayload", () => {
  test("overlays tier onto saved payload additionalInfo", () => {
    const saved = {
      entity: { name: "ACME" },
      additionalInfo: { applicantName: "ACME", riskProfile: "Moderate" },
    };
    const merged = applyCorporateRiskProfileToSavedPdfPayload(
      saved,
      aggressiveAnswers,
    );
    expect(merged.additionalInfo).toMatchObject({ riskProfile: "High Risk" });
    expect(merged.entity).toEqual({ name: "ACME" });
  });
});
