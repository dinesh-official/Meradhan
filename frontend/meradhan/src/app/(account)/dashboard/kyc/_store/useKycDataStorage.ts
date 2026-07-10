/* eslint-disable @typescript-eslint/no-explicit-any */
/* 
  ✅ Complete Zustand Store for KYC Multi-Step Data
  Strongly Typed | Modular | Maintainable
*/

import { MatchResult } from "@/global/utils/match_name";
import {
  type IKraDownloadResponse,
  IPANKycVerifyResponse,
  ISignKycVerifyResponse,
} from "@root/apiGateway";
import { appSchema } from "@root/schema";
import z from "zod";
import { create } from "zustand";

type schema = typeof appSchema.kyc;

// ==========================
// 🪪 Step 1: PAN & Identity Data
// ==========================
export interface PanData<T = unknown> extends z.infer<
  schema["kycPanInfoDataSchema"]
> {
  response?: T;
  panRetryCount?: number;
}

export interface FileData<T> {
  url: string;
  timestamp?: string;
  response?: T;
}

export interface Step1Data {
  pan: PanData<IPANKycVerifyResponse["responseData"]>;
  kraResponse: IKraDownloadResponse | null;
  /** When true, user chose "Use Existing KYC Details" so we skip Aadhar steps */
  usedExistingKra: boolean;
  aadhar: string;
  gender: string;
  face: FileData<IPANKycVerifyResponse["responseData"]>;
  sign: FileData<ISignKycVerifyResponse["responseData"]>;
  nameMismatchDeclaration: {
    isDownloaded: boolean;
    isConfirmed: boolean;
    mismatch: boolean;
    score: number;
    decision: MatchResult["decision"];
    retryCount: number;
  };
}

// ==========================
// 👨‍👩‍👧 Step 2: Personal Details
// ==========================
export interface PersonalData<T = unknown> extends z.infer<
  schema["personalInfoSchema"]
> {
  response?: T;
}

// ==========================
// 🏦 Step 3: Bank Details
// ==========================
export interface BankAccountData<T = unknown> extends z.infer<
  schema["bankInfoSchema"]
> {
  isVerified?: boolean;
  response?: T;
}

// ==========================
// 🧾 Step 4: Depository Details
// ==========================
export interface DepositoryData<T = unknown> extends z.infer<
  schema["dpAccountInfoSchema"]
> {
  response?: T;
}

// ==========================
// 🧠 Step 5: Questionnaire
// ==========================
export type QuestionnaireData = z.infer<schema["riskProfileDataSchema"]>;

// ==========================
// 🗂️ Root Type: KYC Data Storage
// ==========================
export interface KycDataStorage {
  /** PDF Application Type: Re-KYC → UPDATE, first-time KYC → NEW (persisted with KYC progress) */
  kycApplicationType?: "NEW" | "UPDATE";
  stepIndex: number;
  names: {
    fullNameAsPerPan: string;
    fullNameAsPerAadhar: string;
    fullNameAsPerBank: string;
  };
  step_1: Step1Data;
  step_2: PersonalData;
  step_3: BankAccountData[];
  step_4: DepositoryData[];
  step_5: QuestionnaireData;
  step_6: {
    terms: boolean;
    response?: any;
  };
}

// ==========================
// 🧩 Initial Default Data
// ==========================
const initData: KycDataStorage = {
  kycApplicationType: undefined,
  stepIndex: 0,
  names: {
    fullNameAsPerPan: "",
    fullNameAsPerAadhar: "",
    fullNameAsPerBank: "",
  },
  step_1: {
    pan: {
      panCardNo: "",
      dateOfBirth: "",
      firstName: "",
      middleName: "",
      lastName: "",
      checkTerms1: false,
      checkTerms2: false,
      isFatca: false,
      checkKycKraConsent: false,
    },
    kraResponse: null,
    usedExistingKra: false,
    aadhar: "",
    gender: "",
    face: {
      url: "",
    },
    sign: { url: "" },
    nameMismatchDeclaration: {
      isDownloaded: false,
      isConfirmed: false,
      mismatch: false,
      decision: "MATCH_FAIL",
      score: 0,
      retryCount: 0,
    },
  },
  step_2: {
    maritalStatus: "",
    fatSpuName: "",
    reelWithPerson: "",
    qualification: "",
    occupationType: "",
    annualGrossIncome: "",
    motherName: "",
    nationality: "",
    residentialStatus: "",
    otherOccupationName: "",
  },
  step_3: [
    {
      bankAccountType: "",
      bankName: "",
      branchName: "",
      ifscCode: "",
      accountNumber: "",
      isDefault: true,
      checkTerms: false,
      isVerified: false,
      beneficiary_name: "",
    },
  ],
  step_4: [
    {
      depositoryName: "CDSL",
      dpId: "",
      beneficiaryClientId: "",
      depositoryParticipantName: "",
      panNumber: [""],
      accountHolderName: "",
      accountType: "SOLO",
      isDefault: true,
      checkTerms: false,
      isVerified: false,
    },
  ],
  step_5: [
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
  ],
  step_6: {
    terms: false,
  },
};

// ==========================
// 🏗️ Zustand Store
// ==========================
export const useKycDataStorage = create<{
  state: KycDataStorage;
  setState: (state: KycDataStorage) => void;
  setKycApplicationType: (type: "NEW" | "UPDATE") => void;
  updateStep: <K extends keyof KycDataStorage>(
    step: K,
    data: KycDataStorage[K],
  ) => void;
  setNames: (key: keyof KycDataStorage["names"], data: string) => void;
  reset: () => void;
  setStepIndex: (index: number) => void;
  nextLocalStep: () => void;
  prevLocalStep: () => void;

  // step 1
  setStep1PanData: (Key: keyof Step1Data["pan"], data: any) => void;
  setKraResponse: (data: IKraDownloadResponse | null) => void;
  clearKraResponse: () => void;
  setUsedExistingKra: (value: boolean) => void;
  setStep1NameMismatchDeclaration: (
    data: Step1Data["nameMismatchDeclaration"],
  ) => void;
  incrementNameRetryCount: () => void;
  resetNameRetryCount: () => void;
  incrementPanRetryCount: () => void;
  resetPanRetryCount: () => void;
  setAadharData: (data: string) => void;
  setGenderData: (data: string) => void;
  setStep1SelfieFaceData: (Key: keyof Step1Data["face"], data: any) => void;
  setStep1SignData: (Key: keyof Step1Data["sign"], data: any) => void;
  setStep2PersonalData: (Key: keyof PersonalData, data: any) => void;

  // bank
  addBankAccount: () => void;
  updateBankAccount: (index: number, data: Partial<BankAccountData>) => void;
  removeBankAccount: (index: number) => void;
  setDefaultBankAccount: (index: number) => void;

  // depository
  addDepository: () => void;
  updateDepository: (index: number, data: Partial<DepositoryData>) => void;
  removeDepository: (index: number) => void;
  setDefaultDepository: (index: number) => void;
  addDepositoryPan: (index: number) => void;
  updateDepositoryPan: (index: number, subIndex: number, data: string) => void;
  setDepositoryPan: (index: number, data: string[]) => void;
  removeDepositoryPan: (index: number, subIndex: number) => void;
  selectStep5RiskProfileAnswer: (index: number, answer: string) => void;

  // step 6
  setStep6Data: (Key: keyof KycDataStorage["step_6"], data: any) => void;
}>((set) => ({
  state: initData,
  setKycApplicationType: (type) =>
    set((prev) => ({
      state: { ...prev.state, kycApplicationType: type },
    })),
  setNames: (key: keyof KycDataStorage["names"], data: string) =>
    set({
      state: {
        ...initData,
        names: {
          ...initData.names,
          [key]: data,
        },
      },
    }),
  setState: (newState) => set({ state: newState }),

  updateStep: (step, data) =>
    set((prev) => ({
      state: {
        ...prev.state,
        [step]: data,
      },
    })),

  reset: () => set({ state: initData }),

  setStepIndex(index) {
    set((prev) => ({ state: { ...prev.state, stepIndex: index } }));
  },

  setAadharData(data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          aadhar: data,
        },
      },
    }));
  },

  setGenderData(data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          gender: data,
        },
      },
    }));
  },

  nextLocalStep() {
    set((prev) => ({
      state: { ...prev.state, stepIndex: prev.state.stepIndex + 1 },
    }));
  },

  prevLocalStep() {
    set((prev) => ({
      state: {
        ...prev.state,
        stepIndex: prev.state.stepIndex <= 0 ? 0 : prev.state.stepIndex - 1,
      },
    }));
  },

  setStep1PanData: (key, data) =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          pan: { ...prev.state.step_1.pan, [key]: data },
        },
      },
    })),

  setKraResponse: (data) =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          kraResponse: data,
        },
      },
    })),

  clearKraResponse: () =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          kraResponse: null,
          usedExistingKra: false,
        },
      },
    })),

  setUsedExistingKra: (value) =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          usedExistingKra: value,
        },
      },
    })),

  setStep1NameMismatchDeclaration: (data) =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          nameMismatchDeclaration: data,
        },
      },
    })),

  incrementNameRetryCount: () =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          nameMismatchDeclaration: {
            ...prev.state.step_1.nameMismatchDeclaration,
            retryCount:
              prev.state.step_1.nameMismatchDeclaration.retryCount + 1,
          },
        },
      },
    })),

  resetNameRetryCount: () =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          nameMismatchDeclaration: {
            ...prev.state.step_1.nameMismatchDeclaration,
            retryCount: 0,
          },
        },
      },
    })),

  incrementPanRetryCount: () =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          pan: {
            ...prev.state.step_1.pan,
            panRetryCount: (prev.state.step_1.pan.panRetryCount || 0) + 1,
          },
        },
      },
    })),

  resetPanRetryCount: () =>
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          pan: {
            ...prev.state.step_1.pan,
            panRetryCount: 0,
          },
        },
      },
    })),

  setStep1SelfieFaceData(Key, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          face: {
            ...prev.state.step_1.face,
            [Key]: data,
          },
        },
      },
    }));
  },

  setStep1SignData(Key, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_1: {
          ...prev.state.step_1,
          sign: {
            ...prev.state.step_1.sign,
            [Key]: data,
          },
        },
      },
    }));
  },

  setStep2PersonalData(Key, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_2: {
          ...prev.state.step_2,
          [Key]: data,
        },
      },
    }));
  },

  // ==========================
  // 🏦 BANK ACCOUNT HANDLERS
  // ==========================
  addBankAccount() {
    set((prev) => ({
      state: {
        ...prev.state,
        step_3: [
          ...prev.state.step_3,
          { ...initData.step_3[0], isDefault: false },
        ],
      },
    }));
  },

  updateBankAccount(index, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_3: prev.state.step_3.map((item, i) =>
          i === index ? { ...item, ...data } : item,
        ),
      },
    }));
  },

  removeBankAccount(index) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_3: prev.state.step_3.filter((_, i) => i !== index),
      },
    }));
  },

  setDefaultBankAccount(index) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_3: prev.state.step_3.map((item, i) =>
          i === index
            ? { ...item, isDefault: true }
            : { ...item, isDefault: false },
        ),
      },
    }));
  },

  // ==========================
  // 🧾 DEPOSITORY HANDLERS
  // ==========================
  addDepository() {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: [
          ...prev.state.step_4,
          { ...initData.step_4[0], isDefault: false },
        ],
      },
    }));
  },

  updateDepository(index, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) =>
          i === index ? { ...item, ...data } : item,
        ),
      },
    }));
  },

  removeDepository(index) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.filter((_, i) => i !== index),
      },
    }));
  },

  setDepositoryPan(index, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) =>
          i === index ? { ...item, panNumber: data } : item,
        ),
      },
    }));
  },

  setDefaultDepository(index) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) =>
          i === index
            ? { ...item, isDefault: true }
            : { ...item, isDefault: false },
        ),
      },
    }));
  },

  // ✅ Corrected PAN Handlers
  addDepositoryPan(index) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) =>
          i === index
            ? {
              ...item,
              panNumber: [...item.panNumber, ""], // Add new empty PAN field
            }
            : item,
        ),
      },
    }));
  },

  updateDepositoryPan(index, subIndex, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) => {
          if (i === index) {
            const updatedPan = [...item.panNumber];
            updatedPan[subIndex] = data;
            return { ...item, panNumber: updatedPan };
          }
          return item;
        }),
      },
    }));
  },

  removeDepositoryPan(index, subIndex) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_4: prev.state.step_4.map((item, i) => {
          if (i === index) {
            const updatedPan = [...item.panNumber];
            updatedPan.splice(subIndex, 1);
            return { ...item, panNumber: updatedPan };
          }
          return item;
        }),
      },
    }));
  },

  selectStep5RiskProfileAnswer(index, answer) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_5: prev.state.step_5.map((item, i) =>
          i === index ? { ...item, ans: answer } : item,
        ),
      },
    }));
  },

  // ==========================
  // 🧠 STEP 6 HANDLERS
  // ==========================
  setStep6Data(Key, data) {
    set((prev) => ({
      state: {
        ...prev.state,
        step_6: {
          ...prev.state.step_6,
          [Key]: data,
        },
      },
    }));
  },
}));
