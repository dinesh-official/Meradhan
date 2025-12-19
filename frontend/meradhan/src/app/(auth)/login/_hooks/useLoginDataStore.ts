import { create } from "zustand";

export type LoginDataStoreType = {
  state: {
    emailOrPhoneNo: string;
    password: string;
    otp: string;
    allowedResend: boolean;
    mode: "pending" | "verify";
    type: "password" | "otp";
    errorMessage: string;
    successMessage: string;
    maxOtpTry: number;
    currentOtpTry: number;
    rememberMe: boolean;
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
  setMode: (mode: "pending" | "verify") => void;
  setAllowedResend: (allowedResend: boolean) => void;
  setRememberMe: (rememberMe: boolean) => void;
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

  setMode: (mode: "pending" | "verify") =>
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
}));
