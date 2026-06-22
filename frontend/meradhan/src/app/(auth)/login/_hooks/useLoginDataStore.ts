import { create } from "zustand";

export type LoginMode = "pending" | "verify" | "account_activation";
export type ActivationChannel = "phone" | "email" | null;
export type ActivationStep = "prompt" | "otp";

export type LoginDataStoreType = {
  state: {
    emailOrPhoneNo: string;
    password: string;
    otp: string;
    allowedResend: boolean;
    mode: LoginMode;
    type: "password" | "otp";
    errorMessage: string;
    successMessage: string;
    maxOtpTry: number;
    currentOtpTry: number;
    rememberMe: boolean;
    activationChannel: ActivationChannel;
    activationStep: ActivationStep;
    activationToken: string;
    activationMaskedTarget: string;
    twoFactorDialogOpen: boolean;
    twoFactorChallengeToken: string;
    twoFactorPasscode: string;
  };

  reset: () => void;
  setEmailOrPhoneNo: (emailOrPhoneNo: string) => void;
  setPassword: (password: string) => void;
  setOtp: (otp: string) => void;
  setErrorMessage: (message: string) => void;
  setSuccessMessage: (message: string) => void;
  setMaxOtpTry: (maxOtpTry: number) => void;
  setCurrentOtpTry: (currentOtpTry: number) => void;
  setType: (type: "password" | "otp") => void;
  setMode: (mode: LoginMode) => void;
  setAllowedResend: (allowedResend: boolean) => void;
  setRememberMe: (rememberMe: boolean) => void;
  setActivationChannel: (channel: ActivationChannel) => void;
  setActivationStep: (step: ActivationStep) => void;
  setActivationToken: (token: string) => void;
  setActivationMaskedTarget: (maskedTarget: string) => void;
  setTwoFactorDialogOpen: (open: boolean) => void;
  setTwoFactorChallengeToken: (token: string) => void;
  setTwoFactorPasscode: (passcode: string) => void;
  resetTwoFactorDialog: () => void;
};

const initialState: LoginDataStoreType["state"] = {
  emailOrPhoneNo: "",
  password: "",
  otp: "",
  allowedResend: false,
  mode: "pending",
  type: "password",
  errorMessage: "",
  successMessage: "",
  currentOtpTry: 0,
  maxOtpTry: 3,
  rememberMe: false,
  activationChannel: null,
  activationStep: "prompt",
  activationToken: "",
  activationMaskedTarget: "",
  twoFactorDialogOpen: false,
  twoFactorChallengeToken: "",
  twoFactorPasscode: "",
};

export const useLoginDataStore = create<LoginDataStoreType>((set) => ({
  state: initialState,

  reset: () => {
    set({ state: { ...initialState } });
  },

  setEmailOrPhoneNo: (emailOrPhoneNo: string) =>
    set((store) => ({
      state: { ...store.state, emailOrPhoneNo },
    })),

  setPassword: (password: string) =>
    set((store) => ({
      state: { ...store.state, password },
    })),

  setOtp: (otp: string) =>
    set((store) => ({
      state: { ...store.state, otp },
    })),

  setErrorMessage: (message: string) =>
    set((store) => ({
      state: { ...store.state, errorMessage: message },
    })),

  setSuccessMessage: (message: string) =>
    set((store) => ({
      state: { ...store.state, successMessage: message },
    })),

  setMaxOtpTry: (maxOtpTry: number) =>
    set((store) => ({
      state: { ...store.state, maxOtpTry },
    })),

  setCurrentOtpTry: (currentOtpTry: number) =>
    set((store) => ({
      state: { ...store.state, currentOtpTry },
    })),

  setType: (type: "password" | "otp") =>
    set((store) => ({
      state: { ...store.state, type },
    })),

  setMode: (mode: LoginMode) =>
    set((store) => ({
      state: { ...store.state, mode },
    })),

  setAllowedResend: (allowedResend: boolean) =>
    set((store) => ({
      state: { ...store.state, allowedResend },
    })),

  setRememberMe: (rememberMe: boolean) =>
    set((store) => ({
      state: { ...store.state, rememberMe },
    })),

  setActivationChannel: (activationChannel: ActivationChannel) =>
    set((store) => ({
      state: { ...store.state, activationChannel },
    })),

  setActivationStep: (activationStep: ActivationStep) =>
    set((store) => ({
      state: { ...store.state, activationStep },
    })),

  setActivationToken: (activationToken: string) =>
    set((store) => ({
      state: { ...store.state, activationToken },
    })),

  setActivationMaskedTarget: (activationMaskedTarget: string) =>
    set((store) => ({
      state: { ...store.state, activationMaskedTarget },
    })),

  setTwoFactorDialogOpen: (twoFactorDialogOpen: boolean) =>
    set((store) => ({
      state: { ...store.state, twoFactorDialogOpen },
    })),

  setTwoFactorChallengeToken: (twoFactorChallengeToken: string) =>
    set((store) => ({
      state: { ...store.state, twoFactorChallengeToken },
    })),

  setTwoFactorPasscode: (twoFactorPasscode: string) =>
    set((store) => ({
      state: { ...store.state, twoFactorPasscode },
    })),

  resetTwoFactorDialog: () =>
    set((store) => ({
      state: {
        ...store.state,
        twoFactorDialogOpen: false,
        twoFactorChallengeToken: "",
        twoFactorPasscode: "",
      },
    })),
}));
