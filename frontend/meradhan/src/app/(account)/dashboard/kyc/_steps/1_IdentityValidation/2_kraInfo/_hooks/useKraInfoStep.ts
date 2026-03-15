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

export function useKraInfoStep() {
  const {
    state,
    setStep1PanData,
    setStep2PersonalData,
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

    if (kra.appMarStatus) setStep2PersonalData("maritalStatus", kra.appMarStatus);
    if (kra.appFName) setStep2PersonalData("fatSpuName", kra.appFName);
    if (kra.appOcc) setStep2PersonalData("occupationType", kra.appOcc);
    if (kra.appOthOcc) setStep2PersonalData("otherOccupationName", kra.appOthOcc ?? "");
    if (kra.appIncome) setStep2PersonalData("annualGrossIncome", kra.appIncome);
    if (kra.appNationality) setStep2PersonalData("nationality", kra.appNationality);
  };

  const handleUseExisting = () => {
    const kra = state.step_1.kraResponse;
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
