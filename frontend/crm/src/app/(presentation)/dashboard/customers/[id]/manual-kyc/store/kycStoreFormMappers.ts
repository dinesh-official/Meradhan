/**
 * Mappers between KYC Zustand store (KycDataStorage) and manual KYC form (ManualKycFormData).
 * Keeps form and store in sync when hydrating from customer or when form data changes.
 */

import type { ManualKycFormData } from "../../../manual-kyc/_types/manualKycForm.types";
import type { KycDataStorage } from "./useKycDataStorage";

/**
 * Map store state to partial form data (for initial form values from store).
 */
export function mapKycStorageToFormData(
  store: KycDataStorage
): Partial<ManualKycFormData> {
  const pan = store.step_1.pan;
  const step2 = store.step_2;
  const step3Bank = store.step_3;
  const step5 = store.step_5;
  const step6 = store.step_6;

  return {
    step1: {
      firstName: pan?.firstName ?? "",
      lastName: pan?.lastName ?? "",
      gender: store.step_1.gender ?? "",
      emailAddress: "",
      username: "",
    },
    step2: {
      dateOfBirth: pan?.dateOfBirth ?? "",
      fatherOrSpouseName: step2?.fatSpuName ?? "",
      mothersName: step2?.motherName ?? "",
      maritalStatus: step2?.maritalStatus ?? "",
      nationality: step2?.nationality ?? "",
      residentialStatus: step2?.residentialStatus ?? "",
      occupationType: step2?.occupationType ?? "",
      annualGrossIncome: step2?.annualGrossIncome ?? "",
      politicallyExposedPerson: "no",
      confirmPersonalInfoTimestamp: "",
    },
    step4: {
      aadhaarNumber: store.step_1.aadhar ?? "",
      firstName: pan?.firstName ?? "",
      lastName: pan?.lastName ?? "",
      dateOfBirth: pan?.dateOfBirth ?? "",
      gender: store.step_1.gender ?? "",
      documentFileUrl: store.step_1.face?.url ?? "",
      aadhaarConsent: false,
      confirmAadhaarTimestamp: "",
    },
    step5: {
      panNumber: pan?.panCardNo ?? "",
      firstName: pan?.firstName ?? "",
      lastName: pan?.lastName ?? "",
      dateOfBirth: pan?.dateOfBirth ?? "",
      gender: store.step_1.gender ?? "",
      documentFileUrl: store.step_1.sign?.url ?? "",
      panConsent: false,
      confirmPanTimestamp: "",
    },
    step6: {
      bankAccounts: Array.isArray(step3Bank)
        ? step3Bank.map((acc) => ({
            accountHolderName: (acc as { beneficiary_name?: string })?.beneficiary_name ?? "",
            bankName: acc.bankName ?? "",
            accountNumber: acc.accountNumber ?? "",
            ifscCode: acc.ifscCode ?? "",
            accountType: (acc as { bankAccountType?: string })?.bankAccountType ?? "",
            isPrimary: (acc as { isDefault?: boolean })?.isDefault ?? false,
            bankAccountConsent: (acc as { checkTerms?: boolean })?.checkTerms ?? false,
            confirmBankTimestamp: "",
          }))
        : [],
    },
    step7: {
      riskQuestionnaireResponses: Array.isArray(step5)
        ? step5.map((q) => ({
            qus: (q as { qus?: string })?.qus ?? "",
            ans: (q as { ans?: string })?.ans ?? "",
            index: (q as { index?: number })?.index ?? 0,
            opt: (q as { opt?: string[] })?.opt ?? [],
          }))
        : [],
    },
    step8: {
      fatcaDeclaration: "no",
      pepDeclaration: "no",
      sebiTermsAcceptance: step6?.terms ?? false,
    },
  };
}

/**
 * Map form data into store state (merge with current store so unmapped fields are preserved).
 */
export function mapFormDataToKycStorage(
  form: Partial<ManualKycFormData>,
  current: KycDataStorage
): KycDataStorage {
  const step1 = form.step1;
  const step2 = form.step2;
  const step4 = form.step4;
  const step5 = form.step5;
  const step6 = form.step6;
  const step7 = form.step7;
  const step8 = form.step8;

  return {
    ...current,
    names: {
      ...current.names,
      fullNameAsPerPan: [step1?.firstName, step1?.lastName].filter(Boolean).join(" ") || current.names.fullNameAsPerPan,
      fullNameAsPerAadhar: [step4?.firstName, step4?.lastName].filter(Boolean).join(" ") || current.names.fullNameAsPerAadhar,
      fullNameAsPerBank: current.names.fullNameAsPerBank,
    },
    step_1: {
      ...current.step_1,
      pan: {
        ...current.step_1.pan,
        panCardNo: step5?.panNumber ?? current.step_1.pan.panCardNo,
        firstName: step1?.firstName ?? current.step_1.pan.firstName,
        lastName: step1?.lastName ?? current.step_1.pan.lastName,
        dateOfBirth: step2?.dateOfBirth ?? step5?.dateOfBirth ?? current.step_1.pan.dateOfBirth,
      },
      aadhar: step4?.aadhaarNumber ?? current.step_1.aadhar,
      gender: step1?.gender ?? current.step_1.gender,
      face: { ...current.step_1.face, url: step4?.documentFileUrl ?? current.step_1.face.url },
      sign: { ...current.step_1.sign, url: step5?.documentFileUrl ?? current.step_1.sign.url },
    },
    step_2: {
      ...current.step_2,
      maritalStatus: step2?.maritalStatus ?? current.step_2.maritalStatus,
      fatSpuName: step2?.fatherOrSpouseName ?? current.step_2.fatSpuName,
      motherName: step2?.mothersName ?? current.step_2.motherName,
      nationality: step2?.nationality ?? current.step_2.nationality,
      residentialStatus: step2?.residentialStatus ?? current.step_2.residentialStatus,
      occupationType: step2?.occupationType ?? current.step_2.occupationType,
      annualGrossIncome: step2?.annualGrossIncome ?? current.step_2.annualGrossIncome,
    },
    step_3:
      step6?.bankAccounts?.map((acc) => ({
        ...(current.step_3[0] ?? {}),
        bankName: acc.bankName,
        accountNumber: acc.accountNumber,
        ifscCode: acc.ifscCode,
        bankAccountType: acc.accountType,
        isDefault: acc.isPrimary,
        checkTerms: acc.bankAccountConsent,
        beneficiary_name: acc.accountHolderName,
        branchName: (current.step_3[0] as { branchName?: string })?.branchName ?? "",
        isVerified: (current.step_3[0] as { isVerified?: boolean })?.isVerified ?? false,
      })) ?? current.step_3,
    step_5:
      step7?.riskQuestionnaireResponses?.map((q) => ({
        qus: q.qus,
        ans: q.ans,
        index: q.index,
        opt: q.opt,
      })) ?? current.step_5,
    step_6: {
      ...current.step_6,
      terms: step8?.sebiTermsAcceptance ?? current.step_6.terms,
    },
  };
}
