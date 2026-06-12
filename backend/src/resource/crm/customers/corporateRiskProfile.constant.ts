/**
 * Default corporate risk-profile questionnaire seeded into
 * `CustomersRiskProfileModel.data` when a corporate customer is verified
 * via the CRM "Verify & Activate Customer" flow and no risk profile row
 * exists yet.
 *
 * Mirrors `frontend/crm/src/global/constants/riskProfileData.ts` — keep the
 * question/option text in sync with that file. `ans` starts empty so the
 * operator (or customer) can fill answers later from the existing risk
 * profile editor.
 */
export type CorporateRiskProfileQuestion = {
  qus: string;
  ans: string;
  index: number;
  opt: string[];
};

export const CORPORATE_RISK_PROFILE_QUESTIONS: CorporateRiskProfileQuestion[] = [
  {
    qus: "How many years of investment experience do you have?",
    ans: "",
    index: 0,
    opt: ["None", "Up to 1 year", "1 – 5 years", "More than 5 years"],
  },
  {
    qus: "What is your investment goal?",
    ans: "",
    index: 1,
    opt: [
      "Steady Income",
      "Capital Gains",
      "Short-term Parking",
      "Risk Diversification",
    ],
  },
  {
    qus: "What is your risk appetite?",
    ans: "",
    index: 2,
    opt: [
      "Low Risk & Low Returns",
      "Moderate Risk & Moderate Returns",
      "High Risk & High Returns",
    ],
  },
  {
    qus: "What is your investment time horizon?",
    ans: "",
    index: 3,
    opt: ["Up to 1 year", "1 – 3 years", "3 – 5 years", "More than 5 years"],
  },
];
