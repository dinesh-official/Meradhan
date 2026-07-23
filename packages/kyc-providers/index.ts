export * from "./src/digio/digio";
export * from "./src/digio/genPdfForSign";
export * from "./src/digio/digio.response";
export * from "./src/NSDL/NSDLApi.response";
export * from "./src/response.types";
// PDF renderer (@react-pdf) lives on `kyc-providers/pdf` — keep it off the
// main entry so Next.js CRM/FE page-data collection does not pull a nested React.
export {
  applyCorporateRiskProfileToSavedPdfPayload,
  applyParticipantCodeToSavedPdfPayload,
  CORPORATE_RISK_APPETITE_ANSWER_TO_PROFILE,
  CORPORATE_RISK_APPETITE_QUESTION_INDEX,
  CORPORATE_RISK_APPETITE_QUESTION_TEXT,
  isCorporateRiskProfileCompleteForPdf,
  mapCorporateRiskAppetiteToPdfTier,
  mapCorporateRiskProfileToPdfCheckboxes,
  mapCorporateRiskProfileToPdfTier,
  normalizeCorporateRiskProfileAnswers,
} from "./pdf/corporate/corporateRiskProfilePdfMap";
export * from "./pdf/corporate/corporatePdfServicePayload";

export * from "./src/NSDL/NSDLApi";
export * from "./src/CDSL/CDSLAPi";
export * from "./src/kra/index";
export * from "./src/utils/address";
export { getInterestPaymentSchedule } from "./pdf/Orders/interestPaymentSchedule";
