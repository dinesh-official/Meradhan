import type { IKraDownloadResponse } from "@root/apiGateway";
import { useKycDataStorage } from "../../../../_store/useKycDataStorage";
import { usePanCardVerifyHook } from "../../1_panAndAadhar/_hooks/usePanCardVerifyHook";

/** Convert KRA DOB (DD-MM-YYYY or DD/MM/YYYY) to YYYY-MM-DD for store */
function kraDobToIso(dob: string | null): string {
  if (!dob || !dob.trim()) return "";
  const parts = dob.trim().split(/[-/]/);
  if (parts.length >= 3) {
    const [d, m, y] = parts;
    const year = (y ?? "").length === 2 ? `20${y}` : (y ?? "");
    return `${year}-${(m ?? "").padStart(2, "0")}-${(d ?? "").padStart(2, "0")}`;
  }
  return dob;
}

/** Split full name into first, middle, last */
function splitName(full: string | null): {
  firstName: string;
  middleName: string;
  lastName: string;
} {
  if (!full || !full.trim()) return { firstName: "", middleName: "", lastName: "" };
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0] ?? "", middleName: "", lastName: "" };
  const firstName = parts[0] ?? "";
  const lastName = parts[parts.length - 1] ?? "";
  const middleName = parts.slice(1, -1).join(" ") ?? "";
  return { firstName, middleName, lastName };
}

function kraGenderToStore(gen: string | null): string {
  if (!gen) return "";
  const g = (gen ?? "").toUpperCase();
  if (g === "M") return "MALE";
  if (g === "F") return "FEMALE";
  return gen;
}

/**
 * KRA occupation code → Personal Details form value (occupationType).
 * Aligned with KRA API Download file format May 2025.
 * Mapping (per KRA screen):
 * 01 Private Sector, 02 Public Sector, 03 Business, 04 Professional,
 * 05 Agriculturist, 06 Retired, 07 Housewife, 08 Student,
 * 10 Government Service, 99 Others.
 */
const KRA_OCC_TO_FORM: Record<string, string> = {
  "01": "Private Sector",
  "02": "Public Sector",
  "03": "Business",
  "04": "Professional",
  "05": "Agriculturist",
  "06": "Retired",
  "07": "Housewife",
  "08": "Student",
  "10": "Government Sector",
  "99": "Others",
  // Single-letter occupation type (same spec)
  S: "Private Sector",
  B: "Business",
  O: "Others",
  P: "Professional",
  A: "Agriculturist",
  R: "Retired",
  H: "Housewife",
  T: "Student",
};

function kraOccupationCodeToMapKey(code: string): string {
  const c = code.trim();
  if (/^\d+$/.test(c)) {
    return String(parseInt(c, 10)).padStart(2, "0");
  }
  if (c.length === 1) return c.toUpperCase();
  return c;
}

/** KRA income code → Personal Details form value (annualGrossIncome) */
const KRA_INCOME_TO_FORM: Record<string, string> = {
  "01": "0-1L",
  "02": "1-5L",
  "03": "5-10L",
  "04": "10-25L",
  "05": "25L+",
};

/** KRA nationality code → Personal Details form value (nationality) */
const KRA_NATIONALITY_TO_FORM: Record<string, string> = {
  "01": "IN - Indian",
  "02": "OTHER",
};

/** KRA "00" / "0" = not specified — must not prefill selects with invalid values */
function isKraUnspecifiedCode(code: string | null | undefined): boolean {
  if (code == null || String(code).trim() === "") return true;
  const c = String(code).trim();
  return c === "00" || c === "0";
}

export function useKraInfoStep() {
  const {
    state,
    setStep1PanData,
    setStep2PersonalData,
    setGenderData,
    setUsedExistingKra,
    clearKraResponse,
  } = useKycDataStorage();
  const { handelPanVerification, isPending } = usePanCardVerifyHook();

  const prefillFromKra = (kra: IKraDownloadResponse) => {
    const { firstName, middleName, lastName } = splitName(kra.appName);
    setStep1PanData("firstName", firstName);
    setStep1PanData("middleName", middleName);
    setStep1PanData("lastName", lastName);
    const isoDob = kraDobToIso(kra.appDobDt);
    if (isoDob) setStep1PanData("dateOfBirth", isoDob);

    const gender = kraGenderToStore(kra.appGen);
    if (gender) setGenderData(gender);

    // KRA marital status: 01 = Married, 02 = Unmarried (per KRA spec)
    if (kra.appMarStatus) {
      const code = String(kra.appMarStatus).trim();
      const maritalForForm =
        code === "01" ? "MARRIED" : code === "02" ? "SINGLE" : kra.appMarStatus;
      setStep2PersonalData("maritalStatus", maritalForForm);
    }
    if (kra.appFName) setStep2PersonalData("fatSpuName", kra.appFName);
    // Occupation: map KRA code to form value; fallback to "Others" with raw in otherOccupationName
    // Skip "00" — not a valid option; user chooses on Personal Details
    if (kra.appOcc && !isKraUnspecifiedCode(kra.appOcc)) {
      const code = String(kra.appOcc).trim();
      const mapKey = kraOccupationCodeToMapKey(code);
      const formOcc = KRA_OCC_TO_FORM[mapKey] ?? KRA_OCC_TO_FORM[code] ?? "Others";
      setStep2PersonalData("occupationType", formOcc);
      if (formOcc === "Others" && (kra.appOthOcc || code)) {
        setStep2PersonalData("otherOccupationName", kra.appOthOcc?.trim() || code);
      } else if (kra.appOthOcc) {
        setStep2PersonalData("otherOccupationName", kra.appOthOcc.trim());
      }
    }
    // Annual Gross Income: map KRA code to form value (0-1L, 1-5L, etc.)
    // Skip "00" — would set invalid select value "00"
    if (kra.appIncome && !isKraUnspecifiedCode(kra.appIncome)) {
      const code = String(kra.appIncome).trim();
      const normalized = /^\d+$/.test(code)
        ? String(parseInt(code, 10)).padStart(2, "0")
        : code;
      const formIncome =
        KRA_INCOME_TO_FORM[normalized] ?? KRA_INCOME_TO_FORM[code] ?? kra.appIncome;
      setStep2PersonalData("annualGrossIncome", formIncome);
    }
    // Nationality: map KRA code to form value (IN - Indian, OTHER)
    if (kra.appNationality) {
      const code = String(kra.appNationality).trim();
      const formNationality = KRA_NATIONALITY_TO_FORM[code] ?? kra.appNationality;
      setStep2PersonalData("nationality", formNationality);
    }
  };

  const handleUseExisting = () => {
    const kra = state.step_1.kraResponse;
    setUsedExistingKra(true);
    if (kra) prefillFromKra(kra);
    handelPanVerification();
  };

  const handleStartFresh = () => {
    clearKraResponse();
    handelPanVerification();
  };

  return {
    handleUseExisting,
    handleStartFresh,
    isPending,
  };
}
